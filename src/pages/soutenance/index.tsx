import { Link } from "react-router-dom";
import { History, Loader2 } from "lucide-react";
import { useStudentStage } from "./hooks/useStudentStage";
import { DateSelectionSection } from "./_components/DateSelectionSection";

export default function SoutenancePage() {
  const { formationPratique, isLoading, error } = useStudentStage();

  const hasEncadreur = Boolean(formationPratique?.encadreur_pedagogique);

  return (
    // Pleine largeur d'écran (full-bleed) pour laisser respirer le tableau de
    // répartition, en s'échappant du conteneur centré de l'app.
    <div
      className="px-4 sm:px-6 space-y-4"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ma soutenance</h2>
          <p className="text-sm text-gray-600">
            Choisissez votre date de soutenance
          </p>
        </div>
        <Link
          to="/soutenance/historique"
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <History className="h-4 w-4" />
          Historique
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Chargement de votre stage...
        </div>
      ) : error ? (
        <p className="text-center text-red-600 py-16">{error}</p>
      ) : formationPratique && hasEncadreur ? (
        <DateSelectionSection formationPratique={formationPratique} />
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Aucun encadreur pédagogique ne vous est encore assigné. Le choix de la
          date de soutenance sera possible dès qu'un encadreur vous sera
          attribué.
        </p>
      )}
    </div>
  );
}
