import { Check } from "lucide-react";
import { STEPS } from "@/data/steps.data";
import { getStepStatus, calculateProgress } from "../../utils/stepUtils";
import type { StepperProps } from "../../types/form.types";

export const MobileStepper = ({
  currentStep,
  completedSteps,
  onStepChange,
}: StepperProps) => {
  return (
    <div className="lg:hidden">
      <div className="flex overflow-x-auto pb-3 space-x-1 scrollbar-hide">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const { isCompleted, isCurrent, isClickable } = getStepStatus(
            index,
            currentStep,
            completedSteps
          );

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepChange(index)}
              disabled={!isClickable}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[70px] ${
                isCurrent
                  ? "bg-blue-100 border-2 border-blue-300 shadow-sm"
                  : isCompleted
                  ? "bg-green-100 border-2 border-green-300"
                  : isClickable
                  ? "bg-gray-50 border border-gray-300 hover:bg-gray-100"
                  : "opacity-40 cursor-not-allowed border border-gray-200"
              }`}
            >
              <div
                className={`p-1 rounded-full ${
                  isCurrent
                    ? "bg-blue-200"
                    : isCompleted
                    ? "bg-green-200"
                    : "bg-gray-200"
                }`}
              >
                {isCompleted ? (
                  <Check
                    className={`h-4 w-4 ${
                      isCurrent ? "text-blue-700" : "text-green-700"
                    }`}
                  />
                ) : (
                  <Icon
                    className={`h-4 w-4 ${
                      isCurrent
                        ? "text-blue-700"
                        : isClickable
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  />
                )}
              </div>
              <div className="text-center">
                <div
                  className={`text-[9px] font-medium leading-tight ${
                    isCurrent
                      ? "text-blue-800"
                      : isCompleted
                      ? "text-green-800"
                      : "text-gray-600"
                  }`}
                >
                  {step.title.split(" ").map((word, i) => (
                    <div key={i}>{word}</div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Indicateur de progression mobile */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span className="font-medium">Progression</span>
          <span className="font-bold text-blue-600">
            {calculateProgress(completedSteps)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 shadow-sm"
            style={{
              width: `${calculateProgress(completedSteps)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
