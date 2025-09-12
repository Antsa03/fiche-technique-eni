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
    name: "stagiaire.niveau",
  });

  // Fonction pour obtenir le nombre maximum de stagiaires selon le niveau
  const getMaxStagiaires = (niveauEtude: string): number => {
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

  // Fonction pour obtenir le nombre minimum de stagiaires selon le niveau
  const getMinStagiaires = (niveauEtude: string): number => {
    switch (niveauEtude) {
      case "L1":
        return 4;
      case "L2":
        return 1;
      case "L3":
        return 1;
      case "M1":
        return 3;
      case "M2":
        return 1;
      default:
        return 1; // Par défaut
    }
  };

  // Fonction pour obtenir le texte d'aide selon le niveau
  const getHelpText = (niveauEtude: string): string => {
    switch (niveauEtude) {
      case "L1":
        return "💡 Entre 4 et 5 stagiaires requis pour le niveau L1.";
      case "L2":
        return "💡 Maximum 2 stagiaires pour le niveau L2.";
      case "L3":
        return "💡 1 seul stagiaire autorisé pour le niveau L3.";
      case "M1":
        return "💡 Entre 3 et 4 stagiaires requis pour le niveau M1.";
      case "M2":
        return "💡 1 seul stagiaire autorisé pour le niveau M2.";
      default:
        return "💡 Veuillez d'abord sélectionner un niveau d'étude.";
    }
  };

  const maxStagiaires = niveau ? getMaxStagiaires(niveau) : 5;
  const minStagiaires = niveau ? getMinStagiaires(niveau) : 1;
  const helpText = getHelpText(niveau);

  return (
    <div className="space-y-3">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
          Niveau <span className="text-secondary">*</span>
        </Label>
        <Controller
          name="stagiaire.niveau"
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
          name="stagiaire.parcours"
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
                  <SelectItem value="IG">
                    IG - Informatique Générale
                  </SelectItem>
                  <SelectItem value="GID">
                    GID - Gouvernance Ingénierie de Données
                  </SelectItem>
                  <SelectItem value="OCC">
                    OCC - Objets Connectés et Cyber Sécurité
                  </SelectItem>
                  <SelectItem value="ASI">
                    ASI - Audit des Systèmes d’Informations
                  </SelectItem>
                  <SelectItem value="MDi">
                    MDi - Métiers du Digital
                  </SelectItem>
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
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Liste de(s) stagiaire(s) <span className="text-secondary ml-1">*</span>
        </Label>
        <Controller
          name="stagiaire.stagiaires"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <MultiSelectCombobox
                options={etudiantOptions}
                value={field.value}
                onChange={(newValue) => {
                  // Limiter le nombre selon le niveau sélectionné
                  const limitedValue = newValue.slice(0, maxStagiaires);
                  const filteredValue = limitedValue.filter(
                    (item) => item.trim().length > 0
                  );
                  field.onChange(filteredValue);
                  setTimeout(() => trigger("stagiaire.stagiaires"), 100);
                }}
                placeholder={
                  niveau
                    ? "Sélectionner les étudiants stagiaires..."
                    : "Veuillez d'abord sélectionner un niveau d'étude"
                }
                searchPlaceholder="Rechercher un étudiant..."
                maxItems={maxStagiaires}
                error={!!fieldState.error}
              />
              {fieldState.error && (
                <p className="text-sm text-secondary mt-1">
                  {fieldState.error.message}
                </p>
              )}
              {/* Validation message pour les contraintes min/max */}
              {niveau && field.value && (
                <p
                  className={`text-xs mt-1 ${
                    field.value.length < minStagiaires ||
                    field.value.length > maxStagiaires
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {field.value.length < minStagiaires
                    ? `⚠️ Au moins ${minStagiaires} stagiaire(s) requis pour ${niveau}`
                    : field.value.length > maxStagiaires
                    ? `⚠️ Maximum ${maxStagiaires} stagiaire(s) autorisé(s) pour ${niveau}`
                    : `✅ Nombre de stagiaires valide (${field.value.length}/${maxStagiaires})`}
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
