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

  const availableAmount = Math.max(0, goalAmount - currentAmount);
  const contributionAmount = parseFloat(amount) || 0;
  const isAmountInvalid = contributionAmount > availableAmount || contributionAmount <= 0;
  const isGoalReached = availableAmount <= 0;

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

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });

      confetti({
        ...defaults,
        particleCount: particleCount / 2,
        origin: { x: 0.5, y: 0.5 }
      });
    }, 250);
  };

  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);

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
      await httpClient.post(`/collections/${collectionId}/paypal/capture-order`, {
        orderId: data.orderID,
      });

      await createContribution({
        collectionId,
        amount: parseFloat(amount),
        message: undefined,
        isAnonymous: false,
        paymentMethod: 'paypal',
      });

      triggerConfetti();
      toast.success(`¡Pago de S/ ${parseFloat(amount).toFixed(2)} exitoso!`);

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

    if (contributionAmount > remainingAmount) {
      const formattedRemaining = remainingAmount.toFixed(2);
      toast.error("No puedes agregar un monto que supere el 100%", {
        description: `Solo falta S/ ${formattedRemaining} para completar la colecta.`,
        duration: 5000,
      });
      return;
    }

    if (remainingAmount <= 0) {
      toast.error("Esta colecta ya ha alcanzado su meta", {
        description: "No se pueden agregar más contribuciones.",
        duration: 5000,
      });
      return;
    }

    try {
      await createContribution({
        collectionId,
        amount: parseFloat(amount),
        message: note || undefined,
        isAnonymous: false,
        paymentMethod,
      });

      triggerConfetti();

      toast.success(`¡Aporte de S/ ${parseFloat(amount).toFixed(2)} registrado exitosamente!`, {
        duration: 4000,
      });

      setTimeout(() => {
        setAmount(suggestedAmount?.toString() || "");
        setNote("");
        setPaymentMethod("paypal");
        onOpenChange(false);
      }, 1000);
    } catch (error: unknown) {
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
                className={`pl-10 text-lg ${
                  amount && isAmountInvalid ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                min="0"
                step="0.01"
                max={availableAmount}
                disabled={isPending || isGoalReached}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Recaudado: S/ {currentAmount.toFixed(2)}
              </span>
              <span className={availableAmount <= 0 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                Falta: S/ {availableAmount.toFixed(2)}
              </span>
            </div>
            {/* 🚨 Mensaje de error si el monto excede el disponible */}
            {amount && contributionAmount > availableAmount && (
              <p className="text-sm text-red-500 font-medium">
                El monto excede lo disponible. Máximo: S/ {availableAmount.toFixed(2)}
              </p>
            )}
            {/*  Mensaje si la meta ya se alcanzó */}
            {isGoalReached && (
              <p className="text-sm text-green-600 font-medium">
                 ¡La meta ya fue alcanzada! No se pueden realizar más aportes.
              </p>
            )}
          </div>


          {/* NUEVO: Mostrar PayPal Buttons SOLO si método es 'paypal' Y el monto es válido */}
          {paymentMethod === 'paypal' && contributionAmount > 0 && !isAmountInvalid && !isGoalReached && (
            <div className="pt-4">
              <PayPalButtons
                style={{ layout: 'vertical' }}
                disabled={isProcessingPayPal || isAmountInvalid}
                createOrder={createPayPalOrder}
                onApprove={onPayPalApprove}
                onError={(err: unknown) => {
                  toast.error('Error en PayPal. Intenta de nuevo.');
                }}
              />
            </div>
          )}
          {/* Mensaje informativo si no se muestran los botones de PayPal */}
          {paymentMethod === 'paypal' && amount && isAmountInvalid && !isGoalReached && (
            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Ingresa un monto válido para continuar con PayPal
              </p>
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
