import { Controller, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { etudiants, formatEtudiantWithMatricule } from "@/data/etudiant.data";
import type { StepContentProps } from "../../types/form.types";

export const StagiaireStep = ({ control, trigger }: StepContentProps) => {
  // Préparer les options pour le MultiSelectCombobox
  const etudiantOptions = etudiants.map((etudiant) =>
    formatEtudiantWithMatricule(etudiant)
  );

  // Surveiller le niveau d'étude pour ajuster les contraintes
  const niveau = useWatch({
    control,
    name: "étudiant.niveau",
  });

  // Fonction pour obtenir le nombre maximum de étudiants selon le niveau
  const getMaxétudiants = (niveauEtude: string): number => {
    switch (niveauEtude) {
      case "L1":
        return 5;
      case "L2":
        return 2;
      case "L3":
        return 1;
      case "M1":
        return 4;
      case "M2":
        return 1;
      default:
        return 5; // Par défaut
    }
  };

  // Fonction pour obtenir le texte d'aide selon le niveau
  const getHelpText = (niveauEtude: string): string => {
    switch (niveauEtude) {
      case "L1":
        return "💡 Maximum 5 étudiants pour le niveau L1.";
      case "L2":
        return "💡 Maximum 2 étudiants pour le niveau L2.";
      case "L3":
        return "💡 1 seul étudiant autorisé pour le niveau L3.";
      case "M1":
        return "💡 Maximum 4 étudiants pour le niveau M1.";
      case "M2":
        return "💡 1 seul étudiant autorisé pour le niveau M2.";
      default:
        return "💡 Veuillez d'abord sélectionner un niveau d'étude.";
    }
  };

  const maxétudiants = niveau ? getMaxétudiants(niveau) : 5;
  const helpText = getHelpText(niveau);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
          Niveau d'étude <span className="text-secondary">*</span>
        </Label>
        <Controller
          name="étudiant.niveau"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  className={`
                    px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200
                    bg-white hover:bg-gray-50 focus:bg-white
                    focus:outline-none focus:ring-0
                    ${
                      fieldState.error
                        ? "border-secondary focus:border-secondary shadow-secondary/20 focus:shadow-secondary/30"
                        : "border-gray-200 focus:border-primary hover:border-gray-300 focus:shadow-primary/20"
                    }
                    ${fieldState.error ? "focus:shadow-lg" : "focus:shadow-md"}
                  `}
                >
                  <SelectValue placeholder="Sélectionnez le niveau d'étude" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L1">L1 - Licence 1ère année</SelectItem>
                  <SelectItem value="L2">L2 - Licence 2ème année</SelectItem>
                  <SelectItem value="L3">L3 - Licence 3ème année</SelectItem>
                  <SelectItem value="M1">M1 - Master 1ère année</SelectItem>
                  <SelectItem value="M2">M2 - Master 2ème année</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && (
                <p className="text-sm text-secondary mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
          Parcours <span className="text-secondary">*</span>
        </Label>
        <Controller
          name="étudiant.parcours"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  className={`
                    px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200
                    bg-white hover:bg-gray-50 focus:bg-white
                    focus:outline-none focus:ring-0
                    ${
                      fieldState.error
                        ? "border-secondary focus:border-secondary shadow-secondary/20 focus:shadow-secondary/30"
                        : "border-gray-200 focus:border-primary hover:border-gray-300 focus:shadow-primary/20"
                    }
                    ${fieldState.error ? "focus:shadow-lg" : "focus:shadow-md"}
                  `}
                >
                  <SelectValue placeholder="Sélectionnez le parcours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GB">
                    GB - Génie et Base de Données
                  </SelectItem>
                  <SelectItem value="ASR">
                    ASR - Administration Système et Réseaux
                  </SelectItem>
                  <SelectItem value="IG">IG - Informatique Générale</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && (
                <p className="text-sm text-secondary mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Liste des étudiants <span className="text-secondary ml-1">*</span>
        </Label>
        <Controller
          name="étudiant.étudiants"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <MultiSelectCombobox
                options={etudiantOptions}
                value={field.value}
                onChange={(newValue) => {
                  // Limiter le nombre selon le niveau sélectionné
                  const limitedValue = newValue.slice(0, maxétudiants);
                  const filteredValue = limitedValue.filter(
                    (item) => item.trim().length > 0
                  );
                  field.onChange(filteredValue);
                  setTimeout(() => trigger("étudiant.étudiants"), 100);
                }}
                placeholder={
                  niveau
                    ? "Sélectionner les étudiants étudiants..."
                    : "Veuillez d'abord sélectionner un niveau d'étude"
                }
                searchPlaceholder="Rechercher un étudiant..."
                maxItems={maxétudiants}
                error={!!fieldState.error}
              />
              {fieldState.error && (
                <p className="text-sm text-secondary mt-1">
                  {fieldState.error.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
            </div>
          )}
        />
      </div>
    </div>
  );
};
