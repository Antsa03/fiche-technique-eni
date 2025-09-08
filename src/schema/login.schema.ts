import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Veuillez saisir une adresse email valide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(4, "Le mot de passe doit contenir au moins 4 caractères"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
