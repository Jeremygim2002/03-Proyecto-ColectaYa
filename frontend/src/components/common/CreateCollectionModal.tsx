"use client";

import { useOptimistic, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useStepNavigation } from "../collection-modal/hooks/useStepNavigation";
import { useCollectionForm } from "../collection-modal/hooks/useCollectionForm";
import { StepIndicator } from "../collection-modal/components";

// Importaciones directas (sin lazy loading para formularios)
import { BasicInfoStep } from "../collection-modal/steps/BasicInfoStep";
import { ConfigurationStep } from "../collection-modal/steps/ConfigurationStep";
import { MembersStep } from "../collection-modal/steps/MembersStep";
import { SummaryStep } from "../collection-modal/steps/SummaryStep";

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

// Eliminado StepSkeleton - no es necesario para formularios

const STEPS = [
  { number: 1, label: "Información Básica" },
  { number: 2, label: "Configuración" },
  { number: 3, label: "Miembros" },
  { number: 4, label: "Resumen" }
];

export default function CreateCollectionModal({ 
  isOpen, 
  onClose,
  step: initialStep = 1
}: CreateCollectionModalProps) {
  const { currentStep, nextStep, prevStep } = useStepNavigation(initialStep);
  const { formData, updateField, validateStep, addMember, removeMember, resetForm } = useCollectionForm();
  
  // Estado optimista para UX más fluida
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

  // Validar si el formulario está completo
  const isFormValid = validateStep(1) && validateStep(2) && formData.members.length > 0;

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    // Actualización optimista inmediata
    addOptimistic({ type: 'start' });
    
    startTransition(async () => {
      try {
        // Simular progreso de envío optimista
        addOptimistic({ type: 'progress', progress: 25 });
        
        // llamada real a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        addOptimistic({ type: 'progress', progress: 75 });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        addOptimistic({ type: 'success' });
        
        toast.success("¡Colecta creada exitosamente!");
        
        // Reset después de mostrar éxito
        setTimeout(() => {
          addOptimistic({ type: 'reset' });
          resetForm();
          onClose();
        }, 1500);
        
      } catch (error) {
        addOptimistic({ type: 'error' });
        toast.error("Error al crear la colecta");
        console.error("Error creating collection:", error);
      }
    });
  };

  const handleClose = () => {
    if (optimisticState.isSubmitting) {
      toast.warning("Espera a que termine el proceso...");
      return;
    }
    addOptimistic({ type: 'reset' });
    resetForm();
    onClose();
  };

  const canGoNext = currentStep < 4 && !optimisticState.isSubmitting;
  const canGoPrev = currentStep > 1 && !optimisticState.isSubmitting;
  const showSubmit = currentStep === 4 && !optimisticState.isSuccess;

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

        {/* Indicador de progreso optimista */}
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
              {currentStep === 4 && (
                <SummaryStep formData={formData} />
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
