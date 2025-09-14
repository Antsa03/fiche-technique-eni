import { Card, CardContent } from "@/components/ui/card";
import { MobileHeader } from "./MobileHeader";
import { STEPS } from "@/data/steps.data";
import { ANNEE_UNIVERSITAIRE_ACTUELLE } from "@/lib/constants";

interface PageLayoutProps {
  currentStep: number;
  children: React.ReactNode;
  sidebar: React.ReactNode;
  actions: React.ReactNode;
}

export const PageLayout = ({
  currentStep,
  children,
  sidebar,
  actions,
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 py-1 sm:py-2 px-1 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Layout principal - optimisé mobile */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 min-h-[calc(100vh-60px)] lg:h-[calc(100vh-120px)]">
          {/* Header mobile avec titre */}
          <MobileHeader currentStep={currentStep} totalSteps={STEPS.length} />

          {/* Sidebar avec stepper */}
          {sidebar}

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <Card className="h-full overflow-visible">
              <CardContent className="p-3 lg:p-4 h-full flex flex-col overflow-visible">
                {/* Contenu du formulaire - responsive */}
                <div className="flex-1 overflow-y-auto overflow-x-visible pr-1 lg:pr-2">
                  {children}
                </div>

                {/* Actions */}
                {actions}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center text-base text-gray-500">
        <p>Année universitaire: {ANNEE_UNIVERSITAIRE_ACTUELLE}</p>
      </div>
    </div>
  );
};
