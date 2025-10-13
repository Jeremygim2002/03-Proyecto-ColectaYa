"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateCollectionModal from "@/components/common/CreateCollectionModal";

interface FloatingActionProps {
  show?: boolean;
}

export function FloatingAction({ show = true }: FloatingActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!show) return null;

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary shadow-xl transition-all duration-200 motion-safe:hover:scale-105 hover:shadow-2xl md:h-16 md:w-auto md:px-6"
        onClick={() => setIsModalOpen(true)}
        aria-label="Crear colecta"
      >
        <Plus className="h-6 w-6 md:mr-2" />
        <span className="hidden md:inline">Crear colecta</span>
      </Button>

      <CreateCollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
