import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
                  <strong>Libre:</strong> Retira en cualquier momento.
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
            <SelectItem value="libre">Libre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sección de fechas */}
      <div className="space-y-4 animate-fade-in border-t pt-4">
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
                    {formData.paymentMode === "recurrente"
                      ? "Fecha límite para completar los pagos recurrentes"
                      : "Fecha límite para completar la colecta"
                    }
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
    </div>
  );
}
