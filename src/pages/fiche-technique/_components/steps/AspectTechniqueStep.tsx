import { Textarea } from "@/components/ui/textarea";
import { FormField } from "../form/FormField";
import type { StepContentProps } from "../../types/form.types";

export const AspectTechniqueStep = ({ control }: StepContentProps) => {
  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="aspectTechnique.planningPrevisionnel"
        label="Planning prévisionnel"
        placeholder="Décrivez le planning par phases : analyse (semaine 1-2), développement (semaine 3-8), tests (semaine 9-10)..."
        as={Textarea}
        rows={2}
      />
      <FormField
        control={control}
        name="aspectTechnique.moyenLogiciel"
        label="Moyens logiciels"
        placeholder="Technologies, frameworks, IDE, bases de données, outils de versioning..."
        as={Textarea}
        rows={2}
      />
      <FormField
        control={control}
        name="aspectTechnique.moyenMateriel"
        label="Moyens matériels"
        placeholder="Ordinateur, serveurs, équipements réseau, licences logicielles..."
        as={Textarea}
        rows={2}
      />
    </div>
  );
};
