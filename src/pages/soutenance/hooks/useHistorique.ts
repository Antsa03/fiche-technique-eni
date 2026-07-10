import { useEffect, useState } from "react";
import { getMesPvs, getMesMemoires } from "@/services/api";
import type { MemoireHistoriqueItem, PvHistoriqueItem } from "../types";

interface HistoriqueState<T> {
  items: T[];
  isLoading: boolean;
  // Endpoint indisponible (404/501) : on masque la section proprement.
  unavailable: boolean;
}

const isMissingEndpoint = (err: unknown) => {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 404 || status === 501;
};

const toList = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  const nested = (data as { data?: unknown })?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
};

/** Charge l'historique des PV et des mémoires de l'étudiant connecté. */
export const useHistorique = () => {
  const [pvs, setPvs] = useState<HistoriqueState<PvHistoriqueItem>>({
    items: [],
    isLoading: true,
    unavailable: false,
  });
  const [memoires, setMemoires] = useState<
    HistoriqueState<MemoireHistoriqueItem>
  >({ items: [], isLoading: true, unavailable: false });

  useEffect(() => {
    let active = true;

    getMesPvs()
      .then(({ data }) => {
        if (active)
          setPvs({
            items: toList<PvHistoriqueItem>(data),
            isLoading: false,
            unavailable: false,
          });
      })
      .catch((err) => {
        if (active)
          setPvs({
            items: [],
            isLoading: false,
            unavailable: isMissingEndpoint(err),
          });
      });

    getMesMemoires()
      .then(({ data }) => {
        if (active)
          setMemoires({
            items: toList<MemoireHistoriqueItem>(data),
            isLoading: false,
            unavailable: false,
          });
      })
      .catch((err) => {
        if (active)
          setMemoires({
            items: [],
            isLoading: false,
            unavailable: isMissingEndpoint(err),
          });
      });

    return () => {
      active = false;
    };
  }, []);

  return { pvs, memoires };
};
