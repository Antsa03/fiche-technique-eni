import { aspectTechniqueSchema, encadreurSchema, etablissementSchema, stagiaireSchema, sujetSchema } from "@/schema/fiche-technique.schema";
import { Building, Eye, FileText, GraduationCap, Settings, User } from "lucide-react";
import z from "zod";

export const STEPS = [
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