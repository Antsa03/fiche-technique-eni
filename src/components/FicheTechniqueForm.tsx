"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  Building,
  User,
  GraduationCap,
  FileText,
  Settings,
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  Shield,
} from "lucide-react";
import { MultiSelectCombobox } from "./ui/multi-select-combobox";

// Données simulées pour les établissements existants
const ETABLISSEMENTS_EXISTANTS = [
  {
    id: "1",
    sigle: "ACME Corp",
    raisonSociale: "ACME Corporation Madagascar",
    email: "contact@acme-mg.com",
    adressePostale: "Lot II M 15 Androhibe, 101 Antananarivo, Madagascar",
  },
  {
    id: "2",
    sigle: "TechSoft",
    raisonSociale: "TechSoft Solutions SARL",
    email: "info@techsoft.mg",
    adressePostale: "67 Avenue de l'Indépendance, 101 Antananarivo, Madagascar",
  },
  {
    id: "3",
    sigle: "DigiMada",
    raisonSociale: "Digital Madagascar",
    email: "contact@digimada.mg",
    adressePostale:
      "Immeuble Fitaratra, Ankorondrano, 101 Antananarivo, Madagascar",
  },
  {
    id: "4",
    sigle: "InnovTech",
    raisonSociale: "Innovation Technologies Madagascar",
    email: "hello@innovtech.mg",
    adressePostale: "Zone Galaxy Andraharo, 101 Antananarivo, Madagascar",
  },
  {
    id: "5",
    sigle: "WebMada",
    raisonSociale: "Web Madagascar SARL",
    email: "contact@webmada.mg",
    adressePostale:
      "Rue Rainandriamampandry, Isoraka, 101 Antananarivo, Madagascar",
  },
];

// Données simulées pour les encadreurs existants
const ENCADREURS_EXISTANTS = [
  {
    id: "1",
    nom: "RAKOTOMALALA",
    prenoms: "Jean Pierre",
    email: "jp.rakotomalala@acme-mg.com",
    telephone: "+261 34 12 345 67",
    etablissement: "ACME Corp",
  },
  {
    id: "2",
    nom: "ANDRIANASOLO",
    prenoms: "Marie Hortense",
    email: "marie.andrianasolo@techsoft.mg",
    telephone: "+261 33 45 678 90",
    etablissement: "TechSoft",
  },
  {
    id: "3",
    nom: "RASOAMANANA",
    prenoms: "Paul Michel",
    email: "paul.rasoamanana@digimada.mg",
    telephone: "+261 32 98 765 43",
    etablissement: "DigiMada",
  },
  {
    id: "4",
    nom: "RANDRIANARISOA",
    prenoms: "Sophie Claire",
    email: "sophie.randrianarisoa@innovtech.mg",
    telephone: "+261 34 56 789 01",
    etablissement: "InnovTech",
  },
  {
    id: "5",
    nom: "RAZAFY",
    prenoms: "Luc André",
    email: "luc.razafy@webmada.mg",
    telephone: "+261 33 21 098 76",
    etablissement: "WebMada",
  },
];

const etablissementSchema = z
  .object({
    type: z.enum(["nouveau", "existant"]),
    etablissementExistantId: z.string().optional(),
    sigle: z
      .string()
      .min(2, "Le sigle doit contenir au moins 2 caractères")
      .optional(),
    raisonSociale: z
      .string()
      .min(3, "La raison sociale doit contenir au moins 3 caractères")
      .optional(),
    email: z
      .string()
      .email("Veuillez saisir une adresse email valide")
      .optional(),
    adressePostale: z
      .string()
      .min(10, "L'adresse doit être complète (minimum 10 caractères)")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.type === "existant") {
        return !!data.etablissementExistantId;
      } else {
        return !!(
          data.sigle &&
          data.raisonSociale &&
          data.email &&
          data.adressePostale
        );
      }
    },
    {
      message: "Veuillez compléter tous les champs requis",
      path: ["sigle"],
    }
  );

