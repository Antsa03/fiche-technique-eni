import { Card, CardContent } from "@/components/ui/card";
import { MobileStepper } from "./MobileStepper";
import { DesktopStepper } from "./DesktopStepper";
import type { StepperProps } from "../../types/form.types";

export const Stepper = (props: StepperProps) => {
  return (
    <div className="lg:w-56 flex-shrink-0">
      <Card className="h-full">
        <CardContent className="p-2 lg:p-3">
          <MobileStepper {...props} />
          <DesktopStepper {...props} />
        </CardContent>
      </Card>
    </div>
  );
};
