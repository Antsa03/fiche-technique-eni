"use client";

import { STEPS } from "@/data/steps.data";
import { PageLayout } from "./_components/layout/PageLayout";
import { Stepper } from "./_components/stepper/Stepper";
import { FormActions } from "./_components/form/FormActions";
import { EtablissementStep } from "./_components/steps/EtablissementStep";
import { EncadreurStep } from "./_components/steps/EncadreurStep";

import { SujetStep } from "./_components/steps/SujetStep";
import { AspectTechniqueStep } from "./_components/steps/AspectTechniqueStep";
import { RecapitulatifStep } from "./_components/steps/RecapitulatifStep";
import { useFormValidation } from "./hooks/useFormValidation";
import { useFormNavigation } from "./hooks/useFormNavigation";
import { useFormHandlers } from "./hooks/useFormHandlers";
import { StagiaireStep } from "./_components/steps/StagiaireStep";


export default function FicheTechniquePage() {
  // Form setup
  const form = useFormValidation();
  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting },
  } = form;

  // Navigation
  const { currentStep, completedSteps, nextStep, prevStep, goToStep } =
    useFormNavigation({ trigger });

  // Handlers
  const {
    handleEtablissementExistantChange,
    handleEncadreurExistantChange,
    handleEtablissementTypeChange,
    handleEncadreurTypeChange,
    onSubmit,
  } = useFormHandlers({ setValue });

  // Watch values
  const etablissementType = watch("etablissement.type");
  const encadreurType = watch("encadreur.type");
  const etablissementExistantId = watch(
    "etablissement.etablissementExistantId"
  );
  const encadreurExistantId = watch("encadreur.encadreurExistantId");

  const renderStepContent = () => {
    const currentStepData = STEPS[currentStep];

    if (currentStep === STEPS.length - 1) {
      return (
        <RecapitulatifStep
          control={control}
          watch={watch}
          setValue={setValue}
          trigger={trigger}
          getValues={getValues}
        />
      );
    }

    return (
      <div className="space-y-3">
        <div className="text-center pb-3 border-b">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <currentStepData.icon className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-foreground">
                {currentStepData.title}
              </h3>
              <p className="text-muted-foreground text-xs">
                {currentStepData.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto overflow-x-visible">
          {currentStep === 0 && (
            <EtablissementStep
              control={control}
              watch={watch}
              setValue={setValue}
              trigger={trigger}
              getValues={getValues}
              etablissementType={etablissementType}
              etablissementExistantId={etablissementExistantId || ""}
              onEtablissementTypeChange={handleEtablissementTypeChange}
              onEtablissementExistantChange={handleEtablissementExistantChange}
            />
          )}

          {currentStep === 1 && (
            <EncadreurStep
              control={control}
              watch={watch}
              setValue={setValue}
              trigger={trigger}
              getValues={getValues}
              encadreurType={encadreurType}
              encadreurExistantId={encadreurExistantId || ""}
              onEncadreurTypeChange={handleEncadreurTypeChange}
              onEncadreurExistantChange={handleEncadreurExistantChange}
            />
          )}

          {currentStep === 2 && (
            <StagiaireStep
              control={control}
              watch={watch}
              setValue={setValue}
              trigger={trigger}
              getValues={getValues}
            />
          )}

          {currentStep === 3 && (
            <SujetStep
              control={control}
              watch={watch}
              setValue={setValue}
              trigger={trigger}
              getValues={getValues}
            />
          )}

          {currentStep === 4 && (
            <AspectTechniqueStep
              control={control}
              watch={watch}
              setValue={setValue}
              trigger={trigger}
              getValues={getValues}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <PageLayout
      currentStep={currentStep}
      sidebar={
        <Stepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={goToStep}
        />
      }
      actions={
        <FormActions
          currentStep={currentStep}
          totalSteps={STEPS.length}
          isSubmitting={isSubmitting}
          onPrevious={prevStep}
          onNext={nextStep}
          onSubmit={handleSubmit(onSubmit)}
        />
      }
    >
      {renderStepContent()}
    </PageLayout>
  );
}
