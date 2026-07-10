import { useCallback, useEffect, useState } from "react";
import {
  getSalles,
  getSoutenancesByDate,
  getTrancheHoraires,
} from "@/services/api";
import type {
  Salle,
  Soutenance,
  TrancheDisponibilite,
  TrancheHoraire,
} from "../types";

const unwrap = <T,>(data: unknown): T[] => {
  const d = data as { data?: T[] } | T[] | null | undefined;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.data)) return d.data;
  return [];
};

const fullName = (u?: { nom?: string; prenoms?: string } | null) =>
  `${u?.nom ?? ""} ${u?.prenoms ?? ""}`.trim();

// Nom du membre du jury tenant un rôle (RAP / PJ / EXA) dans une soutenance.
const juryName = (s: Soutenance, code: string) => {
  const m = (s.membre_jury ?? []).find(
    (mb) => mb.role_membre_jury?.code_role_jury === code
  );
  if (!m) return "";
  return fullName(m.enseignant?.user) || m.enseignant?.sigle_ens || "";
};

// Étudiant occupant la soutenance (1re inscription de la formation pratique).
const etudiantName = (s: Soutenance) => {
  const etu = s.formation_pratique?.inscriptions?.[0]?.etudiant;
  if (!etu) return "";
  return `${etu.matricule ?? ""} ${fullName(etu.user)}`.trim();
};

// Encadreur pédagogique de la soutenance.
const encadreurName = (s: Soutenance) => {
  const enc = s.formation_pratique?.encadreur_pedagogique;
  if (!enc) return "";
  return fullName(enc.user) || enc.sigle_ens;
};

/**
 * Construit le tableau de répartition (tranches horaires × salles) pour une
 * date, à partir des endpoints existants :
 *  - `/tranche-horaires` et `/salles` fournissent les lignes/colonnes ;
 *  - `/soutenance?date_soutenance=<ISO>` fournit les soutenances déjà posées,
 *    d'où l'on remplit chaque cellule occupée (étudiant + jury) et l'on déduit
 *    les créneaux où l'encadreur pédagogique est déjà engagé.
 *
 * `ownSoutenanceId` sert à marquer la soutenance de l'étudiant connecté.
 */
export const useSoutenanceDisponibilites = (
  date: string,
  sigleEns: string | null | undefined,
  ownSoutenanceId?: string
) => {
  const [tranches, setTranches] = useState<TrancheDisponibilite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!date) {
      setTranches([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [tranchesRes, sallesRes, soutenancesRes] = await Promise.all([
        getTrancheHoraires(),
        getSalles(),
        getSoutenancesByDate(new Date(date).toISOString()),
      ]);

      const trancheList = unwrap<TrancheHoraire>(tranchesRes.data);
      const salleList = unwrap<Salle>(sallesRes.data);
      const soutenances = unwrap<Soutenance>(soutenancesRes.data).filter(
        (s) => s.date_soutenance?.slice(0, 10) === date
      );

      // Soutenance occupant une cellule, indexée par `<tranche>::<num_salle>`.
      const byCell = new Map<string, Soutenance>();
      // Tranches où l'encadreur pédagogique est déjà engagé (jury d'une autre
      // soutenance sur ce créneau).
      const encadreurBusy = new Set<string>();
      for (const s of soutenances) {
        const t = s.heure_soutenance ?? "";
        if (s.lieu) byCell.set(`${t}::${s.lieu}`, s);
        if (
          sigleEns &&
          (s.membre_jury ?? []).some((m) => m.enseignant?.sigle_ens === sigleEns)
        ) {
          encadreurBusy.add(t);
        }
      }

      const grid: TrancheDisponibilite[] = trancheList.map((t) => ({
        code_tranche_horaire: t.code_tranche_horaire,
        libelle_tranche_horaire: t.libelle_tranche_horaire,
        encadreur_disponible: !encadreurBusy.has(t.code_tranche_horaire),
        salles: salleList.map((sa) => {
          const s = byCell.get(`${t.code_tranche_horaire}::${sa.num_salle}`);
          if (!s) {
            return {
              num_salle: sa.num_salle,
              capacite_salle: sa.capacite_salle,
              disponible: true,
            };
          }
          return {
            num_salle: sa.num_salle,
            capacite_salle: sa.capacite_salle,
            disponible: false,
            soutenance_id: s.id,
            is_own: Boolean(ownSoutenanceId) && s.id === ownSoutenanceId,
            etudiant: etudiantName(s),
            encadreur: encadreurName(s),
            rapporteur: juryName(s, "RAP"),
            president: juryName(s, "PJ"),
            examinateur: juryName(s, "EXA"),
          };
        }),
      }));

      setTranches(grid);
    } catch (err) {
      console.error("Erreur de récupération des disponibilités:", err);
      setError("Impossible de charger le tableau de répartition pour cette date.");
      setTranches([]);
    } finally {
      setIsLoading(false);
    }
  }, [date, sigleEns, ownSoutenanceId]);

  useEffect(() => {
    load();
  }, [load]);

  return { tranches, isLoading, error, reload: load };
};
