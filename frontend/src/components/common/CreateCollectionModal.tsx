"use client";

import { useOptimistic, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useStepNavigation } from "../collection-modal/hooks/useStepNavigation";
import { useCollectionForm } from "../collection-modal/hooks/useCollectionForm";
import { StepIndicator } from "../collection-modal/components";
import { collectionsApi } from "@/api/endpoints/collections";
import { invitationsApi } from "@/api/endpoints/invitations";
import { mapFormToApiData, validateFormData } from "@/utils/collectionMapper";
import { useAuthStore } from "@/stores/authStore";
import type { CreateInvitationData } from '@/types';

import { BasicInfoStep } from "../collection-modal/steps/BasicInfoStep";
import { ConfigurationStep } from "../collection-modal/steps/ConfigurationStep";
import { MembersStep } from "../collection-modal/steps/MembersStep";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  step?: number;
}

interface OptimisticState {
  isSubmitting: boolean;
  isSuccess: boolean;
  progress: number;
}

const STEPS = [
  { number: 1, label: "Información" },
  { number: 2, label: "Configuración" },
  { number: 3, label: "Miembros" },
];

export default function CreateCollectionModal({ 
  isOpen, 
  onClose,
  step: initialStep = 1
}: CreateCollectionModalProps) {
  const { currentStep, nextStep, prevStep } = useStepNavigation(initialStep);
  const { formData, updateField, addMember, removeMember, resetForm } = useCollectionForm();
  const { isAuthenticated, user } = useAuthStore();
  
  const [optimisticState, addOptimistic] = useOptimistic(
    { isSubmitting: false, isSuccess: false, progress: 0 },
    (state: OptimisticState, action: { type: string; progress?: number }) => {
      switch (action.type) {
        case 'start':
          return { isSubmitting: true, isSuccess: false, progress: 0 };
        case 'progress':
          return { ...state, progress: action.progress || 0 };
        case 'success':
          return { isSubmitting: false, isSuccess: true, progress: 100 };
        case 'error':
          return { isSubmitting: false, isSuccess: false, progress: 0 };
        case 'reset':
          return { isSubmitting: false, isSuccess: false, progress: 0 };
        default:
          return state;
      }
    }
  );

  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    // Verificar autenticación
    if (!isAuthenticated || !user) {
      toast.error("Debes iniciar sesión para crear una colecta");
      return;
    }

    // Validar formulario antes de enviar
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    startTransition(async () => {
      try {
        // Actualización optimista inicial
        addOptimistic({ type: 'start' });
        
        // Preparar datos para la API
        addOptimistic({ type: 'progress', progress: 25 });
        const collectionData = mapFormToApiData(formData);
        
        // Crear la colección
        addOptimistic({ type: 'progress', progress: 50 });
        const newCollection = await collectionsApi.create(collectionData);
        
        // Crear invitaciones para los miembros si hay
        addOptimistic({ type: 'progress', progress: 75 });
        if (formData.members.length > 0) {
          const invitationPromises = formData.members
            .filter(member => member.type === 'email')
            .map(member => {
              const invitationData: CreateInvitationData = {
                collectionId: newCollection.id,
                invitedEmail: member.identifier,
              };
              return invitationsApi.create(invitationData);
            });
          
          await Promise.allSettled(invitationPromises);
        }
        
        addOptimistic({ type: 'success' });
        toast.success("¡Colecta creada exitosamente!");
        
        setTimeout(() => {
          addOptimistic({ type: 'reset' });
          resetForm();
          onClose();
          window.location.reload();
        }, 1500);
        
      } catch (error) {
        addOptimistic({ type: 'error' });
        
        if (error && typeof error === 'object' && 'message' in error) {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error("Error al crear la colecta. Intenta nuevamente.");
        }
      }
    });
  };

  const handleClose = () => {
    if (optimisticState.isSubmitting) {
      toast.warning("Espera a que termine el proceso...");
      return;
    }
    
    startTransition(() => {
      addOptimistic({ type: 'reset' });
      resetForm();
      onClose();
    });
  };

  const canGoNext = currentStep < 3 && !optimisticState.isSubmitting;
  const canGoPrev = currentStep > 1 && !optimisticState.isSubmitting;
  const showSubmit = currentStep === 3 && !optimisticState.isSuccess;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {optimisticState.isSuccess ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="w-6 h-6" />
                ¡Colecta Creada!
              </div>
            ) : (
              "Crear Nueva Colecta"
            )}
          </DialogTitle>
        </DialogHeader>

        {optimisticState.isSubmitting && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              Creando colecta... {optimisticState.progress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${optimisticState.progress}%` }}
              />
            </div>
          </div>
        )}

        {!optimisticState.isSuccess && (
          <>
            <StepIndicator steps={STEPS} currentStep={currentStep} />
            
            <div className="mt-6">
              {currentStep === 1 && (
                <BasicInfoStep
                  formData={formData}
                  onUpdate={updateField}
                />
              )}
              {currentStep === 2 && (
                <ConfigurationStep
                  formData={formData}
                  onUpdate={updateField}
                />
              )}
              {currentStep === 3 && (
                <MembersStep
                  members={formData.members}
                  onAddMember={addMember}
                  onRemoveMember={removeMember}
                />
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={!canGoPrev}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              {showSubmit ? (
                <Button
                  onClick={handleSubmit}
                  disabled={optimisticState.isSubmitting || isPending}
                  className="flex items-center gap-2"
                >
                  {optimisticState.isSubmitting ? (
                    "Creando..."
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Crear Colecta
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canGoNext}
                  className="flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
