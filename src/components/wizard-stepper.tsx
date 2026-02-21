import { CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface StepDef {
  label: string;
  icon: LucideIcon;
  desc: string;
}

export function WizardStepper({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: readonly StepDef[];
  currentStep: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 pt-2">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={s.label} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={`h-0.5 w-4 sm:w-8 ${isDone ? "bg-primary" : "bg-muted"}`}
              />
            )}
            <button
              type="button"
              onClick={() => i <= currentStep && onStepClick(i)}
              disabled={i > currentStep}
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isDone
                    ? "bg-primary/20 text-primary cursor-pointer"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
