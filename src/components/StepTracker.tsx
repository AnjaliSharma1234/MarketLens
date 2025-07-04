
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepTrackerProps {
  currentStep: number;
  steps: string[];
}

const StepTracker = ({ currentStep, steps }: StepTrackerProps) => {
  const formatStepText = (step: string) => {
    if (step === "Generating Report") {
      return (
        <span className="text-center leading-tight">
          Generating<br />Report
        </span>
      );
    }
    return step;
  };

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center justify-between w-full max-w-4xl px-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={step} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors mb-2",
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
                  "text-xs font-medium text-center min-h-[2rem] flex items-center justify-center px-1",
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                    ? "text-slate-900"
                    : "text-slate-500"
                )}
              >
                {formatStepText(step)}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 h-0.5 transition-colors",
                    isCompleted ? "bg-primary" : "bg-slate-200"
                  )}
                  style={{
                    left: `${((100 / steps.length) * (index + 1)) - (50 / steps.length)}%`,
                    width: `${100 / steps.length}%`,
                    transform: 'translateX(-50%)'
                  }}
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
