import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useStudentStage } from "./hooks/useStudentStage";
import { StageInfoCard } from "./_components/StageInfoCard";
import { MemoireUploadSection } from "./_components/MemoireUploadSection";
import { HistoriqueSection } from "./_components/HistoriqueSection";

export default function SoutenanceHistoriquePage() {
  const { formationPratique, isLoading, error } = useStudentStage();

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historique</h2>
          <p className="text-sm text-gray-600">
            Vos informations de stage, le dépôt de votre mémoire et vos
            PV/mémoires passés
          </p>
        </div>
        <Link
          to="/soutenance"
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la soutenance
        </Link>
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
          <StageInfoCard formationPratique={formationPratique} />
          {formationPratique && (
            <MemoireUploadSection formationPratique={formationPratique} />
          )}
          <HistoriqueSection />
        </>
      )}
    </div>
  );
}
