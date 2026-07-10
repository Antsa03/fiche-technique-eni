import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { dateToWords, getLettreNoteTotale } from "../pv-utils";
import type { EnseignantPV, PvRow } from "../types";
import "../pv.css";

// Icône PDF reprise de front-2026 (assets/icon/IconeFile).
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

// Remplace temporairement les variables de thème oklch (Tailwind v4) par des
// rgb sur :root, le temps de la génération PDF (html2canvas ne parse pas oklch).
// Retourne une fonction de restauration.
const OKLCH_VAR_FALLBACKS: Record<string, string> = {
  "--background": "#ffffff",
  "--foreground": "#475569",
  "--card": "#ffffff",
  "--card-foreground": "#164e63",
  "--popover": "#ffffff",
  "--popover-foreground": "#475569",
  "--primary": "#164e63",
  "--primary-foreground": "#ffffff",
  "--secondary": "#10b981",
  "--secondary-foreground": "#ffffff",
  "--muted": "#f8fafc",
  "--muted-foreground": "#64748b",
  "--accent": "#10b981",
  "--accent-foreground": "#ffffff",
  "--destructive": "#e53e3e",
  "--destructive-foreground": "#ffffff",
  "--border": "#d1d5db",
  "--input": "#ffffff",
  "--ring": "#164e63",
  "--chart-1": "#3b82f6",
  "--chart-2": "#10b981",
  "--chart-3": "#eab308",
  "--chart-4": "#ef4444",
  "--chart-5": "#a855f7",
  "--sidebar": "#f8fafc",
  "--sidebar-foreground": "#475569",
  "--sidebar-primary": "#164e63",
  "--sidebar-primary-foreground": "#ffffff",
  "--sidebar-accent": "#10b981",
  "--sidebar-accent-foreground": "#ffffff",
  "--sidebar-border": "#d1d5db",
  "--sidebar-ring": "#10b981",
};

const overrideOklchVars = (): (() => void) => {
  const root = document.documentElement;
  const previous: Record<string, string> = {};
  Object.entries(OKLCH_VAR_FALLBACKS).forEach(([key, value]) => {
    previous[key] = root.style.getPropertyValue(key);
    root.style.setProperty(key, value);
  });
  return () => {
    Object.entries(previous).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value);
      else root.style.removeProperty(key);
    });
  };
};

// Zone de signature (remplace CFormInput disabled de CoreUI).
// Styles inline uniquement : pas de classe Tailwind (couleurs oklch non
// supportées par html2canvas lors de l'export PDF).
const SignatureInput = () => (
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
);

interface AfficherPVSoutenanceProps {
  visible: boolean;
  setVisible: (v: boolean) => void;
  row: PvRow;
}

