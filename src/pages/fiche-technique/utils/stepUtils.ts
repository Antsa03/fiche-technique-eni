import { STEPS } from "@/data/steps.data";

export const calculateProgress = (completedSteps: Set<number>) => {
  return Math.round((completedSteps.size / (STEPS.length - 1)) * 100);
};

export const isStepClickable = (
  stepIndex: number,
  currentStep: number,
  completedSteps: Set<number>
) => {
  return stepIndex <= currentStep || completedSteps.has(stepIndex);
};

export const getStepStatus = (
  stepIndex: number,
  currentStep: number,
  completedSteps: Set<number>
) => {
  const isCompleted = completedSteps.has(stepIndex);
  const isCurrent = currentStep === stepIndex;
  const isClickable = isStepClickable(stepIndex, currentStep, completedSteps);

  return {
    isCompleted,
    isCurrent,
    isClickable,
  };
};
