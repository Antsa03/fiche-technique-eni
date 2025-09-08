import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  User,
  GraduationCap,
  FileText,
  Settings,
  Eye,
  Shield,
} from "lucide-react";
import { ETABLISSEMENTS_EXISTANTS } from "@/data/etablissement.data";
import { ENCADREURS_EXISTANTS } from "@/data/encadreur-pro.data";
import type { StepContentProps } from "../../types/form.types";

export const RecapitulatifStep = ({ getValues }: StepContentProps) => {
  const getSummaryData = () => {
    const data = getValues();

    return [
      {
        data: data.etablissement,
        icon: Building,
        title: "Établissement d'accueil",
        fields: (() => {
          const etab = data.etablissement;
          if (etab.type === "existant" && etab.etablissementExistantId) {
            const etablissementExistant = ETABLISSEMENTS_EXISTANTS.find(
              (e) => e.id === etab.etablissementExistantId
            );
            return etablissementExistant
              ? [
                  { label: "Type", value: "Établissement existant" },
                  { label: "Sigle", value: etablissementExistant.sigle },
                  {
                    label: "Raison sociale",
                    value: etablissementExistant.raisonSociale,
                  },
                  { label: "Email", value: etablissementExistant.email },
                  {
                    label: "Adresse",
                    value: etablissementExistant.adressePostale,
                    span: true,
                  },
                ]
              : [];
          } else {
            return [
              { label: "Type", value: "Nouvel établissement" },
              { label: "Sigle", value: etab.sigle || "" },
              { label: "Raison sociale", value: etab.raisonSociale || "" },
              { label: "Email", value: etab.email || "" },
              {
                label: "Adresse",
                value: etab.adressePostale || "",
                span: true,
              },
            ];
          }
        })(),
      },
      {
        data: data.encadreur,
        icon: User,
        title: "Encadreur professionnel",
        fields: (() => {
          const enc = data.encadreur;
          if (enc.type === "existant" && enc.encadreurExistantId) {
            const encadreurExistant = ENCADREURS_EXISTANTS.find(
              (e) => e.id === enc.encadreurExistantId
            );
            return encadreurExistant
              ? [
                  { label: "Type", value: "Encadreur existant" },
                  { label: "Nom", value: encadreurExistant.nom },
                  { label: "Prénom(s)", value: encadreurExistant.prenoms },
                  { label: "Email", value: encadreurExistant.email },
                  { label: "Téléphone", value: encadreurExistant.telephone },
                  {
                    label: "Établissement",
                    value: encadreurExistant.etablissement,
                    span: true,
                  },
                ]
              : [];
          } else {
            return [
              { label: "Type", value: "Nouvel encadreur" },
              { label: "Nom", value: enc.nom || "" },
              { label: "Prénom(s)", value: enc.prenoms || "" },
              { label: "Email", value: enc.email || "" },
              { label: "Téléphone", value: enc.telephone || "" },
            ];
          }
        })(),
      },
      {
        data: data.stagiaire,
        icon: GraduationCap,
        title: "Stagiaire(s)",
        fields: [
          { label: "Niveau d'étude", value: data.stagiaire.niveau },
          { label: "Parcours", value: data.stagiaire.parcours },
          {
            label: "Liste des stagiaires",
            value: data.stagiaire.stagiaires,
            isBadges: true,
            span: true,
          },
        ],
      },
      {
        data: data.sujet,
        icon: FileText,
        title: "Sujet proposé",
        fields: [
          { label: "Thème", value: data.sujet.theme, span: true },
          {
            label: "Objectifs",
            value: data.sujet.objectif,
            span: true,
            multiline: true,
          },
          {
            label: "Descriptif",
            value: data.sujet.descriptif,
            span: true,
            multiline: true,
          },
        ],
      },
      {
        data: data.aspectTechnique,
        icon: Settings,
        title: "Aspects techniques",
        fields: [
          {
            label: "Planning prévisionnel",
            value: data.aspectTechnique.planningPrevisionnel,
            span: true,
            multiline: true,
          },
          {
            label: "Moyens logiciels",
            value: data.aspectTechnique.moyenLogiciel,
            span: true,
            multiline: true,
          },
          {
            label: "Moyens matériels",
            value: data.aspectTechnique.moyenMateriel,
            span: true,
            multiline: true,
          },
        ],
      },
    ];
  };

  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-100 rounded-full">
            <Eye className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-bold text-amber-900">
              ⚠️ Vérification finale - Récapitulatif
            </h3>
            <p className="text-amber-700 text-xs lg:text-sm font-medium">
              Attention : Vérifiez attentivement toutes les informations avant
              de soumettre le formulaire
            </p>
          </div>
        </div>
        <div className="bg-amber-100 border border-amber-300 rounded-md p-2 mt-3">
          <p className="text-amber-800 text-xs font-medium flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Une fois soumis, les modifications nécessiteront une nouvelle
            demande
          </p>
        </div>
      </div>

      <div className="space-y-2 lg:space-y-3 max-h-[60vh] lg:max-h-[380px] overflow-y-auto">
        {getSummaryData().map((section, index) => {
          const Icon = section.icon;
          return (
            <Card
              key={index}
              className="border shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm lg:text-base font-semibold text-foreground">
                    {section.title}
                  </h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {section.fields.map((field: any, fieldIndex: number) => (
                    <div
                      key={fieldIndex}
                      className={`space-y-1.5 ${
                        field.span ? "lg:col-span-2" : ""
                      }`}
                    >
                      <span className="text-xs lg:text-sm font-medium text-gray-600 block">
                        {field.label}
                      </span>
                      {field.isBadges ? (
                        <div className="flex flex-wrap gap-1.5">
                          {(field.value as string[]).map(
                            (item: string, badgeIndex: number) => (
                              <Badge
                                key={badgeIndex}
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 text-xs px-2 py-1 shadow-sm"
                              >
                                {item}
                              </Badge>
                            )
                          )}
                        </div>
                      ) : (
                        <p
                          className={`text-foreground text-xs lg:text-sm leading-relaxed ${
                            field.multiline ? "whitespace-pre-wrap" : ""
                          }`}
                        >
                          {field.value}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
