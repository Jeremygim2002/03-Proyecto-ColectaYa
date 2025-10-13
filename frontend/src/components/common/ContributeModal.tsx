"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useCreateContribution } from "@/hooks/queries/useContributions";
import type { PaymentMethod } from "@/types/contribution";

interface ContributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionTitle: string;
  collectionId: string;
  suggestedAmount?: number;
}

export function ContributeModal({ 
  open, 
  onOpenChange, 
  collectionTitle,
  collectionId,
  suggestedAmount 
}: ContributeModalProps) {
  const [amount, setAmount] = useState(suggestedAmount?.toString() || "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [note, setNote] = useState("");

  const { mutateAsync: createContribution, isPending } = useCreateContribution(collectionId);

  const triggerConfetti = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
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
    }, 250);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Por favor ingresa un monto válido");
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

      // confetti
      triggerConfetti();

      toast.success(`¡Aporte de S/ ${parseFloat(amount).toFixed(2)} registrado! 🎉`);

      // close
      setTimeout(() => {
        setAmount(suggestedAmount?.toString() || "");
        setNote("");
        onOpenChange(false);
      }, 500);
    } catch (error) {
      toast.error("Error al procesar el aporte. Intenta nuevamente.");
      console.error("Contribution error:", error);
    }
  };

  const paymentMethods = [
    { id: "yape", name: "Yape", icon: "💜" },
    { id: "plin", name: "Plin", icon: "💙" },
    { id: "mercadopago", name: "MercadoPago", icon: "💳" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Realizar aporte</DialogTitle>
          <p className="text-sm text-muted-foreground">{collectionTitle}</p>
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
            {suggestedAmount && (
              <p className="text-sm text-muted-foreground">
                Monto sugerido: S/ {suggestedAmount.toFixed(2)}
              </p>
            )}
          </div>

          {/* Metodo de pago */}
          <div className="space-y-3">
            <Label>Método de pago *</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} 
              disabled={isPending}
            >
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer flex-1 font-normal">
                    <span className="text-xl">{method.icon}</span>
                    <span>{method.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="note">Nota (opcional)</Label>
            <Textarea
              id="note"
              placeholder="Añade un mensaje..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={200}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">{note.length}/200</p>
          </div>
        </div>

        {/* Actions */}
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
      </DialogContent>
    </Dialog>
  );
}
