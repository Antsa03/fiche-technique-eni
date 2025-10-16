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
import type { StepContentProps } from "../../types/form.types";
import { useEffect, useState } from "react";
import type { EncadreurType, EtablissementType } from "@/schema/fiche-technique.schema";
import { getEncadreurPro, getEtablissementAccueil } from "@/services/api";

export const RecapitulatifStep = ({ getValues }: StepContentProps) => {
  const getSummaryData = () => {
    const data = getValues();
    const [etablissementAccueilSelected, setEtablissementAccueilSelected] = useState<EtablissementType>();
    const [encadreurProSelected, setEncadreurProSelected] = useState<EncadreurType>();
    useEffect(() => {
      const fetchData = async () => {
        try {          
          const response_ea = await getEtablissementAccueil(10,0,data.etablissement.etablissementExistantId);
          const etablissementAccueilsData = response_ea.data?.data[0] || [];
          setEtablissementAccueilSelected(etablissementAccueilsData);

          
          const response_encpro = await getEncadreurPro(10,0,data.encadreur.encadreurExistantId);
          const encadreurProData = response_encpro.data?.data[0] || [];
          setEncadreurProSelected(encadreurProData);
        } catch (err) {
          console.error('Failed to fetch data selected from APIs:', err);
        }
      };

      fetchData();
    }, []);
    return [
      {
        data: data.etablissement,
        icon: Building,
        title: "Établissement d'accueil",
        fields: (() => {
          const etab = data.etablissement;
          if (etab.type === "existant" && etab.etablissementExistantId) {
            const etablissementExistant = etablissementAccueilSelected
            return etablissementExistant
              ? [
                  { label: "Sigle", value: etablissementExistant.sigle_ea },
                  {
                    label: "Raison sociale",
                    value: etablissementExistant.raison_sociale,
                  },
                  { label: "Responsable", value: etablissementExistant.responsable_ea },
                  { label: "Email", value: etablissementExistant.email_ea },
                  { label: "Telephone", value: etablissementExistant.contact_ea },
                  {
                    label: "Adresse",
                    value: etablissementExistant.adresse_ea,
                  },{
                    label: "Site web",
                    value: etablissementExistant.site_web_ea,
                    span: true,
                  },
                ]
              : [];
          } else {
            return [
              { label: "Sigle", value: etab.sigle_ea || "" },
              { label: "Raison sociale", value: etab.raison_sociale || "" },
              { label: "Email", value: etab.email_ea || "" },
              { label: "Telephone", value: etab.contact_ea || "" },
              {
                label: "Adresse",
                value: etab.adresse_ea || "",
              },
              {
                label: "Site web",
                value: etab.site_web_ea || "",
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
            const encadreurExistant = encadreurProSelected
            return encadreurExistant
              ? [
                  { label: "Nom", value: encadreurExistant.user?.nom },
                  { label: "Prénom(s)", value: encadreurExistant.user?.prenoms },
                  { label: "Email", value: encadreurExistant.user?.email },
                  { label: "Téléphone", value: encadreurExistant.user?.contact },
                ]
              : [];
          } else {
            return [
              { label: "Nom", value: enc.user.nom || "" },
              { label: "Prénom(s)", value: enc.user.prenoms || "" },
              { label: "Email", value: enc.user.email || "" },
              { label: "Téléphone", value: enc.user.contact || "" },
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
            label: "Liste de(s) stagiaire(s)",
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
