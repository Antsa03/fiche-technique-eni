import { useState, useCallback } from "react";
import { STEPS } from "@/data/steps.data";
import type { FormData } from "../types/form.types";

interface UseFormNavigationProps {
  trigger: (field?: keyof FormData | (keyof FormData)[]) => Promise<boolean>;
}

export const useFormNavigation = ({ trigger }: UseFormNavigationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const validateCurrentStep = useCallback(async () => {
    // Skip validation for summary step
    if (currentStep === STEPS.length - 1) {
      return true;
    }

    try {
      const stepKey = STEPS[currentStep].id as keyof FormData;
      const isValid = await trigger(stepKey);

      if (isValid) {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      }

      return isValid;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  }, [currentStep, trigger]);

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
        setCurrentStep(stepIndex);
      } else if (stepIndex === currentStep + 1) {
        await nextStep();
      }
    },
    [currentStep, completedSteps, nextStep]
  );

  return {
    currentStep,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,
  };
};
