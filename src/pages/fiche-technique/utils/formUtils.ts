import { ETABLISSEMENTS_EXISTANTS } from "@/data/etablissement.data";
import { ENCADREURS_EXISTANTS } from "@/data/encadreur-pro.data";
import type { FormData } from "../types/form.types";

export const fillEtablissementData = (
  etablissementId: string,
  setValue: any
) => {
  const etablissement = ETABLISSEMENTS_EXISTANTS.find(
    (e) => e.id === etablissementId
  );
  if (etablissement) {
    setValue("etablissement.sigle", etablissement.sigle);
    setValue("etablissement.raisonSociale", etablissement.raisonSociale);
    setValue("etablissement.email", etablissement.email);
    setValue("etablissement.adressePostale", etablissement.adressePostale);
  }
};

export const fillEncadreurData = (encadreurId: string, setValue: any) => {
  const encadreur = ENCADREURS_EXISTANTS.find((e) => e.id === encadreurId);
  if (encadreur) {
    setValue("encadreur.nom", encadreur.nom);
    setValue("encadreur.prenoms", encadreur.prenoms);
    setValue("encadreur.email", encadreur.email);
    setValue("encadreur.telephone", encadreur.telephone);
  }
};

export const resetEtablissementFields = (setValue: any) => {
  setValue("etablissement.etablissementExistantId", "");
  setValue("etablissement.sigle", "");
  setValue("etablissement.raisonSociale", "");
  setValue("etablissement.email", "");
  setValue("etablissement.adressePostale", "");
};

export const resetEncadreurFields = (setValue: any) => {
  setValue("encadreur.encadreurExistantId", "");
  setValue("encadreur.nom", "");
  setValue("encadreur.prenoms", "");
  setValue("encadreur.email", "");
  setValue("encadreur.telephone", "");
};

export const getFormDefaultValues = (): FormData => ({
  etablissement: {
    type: "nouveau",
    etablissementExistantId: "",
    sigle: "",
    raisonSociale: "",
    email: "",
    adressePostale: "",
  },
  encadreur: {
    type: "nouveau",
    encadreurExistantId: "",
    nom: "",
    prenoms: "",
    email: "",
    telephone: "",
  },
  stagiaire: { niveau: "", parcours: "", stagiaires: [] },
  sujet: { theme: "", objectif: "", descriptif: "" },
  aspectTechnique: {
    planningPrevisionnel: "",
    moyenLogiciel: "",
    moyenMateriel: "",
  },
});
