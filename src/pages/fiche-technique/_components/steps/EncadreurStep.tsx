import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ENCADREURS_EXISTANTS } from "@/data/encadreur-pro.data";
import { FormField } from "../form/FormField";
import type { StepContentProps } from "../../types/form.types";

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
            Sélectionner un encadreur <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="encadreur.encadreurExistantId"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <SearchableSelect
                  options={ENCADREURS_EXISTANTS.map((encadreur) => ({
                    value: encadreur.id,
                    label: `${encadreur.prenoms} ${encadreur.nom}`,
                    description: `${encadreur.etablissement} - ${encadreur.email}`,
                  }))}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    onEncadreurExistantChange(value);
                  }}
                  placeholder="Choisir un encadreur..."
                  searchPlaceholder="Rechercher un encadreur..."
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
              name="encadreur.nom"
              label="Nom de famille"
              placeholder="Nom"
            />
            <FormField
              control={control}
              name="encadreur.prenoms"
              label="Prénom(s)"
              placeholder="Prénom(s)"
            />
          </div>
          <FormField
            control={control}
            name="encadreur.email"
            label="Email professionnel"
            type="email"
            placeholder="prenom.nom@entreprise.com"
          />
          <FormField
            control={control}
            name="encadreur.telephone"
            label="Numéro de téléphone"
            placeholder="+261 XX XX XXX XX"
          />
        </>
      )}

      {/* Affichage des informations si encadreur existant sélectionné */}
      {encadreurType === "existant" && encadreurExistantId && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2">
            Informations de l'encadreur :
          </h4>
          {(() => {
            const encadreur = ENCADREURS_EXISTANTS.find(
              (e) => e.id === encadreurExistantId
            );
            return encadreur ? (
              <div className="space-y-1 text-xs text-green-800">
                <p>
                  <span className="font-medium">Nom:</span> {encadreur.nom}
                </p>
                <p>
                  <span className="font-medium">Prénom(s):</span>{" "}
                  {encadreur.prenoms}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {encadreur.email}
                </p>
                <p>
                  <span className="font-medium">Téléphone:</span>{" "}
                  {encadreur.telephone}
                </p>
                <p>
                  <span className="font-medium">Établissement:</span>{" "}
                  {encadreur.etablissement}
                </p>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};
