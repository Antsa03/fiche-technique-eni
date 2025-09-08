import * as React from "react";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
  completed?: boolean;
};

type StepperContextValue = {
  activeStep: number;
  steps: Step[];
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
};

const StepperContext = React.createContext<StepperContextValue | undefined>(
  undefined
);

function useStepper() {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a StepperProvider");
  }
  return context;
}

interface StepperProviderProps {
  steps: Step[];
  activeStep?: number;
  initialStep?: number;
  children: React.ReactNode;
}

function StepperProvider({
  steps,
  activeStep: controlledActiveStep,
  initialStep = 0,
  children,
}: StepperProviderProps) {
  const [activeStep, setActiveStep] = React.useState(initialStep);

  const currentActiveStep =
    controlledActiveStep !== undefined ? controlledActiveStep : activeStep;

  const isLastStep = currentActiveStep === steps.length - 1;
  const isFirstStep = currentActiveStep === 0;

  const goToStep = React.useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const nextStep = React.useCallback(() => {
    if (!isLastStep) {
      setActiveStep((prev) => prev + 1);
    }
  }, [isLastStep]);

  const prevStep = React.useCallback(() => {
    if (!isFirstStep) {
      setActiveStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const value = React.useMemo(
    () => ({
      activeStep: currentActiveStep,
      steps,
      goToStep,
      nextStep,
      prevStep,
      isLastStep,
      isFirstStep,
    }),
    [
      currentActiveStep,
      steps,
      goToStep,
      nextStep,
      prevStep,
      isLastStep,
      isFirstStep,
    ]
  );

  return (
    <StepperContext.Provider value={value}>{children}</StepperContext.Provider>
  );
}

interface StepperProps {
  activeStep?: number;
  steps: Step[];
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
  className?: string;
}

function Stepper({
  activeStep,
  steps,
  orientation = "horizontal",
  children,
  className,
}: StepperProps) {
  return (
    <StepperProvider steps={steps} activeStep={activeStep}>
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-col" : "flex-row gap-4",
          className
        )}
      >
        <StepperSteps orientation={orientation} />
        <div className="mt-6">{children}</div>
      </div>
    </StepperProvider>
  );
}

interface StepperStepsProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

function StepperSteps({
  orientation = "horizontal",
  className,
}: StepperStepsProps) {
  const { steps, activeStep } = useStepper();

  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal"
          ? "flex-row items-center justify-center mx-auto max-w-4xl"
          : "flex-col items-start",
        "gap-2",
        className
      )}
    >
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isCompleted = step.completed || index < activeStep;

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center gap-2",
                orientation === "vertical" && "flex-col"
              )}
            >
              <StepperStepIndicator
                isActive={isActive}
                isCompleted={isCompleted}
                stepNumber={index + 1}
              />
              <div
                className={cn(
                  "flex",
                  orientation === "horizontal"
                    ? "flex-col"
                    : "flex-row items-center gap-1"
                )}
              >
                <div
                  className={cn(
                    "text-sm font-medium",
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-primary/80"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                  {step.optional && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      (optionnel)
                    </span>
                  )}
                </div>
                {step.description && (
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <StepperSeparator
                orientation={orientation}
                isCompleted={index < activeStep}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface StepperStepIndicatorProps {
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
  className?: string;
}

function StepperStepIndicator({
  isActive,
  isCompleted,
  stepNumber,
  className,
}: StepperStepIndicatorProps) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-medium",
        isActive
          ? "border-green-500 bg-green-500 text-white"
          : isCompleted
          ? "border-green-500 bg-green-500/10 text-green-500"
          : "border-gray-300 text-gray-500",
        className
      )}
    >
      {isCompleted ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      ) : (
        stepNumber
      )}
    </div>
  );
}

interface StepperSeparatorProps {
  orientation?: "horizontal" | "vertical";
  isCompleted?: boolean;
  className?: string;
}

function StepperSeparator({
  orientation = "horizontal",
  isCompleted,
  className,
}: StepperSeparatorProps) {
  return (
    <div
      className={cn(
        orientation === "horizontal" ? "h-px grow" : "w-px h-6",
        isCompleted ? "bg-primary" : "bg-muted-foreground/20",
        className
      )}
    />
  );
}

interface StepProps {
  index: number;
  children: React.ReactNode;
}

function Step({ index, children }: StepProps) {
  const { activeStep } = useStepper();

  if (activeStep !== index) {
    return null;
  }

  return <div className="step">{children}</div>;
}

interface StepperActionsProps {
  className?: string;
  onFinish?: () => void;
  finishButtonLabel?: string;
  nextButtonLabel?: string;
  backButtonLabel?: string;
  canGoNext?: boolean;
}

function StepperActions({
  className,
  onFinish,
  finishButtonLabel = "Terminer",
  nextButtonLabel = "Suivant",
  backButtonLabel = "Précédent",
  canGoNext = true,
}: StepperActionsProps) {
  const { nextStep, prevStep, isLastStep, isFirstStep } = useStepper();

  return (
    <div className={cn("flex justify-between mt-8", className)}>
      <button
        type="button"
        onClick={prevStep}
        disabled={isFirstStep}
        className={cn(
          "flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm transition-colors",
          isFirstStep && "invisible"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        {backButtonLabel}
      </button>

      {!isLastStep ? (
        <button
          type="button"
          onClick={nextStep}
          disabled={!canGoNext}
          className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {nextButtonLabel}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={onFinish}
          className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg bg-green-600 text-white shadow-md hover:bg-green-700 transition-colors"
        >
          {finishButtonLabel}
        </button>
      )}
    </div>
  );
}

export { Stepper, Step, StepperActions, useStepper, type Step as StepType };
