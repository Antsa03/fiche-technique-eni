import { Card, CardContent } from "@/components/ui/card";

interface MobileHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export const MobileHeader = ({
  currentStep,
  totalSteps,
}: MobileHeaderProps) => {
  return (
    <div className="lg:hidden mb-2">
      <Card>
        <CardContent className="p-3">
          <h2 className="text-lg font-bold text-center text-gray-900">
            Fiche Technique de Stage
          </h2>
          <p className="text-sm text-center text-gray-600 mt-1">
            Étape {currentStep + 1} sur {totalSteps}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
