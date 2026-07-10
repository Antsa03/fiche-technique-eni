import type { FormData } from "../types/form.types";
import { getFormDefaultValues } from "./formUtils";

// Forme (défensive) de la réponse GET /formation/pratiques/me. La complétude
// des données n'est pas garantie côté backend : tous les champs sont optionnels
// et le mapping ci-dessous tolère les absences (valeurs vides par défaut).
export interface FormationPratiqueDetail {
  id: string;
  theme?: string | null;
  descriptif?: string | null;
  objectif?: string | null;
  moyen_logiciel?: string | null;
  moyen_materiel?: string | null;
  planning_previsionnel?: string | null;
  specialite?: { code_specialite?: string | null } | null;
  etablissement_accueil?: {
    sigle_ea?: string | null;
    raison_sociale?: string | null;
    responsable_ea?: string | null;
    email_ea?: string | null;
    adresse_ea?: string | null;
    contact_ea?: string | null;
    site_web_ea?: string | null;
  } | null;
  encadreur_professionnel?: {
    id?: string | null;
    user?: {
      nom?: string | null;
      prenoms?: string | null;
      email?: string | null;
      contact?: string | null;
    } | null;
  } | null;
  inscriptions?: Array<{
    code_inscription?: string | null;
    // Le niveau/parcours peut revenir sous forme de code brut ou d'objet imbriqué.
    niveau?: { code_niveau?: string | null } | string | null;
    parcours?: { code_parcours?: string | null } | string | null;
    etudiant?: {
      user?: { nom?: string | null; prenoms?: string | null } | null;
    } | null;
  }> | null;
}

// Extrait un code (niveau/parcours) qu'il soit fourni en chaîne ou en objet.
const codeOf = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    return (
      (o.code_niveau as string) ||
      (o.code_parcours as string) ||
      (o.code as string) ||
      ""
    );
  }
  return "";
};

/**
 * Transforme la formation pratique renvoyée par l'API en valeurs du formulaire
 * (forme inverse de la transformation opérée par onSubmit). Les sections dont
 * la donnée est absente retombent sur les valeurs par défaut. L'établissement et
 * l'encadreur passent en mode "existant" puisqu'ils sont déjà rattachés au stage.
 */
export const mapFormationPratiqueToFormData = (
  fp: FormationPratiqueDetail
): FormData => {
  const defaults = getFormDefaultValues();
  const ea = fp.etablissement_accueil;
  const enc = fp.encadreur_professionnel;
  const inscriptions = fp.inscriptions ?? [];

  // Reconstitue les libellés "CODE - Nom Prénoms" attendus par le multi-select.
  const stagiaires = inscriptions
    .map((i) => {
      const code = i.code_inscription ?? "";
      const nom = i.etudiant?.user?.nom ?? "";
      const prenoms = i.etudiant?.user?.prenoms ?? "";
      return `${code} - ${nom} ${prenoms}`.trim();
    })
    .filter((s) => s.replace(/-/g, "").trim().length > 0);

  const first = inscriptions[0];

  return {
    etablissement: ea
      ? {
          type: "existant",
          etablissementExistantId: ea.sigle_ea ?? "",
          sigle_ea: ea.sigle_ea ?? "",
          raison_sociale: ea.raison_sociale ?? "",
          responsable_ea: ea.responsable_ea ?? "",
          email_ea: ea.email_ea ?? "",
          adresse_ea: ea.adresse_ea ?? "",
          contact_ea: ea.contact_ea ?? "",
          site_web_ea: ea.site_web_ea ?? "",
        }
      : defaults.etablissement,
    encadreur: enc
      ? {
          type: "existant",
          encadreurExistantId: enc.id ?? "",
          id: enc.id ?? "",
          user: {
            nom: enc.user?.nom ?? "",
            prenoms: enc.user?.prenoms ?? "",
            email: enc.user?.email ?? "",
            contact: enc.user?.contact ?? "",
          },
        }
      : defaults.encadreur,
    stagiaire: {
      niveau: codeOf(first?.niveau),
      parcours: codeOf(first?.parcours),
      stagiaires,
    },
    sujet: {
      theme: fp.theme ?? "",
      orientation: fp.specialite?.code_specialite ?? "",
      objectif: fp.objectif ?? "",
      descriptif: fp.descriptif ?? "",
    },
    aspectTechnique: {
      planningPrevisionnel: fp.planning_previsionnel ?? "",
      moyenLogiciel: fp.moyen_logiciel ?? "",
      moyenMateriel: fp.moyen_materiel ?? "",
    },
  };
};
