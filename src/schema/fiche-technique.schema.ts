import z from "zod";

const etablissementSchema = z.discriminatedUnion("type", [
  // Schéma pour établissement existant
  z.object({
    type: z.literal("existant"),
    etablissementExistantId: z
      .string()
      .min(1, "Veuillez sélectionner un établissement existant"),
    // Champs optionnels car remplis automatiquement
    sigle_ea: z.string().optional(),
    raison_sociale: z.string().optional(),
    responsable_ea: z.string().optional(),
    email_ea: z.string().optional(),
    adresse_ea: z.string().optional(),
    contact_ea: z.string().optional(),
    site_web_ea: z.string().optional().nullable(),
  }),
  // Schéma pour nouvel établissement
  z.object({
    type: z.literal("nouveau"),
    etablissementExistantId: z.string().optional(),
    // Champs obligatoires pour un nouvel établissement
    sigle_ea: z.string().min(2, "Le sigle doit contenir au moins 2 caractères"),
    raison_sociale: z
      .string()
      .min(3, "La raison sociale doit contenir au moins 3 caractères"),
    responsable_ea: z.string().min(4, "Veuillez saisir le nom complet"),
    email_ea: z.string().email("Veuillez saisir une adresse email valide"),
    adresse_ea: z
      .string()
      .min(10, "L'adresse doit être complète (minimum 10 caractères)"),
    contact_ea: z
      .string()
      .min(10, "Le contact doit être complète (minimum 10 caractères)"),
    site_web_ea: z.string().optional().nullable(),
  }),
]);

const encadreurSchema = z.discriminatedUnion("type", [
  // Schéma pour encadreur existant
  z.object({
    type: z.literal("existant"),
    encadreurExistantId: z
      .string()
      .min(1, "Veuillez sélectionner un encadreur existant"),
    // Champs optionnels car remplis automatiquement
    id: z.string().optional(),
    user: z
      .object({
        nom: z.string().optional(),
        prenoms: z.string().optional(),
        email: z.string().optional(),
        contact: z.string().optional(),
      })
      .optional(),
  }),
  // Schéma pour nouvel encadreur
  z.object({
    type: z.literal("nouveau"),
    encadreurExistantId: z.string().optional(),
    id: z.string().optional(),
    // Champs obligatoires pour un nouvel encadreur
    user: z.object({
      nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
      prenoms: z
        .string()
        .min(2, "Les prénoms doivent contenir au moins 2 caractères"),
      email: z.string().email("Veuillez saisir une adresse email valide"),
      contact: z
        .string()
        .min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres"),
    }),
  }),
]);

const stagiaireSchema = z
  .object({
    niveau: z.string().min(1, "Veuillez sélectionner un niveau d'étude"),
    parcours: z.string().min(1, "Veuillez sélectionner un parcours"),
    stagiaires: z
      .array(z.string())
      .transform((arr) => arr.filter((item) => item.trim().length > 0))
      .refine(
        (arr) => arr.every((item) => item.length >= 3),
        "Chaque nom doit contenir au moins 3 caractères"
      ),
  })
  .refine(
    (data) => {
      const { niveau, stagiaires } = data;

      // Définir les contraintes min/max par niveau
      const constraints: Record<string, { min: number; max: number }> = {
        L1: { min: 4, max: 5 },
        L2: { min: 1, max: 2 },
        L3: { min: 1, max: 1 },
        M1: { min: 3, max: 4 },
        M2: { min: 1, max: 1 },
      };

      if (!niveau || !constraints[niveau]) {
        return stagiaires.length >= 1 && stagiaires.length <= 5;
      }

      const { min, max } = constraints[niveau];
      return stagiaires.length >= min && stagiaires.length <= max;
    },
    (data) => {
      const { niveau, stagiaires } = data;

      const constraints: Record<string, { min: number; max: number }> = {
        L1: { min: 4, max: 5 },
        L2: { min: 1, max: 2 },
        L3: { min: 1, max: 1 },
        M1: { min: 3, max: 4 },
        M2: { min: 1, max: 1 },
      };

      if (!niveau || !constraints[niveau]) {
        if (stagiaires.length < 1)
          return {
            message: "Au moins un stagiaire est requis",
            path: ["stagiaires"],
          };
        if (stagiaires.length > 5)
          return {
            message: "Maximum 5 stagiaires autorisés",
            path: ["stagiaires"],
          };
        return { message: "Erreur de validation", path: ["stagiaires"] };
      }

      const { min, max } = constraints[niveau];

      if (stagiaires.length < min) {
        return {
          message: `Au moins ${min} stagiaire${min > 1 ? "s" : ""} ${
            min > 1 ? "sont" : "est"
          } requis pour le niveau ${niveau}`,
          path: ["stagiaires"],
        };
      }

      if (stagiaires.length > max) {
        return {
          message: `Maximum ${max} stagiaire${max > 1 ? "s" : ""} autorisé${
            max > 1 ? "s" : ""
          } pour le niveau ${niveau}`,
          path: ["stagiaires"],
        };
      }

      return { message: "Erreur de validation", path: ["stagiaires"] };
    }
  );

const sujetSchema = z.object({
  theme: z.string().min(5, "Le thème doit contenir au moins 5 caractères"),
  orientation: z.string().min(1, "Veuillez sélectionner une orientation"),
  objectif: z
    .string()
    .min(10, "L'objectif doit être détaillé (minimum 10 caractères)"),
  descriptif: z
    .string()
    .min(10, "Le descriptif doit être détaillé (minimum 10 caractères)"),
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

export {
  globalSchema,
  aspectTechniqueSchema,
  encadreurSchema,
  etablissementSchema,
  stagiaireSchema,
  sujetSchema,
};

export type EtablissementType = z.infer<typeof etablissementSchema>;
export type EncadreurType = z.infer<typeof encadreurSchema>;
export type StagiaireType = z.infer<typeof stagiaireSchema>;
export type SujetType = z.infer<typeof sujetSchema>;
export type AspectTechniqueType = z.infer<typeof aspectTechniqueSchema>;
