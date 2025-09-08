import { Check } from "lucide-react";
import { STEPS } from "@/data/steps.data";
import { getStepStatus, calculateProgress } from "../../utils/stepUtils";
import type { StepperProps } from "../../types/form.types";

export const DesktopStepper = ({
  currentStep,
  completedSteps,
  onStepChange,
}: StepperProps) => {
  return (
    <div className="hidden lg:block space-y-2">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const { isCompleted, isCurrent, isClickable } = getStepStatus(
          index,
          currentStep,
          completedSteps
        );

        return (
          <div key={step.id} className="relative">
            <button
              onClick={() => isClickable && onStepChange(index)}
              disabled={!isClickable}
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-200 text-left ${
                isCurrent
                  ? "bg-blue-50 border-2 border-blue-200"
                  : isCompleted
                  ? "bg-green-50 border border-green-200 hover:bg-green-100"
                  : isClickable
                  ? "hover:bg-gray-50 border border-gray-200"
                  : "opacity-50 cursor-not-allowed border border-gray-100"
              }`}
            >
              {/* Indicateur circulaire */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? "bg-green-600 text-white"
                    : isCurrent
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-xs font-medium truncate ${
                    isCurrent
                      ? "text-blue-700"
                      : isCompleted
                      ? "text-green-700"
                      : "text-gray-600"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  {step.subtitle}
                </div>
              </div>
            </button>

            {/* Ligne de connexion */}
            {index < STEPS.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-2 bg-gray-200">
                <div
                  className={`w-full transition-all duration-300 ${
                    isCompleted ? "bg-green-600 h-full" : "bg-gray-200 h-0"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Indicateur de progression compact */}
      <div className="mt-4 pt-3 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Progression</span>
          <span>{calculateProgress(completedSteps)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${calculateProgress(completedSteps)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
