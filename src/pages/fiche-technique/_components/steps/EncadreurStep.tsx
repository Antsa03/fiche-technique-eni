import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { FormField } from "../form/FormField";
import type { StepContentProps } from "../../types/form.types";
import type { EncadreurType } from "@/schema/fiche-technique.schema";
import { useEffect, useState } from "react";
import { getEncadreurPro } from "@/services/api";

interface EncadreurStepProps extends StepContentProps {
  encadreurType: string;
  encadreurExistantId: string;
  onEncadreurTypeChange: (type: "nouveau" | "existant") => void;
  onEncadreurExistantChange: (id: string) => void;
}

export const EncadreurStep = ({
  control,
  encadreurType,
  encadreurExistantId,
  onEncadreurTypeChange,
  onEncadreurExistantChange,
}: EncadreurStepProps) => {
  const [encadreurPros, setEncadreurPros] = useState<EncadreurType[]>([]);
  useEffect(() => {
    const fetchEncadreurPro = async () => {
      try {
        const response = await getEncadreurPro(1000);
        const encadreurProsData = response.data?.data || [];
        setEncadreurPros(encadreurProsData);
      } catch (err) {
        console.error('Failed to fetch encadreur pro:', err);
      }
    };
    fetchEncadreurPro();
  }, []);
  return (
    <div className="space-y-3">
      {/* Switcher Nouveau/Existant */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">
          Type d'encadreur <span className="text-red-500 ml-1">*</span>
        </Label>
        <Controller
          name="encadreur.type"
          control={control}
          render={({ field }) => (
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="existant"
                  checked={field.value === "existant"}
                  onChange={() => onEncadreurTypeChange("existant")}
                  className="text-blue-600"
                />
                <span className="text-sm">Encadreur existant</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="nouveau"
                  checked={field.value === "nouveau"}
                  onChange={() => onEncadreurTypeChange("nouveau")}
                  className="text-blue-600"
                />
                <span className="text-sm">Nouvel encadreur</span>
              </label>
            </div>
          )}
        />
      </div>

      {/* Sélection encadreur existant */}
      {encadreurType === "existant" && (
        <div className="space-y-1">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            Sélectionner un encadreur professionnel <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="encadreur.encadreurExistantId"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <SearchableSelect
                  options={encadreurPros.map((encadreur) => ({
                    value: encadreur.id,
                    label: `${encadreur.user?.nom} ${encadreur.user?.prenoms}`,
                    description: `${encadreur.user?.contact} - ${encadreur.user?.email}`,
                  }))}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    onEncadreurExistantChange(value);
                  }}
                  placeholder="Choisir un encadreur professionnel ..."
                  searchPlaceholder="Rechercher un encadreur encadreur professionnel ..."
                  error={!!fieldState.error}
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      )}

      {/* Champs pour nouvel encadreur */}
      {encadreurType === "nouveau" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={control}
              name="encadreur.user.nom"
              label="Nom"
              placeholder="Nom"
            />
            <FormField
              control={control}
              name="encadreur.user.prenoms"
              label="Prénom(s)"
              placeholder="Prénom(s)"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={control}
              name="encadreur.user.email"
              label="Email professionnel"
              type="email"
              placeholder="prenom.nom@entreprise.com"
            />
            <FormField
              control={control}
              name="encadreur.user.contact"
              label="Numéro de téléphone"
              placeholder="+261 XX XX XXX XX"
            />
          </div>
        </>
      )}

      {/* Affichage des informations si encadreur existant sélectionné */}
      {encadreurType === "existant" && encadreurExistantId && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2">
            Informations de l'encadreur :
          </h4>
          {(() => {
            const encadreur = encadreurPros.find(
              (e) => e.id === encadreurExistantId
            );
            return encadreur ? (
              <div className="space-y-1 text-xs text-green-800">
                <p>
                  <span className="font-medium">Nom:</span> {encadreur.user?.nom}
                </p>
                <p>
                  <span className="font-medium">Prénom(s):</span>{" "}
                  {encadreur.user?.prenoms}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {encadreur.user?.email}
                </p>
                <p>
                  <span className="font-medium">Téléphone:</span>{" "}
                  {encadreur.user?.contact}
                </p>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};
