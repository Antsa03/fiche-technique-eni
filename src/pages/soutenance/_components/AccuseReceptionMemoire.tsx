import { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { dateToWords } from "../pv-utils";
import { overrideOklchVars } from "../pdf-utils";
import "../pv.css";

// Icône PDF reprise de front-2026 (assets/icon/IconeFile), identique au PV.
const PDFIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    style={{ marginRight: 4 }}
  >
    <path
      fill="currentColor"
      d="M2.5 6.5V6H2v.5zm4 0V6H6v.5zm0 4H6v.5h.5zm7-7h.5v-.207l-.146-.147zm-3-3l.354-.354L10.707 0H10.5zM2.5 7h1V6h-1zm.5 4V8.5H2V11zm0-2.5v-2H2v2zm.5-.5h-1v1h1zm.5-.5a.5.5 0 0 1-.5.5v1A1.5 1.5 0 0 0 5 7.5zM3.5 7a.5.5 0 0 1 .5.5h1A1.5 1.5 0 0 0 3.5 6zM6 6.5v4h1v-4zm.5 4.5h1v-1h-1zM9 9.5v-2H8v2zM7.5 6h-1v1h1zM9 7.5A1.5 1.5 0 0 0 7.5 6v1a.5.5 0 0 1 .5.5zM7.5 11A1.5 1.5 0 0 0 9 9.5H8a.5.5 0 0 1-.5.5zM10 6v5h1V6zm.5 1H13V6h-2.5zm0 2H12V8h-1.5zM2 5V1.5H1V5zm11-1.5V5h1V3.5zM2.5 1h8V0h-8zm7.646-.146l3 3l.708-.708l-3-3zM2 1.5a.5.5 0 0 1 .5-.5V0A1.5 1.5 0 0 0 1 1.5zM1 12v1.5h1V12zm1.5 3h10v-1h-10zM14 13.5V12h-1v1.5zM12.5 15a1.5 1.5 0 0 0 1.5-1.5h-1a.5.5 0 0 1-.5.5zM1 13.5A1.5 1.5 0 0 0 2.5 15v-1a.5.5 0 0 1-.5-.5z"
    />
  </svg>
);

// Données du récépissé, constituées au moment du dépôt réussi.
export interface AccuseReceptionData {
  reference: string; // identifiant du fichier renvoyé par le backend
  etudiant: string; // titre + nom + prénoms de l'étudiant connecté
  theme: string; // intitulé du mémoire / thème du stage
  fileName: string;
  fileSizeMo?: string; // taille formatée en Mo (indisponible depuis l'historique)
  deposeLe: string; // date/heure ISO du dépôt
}

interface AccuseReceptionMemoireProps {
  visible: boolean;
  setVisible: (v: boolean) => void;
  data: AccuseReceptionData;
}

const AccuseReceptionMemoire = ({
  visible,
  setVisible,
  data,
}: AccuseReceptionMemoireProps) => {
  const [loadingButton, setLoadingButton] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const heure = new Date(data.deposeLe);
  const heureText = isNaN(heure.getTime())
    ? ""
    : ` à ${String(heure.getHours()).padStart(2, "0")}h${String(
        heure.getMinutes()
      ).padStart(2, "0")}`;

  const handleDownloadPDF = () => {
    setLoadingButton(true);

    // html2canvas ne sait pas parser oklch (Tailwind v4) : on remplace
    // temporairement les variables de thème oklch de :root par des rgb.
    const restoreVars = overrideOklchVars();

    const options = {
      margin: 10,
      filename: `Accuse_reception_memoire_${data.reference || "document"}.pdf`,
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf()
      .set(options)
      .from(pdfRef.current)
      .save()
      .then(() => {
        restoreVars();
        setLoadingButton(false);
      })
      .catch((err: unknown) => {
        restoreVars();
        console.error("Error generating PDF: ", err);
        setLoadingButton(false);
      });
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="w-full sm:max-w-[860px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogTitle className="sr-only">
          Accusé de réception de dépôt de mémoire
        </DialogTitle>
        <div ref={pdfRef} id="pdf">
          <div className="headerPV fs-s">
            <div className="left">
              <p>
                <small>
                  UNIVERSITE DE FIANARANTSOA
                  <br />
                  ECOLE NATIONALE D&apos;INFORMATIQUE
                  <br />
                  BP : 1487, Tanambao, Fianarantsoa (301)
                  <br />
                  Tél: 034 05 733 36 - 032 15 204 28
                  <br />
                </small>
                <strong>Email : eni@eni.mg</strong>
              </p>
            </div>
            <div className="right">
              <p>
                <small>
                  Référence : {data.reference}
                  <br />
                  Fianarantsoa, le {dateToWords(data.deposeLe)}
                </small>
              </p>
            </div>
          </div>

          <h4 className="titlePV">
            Accusé de réception de dépôt de mémoire
          </h4>

          <p className="mt-3">
            L&apos;École Nationale d&apos;Informatique accuse réception de la
            version finale du mémoire déposée par voie électronique par
            l&apos;étudiant(e) désigné(e) ci-dessous.
          </p>

          <div className="rowPV mt-3">
            <label>Étudiant(e) :</label>
            <p>
              <small>{data.etudiant}</small>
            </p>
          </div>
          <div className="rowPV mt-2">
            <label>Intitulé du mémoire :</label>
            <p>
              <small>{data.theme}</small>
            </p>
          </div>
          <div className="rowPV mt-2">
            <label>Fichier déposé :</label>
            <p>
              <small>
                {data.fileName}
                {data.fileSizeMo ? ` (${data.fileSizeMo} Mo)` : ""}
              </small>
            </p>
          </div>
          <div className="rowPV mt-2">
            <label>Numéro de référence :</label>
            <p>
              <small>{data.reference}</small>
            </p>
          </div>
          <div className="rowPV mt-2">
            <label>Date de dépôt :</label>
            <p>
              <small>
                {dateToWords(data.deposeLe)}
                {heureText}
              </small>
            </p>
          </div>

          <p className="mt-3">
            Le présent accusé atteste uniquement de la réception du fichier à la
            date indiquée ; il ne préjuge en rien de l&apos;évaluation du
            mémoire ni de sa conformité.
          </p>

          <div className="rowPV mt-4" style={{ justifyContent: "flex-end" }}>
            <div style={{ textAlign: "center" }}>
              <p>
                <small>Le service de la scolarité</small>
              </p>
              <input
                disabled
                style={{
                  width: 200,
                  border: "1px solid #999",
                  borderRadius: 4,
                  padding: "4px 8px",
                  background: "#fff",
                }}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDownloadPDF}
            disabled={loadingButton}
          >
            {loadingButton ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>{PDFIcon}</span>
            )}
            Telecharger
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setLoadingButton(false);
              setVisible(false);
            }}
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccuseReceptionMemoire;
