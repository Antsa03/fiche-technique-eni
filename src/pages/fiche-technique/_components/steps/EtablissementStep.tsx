import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { FormField } from "../form/FormField";
import type { StepContentProps } from "../../types/form.types";
import { useEffect, useState } from "react";
import { getEtablissementAccueil } from "@/services/api";
import type { EtablissementType } from "@/schema/fiche-technique.schema";

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
  const [etablissementAccueils, setEtablissementAccueils] = useState<EtablissementType[]>([]);
  useEffect(() => {
    const fetchEtablissementAccueils = async () => {
      try {
        const response = await getEtablissementAccueil(2000);
        const etablissementAccueilsData = response.data?.data || [];
        setEtablissementAccueils(etablissementAccueilsData);
      } catch (err) {
        console.error('Failed to fetch établissements:', err);
      }
    };

    fetchEtablissementAccueils();
  }, []);
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
                  value="existant"
                  checked={field.value === "existant"}
                  onChange={() => onEtablissementTypeChange("existant")}
                  className="text-blue-600"
                />
                <span className="text-sm">Établissement existant</span>
              </label>
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
                <SearchableSelect
                  options={etablissementAccueils.map((etablissement) => ({
                    value: etablissement.sigle_ea,
                    label: etablissement.raison_sociale,
                    description: etablissement.raison_sociale + '' + etablissement.adresse_ea,
                  }))}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    onEtablissementExistantChange(value);
                  }}
                  placeholder="Choisir un établissement..."
                  searchPlaceholder="Rechercher un établissement..."
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

      {/* Champs pour nouvel établissement */}
      {etablissementType === "nouveau" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={control}
              name="etablissement.sigle_ea"
              label="Sigle de l'entreprise"
              placeholder="Ex: ACME Inc."
            />
            <FormField
              control={control}
              name="etablissement.raison_sociale"
              label="Raison sociale"
              placeholder="Nom complet de l'entreprise"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={control}
              name="etablissement.email_ea"
              label="Email de l'etablissement d'accueil"
              type="email"
              placeholder="contact@entreprise.com"
            />
            <FormField
              control={control}
              name="etablissement.contact_ea"
              label="Telephone de l'etablissement d'accueil"
              placeholder="+261 xx xx xxx xx"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={control}
              name="etablissement.site_web_ea"
              label="Site web de l'etablissement d'accueil"
              placeholder="entreprise.com"
            />
            <FormField
              control={control}
              name="etablissement.adresse_ea"
              label="Adresse postale complète"
              placeholder="Adresse, code postal, ville, pays"
              as={Textarea}
              rows={2}
            />
          </div>
        </>
      )}

      {/* Affichage des informations si établissement existant sélectionné */}
      {etablissementType === "existant" && etablissementExistantId && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Informations de l'établissement :
          </h4>
          {(() => {
            const etablissement = etablissementAccueils.find(
              (e) => e.sigle_ea === etablissementExistantId
            );
            return etablissement ? (
              <div className="space-y-1 text-xs text-blue-800">
                <p>
                  <span className="font-medium">Sigle:</span>{" "}
                  {etablissement.sigle_ea}
                </p>
                <p>
                  <span className="font-medium">Raison sociale:</span>{" "}
                  {etablissement.raison_sociale}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {etablissement.email_ea}
                </p>
                <p>
                  <span className="font-medium">Adresse:</span>{" "}
                  {etablissement.adresse_ea}
                </p>
                <p>
                  <span className="font-medium">Telephone:</span>{" "}
                  {etablissement.contact_ea}
                </p>
                <p>
                  <span className="font-medium">Site web:</span>{" "}
                  {etablissement.site_web_ea}
                </p>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};
