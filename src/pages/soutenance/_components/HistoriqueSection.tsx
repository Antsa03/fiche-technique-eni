import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  Eye,
  FileText,
  History,
  Loader2,
  ScrollText,
} from "lucide-react";
import { useHistorique } from "../hooks/useHistorique";
import { resolveFileUrl } from "../utils";
import AfficherPVSoutenance from "./AfficherPVSoutenance";
import type {
  MemoireHistoriqueItem,
  PvHistoriqueItem,
  PvRow,
} from "../types";

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const DownloadLink = ({ href }: { href: string | null }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      <Download className="h-3.5 w-3.5" />
      Télécharger
    </a>
  );
};

const PvRow = ({
  pv,
  onView,
}: {
  pv: PvHistoriqueItem;
  onView: (pv: PvHistoriqueItem) => void;
}) => (
  <li className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
    <div className="min-w-0">
      <p className="font-medium">
        Soutenance du{" "}
        {formatDate(pv.soutenance?.date_soutenance) || formatDate(pv.date_pv)}
      </p>
      <p className="text-xs text-muted-foreground">
        {pv.note_pv != null ? `Note : ${pv.note_pv}/20` : "Note non disponible"}
      </p>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onView(pv)}
        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Eye className="h-3.5 w-3.5" />
        Voir
      </button>
      <DownloadLink href={resolveFileUrl(pv.file)} />
    </div>
  </li>
);

const MemoireRow = ({ memoire }: { memoire: MemoireHistoriqueItem }) => (
  <li className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
    <div className="min-w-0">
      <p className="truncate font-medium">
        {memoire.theme || memoire.file?.path?.split("/").pop() || "Mémoire"}
      </p>
      {memoire.createdAt && (
        <p className="text-xs text-muted-foreground">
          Déposé le {formatDate(memoire.createdAt)}
        </p>
      )}
    </div>
    <DownloadLink href={resolveFileUrl(memoire.file, memoire.path)} />
  </li>
);

export const HistoriqueSection = () => {
  const { pvs, memoires } = useHistorique();
  const [pvToShow, setPvToShow] = useState<PvRow | null>(null);

  // Si les deux endpoints d'historique sont indisponibles, on masque tout.
  if (pvs.unavailable && memoires.unavailable) return null;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <History className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Historique</h3>
            <p className="text-muted-foreground text-xs">
              Vos procès-verbaux et mémoires
            </p>
          </div>
        </div>

        {/* PV */}
        {!pvs.unavailable && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ScrollText className="h-4 w-4 text-gray-500" />
              Procès-verbaux
            </div>
            {pvs.isLoading ? (
              <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Chargement...
              </div>
            ) : pvs.items.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">
                Aucun procès-verbal pour le moment.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {pvs.items.map((pv) => (
                  <PvRow
                    key={pv.id}
                    pv={pv}
                    onView={(item) => setPvToShow(item as unknown as PvRow)}
                  />
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Mémoires */}
        {!memoires.unavailable && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-gray-500" />
              Mémoires
            </div>
            {memoires.isLoading ? (
              <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Chargement...
              </div>
            ) : memoires.items.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">
                Aucun mémoire déposé pour le moment.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {memoires.items.map((m) => (
                  <MemoireRow key={m.id} memoire={m} />
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>

      {pvToShow && (
        <AfficherPVSoutenance
          visible={!!pvToShow}
          setVisible={(v) => !v && setPvToShow(null)}
          row={pvToShow}
        />
      )}
    </Card>
  );
};
