import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);
  private readonly clientId: string;
  private readonly secret: string;
  private readonly apiUrl: string;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.get<string>('PAYPAL_CLIENT_ID') || '';
    this.secret = this.config.get<string>('PAYPAL_SECRET') || '';
    this.apiUrl = this.config.get<string>('PAYPAL_API_URL', 'https://api-m.sandbox.paypal.com');

    if (!this.clientId || !this.secret) {
      this.logger.error('PayPal credentials not configured');
      throw new Error('PayPal credentials missing in environment variables');
    }

    this.logger.log(`PayPal service initialized with API: ${this.apiUrl}`);
  }

  /**
   * Obtiene un access token de PayPal usando autenticación básica HTTP.
   * Cachea el token hasta que expire para reducir llamadas a la API.
   */
  private async getAccessToken(): Promise<string> {
    // Retornar token cacheado si aún es válido
    if (this.cachedToken && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    const auth = Buffer.from(`${this.clientId}:${this.secret}`).toString('base64');

    try {
      const response = await axios.post<{
        access_token: string;
        expires_in: number;
      }>(`${this.apiUrl}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.cachedToken = response.data.access_token;
      // Expira 5 minutos antes del tiempo real por seguridad
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      this.logger.log('PayPal access token obtained successfully');
      return this.cachedToken;
    } catch (error) {
      this.handlePayPalError(error, 'Failed to authenticate with PayPal');
    }
  }

  /**
   * Crea una orden de pago en PayPal.
   * @param amount Monto en USD
   * @param collectionId ID de la colecta para referencia
   * @param returnUrl URL a la que PayPal redirigirá después del pago exitoso
   * @param cancelUrl URL a la que PayPal redirigirá si el usuario cancela
   */
  async createOrder(
    amount: number,
    collectionId: string,
    returnUrl?: string,
    cancelUrl?: string,
  ): Promise<PayPalOrderResponse> {
    const accessToken = await this.getAccessToken();
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:5173');

    // URLs de retorno
    const finalReturnUrl = returnUrl || `${frontendUrl}/collections/${collectionId}?payment=success`;
    const finalCancelUrl = cancelUrl || `${frontendUrl}/collections/${collectionId}?payment=cancelled`;

    try {
      const response = await axios.post<PayPalOrderResponse>(
        `${this.apiUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: amount.toFixed(2),
              },
              description: `Contribución a ColectaYa - ID: ${collectionId}`,
              reference_id: collectionId,
            },
          ],
          application_context: {
            brand_name: 'ColectaYa',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: finalReturnUrl,
            cancel_url: finalCancelUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`PayPal order created successfully: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.handlePayPalError(error, 'Failed to create PayPal order');
    }
  }

  /**
   * Captura el pago después de que el usuario aprueba la transacción.
   * @param orderId ID de la orden de PayPal
   * @returns Datos de la captura incluyendo el ID de la transacción
   */
  async captureOrder(orderId: string): Promise<PayPalCaptureResponse> {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios.post<PayPalCaptureResponse>(
        `${this.apiUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status !== 'COMPLETED') {
        this.logger.warn(`PayPal order ${orderId} not completed. Status: ${response.data.status}`);
        throw new BadRequestException('Payment was not completed');
      }

      const captureId = response.data.purchase_units[0]?.payments?.captures[0]?.id;
      this.logger.log(`PayPal order captured successfully: ${orderId} (Capture ID: ${captureId})`);

      return response.data;
    } catch (error) {
      this.handlePayPalError(error, 'Failed to capture PayPal payment');
    }
  }

  /**
   * Maneja errores de PayPal de forma consistente
   */
  private handlePayPalError(error: unknown, message: string): never {
    if (axios.isAxiosError(error)) {
      const errorDetails = error.response?.data as { name?: string } | undefined;

      this.logger.error(`PayPal API Error: ${message}`, {
        status: error.response?.status,
        data: errorDetails,
      });

      // Mensajes más específicos según el error
      if (error.response?.status === 401) {
        throw new BadRequestException('Invalid PayPal credentials');
      }

      if (errorDetails?.name === 'INSTRUMENT_DECLINED') {
        throw new BadRequestException('Payment method was declined. Please try another payment method.');
      }

      if (errorDetails?.name === 'INSUFFICIENT_FUNDS') {
        throw new BadRequestException('Insufficient funds in PayPal account');
      }
    }

    this.logger.error(`PayPal Error: ${message}`, error);
    throw new BadRequestException(message);
  }
}
