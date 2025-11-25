import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    {
                      "border-primary bg-primary text-primary-foreground": isActive || isCompleted,
                      "border-muted bg-background text-muted-foreground": !isActive && !isCompleted,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                <p
                  className={cn("mt-2 text-xs font-medium", {
                    "text-primary": isActive || isCompleted,
                    "text-muted-foreground": !isActive && !isCompleted,
                  })}
                >
                  {step.label}
                </p>
              </div>

              {!isLast && (
                <div className="flex-1 px-2 pb-6">
                  <div
                    className={cn("h-0.5 w-full transition-all", {
                      "bg-primary": isCompleted,
                      "bg-muted": !isCompleted,
                    })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
