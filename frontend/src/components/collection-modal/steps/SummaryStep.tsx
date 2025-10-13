import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Target,
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import type { CollectionFormData } from "../hooks/useCollectionForm";

interface SummaryStepProps {
  formData: CollectionFormData;
}

export function SummaryStep({ formData }: SummaryStepProps) {
  const formatAmount = (amount: string) => {
    const num = parseFloat(amount) || 0;
    return `S/ ${num.toFixed(2)}`;
  };

  const getPaymentModeLabel = () => {
    if (formData.paymentMode === "unico") return "Pago único";
    return `Pago recurrente (${formData.period})`;
  };

  const getWithdrawalTypeLabel = () => {
    const types: Record<string, string> = {
      manual: "Retiro manual",
      goal: "Al alcanzar la meta",
      deadline: "En una fecha límite",
    };
    return types[formData.withdrawalType] || formData.withdrawalType;
  };

  const getInitials = (text: string) => {
    const parts = text.split(/[@\s.]/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : text.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              ¡Todo listo para crear tu colecta!
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Revisa la información antes de continuar
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{formData.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {formData.description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Meta económica</p>
                <p className="text-2xl font-bold">{formatAmount(formData.goal)}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tipo de retiro</span>
                <span className="font-medium">{getWithdrawalTypeLabel()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">División de monto</span>
                <span className="font-medium">
                  {formData.splitEqually === "yes" ? "División equitativa" : "Montos libres"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Modo de pago</p>
                <p className="text-lg font-semibold">{getPaymentModeLabel()}</p>
              </div>
            </div>

            {formData.paymentMode === "recurrente" && (
              <>
                <Separator />
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Periodo</span>
                    <Badge variant="outline" className="capitalize">
                      {formData.period}
                    </Badge>
                  </div>
                  {formData.endDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fecha de fin</span>
                      <span className="font-medium">
                        {new Date(formData.endDate).toLocaleDateString("es-PE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Miembros invitados</p>
                <p className="text-lg font-semibold">
                  {formData.members.length === 0
                    ? "Sin miembros"
                    : `${formData.members.length} miembro${formData.members.length > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            {formData.members.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  {formData.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(member.identifier)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{member.identifier}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.type === "email" ? "Correo electrónico" : "Teléfono"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-muted bg-muted/50 p-3">
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Podrás editar la información de la colecta desde el panel de administración después de
            crearla
          </p>
        </div>
      </div>
    </div>
  );
}
