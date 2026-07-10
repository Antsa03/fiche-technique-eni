import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { submitMemoire } from "@/services/api";
import AccuseReceptionMemoire, {
  type AccuseReceptionData,
} from "./AccuseReceptionMemoire";
import { formatEtudiant } from "../utils";
import type { FormationPratique } from "../types";

interface MemoireUploadSectionProps {
  formationPratique: FormationPratique;
}

const MAX_SIZE_MB = 20;

export const MemoireUploadSection = ({
  formationPratique,
}: MemoireUploadSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accuse, setAccuse] = useState<AccuseReceptionData | null>(null);
  const [accuseVisible, setAccuseVisible] = useState(false);

  const pickFile = (selected: File | null) => {
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      toast.error("Le mémoire doit être un fichier PDF.");
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Le fichier ne doit pas dépasser ${MAX_SIZE_MB} Mo.`);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsSubmitting(true);
    try {
      const res = await submitMemoire(formationPratique.id, file);
      // Le backend renvoie { file: { id, path } } ; l'id sert de référence de
      // l'accusé. On se replie sur un horodatage local si l'id est absent.
      const reference =
        (res?.data?.file?.id as string | undefined) ??
        `MEM-${Date.now().toString(36).toUpperCase()}`;

      setAccuse({
        reference,
        etudiant: formatEtudiant(),
        theme: formationPratique.theme,
        fileName: file.name,
        fileSizeMo: (file.size / 1024 / 1024).toFixed(2),
        deposeLe: new Date().toISOString(),
      });
      setAccuseVisible(true);

      toast.success("Mémoire déposé avec succès !");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Échec du dépôt du mémoire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <FileText className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Mémoire final (PDF)
            </h3>
            <p className="text-muted-foreground text-xs">
              Déposez la version finale de votre mémoire
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />

        {!file ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-gray-50"
          >
            <Upload className="h-6 w-6" />
            Cliquez pour sélectionner un fichier PDF
            <span className="text-xs">Taille maximale : {MAX_SIZE_MB} Mo</span>
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} Mo
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Retirer le fichier"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {accuse && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <span>
              Dépôt enregistré — référence{" "}
              <strong>{accuse.reference}</strong>. Un accusé de réception est
              disponible.
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setAccuseVisible(true)}
            >
              <FileText className="h-4 w-4" />
              Voir l&apos;accusé
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Déposer le mémoire
          </Button>
        </div>
      </CardContent>

      {accuse && (
        <AccuseReceptionMemoire
          visible={accuseVisible}
          setVisible={setAccuseVisible}
          data={accuse}
        />
      )}
    </Card>
  );
};
