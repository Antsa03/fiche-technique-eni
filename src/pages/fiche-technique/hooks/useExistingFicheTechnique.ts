import { useEffect, useState } from "react";
import { getMyFormationPratique } from "@/services/api";
import type { FormationPratiqueDetail } from "../utils/mapFormationToForm";

interface ExistingFicheTechniqueState {
  formationPratique: FormationPratiqueDetail | null;
  isLoading: boolean;
}

/**
 * Détecte si l'étudiant connecté possède déjà un stage (formation pratique) via
 * GET /formation/pratiques/me. S'il en a un, le formulaire passe en mode édition
 * (pré-remplissage + PATCH). Un 404 — ou toute autre erreur — signifie « pas de
 * stage » et laisse le formulaire en mode création.
 */
export const useExistingFicheTechnique = (): ExistingFicheTechniqueState => {
  const [state, setState] = useState<ExistingFicheTechniqueState>({
    formationPratique: null,
    isLoading: true,
  });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data } = await getMyFormationPratique();
        if (active) {
          setState({ formationPratique: data ?? null, isLoading: false });
        }
      } catch (err: unknown) {
        // 404 = aucun stage rattaché (cas normal). On reste en mode création.
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status !== 404) {
          console.error("Erreur de récupération du stage:", err);
        }
        if (active) {
          setState({ formationPratique: null, isLoading: false });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return state;
};
