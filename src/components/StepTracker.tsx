
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

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative w-full max-w-4xl px-4">
        {/* Progress Bar Background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200" style={{ 
          left: `${(100 / steps.length) / 2}%`, 
          right: `${(100 / steps.length) / 2}%` 
        }} />
        
        {/* Progress Bar Fill */}
        <div 
          className="absolute top-4 h-0.5 bg-primary transition-all duration-500 ease-out" 
          style={{ 
            left: `${(100 / steps.length) / 2}%`, 
            width: `${(progressPercentage * (100 - 100 / steps.length)) / 100}%` 
          }} 
        />

        {/* Steps Container */}
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={step} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors mb-2 relative z-10 bg-white border-2",
                    isCompleted
                      ? "bg-primary text-white border-primary"
                      : isCurrent
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-600 border-slate-200"
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepTracker;
