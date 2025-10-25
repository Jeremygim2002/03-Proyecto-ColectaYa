"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
}

export function ShareModal({ open, onOpenChange, title, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Error al copiar el enlace");
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`¡Únete a esta colecta! ${title}\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareOnFacebook = () => {
    const shareUrl = encodeURIComponent(url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir colecta</DialogTitle>
          <DialogDescription>
            Comparte tu colecta con amigos y familiares en redes sociales
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Redes sociales */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={shareOnWhatsApp}
              className="flex flex-col items-center gap-2 rounded-lg border-2 border-border p-4 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white text-2xl">
                <span>📱</span>
              </div>
              <span className="text-xs font-medium">WhatsApp</span>
            </button>

            <button
              onClick={shareOnFacebook}
              className="flex flex-col items-center gap-2 rounded-lg border-2 border-border p-4 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-white text-2xl">
                <span>📘</span>
              </div>
              <span className="text-xs font-medium">Facebook</span>
            </button>
          </div>

          {/* Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">O copia el enlace</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
