"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa";
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
      <DialogContent className="sm:max-w-md max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Compartir colecta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Redes sociales */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">
              Redes sociales
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareOnWhatsApp}
                className="flex items-center gap-3 rounded-lg border-2 border-border p-4 transition-all hover:border-[#25D366] hover:bg-[#25D366]/5 active:scale-95"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#25D366] text-white shrink-0">
                  <FaWhatsapp className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-sm sm:text-base font-medium text-left">WhatsApp</span>
              </button>

              <button
                onClick={shareOnFacebook}
                className="flex items-center gap-3 rounded-lg border-2 border-border p-4 transition-all hover:border-[#1877F2] hover:bg-[#1877F2]/5 active:scale-95"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#1877F2] text-white shrink-0">
                  <FaFacebookF className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-sm sm:text-base font-medium text-left">Facebook</span>
              </button>
            </div>
          </div>

          {/* Link */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">
              O copia el enlace
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 rounded-md border border-input bg-muted px-3 py-3 sm:py-2 text-sm select-all cursor-pointer"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                variant="outline"
                size="default"
                onClick={handleCopy}
                className="shrink-0 w-full sm:w-auto py-3 sm:py-2 font-medium"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    <span>Copiar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
