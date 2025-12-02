"use client";

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateCollectionModal from '@/components/common/CreateCollectionModal';

const HIDDEN_PAGES = [
  '/auth/callback',
  '/login',
  '/auth/login', 
  '/onboarding',
  '/404',
  '/not-found',
];

export function FloatingAction() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const shouldHide = HIDDEN_PAGES.some(page => 
    location.pathname === page || location.pathname.startsWith(page)
  ) || location.pathname.startsWith('/collections/');

  if (shouldHide) return null;

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
