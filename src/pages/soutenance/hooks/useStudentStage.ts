import { useCallback, useEffect, useState } from "react";
import { getMyFormationPratique } from "@/services/api";
import type { FormationPratique } from "../types";

interface StudentStageState {
  formationPratique: FormationPratique | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Récupère le stage (FormationPratique) de l'étudiant connecté via
 * GET /formation/pratiques/me. Un 404 signifie « aucun stage » (pas une
 * erreur) ; l'encadreur_pedagogique peut être null (non encore assigné).
 */
export const useStudentStage = (): StudentStageState & {
  refetch: () => void;
} => {
  const [state, setState] = useState<StudentStageState>({
    formationPratique: null,
    isLoading: true,
    error: null,
  });

  const fetchStage = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { data } = await getMyFormationPratique();
      setState({
        formationPratique: data ?? null,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) {
        // Pas de stage rattaché à l'étudiant : cas normal, pas une erreur.
        setState({ formationPratique: null, isLoading: false, error: null });
        return;
      }
      console.error("Erreur de récupération du stage:", err);
      setState({
        formationPratique: null,
        isLoading: false,
        error: "Impossible de charger votre stage.",
      });
    }
  }, []);

  useEffect(() => {
    fetchStage();
  }, [fetchStage]);

  return { ...state, refetch: fetchStage };
};
