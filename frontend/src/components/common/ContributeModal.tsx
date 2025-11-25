"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useCreateContribution } from "@/hooks/queries/useContributions";
import { httpClient } from "@/api/client";
import type { PaymentMethod } from "@/types/contribution";

interface ContributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionTitle: string;
  collectionId: string;
  suggestedAmount?: number;
  currentAmount: number;
  goalAmount: number;
}

export function ContributeModal({
  open,
  onOpenChange,
  collectionTitle,
  collectionId,
  suggestedAmount,
  currentAmount,
  goalAmount
}: ContributeModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');
  const [note, setNote] = useState("");

  const { mutateAsync: createContribution, isPending } = useCreateContribution(collectionId);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 1000,
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Confetti desde la izquierda
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });

      // Confetti desde la derecha
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });

      // Confetti desde el centro para más efecto
      confetti({
        ...defaults,
        particleCount: particleCount / 2,
        origin: { x: 0.5, y: 0.5 }
      });
    }, 250);
  };

  // Estado para PayPal
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);

  // NUEVO: Callbacks para PayPal
  const createPayPalOrder = async () => {
    try {
      const response = await httpClient.post<{ id: string }>(`/collections/${collectionId}/paypal/create-order`, {
        amount: parseFloat(amount),
      });
      return response.id; // PayPal Order ID
    } catch (error) {
      toast.error('Error al crear orden de PayPal');
      throw error;
    }
  };

  const onPayPalApprove = async (data: { orderID: string }) => {
    setIsProcessingPayPal(true);
    try {
      // Capturar pago en backend
      await httpClient.post(`/collections/${collectionId}/paypal/capture-order`, {
        orderId: data.orderID,
      });

      // Registrar contribución
      await createContribution({
        collectionId,
        amount: parseFloat(amount),
        message: undefined,
        isAnonymous: false,
        paymentMethod: 'paypal',
      });

      triggerConfetti();
      toast.success(`¡Pago de S/ ${parseFloat(amount).toFixed(2)} exitoso! 🎉`);

      setTimeout(() => {
        setAmount(suggestedAmount?.toString() || "");
        setPaymentMethod("paypal");
        setNote("");
        onOpenChange(false);
      }, 1000);
    } catch {
      toast.error('Error al procesar el pago de PayPal');
    } finally {
      setIsProcessingPayPal(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Por favor ingresa un monto válido");
      return;
    }

    const contributionAmount = parseFloat(amount);
    const remainingAmount = goalAmount - currentAmount;

    // Validar que no supere el 100%
    if (contributionAmount > remainingAmount) {
      const formattedRemaining = remainingAmount.toFixed(2);
      toast.error("No puedes agregar un monto que supere el 100%", {
        description: `Solo falta S/ ${formattedRemaining} para completar la colecta.`,
        duration: 5000,
      });
      return;
    }

    // Validar que no sea exactamente 0 lo que falta
    if (remainingAmount <= 0) {
      toast.error("Esta colecta ya ha alcanzado su meta", {
        description: "No se pueden agregar más contribuciones.",
        duration: 5000,
      });
      return;
    }

    try {
      // Solo enviamos el amount, que es lo que el backend espera
      await createContribution({
        collectionId,
        amount: parseFloat(amount),
        message: note || undefined,
        isAnonymous: false,
        paymentMethod,
      });

      // Trigger confetti effect
      triggerConfetti();

      // Success message
      toast.success(`¡Aporte de S/ ${parseFloat(amount).toFixed(2)} registrado exitosamente! 🎉`, {
        duration: 4000,
      });

      // Reset form and close modal after animation
      setTimeout(() => {
        setAmount(suggestedAmount?.toString() || "");
        setNote("");
        setPaymentMethod("paypal");
        onOpenChange(false);
      }, 1000);
    } catch (error: unknown) {
      console.error("Contribution error:", error);

      // Diferentes mensajes según el tipo de error
      const axiosError = error as { response?: { status: number; data?: { message?: string } } };

      if (axiosError.response?.status === 400) {
        const errorMsg = axiosError.response?.data?.message || 'El procesamiento del pago falló';
        toast.error('Error en el pago', {
          description: `${errorMsg}. Por favor intenta nuevamente.`,
          duration: 5000,
        });
      } else if (axiosError.response?.status === 403) {
        toast.error('Acceso denegado', {
          description: 'No tienes permisos para contribuir a esta colecta.',
          duration: 5000,
        });
      } else if (axiosError.response?.status === 404) {
        toast.error('Colecta no encontrada', {
          description: 'La colecta podría haber sido eliminada.',
          duration: 5000,
        });
      } else if (axiosError.response?.status === 500) {
        toast.error('Error del servidor', {
          description: 'Hay un problema temporal. Por favor intenta más tarde.',
          duration: 5000,
        });
      } else {
        const errorMessage = error instanceof Error
          ? error.message
          : "Error al procesar el aporte. Intenta nuevamente.";

        toast.error(errorMessage, {
          description: 'Si el problema persiste, contacta al soporte.',
          duration: 5000,
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Realizar aporte</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {collectionTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto a aportar *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                S/
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-lg"
                min="0"
                step="0.01"
                disabled={isPending}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Recaudado: S/ {currentAmount.toFixed(2)}
              </span>
              <span className="text-muted-foreground">
                Falta: S/ {(goalAmount - currentAmount).toFixed(2)}
              </span>
            </div>
          </div>


          {/* NUEVO: Mostrar PayPal Buttons SOLO si método es 'paypal' */}
          {paymentMethod === 'paypal' && parseFloat(amount) > 0 && (
            <div className="pt-4">
              <PayPalButtons
                style={{ layout: 'vertical' }}
                disabled={isProcessingPayPal}
                createOrder={createPayPalOrder}
                onApprove={onPayPalApprove}
                onError={(err: unknown) => {
                  console.error('PayPal error:', err);
                  toast.error('Error en PayPal. Intenta de nuevo.');
                }}
              />
            </div>
          )}
        </div>

        {/* Actions - Mostrar SOLO si NO es PayPal */}
        {paymentMethod !== 'paypal' && (
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
