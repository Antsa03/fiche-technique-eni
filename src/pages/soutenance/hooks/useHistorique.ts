import { useEffect, useState } from "react";
import { getMesPvs, getMesMemoires } from "@/services/api";
import type {
  ApiFile,
  InscriptionContexte,
  MemoireHistoriqueItem,
  PvHistoriqueItem,
} from "../types";

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

// Forme brute possible d'un item mémoire renvoyé par
// /v1/formation/pratiques/me/memoires. Le mémoire est rattaché à une formation
// pratique (elle-même liée aux inscriptions), mais l'imbrication exacte n'est
// pas garantie : l'item peut être le mémoire portant sa `formation_pratique`,
// ou la formation pratique portant son `memoire`. On normalise les deux.
interface RawMemoire {
  id: string;
  createdAt?: string;
  theme?: string;
  file?: ApiFile | null;
  path?: string;
  memoire?: {
    id?: string;
    createdAt?: string;
    theme?: string;
    file?: ApiFile | null;
    path?: string;
  } | null;
  formation_pratique?: {
    theme?: string;
    inscriptions?: InscriptionContexte[] | null;
  } | null;
  // Cas où l'item EST une formation pratique (inscriptions au premier niveau).
  inscriptions?: InscriptionContexte[] | null;
}

const normalizeMemoire = (raw: RawMemoire): MemoireHistoriqueItem => {
  // Le fichier/déposé peut vivre sous `memoire` (item = formation pratique)
  // ou directement sur l'item (item = mémoire).
  const memoire = raw.memoire ?? raw;
  // La formation pratique porte les inscriptions : soit imbriquée, soit l'item
  // lui-même lorsqu'il expose des inscriptions au premier niveau.
  const fp =
    raw.formation_pratique ??
    (raw.inscriptions ? { inscriptions: raw.inscriptions } : null);

  return {
    id: memoire.id ?? raw.id,
    createdAt: memoire.createdAt ?? raw.createdAt,
    theme: memoire.theme ?? raw.theme ?? fp?.theme,
    file: memoire.file ?? null,
    path: memoire.path,
    formation_pratique: fp
      ? { theme: fp.theme, inscriptions: fp.inscriptions ?? null }
      : null,
  };
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
            items: toList<RawMemoire>(data).map(normalizeMemoire),
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
