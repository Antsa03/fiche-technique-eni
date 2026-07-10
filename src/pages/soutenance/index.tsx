import { useState, type ReactNode } from "react";
import { Loader2, CalendarClock, History } from "lucide-react";
import { useStudentStage } from "./hooks/useStudentStage";
import { StageInfoCard } from "./_components/StageInfoCard";
import { DateSelectionSection } from "./_components/DateSelectionSection";
import { MemoireUploadSection } from "./_components/MemoireUploadSection";
import { HistoriqueSection } from "./_components/HistoriqueSection";

type SoutenanceTab = "soutenance" | "historique";

export default function SoutenancePage() {
  const { formationPratique, isLoading, error } = useStudentStage();
  const [tab, setTab] = useState<SoutenanceTab>("soutenance");

  const hasEncadreur = Boolean(formationPratique?.encadreur_pedagogique);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Ma soutenance</h2>
        <p className="text-sm text-gray-600">
          Choisissez votre date de soutenance et déposez votre mémoire final
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Chargement de votre stage...
        </div>
      ) : error ? (
        <p className="text-center text-red-600 py-16">{error}</p>
      ) : (
        <>
          {/* Onglets */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
            <TabButton
              active={tab === "soutenance"}
              onClick={() => setTab("soutenance")}
              icon={<CalendarClock className="h-4 w-4" />}
              label="Soutenance"
            />
            <TabButton
              active={tab === "historique"}
              onClick={() => setTab("historique")}
              icon={<History className="h-4 w-4" />}
              label="Historique"
            />
          </div>

          {/* Onglet Soutenance : uniquement la grille de choix de date */}
          {tab === "soutenance" &&
            (formationPratique && hasEncadreur ? (
              <DateSelectionSection formationPratique={formationPratique} />
            ) : (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Aucun encadreur pédagogique ne vous est encore assigné. Le choix
                de la date de soutenance sera possible dès qu'un encadreur vous
                sera attribué.
              </p>
            ))}

          {/* Onglet Historique : infos stage, dépôt du mémoire, PV/mémoires passés */}
          {tab === "historique" && (
            <>
              <StageInfoCard formationPratique={formationPratique} />
              {formationPratique && (
                <MemoireUploadSection formationPratique={formationPratique} />
              )}
              <HistoriqueSection />
            </>
          )}
        </>
      )}
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

const TabButton = ({ active, onClick, icon, label }: TabButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-white text-indigo-600 shadow-sm"
        : "text-gray-600 hover:text-gray-900",
    ].join(" ")}
  >
    {icon}
    {label}
  </button>
);
