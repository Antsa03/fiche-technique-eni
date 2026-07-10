import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Lock,
  UserX,
} from "lucide-react";
import {
  chooseSoutenanceDate,
  getSoutenanceByFormation,
} from "@/services/api";
import { useSoutenanceDisponibilites } from "../hooks/useSoutenanceDisponibilites";
import { JuryList } from "./JuryList";
import type {
  CreneauChoisi,
  FormationPratique,
  Soutenance,
  TrancheDisponibilite,
} from "../types";

interface DateSelectionSectionProps {
  formationPratique: FormationPratique;
}

const todayISO = () => new Date().toISOString().split("T")[0];

// Décale une date ISO (YYYY-MM-DD) de N jours, en restant sur le fuseau local.
const shiftISODate = (iso: string, days: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Le jury « scolarité » est-il attribué ? Le rapporteur — créé
// automatiquement au choix de la date et qui est l'encadreur pédagogique —
// ne compte pas : sa seule présence ne doit pas verrouiller la date.
const hasScolariteJury = (
  s: Soutenance | null,
  sigleEncadreur?: string | null
) => (s?.membre_jury ?? []).some((m) => m.enseignant?.sigle_ens !== sigleEncadreur);

// Un PV a-t-il déjà été généré ? (plusieurs formes possibles côté backend)
const hasPv = (s: Soutenance | null) =>
  Boolean(s?.has_pv || s?.pv?.id || s?.proces_verbal?.id);

const isSameCreneau = (a: CreneauChoisi | null, code: string, salle: string) =>
  a?.code_tranche_horaire === code && a?.num_salle === salle;

export const DateSelectionSection = ({
  formationPratique,
}: DateSelectionSectionProps) => {
  const sigleEns = formationPratique.encadreur_pedagogique?.sigle_ens;

  const [date, setDate] = useState(todayISO());
  const [creneau, setCreneau] = useState<CreneauChoisi | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existing, setExisting] = useState<Soutenance | null>(null);

  const { tranches, isLoading: gridLoading, error: gridError, reload } =
    useSoutenanceDisponibilites(date, sigleEns, existing?.id);

  const juryAssigned = hasScolariteJury(existing, sigleEns);
  const pvGenerated = hasPv(existing);
  const isLocked = juryAssigned || pvGenerated;

  const canConfirm = Boolean(creneau) && !isSubmitting && !isLocked;

  // Charge la soutenance déjà choisie (date, salle, jury, statut PV).
  const loadExisting = useCallback(async () => {
    try {
      const { data } = await getSoutenanceByFormation(formationPratique.id);
      const list = data?.data ?? data ?? [];
      const soutenance: Soutenance | null = Array.isArray(list)
        ? list[0] ?? null
        : list ?? null;
      setExisting(soutenance);
    } catch {
      setExisting(null);
    }
  }, [formationPratique.id]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  // Changer de date invalide le créneau sélectionné.
  const handleDateChange = (v: string) => {
    setDate(v);
    setCreneau(null);
  };

  // Navigation date : on ne recule pas avant aujourd'hui.
  const canGoPrev = date > todayISO();
  const goPrev = () => canGoPrev && handleDateChange(shiftISODate(date, -1));
  const goNext = () => handleDateChange(shiftISODate(date, 1));

  const handleConfirm = async () => {
    if (!canConfirm || !creneau) return;
    setIsSubmitting(true);
    try {
      await chooseSoutenanceDate({
        formation_pratique: { id: formationPratique.id },
        date_soutenance: date,
        tranche_horaire: { code_tranche_horaire: creneau.code_tranche_horaire },
        // Le backend stocke la salle dans `lieu` (= num_salle), pas dans un objet.
        lieu: creneau.num_salle,
      });
      toast.success(
        "Créneau envoyé ! En attente de la confirmation de la scolarité.",
        { duration: 6000 }
      );
      setCreneau(null);
      loadExisting();
      reload();
    } catch (err) {
      console.error(err);
      toast.error("Échec de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingSalle = existing?.lieu;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <CalendarClock className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Date de soutenance
            </h3>
            <p className="text-muted-foreground text-xs">
              {isLocked
                ? "La date est verrouillée"
                : "Choisissez une date, puis un créneau et une salle disponibles"}
            </p>
          </div>
        </div>

        {/* Date (+ salle) déjà choisie */}
        {existing?.date_soutenance && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            <CalendarCheck className="h-4 w-4 shrink-0" />
            <span className="capitalize">
              Date{isLocked ? "" : " actuelle"} :{" "}
              {formatDate(existing.date_soutenance)}
              {existing.heure_soutenance && ` — ${existing.heure_soutenance}`}
              {existingSalle && ` — ${existingSalle}`}
            </span>
          </div>
        )}

        {/* En attente de la confirmation de la scolarité (encore modifiable) */}
        {existing?.date_soutenance && !isLocked && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <Clock className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Votre date a bien été envoyée. Elle est{" "}
              <strong>en attente de la confirmation de la scolarité</strong>.
            </p>
          </div>
        )}

        {/* Motif de verrouillage */}
        {isLocked && (
          <div className="flex items-start gap-2 rounded-lg bg-gray-100 border border-gray-200 p-3 text-sm text-gray-700">
            <Lock className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              {pvGenerated
                ? "La soutenance est terminée (procès-verbal généré) : la date ne peut plus être modifiée."
                : "Votre soutenance a été confirmée par la scolarité (jury attribué) : la date ne peut plus être modifiée."}
            </p>
          </div>
        )}

        {/* Membres du jury */}
        {juryAssigned && existing?.membre_jury && (
          <JuryList membres={existing.membre_jury} />
        )}

        {/* Choix de la date + grille des disponibilités (masqués si verrouillé) */}
        {!isLocked && (
          <>
            {/* Sélecteur de date centré et fixe (reste visible au scroll) */}
            <div className="sticky top-0 z-30 -mx-6 flex flex-col items-center gap-1.5 border-b bg-white/95 px-6 py-3 backdrop-blur">
              <Label htmlFor="date-soutenance">Date de la soutenance</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={goPrev}
                  disabled={!canGoPrev}
                  title="Jour précédent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input
                  id="date-soutenance"
                  type="date"
                  min={todayISO()}
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-44 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={goNext}
                  title="Jour suivant"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {date && (
              <DisponibilitesGrid
                tranches={tranches}
                isLoading={gridLoading}
                error={gridError}
                creneau={creneau}
                onSelect={setCreneau}
              />
            )}

            {/* Barre de confirmation : reste visible même en scrollant */}
            {creneau && (
              <div className="sticky bottom-0 z-20 -mx-6 flex flex-wrap items-center justify-between gap-2 border-t bg-white/95 px-6 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur">
                <p className="text-sm text-muted-foreground">
                  Créneau sélectionné :{" "}
                  <span className="font-medium text-foreground">
                    {creneau.libelle_tranche_horaire ??
                      creneau.code_tranche_horaire}{" "}
                    · {creneau.num_salle} ·{" "}
                    <span className="capitalize">{formatDate(date)}</span>
                  </span>
                </p>
                <Button onClick={handleConfirm} disabled={!canConfirm}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirmer la date
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ----- Tableau de répartition (Heure × Salle), vue étudiant lecture seule -----

interface DisponibilitesGridProps {
  tranches: TrancheDisponibilite[];
  isLoading: boolean;
  error: string | null;
  creneau: CreneauChoisi | null;
  onSelect: (c: CreneauChoisi) => void;
}

const DisponibilitesGrid = ({
  tranches,
  isLoading,
  error,
  creneau,
  onSelect,
}: DisponibilitesGridProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement du tableau de répartition...
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
        {error}
      </p>
    );
  }

  if (!tranches.length) {
    return (
      <p className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-600">
        Aucun créneau pour cette date.
      </p>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-auto rounded-lg border">
      <table className="w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="text-left text-white">
            <th className="sticky top-0 z-10 bg-indigo-500 px-3 py-2 font-semibold">
              Heure
            </th>
            <th className="sticky top-0 z-10 bg-indigo-500 px-3 py-2 font-semibold">
              Salle
            </th>
            <th className="sticky top-0 z-10 bg-indigo-500 px-3 py-2 font-semibold">
              Étudiant
            </th>
            <th className="sticky top-0 z-10 bg-indigo-500 px-3 py-2 font-semibold">
              Encadreur
            </th>
            <th className="sticky top-0 z-10 bg-indigo-500 px-3 py-2 font-semibold">
              Rapporteur
            </th>
            <th className="sticky top-0 z-10 bg-indigo-500 px-3 py-2 font-semibold text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {tranches.map((t) => {
            const label = t.libelle_tranche_horaire ?? t.code_tranche_horaire;
            const salles = t.salles ?? [];

            if (!salles.length) {
              return (
                <tr key={t.code_tranche_horaire} className="border-t">
                  <td className="px-3 py-2 font-medium align-top">{label}</td>
                  <td
                    className="px-3 py-2 text-muted-foreground italic"
                    colSpan={5}
                  >
                    Aucune salle
                  </td>
                </tr>
              );
            }

            return salles.map((s, idx) => {
              const occupied = !s.disponible;
              const selectable = t.encadreur_disponible && s.disponible;
              const selected = isSameCreneau(
                creneau,
                t.code_tranche_horaire,
                s.num_salle
              );
              // On n'affiche jamais les infos des AUTRES : seule la soutenance
              // de l'étudiant connecté montre ses détails ; les autres cases
              // occupées sont simplement grisées.
              const showInfo = occupied && s.is_own;

              return (
                <tr
                  key={`${t.code_tranche_horaire}-${s.num_salle}`}
                  className={[
                    "border-t transition-colors",
                    selected
                      ? "bg-emerald-50"
                      : s.is_own
                      ? "bg-blue-50"
                      : occupied
                      ? "bg-gray-100 text-gray-400"
                      : "",
                    selectable && !selected ? "hover:bg-gray-50" : "",
                  ].join(" ")}
                >
                  {idx === 0 && (
                    <td
                      className="px-3 py-2 font-medium align-top text-foreground"
                      rowSpan={salles.length}
                    >
                      <div>{label}</div>
                      {!t.encadreur_disponible && (
                        <div className="mt-1 flex items-center gap-1 text-xs font-normal text-red-600">
                          <UserX className="h-3 w-3" />
                          Encadreur indisponible
                        </div>
                      )}
                    </td>
                  )}
                  <td className="px-3 py-2 font-medium">{s.num_salle}</td>
                  <td className="px-3 py-2">
                    {showInfo && s.etudiant}
                    {s.is_own && (
                      <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                        Vous
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">{showInfo ? s.encadreur : ""}</td>
                  <td className="px-3 py-2">{showInfo ? s.rapporteur : ""}</td>
                  <td className="px-3 py-2 text-right">
                    {selected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <Check className="h-4 w-4" />
                        Sélectionnée
                      </span>
                    ) : s.disponible ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!selectable}
                        title={
                          selectable
                            ? undefined
                            : "Encadreur indisponible sur ce créneau"
                        }
                        onClick={() =>
                          onSelect({
                            code_tranche_horaire: t.code_tranche_horaire,
                            libelle_tranche_horaire: t.libelle_tranche_horaire,
                            num_salle: s.num_salle,
                          })
                        }
                      >
                        Choisir
                      </Button>
                    ) : (
                      <span className="text-xs">
                        {s.is_own ? "Votre soutenance" : "Occupée"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  );
};
