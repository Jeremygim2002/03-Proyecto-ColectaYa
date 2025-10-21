import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";
import type { CollectionFormData } from "../hooks/useCollectionForm";

interface BasicInfoStepProps {
  formData: CollectionFormData;
  onUpdate: <K extends keyof CollectionFormData>(
    field: K,
    value: CollectionFormData[K]
  ) => void;
}

export function BasicInfoStep({ formData, onUpdate }: BasicInfoStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">

      <div className="space-y-2">
        <Label htmlFor="title">
          Nombre de la colecta <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ej: Viaje a Cusco 2025"
          value={formData.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">
          {formData.title.length}/50 caracteres
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Describe brevemente el propósito de esta colecta..."
          value={formData.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          maxLength={200}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          {formData.description.length}/150 caracteres
        </p>

        {/* Privacidad de la colecta */}
        <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/40 p-4">
          <div>
            <Label htmlFor="isPrivate" className="cursor-pointer">
              Colecta privada
            </Label>
            <p className="text-xs text-muted-foreground">
              Si es privada, solo usuarios invitados podrán verla y unirse.
            </p>
          </div>
          <Switch
            id="isPrivate"
            checked={formData.isPrivate}
            onCheckedChange={(checked) => onUpdate("isPrivate", !!checked)}
          />
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">
                Imagen generada automáticamente con IA
              </p>
              <p className="text-xs text-muted-foreground">
                Colectaya creará una imagen única basada en los datos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