const encadreurSchema = z
  .object({
    type: z.enum(["nouveau", "existant"]),
    encadreurExistantId: z.string().optional(),
    nom: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .optional(),
    prenoms: z
      .string()
      .min(2, "Les prénoms doivent contenir au moins 2 caractères")
      .optional(),
    email: z
      .string()
      .email("Veuillez saisir une adresse email valide")
      .optional(),
    telephone: z
      .string()
      .min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.type === "existant") {
        return !!data.encadreurExistantId;
      } else {
        return !!(data.nom && data.prenoms && data.email && data.telephone);
      }
    },
    {
      message: "Veuillez compléter tous les champs requis",
      path: ["nom"],
    }
  );

const stagiaireSchema = z.object({
  niveau: z.string().min(1, "Veuillez sélectionner un niveau d'étude"),
  stagiaires: z
    .array(z.string())
    .transform((arr) => arr.filter((item) => item.trim().length > 0))
    .refine((arr) => arr.length >= 1, "Au moins un stagiaire est requis")
    .refine((arr) => arr.length <= 5, "Maximum 5 stagiaires autorisés")
    .refine(
      (arr) => arr.every((item) => item.length >= 3),
      "Chaque nom doit contenir au moins 3 caractères"
    ),
});

const sujetSchema = z.object({
  theme: z.string().min(5, "Le thème doit contenir au moins 5 caractères"),
  objectif: z
    .string()
    .min(20, "L'objectif doit être détaillé (minimum 20 caractères)"),
  descriptif: z
    .string()
    .min(50, "Le descriptif doit être détaillé (minimum 50 caractères)"),
});

const aspectTechniqueSchema = z.object({
  planningPrevisionnel: z
    .string()
    .min(20, "Le planning doit être détaillé (minimum 20 caractères)"),
  moyenLogiciel: z.string().min(10, "Veuillez détailler les moyens logiciels"),
  moyenMateriel: z.string().min(10, "Veuillez détailler les moyens matériels"),
});

const globalSchema = z.object({
  etablissement: etablissementSchema,
  encadreur: encadreurSchema,
  stagiaire: stagiaireSchema,
  sujet: sujetSchema,
  aspectTechnique: aspectTechniqueSchema,
});

type FormData = z.infer<typeof globalSchema>;

const STEPS = [
  {
    id: "etablissement",
    title: "Établissement d'accueil",
    subtitle: "Informations sur l'entreprise",
    icon: Building,
    schema: etablissementSchema,
  },
  {
    id: "encadreur",
    title: "Encadreur professionnel",
    subtitle: "Responsable du stage",
    icon: User,
    schema: encadreurSchema,
  },
  {
    id: "stagiaire",
    title: "Stagiaire(s)",
    subtitle: "Informations académiques",
    icon: GraduationCap,
    schema: stagiaireSchema,
  },
  {
    id: "sujet",
    title: "Sujet proposé",
    subtitle: "Objectifs et description",
    icon: FileText,
    schema: sujetSchema,
  },
  {
    id: "aspectTechnique",
    title: "Aspects techniques",
    subtitle: "Planning et ressources",
    icon: Settings,
    schema: aspectTechniqueSchema,
  },
  {
    id: "recapitulatif",
    title: "Récapitulatif",
    subtitle: "Vérification des données",
    icon: Eye,
    schema: z.object({}), // No validation needed for summary step
  },
] as const;

const InternshipApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const form = useForm<FormData>({
    resolver: zodResolver(globalSchema),
    mode: "onBlur",
    defaultValues: {
      etablissement: {
        type: "nouveau",
        etablissementExistantId: "",
        sigle: "",
        raisonSociale: "",
        email: "",
        adressePostale: "",
      },
      encadreur: {
        type: "nouveau",
        encadreurExistantId: "",
        nom: "",
        prenoms: "",
        email: "",
        telephone: "",
      },
      stagiaire: { niveau: "", stagiaires: [] },
      sujet: { theme: "", objectif: "", descriptif: "" },
      aspectTechnique: {
        planningPrevisionnel: "",
        moyenLogiciel: "",
        moyenMateriel: "",
      },
    },
  });

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting },
  } = form;

  // Watch pour les types sélectionnés
  const etablissementType = watch("etablissement.type");
  const encadreurType = watch("encadreur.type");
  const etablissementExistantId = watch(
    "etablissement.etablissementExistantId"
  );
  const encadreurExistantId = watch("encadreur.encadreurExistantId");

  // Fonction pour remplir automatiquement les champs d'établissement
  const handleEtablissementExistantChange = useCallback(
    (etablissementId: string) => {
      const etablissement = ETABLISSEMENTS_EXISTANTS.find(
        (e) => e.id === etablissementId
      );
      if (etablissement) {
        setValue("etablissement.sigle", etablissement.sigle);
        setValue("etablissement.raisonSociale", etablissement.raisonSociale);
        setValue("etablissement.email", etablissement.email);
        setValue("etablissement.adressePostale", etablissement.adressePostale);
      }
    },
    [setValue]
  );

  // Fonction pour remplir automatiquement les champs d'encadreur
  const handleEncadreurExistantChange = useCallback(
    (encadreurId: string) => {
      const encadreur = ENCADREURS_EXISTANTS.find((e) => e.id === encadreurId);
      if (encadreur) {
        setValue("encadreur.nom", encadreur.nom);
        setValue("encadreur.prenoms", encadreur.prenoms);
        setValue("encadreur.email", encadreur.email);
        setValue("encadreur.telephone", encadreur.telephone);
      }
    },
    [setValue]
  );

  // Réinitialiser les champs quand on change de type
  const handleEtablissementTypeChange = useCallback(
    (type: "nouveau" | "existant") => {
      setValue("etablissement.type", type);
      if (type === "nouveau") {
        setValue("etablissement.etablissementExistantId", "");
        setValue("etablissement.sigle", "");
        setValue("etablissement.raisonSociale", "");
        setValue("etablissement.email", "");
        setValue("etablissement.adressePostale", "");
      }
    },
    [setValue]
  );

  const handleEncadreurTypeChange = useCallback(
    (type: "nouveau" | "existant") => {
      setValue("encadreur.type", type);
      if (type === "nouveau") {
        setValue("encadreur.encadreurExistantId", "");
        setValue("encadreur.nom", "");
        setValue("encadreur.prenoms", "");
        setValue("encadreur.email", "");
        setValue("encadreur.telephone", "");
      }
    },
    [setValue]
  );

  const validateCurrentStep = useCallback(async () => {
    // Skip validation for summary step
    if (currentStep === STEPS.length - 1) {
      return true;
    }

    const stepKey = STEPS[currentStep].id as keyof FormData;
    const isValid = await trigger(stepKey);

    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
    }

    return isValid;
  }, [currentStep, trigger]);

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
        setCurrentStep(stepIndex);
      } else if (stepIndex === currentStep + 1) {
        await nextStep();
      }
    },
    [currentStep, completedSteps, nextStep]
  );

  const onSubmit = useCallback((data: FormData) => {
    console.log("=== DONNÉES DU FORMULAIRE ===", data);
    // Here you would typically send the data to your API
    alert("Demande de stage soumise avec succès !");
  }, []);

  const FormField = ({
    name,
    label,
    placeholder,
    type = "text",
    required = true,
    as: Component = Input,
    ...props
  }: any) => (
    <div className="space-y-2">
      <Label
        htmlFor={name}
        className="text-sm font-semibold text-gray-700 flex items-center gap-1"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <div className="relative">
            <Component
              {...field}
              {...props}
              id={name}
              placeholder={placeholder}
              type={type}
              className={`
                w-full px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200
                bg-white hover:bg-gray-50 focus:bg-white
                placeholder:text-gray-400 placeholder:font-normal
                focus:outline-none focus:ring-0
                ${
                  fieldState.error
                    ? "border-red-300 focus:border-red-500 shadow-red-100 focus:shadow-red-200"
                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:shadow-blue-100"
                }
                ${fieldState.error ? "focus:shadow-lg" : "focus:shadow-md"}
              `}
            />
            {/* Indicateur de focus */}
            <div
              className={`
                absolute inset-0 rounded-lg pointer-events-none transition-all duration-200
                ${
                  fieldState.error
                    ? "shadow-red-100"
                    : "shadow-transparent hover:shadow-sm focus-within:shadow-blue-100"
                }
              `}
            />
            {fieldState.error && (
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1 h-1 bg-red-500 rounded-full" />
                <p className="text-xs text-red-600 font-medium">
                  {fieldState.error.message}
                </p>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );

  const renderStepContent = () => {
    const currentStepData = STEPS[currentStep];

    if (currentStep === STEPS.length - 1) {
      return (
        <div className="space-y-3">
          <div className="text-center pb-3 border-b">
            <h3 className="text-base lg:text-lg font-bold text-foreground mb-1">
              Récapitulatif
            </h3>
            <p className="text-muted-foreground text-xs lg:text-sm">
              Vérifiez toutes les informations avant de soumettre le formulaire
            </p>
          </div>

          <div className="space-y-2 lg:space-y-3 max-h-[60vh] lg:max-h-[380px] overflow-y-auto">
            {(
              [
                {
                  data: getValues().etablissement,
                  icon: Building,
                  title: "Établissement d'accueil",
                  fields: (() => {
                    const etab = getValues().etablissement;
                    if (
                      etab.type === "existant" &&
                      etab.etablissementExistantId
                    ) {
                      const etablissementExistant =
                        ETABLISSEMENTS_EXISTANTS.find(
                          (e) => e.id === etab.etablissementExistantId
                        );
                      return etablissementExistant
                        ? [
                            { label: "Type", value: "Établissement existant" },
                            {
                              label: "Sigle",
                              value: etablissementExistant.sigle,
                            },
                            {
                              label: "Raison sociale",
                              value: etablissementExistant.raisonSociale,
                            },
                            {
                              label: "Email",
                              value: etablissementExistant.email,
                            },
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
                        {
                          label: "Raison sociale",
                          value: etab.raisonSociale || "",
                        },
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
                  data: getValues().encadreur,
                  icon: User,
                  title: "Encadreur professionnel",
                  fields: (() => {
                    const enc = getValues().encadreur;
                    if (enc.type === "existant" && enc.encadreurExistantId) {
                      const encadreurExistant = ENCADREURS_EXISTANTS.find(
                        (e) => e.id === enc.encadreurExistantId
                      );
                      return encadreurExistant
                        ? [
                            { label: "Type", value: "Encadreur existant" },
                            { label: "Nom", value: encadreurExistant.nom },
                            {
                              label: "Prénom(s)",
                              value: encadreurExistant.prenoms,
                            },
                            { label: "Email", value: encadreurExistant.email },
                            {
                              label: "Téléphone",
                              value: encadreurExistant.telephone,
                            },
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
                  data: getValues().stagiaire,
                  icon: GraduationCap,
                  title: "Stagiaire(s)",
                  fields: [
                    {
                      label: "Niveau d'étude",
                      value: getValues().stagiaire.niveau,
                    },
                    {
                      label: "Liste des stagiaires",
                      value: getValues().stagiaire.stagiaires,
                      isBadges: true,
                      span: true,
                    },
                  ],
                },
                {
                  data: getValues().sujet,
                  icon: FileText,
                  title: "Sujet proposé",
                  fields: [
                    {
                      label: "Thème",
                      value: getValues().sujet.theme,
                      span: true,
                    },
                    {
                      label: "Objectifs",
                      value: getValues().sujet.objectif,
                      span: true,
                      multiline: true,
                    },
                    {
                      label: "Descriptif",
                      value: getValues().sujet.descriptif,
                      span: true,
                      multiline: true,
                    },
                  ],
                },
                {
                  data: getValues().aspectTechnique,
                  icon: Settings,
                  title: "Aspects techniques",
                  fields: [
                    {
                      label: "Planning prévisionnel",
                      value: getValues().aspectTechnique.planningPrevisionnel,
                      span: true,
                      multiline: true,
                    },
                    {
                      label: "Moyens logiciels",
                      value: getValues().aspectTechnique.moyenLogiciel,
                      span: true,
                      multiline: true,
                    },
                    {
                      label: "Moyens matériels",
                      value: getValues().aspectTechnique.moyenMateriel,
                      span: true,
                      multiline: true,
                    },
                  ],
                },
              ] as any[]
            ).map((section, index) => {
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

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-amber-900 mb-1 text-sm">
                  ⚠️ Attention - Vérification requise
                </h5>
                <p className="text-amber-800 text-sm leading-relaxed">
                  Assurez-vous que toutes les informations saisies sont exactes
                  avant de soumettre le formulaire. Une fois envoyée, les
                  modifications ne seront plus possibles.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="text-center pb-3 border-b">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <currentStepData.icon className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-foreground">
                {currentStepData.title}
              </h3>
              <p className="text-muted-foreground text-xs">
                {currentStepData.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto overflow-x-visible">
          {currentStep === 0 && (
            <div className="space-y-3">
              {/* Switcher Nouveau/Existant */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground">
                  Type d'établissement{" "}
                  <span className="text-red-500 ml-1">*</span>
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
                          onChange={() =>
                            handleEtablissementTypeChange("nouveau")
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm">Nouvel établissement</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="existant"
                          checked={field.value === "existant"}
                          onChange={() =>
                            handleEtablissementTypeChange("existant")
                          }
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
                            handleEtablissementExistantChange(value);
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
                                fieldState.error
                                  ? "focus:shadow-lg"
                                  : "focus:shadow-md"
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
                      name="etablissement.sigle"
                      label="Sigle de l'entreprise"
                      placeholder="Ex: ACME Inc."
                    />
                    <FormField
                      name="etablissement.raisonSociale"
                      label="Raison sociale"
                      placeholder="Nom complet de l'entreprise"
                    />
                  </div>
                  <FormField
                    name="etablissement.email"
                    label="Email de contact"
                    type="email"
                    placeholder="contact@entreprise.com"
                  />
                  <FormField
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
          )}

          {currentStep === 1 && (
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
                          onChange={() => handleEncadreurTypeChange("nouveau")}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Nouvel encadreur</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="existant"
                          checked={field.value === "existant"}
                          onChange={() => handleEncadreurTypeChange("existant")}
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
                    Sélectionner un encadreur{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="encadreur.encadreurExistantId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleEncadreurExistantChange(value);
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
                                fieldState.error
                                  ? "focus:shadow-lg"
                                  : "focus:shadow-md"
                              }
                            `}
                          >
                            <SelectValue placeholder="Choisir un encadreur..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ENCADREURS_EXISTANTS.map((encadreur) => (
                              <SelectItem
                                key={encadreur.id}
                                value={encadreur.id}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {encadreur.prenoms} {encadreur.nom}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {encadreur.etablissement} -{" "}
                                    {encadreur.email}
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
                      name="encadreur.nom"
                      label="Nom de famille"
                      placeholder="Nom"
                    />
                    <FormField
                      name="encadreur.prenoms"
                      label="Prénom(s)"
                      placeholder="Prénom(s)"
                    />
                  </div>
                  <FormField
                    name="encadreur.email"
                    label="Email professionnel"
                    type="email"
                    placeholder="prenom.nom@entreprise.com"
                  />
                  <FormField
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
                          <span className="font-medium">Nom:</span>{" "}
                          {encadreur.nom}
                        </p>
                        <p>
                          <span className="font-medium">Prénom(s):</span>{" "}
                          {encadreur.prenoms}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {encadreur.email}
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
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  Niveau d'étude <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="stagiaire.niveau"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Select
                        onValueChange={field.onChange}
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
                              fieldState.error
                                ? "focus:shadow-lg"
                                : "focus:shadow-md"
                            }
                          `}
                        >
                          <SelectValue placeholder="Sélectionnez le niveau d'étude" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L1">
                            L1 - Licence 1ère année
                          </SelectItem>
                          <SelectItem value="L2">
                            L2 - Licence 2ème année
                          </SelectItem>
                          <SelectItem value="L3">
                            L3 - Licence 3ème année
                          </SelectItem>
                          <SelectItem value="M1">
                            M1 - Master 1ère année
                          </SelectItem>
                          <SelectItem value="M2">
                            M2 - Master 2ème année
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-sm text-red-500 mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Liste des stagiaires{" "}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Controller
                  name="stagiaire.stagiaires"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="relative z-[100]">
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
                          setTimeout(
                            () => trigger("stagiaire.stagiaires"),
                            100
                          );
                        }}
                        placeholder="Sélectionner ou saisir les noms des stagiaires..."
                        searchPlaceholder="Rechercher ou saisir un nouveau nom..."
                        maxItems={5}
                        error={!!fieldState.error}
                      />
                      {fieldState.error && (
                        <p className="text-sm text-red-500 mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 Vous pouvez sélectionner des noms existants ou en
                        saisir de nouveaux. Maximum 5 stagiaires.
                      </p>
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <FormField
                name="sujet.theme"
                label="Thème du stage"
                placeholder="Ex: Développement d'une application mobile de gestion"
              />
              <FormField
                name="sujet.objectif"
                label="Objectifs du stage"
                placeholder="Décrivez les objectifs principaux et les compétences à acquérir..."
                as={Textarea}
                rows={2}
              />
              <FormField
                name="sujet.descriptif"
                label="Descriptif détaillé"
                placeholder="Décrivez en détail les tâches, missions, livrables attendus et méthodologie..."
                as={Textarea}
                rows={3}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-3">
              <FormField
                name="aspectTechnique.planningPrevisionnel"
                label="Planning prévisionnel"
                placeholder="Décrivez le planning par phases : analyse (semaine 1-2), développement (semaine 3-8), tests (semaine 9-10)..."
                as={Textarea}
                rows={2}
              />
              <FormField
                name="aspectTechnique.moyenLogiciel"
                label="Moyens logiciels"
                placeholder="Technologies, frameworks, IDE, bases de données, outils de versioning..."
                as={Textarea}
                rows={2}
              />
              <FormField
                name="aspectTechnique.moyenMateriel"
                label="Moyens matériels"
                placeholder="Ordinateur, serveurs, équipements réseau, licences logicielles..."
                as={Textarea}
                rows={2}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-1 sm:py-2 px-1 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Layout principal - optimisé mobile */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 min-h-[calc(100vh-60px)] lg:h-[calc(100vh-120px)]">
          {/* Header mobile avec titre */}
          <div className="lg:hidden mb-2">
            <Card>
              <CardContent className="p-3">
                <h2 className="text-lg font-bold text-center text-gray-900">
                  Fiche Technique de Stage
                </h2>
                <p className="text-sm text-center text-gray-600 mt-1">
                  Étape {currentStep + 1} sur {STEPS.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar avec stepper - horizontal sur mobile, vertical sur desktop */}
          <div className="lg:w-56 flex-shrink-0">
            <Card className="h-full">
              <CardContent className="p-2 lg:p-3">
                {/* Stepper horizontal sur mobile - amélioré */}
                <div className="lg:hidden">
                  <div className="flex overflow-x-auto pb-3 space-x-1 scrollbar-hide">
                    {STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = completedSteps.has(index);
                      const isCurrent = currentStep === index;
                      const isClickable =
                        index <= currentStep || completedSteps.has(index);

                      return (
                        <button
                          key={step.id}
                          onClick={() => isClickable && goToStep(index)}
                          disabled={!isClickable}
                          className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[70px] ${
                            isCurrent
                              ? "bg-blue-100 border-2 border-blue-300 shadow-sm"
                              : isCompleted
                              ? "bg-green-100 border-2 border-green-300"
                              : isClickable
                              ? "bg-gray-50 border border-gray-300 hover:bg-gray-100"
                              : "opacity-40 cursor-not-allowed border border-gray-200"
                          }`}
                        >
                          <div
                            className={`p-1 rounded-full ${
                              isCurrent
                                ? "bg-blue-200"
                                : isCompleted
                                ? "bg-green-200"
                                : "bg-gray-200"
                            }`}
                          >
                            {isCompleted ? (
                              <Check
                                className={`h-4 w-4 ${
                                  isCurrent ? "text-blue-700" : "text-green-700"
                                }`}
                              />
                            ) : (
                              <Icon
                                className={`h-4 w-4 ${
                                  isCurrent
                                    ? "text-blue-700"
                                    : isClickable
                                    ? "text-gray-600"
                                    : "text-gray-400"
                                }`}
                              />
                            )}
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-[9px] font-medium leading-tight ${
                                isCurrent
                                  ? "text-blue-800"
                                  : isCompleted
                                  ? "text-green-800"
                                  : "text-gray-600"
                              }`}
                            >
                              {step.title.split(" ").map((word, i) => (
                                <div key={i}>{word}</div>
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Indicateur de progression mobile - amélioré */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span className="font-medium">Progression</span>
                      <span className="font-bold text-blue-600">
                        {Math.round(
                          (completedSteps.size / (STEPS.length - 1)) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${
                            (completedSteps.size / (STEPS.length - 1)) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stepper vertical sur desktop */}
                <div className="hidden lg:block space-y-2">
                  {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = completedSteps.has(index);
                    const isCurrent = currentStep === index;
                    const isClickable =
                      index <= currentStep || completedSteps.has(index);

                    return (
                      <div key={step.id} className="relative">
                        <button
                          onClick={() => isClickable && goToStep(index)}
                          disabled={!isClickable}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-200 text-left ${
                            isCurrent
                              ? "bg-blue-50 border-2 border-blue-200"
                              : isCompleted
                              ? "bg-green-50 border border-green-200 hover:bg-green-100"
                              : isClickable
                              ? "hover:bg-gray-50 border border-gray-200"
                              : "opacity-50 cursor-not-allowed border border-gray-100"
                          }`}
                        >
                          {/* Indicateur circulaire plus petit */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? "bg-green-600 text-white"
                                : isCurrent
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>

                          {/* Texte plus compact */}
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-xs font-medium truncate ${
                                isCurrent
                                  ? "text-blue-700"
                                  : isCompleted
                                  ? "text-green-700"
                                  : "text-gray-600"
                              }`}
                            >
                              {step.title}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {step.subtitle}
                            </div>
                          </div>
                        </button>

                        {/* Ligne de connexion plus petite */}
                        {index < STEPS.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-2 bg-gray-200">
                            <div
                              className={`w-full transition-all duration-300 ${
                                isCompleted
                                  ? "bg-green-600 h-full"
                                  : "bg-gray-200 h-0"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Indicateur de progression compact */}
                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>
                      {Math.round(
                        (completedSteps.size / (STEPS.length - 1)) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (completedSteps.size / (STEPS.length - 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <Card className="h-full overflow-visible">
              <CardContent className="p-3 lg:p-4 h-full flex flex-col overflow-visible">
                {/* Contenu du formulaire - responsive */}
                <div className="flex-1 overflow-y-auto overflow-x-visible pr-1 lg:pr-2">
                  {renderStepContent()}
                </div>

                {/* Actions - optimisées pour mobile */}
                <div className="mt-3 lg:mt-4 pt-3 border-t flex-shrink-0">
                  {/* Mobile: Actions en pile */}
                  <div className="lg:hidden space-y-2">
                    <div className="flex justify-center">
                      <Badge variant="secondary" className="px-3 py-1 text-sm">
                        Étape {currentStep + 1} / {STEPS.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="w-full py-3 text-sm border-2"
                        size="sm"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Précédent
                      </Button>

                      {currentStep === STEPS.length - 1 ? (
                        <Button
                          onClick={handleSubmit(onSubmit)}
                          disabled={isSubmitting}
                          className="w-full bg-green-600 hover:bg-green-700 py-3 text-sm font-medium"
                          size="sm"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Envoyer
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="w-full py-3 text-sm font-medium"
                          size="sm"
                        >
                          Suivant
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Desktop: Actions en ligne */}
                  <div className="hidden lg:flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="px-4 py-2 text-sm bg-transparent"
                      size="sm"
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      Précédent
                    </Button>

                    <Badge variant="secondary" className="px-2 py-1 text-xs">
                      Étape {currentStep + 1} / {STEPS.length}
                    </Badge>

                    {currentStep === STEPS.length - 1 ? (
                      <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 text-sm"
                        size="sm"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3 mr-1" />
                            Confirmer et envoyer
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="px-4 py-2 text-sm"
                        size="sm"
                      >
                        Suivant
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipApplicationForm;