const AfficherPVSoutenance = ({
  visible,
  setVisible,
  row,
}: AfficherPVSoutenanceProps) => {
  const [textPV, setTextPV] = useState<string | null>(null);
  const [selectedEtudiant, setSelectedEtudiant] = useState(row.inscription);
  const [selectedSoutenance, setSelectedSoutenance] = useState(row.soutenance);
  const [president, setPresident] = useState<EnseignantPV | null>(null);
  const [examinateur, setExaminateur] = useState<EnseignantPV | null>(null);
  const [rapporteur, setRapporteur] = useState<EnseignantPV | null>(null);
  const [loadingButton, setLoadingButton] = useState(false);
  const [criteres, setCriteres] = useState(row.note_par_critere);
  const pdfRef = useRef<HTMLDivElement>(null);

  const paramTextePV = (niveau?: string) => {
    const texts: Record<string, string> = {
      L1: "rapport de projet pour le passage en deuxieme annee de licence professionnelle",
      L2: "rapport de stage pour le passage en troisieme annee de licence professionnelle",
      L3: "memoire en vue de l'obtention de diplome de licence professionnelle",
      M1: "rapport de projet pour le passage en deuxieme annee de master professionnel",
      M2: "memoire en vue de l'obtention de diplome de master professionnel",
    };
    setTextPV((niveau && texts[niveau]) || null);
  };

  useEffect(() => {
    paramTextePV(row.inscription?.niveau?.code_niveau);
    setSelectedEtudiant(row.inscription);
    setSelectedSoutenance(row.soutenance);
    setCriteres(row.note_par_critere);

    setPresident(
      row.soutenance?.membre_jury?.find(
        (m) => m.role_membre_jury?.code_role_jury === "PJ"
      )?.enseignant || null
    );
    setExaminateur(
      row.soutenance?.membre_jury?.find(
        (m) => m.role_membre_jury?.code_role_jury === "EXA"
      )?.enseignant || null
    );
    setRapporteur(
      row.soutenance?.membre_jury?.find(
        (m) => m.role_membre_jury?.code_role_jury === "RAP"
      )?.enseignant || null
    );
  }, [row]);

  const handleDownloadPDF = () => {
    setLoadingButton(true);

    // html2canvas ne sait pas parser oklch (Tailwind v4). On remplace
    // temporairement les variables de thème oklch de :root par des rgb, puis
    // on restaure après génération.
    const restoreVars = overrideOklchVars();

    const options = {
      margin: 10,
      filename: `PV_Soutenance_${row.inscription?.code_inscription || "document"}.pdf`,
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
          Procès-verbal de soutenance
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
                  ANNEE UNIVERSITAIRE:{" "}
                  {selectedEtudiant?.annee_universitaire?.code_au}
                </small>
              </p>
            </div>
          </div>
          <h4 className="titlePV">PROCES VERBAL DE SOUTENANCE</h4>
          <p className="text-center text-uppercase">
            <strong>{textPV}</strong>
          </p>
          <div className="rowPV mt-3">
            <label>Mention:</label>
            <p>
              <small>
                {selectedEtudiant?.parcours?.mention?.description_mention}
              </small>
            </p>
          </div>
          <div className="rowPV mt-2">
            <label>Parcours:</label>
            <p>
              <small>{selectedEtudiant?.parcours?.description_parcours}</small>
            </p>
          </div>
          <div className="rowPV mt-2" style={{ fontSize: "20px" }}>
            <small>
              {(selectedEtudiant?.etudiant?.user?.titre?.description_titre ??
                "") +
                " " +
                (selectedEtudiant?.etudiant?.user?.nom ?? "") +
                " " +
                (selectedEtudiant?.etudiant?.user?.prenoms ?? "")}
            </small>
          </div>
          <div className="rowPV mt-2">
            <label>IM :</label>
            <p>
              <small>{selectedEtudiant?.etudiant?.matricule}</small>
            </p>
          </div>
          <p className="mt-2">
            A soutenu publiquement son {textPV} à l&apos;Ecole Nationale
            d&apos;Informatique de l&apos;Université de Fianarantsoa.
          </p>
          <div className="rowPV">
            <label>Intitulé du mémoire :</label>
            <p>
              <small>
                {selectedSoutenance?.formation_pratique?.theme}
              </small>
            </p>
          </div>
          <div className="rowPV mt-3">
            <label>Lieu :</label>
            <p>
              <small>
                {(selectedSoutenance?.formation_pratique?.etablissement_accueil
                  ?.raison_sociale ?? "") +
                  " " +
                  (selectedSoutenance?.formation_pratique?.etablissement_accueil
                    ?.adresse_ea ?? "")}
              </small>
            </p>
          </div>
          <div className="rowPV mt-3">
            <label>Date de soutenance :</label>
            <p>
              <small>{dateToWords(selectedSoutenance?.date_soutenance)}</small>
            </p>
          </div>
          <div className="rowPV mt-3">
            <label>Encadreur pédagogique :</label>
            <p>
              <small>
                {`${
                  selectedSoutenance?.formation_pratique?.encadreur_pedagogique
                    ?.user?.titre?.description_titre ?? ""
                }
                  ${
                    selectedSoutenance?.formation_pratique
                      ?.encadreur_pedagogique?.user?.nom ?? ""
                  }
                  ${
                    selectedSoutenance?.formation_pratique
                      ?.encadreur_pedagogique?.user?.prenoms ?? ""
                  }
                  (${
                    selectedSoutenance?.formation_pratique
                      ?.encadreur_pedagogique?.grade?.code_grade ?? ""
                  })`.trim()}
              </small>
            </p>
          </div>
          <p className="mt-3">
            Après délibération, le Jury a déclaré les notes suivantes :
          </p>
          {[...(criteres ?? [])]
            .sort((a, b) => {
              const dateA = new Date(
                a?.bareme?.critere_notation_pv?.createdAt || 0
              ).getTime();
              const dateB = new Date(
                b?.bareme?.critere_notation_pv?.createdAt || 0
              ).getTime();
              return dateA - dateB;
            })
            .map((note) => (
              <div
                key={note.id}
                className="rowPV mt-2"
                style={{ marginLeft: "13px" }}
              >
                <p>
                  <small>
                    {note.bareme?.critere_notation_pv
                      ?.description_critere_notation_pv}
                  </small>
                </p>
                <p>
                  <strong>
                    <small>
                      {parseFloat(String(note.valeur_note_par_critere)).toFixed(
                        2
                      )}
                    </small>
                    /<small>{note.bareme?.valeur_bareme}</small>
                  </strong>
                </p>
              </div>
            ))}
          <div className="rowPV mt-3">
            <p>
              <strong>
                <small>NOTE DE SOUTENANCE:</small>
              </strong>
            </p>
            <p style={{ marginLeft: "15px" }}>
              <strong>
                <small className="text-uppercase">
                  {row.note_pv +
                    "/20" +
                    "  " +
                    getLettreNoteTotale(row.note_pv) +
                    " sur vingt"}
                </small>
              </strong>
            </p>
          </div>
          <div className="rowPV mt-2">
            <label>LES MEMBRES DU JURY:</label>
          </div>
          {president ? (
            <div className="rowPV mt-2">
              <label>
                <small className="text-uppercase fw-bold">President:</small>
              </label>
              <p>
                <small>
                  {`${president?.user?.titre?.description_titre}
                    ${president?.user?.nom}
                    ${president?.user?.prenoms || ""}
                    (${president?.grade?.code_grade})`}
                </small>
              </p>
              <div>
                <SignatureInput />
              </div>
            </div>
          ) : (
            ""
          )}
          {examinateur ? (
            <div className="rowPV mt-2">
              <label>
                <small className="text-uppercase fw-bold">Examinateur:</small>
              </label>
              <p>
                <small>
                  {`${examinateur?.user?.titre?.description_titre}
                    ${examinateur?.user?.nom}
                    ${examinateur?.user?.prenoms || ""}
                    (${examinateur?.grade?.code_grade})`}
                </small>
              </p>
              <div>
                <SignatureInput />
              </div>
            </div>
          ) : (
            ""
          )}
          <div className="rowPV mt-2">
            <label>
              <small className="text-uppercase fw-bold">Rapporteur:</small>
            </label>
            <p>
              <small>
                {`${rapporteur?.user?.titre?.description_titre}
                  ${rapporteur?.user?.nom}
                  ${rapporteur?.user?.prenoms || ""}
                  (${rapporteur?.grade?.code_grade})`}
              </small>
            </p>
            <div>
              <SignatureInput />
            </div>
          </div>
          {selectedSoutenance?.nom_rapporteur_externe &&
            selectedSoutenance?.titre_rapporteur_externe && (
              <div className="rowPV mt-2">
                <label>
                  <small className="text-uppercase fw-bold">
                    Rapporteur externe:
                  </small>
                </label>{" "}
                <p>
                  <small>
                    {selectedSoutenance?.titre_rapporteur_externe || ""}{" "}
                    {selectedSoutenance?.nom_rapporteur_externe || ""}{" "}
                    {selectedSoutenance?.prenoms_rapporteur_externe || ""}
                  </small>
                </p>
                <div>
                  <SignatureInput />
                </div>
              </div>
            )}
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

export default AfficherPVSoutenance;
