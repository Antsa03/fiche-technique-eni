import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { FormField } from "../form/FormField";
import type { StepContentProps } from "../../types/form.types";
import { useEffect, useState } from "react";
import { getSpecialite } from "@/services/api";
import type {SpecialiteTheme } from "@/pages/fiche-technique/types/type";

export const SujetStep = ({ control }: StepContentProps) => {
  // Préparer les options pour le SearchableSelect
  const [specialites, setSpecialites] = useState<SpecialiteTheme[]>([]);
  useEffect(() => {
    const fetchEncadreurPro = async () => {
      try {
        const response = await getSpecialite(100);
        const encadreurProsData = response.data?.data || [];
        setSpecialites(encadreurProsData);
      } catch (err) {
        console.error('Failed to fetch encadreur pro:', err);
      }
    };
    fetchEncadreurPro();
  }, []);
  const orientationOptions = specialites.map((orientation) => ({
    value: orientation.code_specialite,
    label: orientation.code_specialite,
    description: orientation.description_specialite,
  }));

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="sujet.theme"
        label="Thème du stage"
        placeholder="Ex: Développement d'une application mobile de gestion"
      />

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
          Orientation <span className="text-secondary">*</span>
        </Label>
        <Controller
          name="sujet.orientation"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <SearchableSelect
                options={orientationOptions}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Sélectionnez une orientation..."
                searchPlaceholder="Rechercher une orientation..."
                error={!!fieldState.error}
              />
              {fieldState.error && (
                <p className="text-sm text-secondary mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

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
