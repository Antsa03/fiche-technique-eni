import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import type { StepContentProps } from "../../types/form.types";

export const StagiaireStep = ({ control, trigger }: StepContentProps) => {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
          Niveau d'étude <span className="text-secondary">*</span>
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
                  <SelectItem value="GB">GB - Génie et Base de Données</SelectItem>
                  <SelectItem value="ASR">
                    ASR - Administration Système et Réseaux
                  </SelectItem>
                  <SelectItem value="IG">
                    IG - Informatique Générale
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

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Liste des stagiaires <span className="text-secondary ml-1">*</span>
        </Label>
        <Controller
          name="stagiaire.stagiaires"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <MultiSelectCombobox
                options={[
                  "ANDRIAMANANA Hery",
                  "RASOAMANANA Mialy",
                  "RAKOTOMALALA Jean",
                  "RANDRIANARISOA Marie",
                  "RAZAFY Paul",
                  "RAHARISON Sophie",
                  "ANDRIAMAMPIANINA Luc",
                  "RATSIMBAZAFY Anna",
                  "RAKOTONDRAZAKA Pierre",
                  "RAMAROSON Claire",
                ]}
                value={field.value}
                onChange={(newValue) => {
                  const filteredValue = newValue.filter(
                    (item) => item.trim().length > 0
                  );
                  field.onChange(filteredValue);
                  setTimeout(() => trigger("stagiaire.stagiaires"), 100);
                }}
                placeholder="Sélectionner les noms des stagiaires..."
                searchPlaceholder="Rechercher un nom de stagiaire..."
                maxItems={5}
                error={!!fieldState.error}
              />
              {fieldState.error && (
                <p className="text-sm text-secondary mt-1">
                  {fieldState.error.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                💡 Vous pouvez sélectionner des noms existants dans la liste.
                Maximum 5 stagiaires.
              </p>
            </div>
          )}
        />
      </div>
    </div>
  );
};
