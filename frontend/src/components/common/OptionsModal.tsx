"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, FileDown } from "lucide-react";

interface OptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OptionsModal({ open, onOpenChange }: OptionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Más opciones
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Estadísticas */}
          <button
            className="w-full flex items-center gap-4 rounded-lg border-2 border-border p-4 transition-all hover:border-primary hover:bg-primary/5 active:scale-95 text-left"
            onClick={() => onOpenChange(false)}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-foreground">
                Ver estadísticas
              </p>
              <p className="text-xs text-muted-foreground">
                Detalles completos de la colecta
              </p>
            </div>
            <div className="px-2 py-1 rounded-md bg-warning/10 text-warning text-[10px] font-medium shrink-0">
              Próximamente
            </div>
          </button>

          {/* Descargar reporte */}
          <button
            className="w-full flex items-center gap-4 rounded-lg border-2 border-border p-4 transition-all hover:border-primary hover:bg-primary/5 active:scale-95 text-left"
            onClick={() => onOpenChange(false)}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success shrink-0">
              <FileDown className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-foreground">
                Descargar reporte
              </p>
              <p className="text-xs text-muted-foreground">
                Exportar en formato PDF
              </p>
            </div>
            <div className="px-2 py-1 rounded-md bg-warning/10 text-warning text-[10px] font-medium shrink-0">
              Próximamente
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
