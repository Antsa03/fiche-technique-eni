import { Textarea } from "@/components/ui/textarea";
import { FormField } from "../form/FormField";
import type { StepContentProps } from "../../types/form.types";

export const SujetStep = ({ control }: StepContentProps) => {
  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="sujet.theme"
        label="Thème du stage"
        placeholder="Ex: Développement d'une application mobile de gestion"
      />
      <FormField
        control={control}
        name="sujet.objectif"
        label="Objectifs du stage"
        placeholder="Décrivez les objectifs principaux et les compétences à acquérir..."
        as={Textarea}
        rows={2}
      />
      <FormField
        control={control}
        name="sujet.descriptif"
        label="Descriptif détaillé"
        placeholder="Décrivez en détail les tâches, missions, livrables attendus et méthodologie..."
        as={Textarea}
        rows={3}
      />
    </div>
  );
};
