import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
                  value="nouveau"
                  checked={field.value === "nouveau"}
                  onChange={() => onEncadreurTypeChange("nouveau")}
                  className="text-blue-600"
                />
                <span className="text-sm">Nouvel encadreur</span>
              </label>
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
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onEncadreurExistantChange(value);
                  }}
                  value={field.value}
                >
                  <SelectTrigger
                    className={`
                      px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200
                      bg-white hover:bg-gray-50 focus:bg-white
                      focus:outline-none focus:ring-0
                      ${
                        fieldState.error
                          ? "border-red-300 focus:border-red-500 shadow-red-100 focus:shadow-red-200"
                          : "border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:shadow-blue-100"
                      }
                      ${
                        fieldState.error ? "focus:shadow-lg" : "focus:shadow-md"
                      }
                    `}
                  >
                    <SelectValue placeholder="Choisir un encadreur..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ENCADREURS_EXISTANTS.map((encadreur) => (
                      <SelectItem key={encadreur.id} value={encadreur.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {encadreur.prenoms} {encadreur.nom}
                          </span>
                          <span className="text-xs text-gray-500">
                            {encadreur.etablissement} - {encadreur.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
