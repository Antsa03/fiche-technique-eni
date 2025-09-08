import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import type { FormActionsProps } from "../../types/form.types";

export const FormActions = ({
  currentStep,
  totalSteps,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit,
}: FormActionsProps) => {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="mt-3 lg:mt-4 pt-3 border-t flex-shrink-0">
      {/* Mobile: Actions en pile */}
      <div className="lg:hidden space-y-2">
        <div className="flex justify-center">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            Étape {currentStep + 1} / {totalSteps}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={currentStep === 0}
            className="w-full py-3 text-sm border-2"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>

          {isLastStep ? (
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full py-3 text-sm font-medium"
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onNext}
              className="w-full py-3 text-sm font-medium"
              size="sm"
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Desktop: Actions en ligne */}
      <div className="hidden lg:flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm bg-transparent"
          size="sm"
        >
          <ChevronLeft className="h-3 w-3 mr-1" />
          Précédent
        </Button>

        <Badge variant="secondary" className="px-2 py-1 text-xs">
          Étape {currentStep + 1} / {totalSteps}
        </Badge>

        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 text-sm"
            size="sm"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="h-3 w-3 mr-1" />
                Confirmer et envoyer
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            className="px-4 py-2 text-sm"
            size="sm"
          >
            Suivant
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};
