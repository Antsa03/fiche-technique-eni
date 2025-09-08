import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ETABLISSEMENTS_EXISTANTS } from "@/data/etablissement.data";
import { FormField } from "../form/FormField";
import type { StepContentProps } from "../../types/form.types";

interface EtablissementStepProps extends StepContentProps {
  etablissementType: string;
  etablissementExistantId: string;
  onEtablissementTypeChange: (type: "nouveau" | "existant") => void;
  onEtablissementExistantChange: (id: string) => void;
}

export const EtablissementStep = ({
  control,
  etablissementType,
  etablissementExistantId,
  onEtablissementTypeChange,
  onEtablissementExistantChange,
}: EtablissementStepProps) => {
  return (
    <div className="space-y-3">
      {/* Switcher Nouveau/Existant */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">
          Type d'établissement <span className="text-red-500 ml-1">*</span>
        </Label>
        <Controller
          name="etablissement.type"
          control={control}
          render={({ field }) => (
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="nouveau"
                  checked={field.value === "nouveau"}
                  onChange={() => onEtablissementTypeChange("nouveau")}
                  className="text-blue-600"
                />
                <span className="text-sm">Nouvel établissement</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="existant"
                  checked={field.value === "existant"}
                  onChange={() => onEtablissementTypeChange("existant")}
                  className="text-blue-600"
                />
                <span className="text-sm">Établissement existant</span>
              </label>
            </div>
          )}
        />
      </div>

      {/* Sélection établissement existant */}
      {etablissementType === "existant" && (
        <div className="space-y-1">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            Sélectionner un établissement{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="etablissement.etablissementExistantId"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onEtablissementExistantChange(value);
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
                    <SelectValue placeholder="Choisir un établissement..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ETABLISSEMENTS_EXISTANTS.map((etablissement) => (
                      <SelectItem
                        key={etablissement.id}
                        value={etablissement.id}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {etablissement.sigle}
                          </span>
                          <span className="text-xs text-gray-500">
                            {etablissement.raisonSociale}
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

      {/* Champs pour nouvel établissement */}
      {etablissementType === "nouveau" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={control}
              name="etablissement.sigle"
              label="Sigle de l'entreprise"
              placeholder="Ex: ACME Inc."
            />
            <FormField
              control={control}
              name="etablissement.raisonSociale"
              label="Raison sociale"
              placeholder="Nom complet de l'entreprise"
            />
          </div>
          <FormField
            control={control}
            name="etablissement.email"
            label="Email de contact"
            type="email"
            placeholder="contact@entreprise.com"
          />
          <FormField
            control={control}
            name="etablissement.adressePostale"
            label="Adresse postale complète"
            placeholder="Adresse, code postal, ville, pays"
            as={Textarea}
            rows={2}
          />
        </>
      )}

      {/* Affichage des informations si établissement existant sélectionné */}
      {etablissementType === "existant" && etablissementExistantId && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Informations de l'établissement :
          </h4>
          {(() => {
            const etablissement = ETABLISSEMENTS_EXISTANTS.find(
              (e) => e.id === etablissementExistantId
            );
            return etablissement ? (
              <div className="space-y-1 text-xs text-blue-800">
                <p>
                  <span className="font-medium">Sigle:</span>{" "}
                  {etablissement.sigle}
                </p>
                <p>
                  <span className="font-medium">Raison sociale:</span>{" "}
                  {etablissement.raisonSociale}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {etablissement.email}
                </p>
                <p>
                  <span className="font-medium">Adresse:</span>{" "}
                  {etablissement.adressePostale}
                </p>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};
