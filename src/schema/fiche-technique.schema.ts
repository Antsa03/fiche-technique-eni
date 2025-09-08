import z from "zod";

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
  parcours: z.string().min(1, "Veuillez sélectionner un parcours"),
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

export {
  globalSchema,
  aspectTechniqueSchema,
  encadreurSchema,
  etablissementSchema,
  stagiaireSchema,
  sujetSchema,
};
