
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepTrackerProps {
  currentStep: number;
  steps: string[];
}

const StepTracker = ({ currentStep, steps }: StepTrackerProps) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center w-full max-w-2xl">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted
                      ? "bg-primary text-white"
                      : isCurrent
                      ? "bg-primary text-white"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-slate-900"
                      : "text-slate-500"
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    isCompleted ? "bg-primary" : "bg-slate-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepTracker;
