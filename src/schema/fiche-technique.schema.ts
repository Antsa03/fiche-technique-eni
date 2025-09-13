import z from "zod";

const etablissementSchema = z
  .object({
    type: z.enum(["nouveau", "existant"]),
    etablissementExistantId: z.string().optional(),
    sigle_ea: z
      .string()
      .min(2, "Le sigle doit contenir au moins 2 caractères")
      .optional(),
      raison_sociale: z
      .string()
      .min(3, "La raison sociale doit contenir au moins 3 caractères")
      .optional(),
      email_ea: z
      .string()
      .email("Veuillez saisir une adresse email valide")
      .optional(),
      adresse_ea: z
      .string()
      .min(10, "L'adresse doit être complète (minimum 10 caractères)")
      .optional(),
      contact_ea: z
      .string()
      .min(10, "Le contact doit être complète (minimum 10 caractères)")
      .optional(),
      site_web_ea: z
      .string()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.type === "existant") {
        return !!data.etablissementExistantId;
      } else {
        return !!(
          data.sigle_ea &&
          data.raison_sociale &&
          data.email_ea &&
          data.adresse_ea &&
          data.contact_ea &&
          data.site_web_ea
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
    id: z
      .string()
      .min(2, "Erreur sur l id enc pro")
      .optional(),
    user: z
      .object({
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
        contact: z
          .string()
          .min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres")
          .optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.type === "existant") {
        return !!data.encadreurExistantId;
      } else {
        return !!(
          data.user?.nom &&
          data.user?.prenoms &&
          data.user?.email &&
          data.user?.contact
        );
      }
    },
    {
      message: "Veuillez compléter tous les champs requis",
      path: ["user"],
    }
  );

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
