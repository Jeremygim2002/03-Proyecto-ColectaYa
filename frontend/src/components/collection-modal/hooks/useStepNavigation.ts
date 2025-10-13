import { useState } from "react";

export function useStepNavigation(initialStep = 1, totalSteps = 4) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const reset = () => {
    setCurrentStep(initialStep);
  };

  return {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    reset,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    progress: (currentStep / totalSteps) * 100,
  };
}
