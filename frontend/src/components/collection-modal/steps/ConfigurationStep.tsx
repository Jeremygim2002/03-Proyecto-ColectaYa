import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { CollectionFormData } from "../hooks/useCollectionForm";

interface ConfigurationStepProps {
  formData: CollectionFormData;
  onUpdate: <K extends keyof CollectionFormData>(
    field: K,
    value: CollectionFormData[K]
  ) => void;
}

export function ConfigurationStep({ formData, onUpdate }: ConfigurationStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Monto final */}
      <div className="space-y-2">
        <Label htmlFor="goal">
          Monto objetivo <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            S/
          </span>
          <Input
            id="goal"
            type="number"
            placeholder="5000.00"
            value={formData.goal}
            onChange={(e) => onUpdate("goal", e.target.value)}
            min="0"
            step="0.01"
            className="pl-10"
          />
        </div>
      </div>

      {/* Tipo de retiro */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Tipo de retiro</Label>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button type="button" className="focus:outline-none">
                  <HelpCircle className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  <strong>Al 100%:</strong> Solo se puede retirar cuando se alcance la meta completa.
                  <br />
                  <strong>Por rango:</strong> Retiros parciales al alcanzar ciertos porcentajes.
                  <br />
                  <strong>Libre:</strong> Retiros en cualquier momento.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={formData.withdrawalType}
          onValueChange={(v) => onUpdate("withdrawalType", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="al100">Al 100% del objetivo</SelectItem>
            <SelectItem value="rango">Por rango de avance</SelectItem>
            <SelectItem value="libre">Libre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sección dividida en partes iguales */}
      <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>¿Dividir el monto equitativamente entre los miembros?</Label>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button type="button" className="focus:outline-none">
                    <HelpCircle className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Colectaya calculará automáticamente cuánto le corresponde aportar a cada miembro
                    según la cantidad de participantes y el plazo definido.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <RadioGroup
            value={formData.splitEqually}
            onValueChange={(v: string) => onUpdate("splitEqually", v as "yes" | "no")}
          >
            <div className="flex items-center space-x-3 rounded-lg border bg-background p-3 hover:bg-muted/50">
              <RadioGroupItem value="no" id="split-no" />
              <Label htmlFor="split-no" className="flex-1 cursor-pointer font-normal">
                No, cada miembro aporta libremente
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border bg-background p-3 hover:bg-muted/50">
              <RadioGroupItem value="yes" id="split-yes" />
              <Label htmlFor="split-yes" className="flex-1 cursor-pointer font-normal">
                Sí, dividir equitativamente
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Metodo de pago */}
        {formData.splitEqually === "yes" && (
          <div className="space-y-4 animate-fade-in border-t pt-4">
            <div className="space-y-3">
              <Label>Tipo de pago</Label>
              <RadioGroup
                value={formData.paymentMode}
                onValueChange={(v: string) =>
                  onUpdate("paymentMode", v as "unico" | "recurrente")
                }
              >
                <div className="flex items-center space-x-3 rounded-lg border bg-background p-3 hover:bg-muted/50">
                  <RadioGroupItem value="unico" id="payment-unico" />
                  <Label htmlFor="payment-unico" className="flex-1 cursor-pointer font-normal">
                    Pago único
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border bg-background p-3 hover:bg-muted/50">
                  <RadioGroupItem value="recurrente" id="payment-recurrente" />
                  <Label
                    htmlFor="payment-recurrente"
                    className="flex-1 cursor-pointer font-normal"
                  >
                    Pagos recurrentes
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Opciones de pago recurrente */}
            {formData.paymentMode === "recurrente" && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="period">Período de pago</Label>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button type="button" className="focus:outline-none">
                            <HelpCircle className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Frecuencia con la que cada miembro realizará sus aportes
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={formData.period} onValueChange={(v) => onUpdate("period", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="endDate">Fecha límite</Label>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button type="button" className="focus:outline-none">
                            <HelpCircle className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Fecha límite para completar los pagos recurrentes
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => onUpdate("endDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
