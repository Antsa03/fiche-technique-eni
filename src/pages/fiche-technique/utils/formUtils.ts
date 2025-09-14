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
    setValue("etablissement.sigle_ea", etablissement.sigle);
    setValue("etablissement.raison_sociale", etablissement.raisonSociale);
    setValue("etablissement.email_ea", etablissement.email);
    setValue("etablissement.adresse_ea", etablissement.adressePostale);
    // Les champs suivants seront remplis par l'utilisateur s'il choisit "nouveau"
    setValue("etablissement.contact_ea", "");
    setValue("etablissement.site_web_ea", "");
  }
};

export const fillEncadreurData = (encadreurId: string, setValue: any) => {
  const encadreur = ENCADREURS_EXISTANTS.find((e) => e.id === encadreurId);
  if (encadreur) {
    setValue("encadreur.user.nom", encadreur.nom);
    setValue("encadreur.user.prenoms", encadreur.prenoms);
    setValue("encadreur.user.email", encadreur.email);
    setValue("encadreur.user.contact", encadreur.telephone);
  }
};

export const resetEtablissementFields = (setValue: any) => {
  setValue("etablissement.etablissementExistantId", "");
  setValue("etablissement.sigle_ea", "");
  setValue("etablissement.raison_sociale", "");
  setValue("etablissement.email_ea", "");
  setValue("etablissement.adresse_ea", "");
  setValue("etablissement.contact_ea", "");
  setValue("etablissement.site_web_ea", "");
};

export const resetEncadreurFields = (setValue: any) => {
  setValue("encadreur.encadreurExistantId", "");
  setValue("encadreur.id", "");
  setValue("encadreur.user.nom", "");
  setValue("encadreur.user.prenoms", "");
  setValue("encadreur.user.email", "");
  setValue("encadreur.user.contact", "");
};

export const getFormDefaultValues = (): FormData => ({
  etablissement: {
    type: "existant",
    etablissementExistantId: "",
    sigle_ea: "",
    raison_sociale: "",
    email_ea: "",
    adresse_ea: "",
    contact_ea: "",
    site_web_ea: "",
  },
  encadreur: {
    type: "existant",
    encadreurExistantId: "",
    id: "",
    user: {
      nom: "",
      prenoms: "",
      email: "",
      contact: "",
    },
  },
  stagiaire: {
    niveau: "",
    parcours: "",
    stagiaires: [],
  },
  sujet: {
    theme: "",
    orientation: "",
    objectif: "",
    descriptif: "",
  },
  aspectTechnique: {
    planningPrevisionnel: "",
    moyenLogiciel: "",
    moyenMateriel: "",
  },
});
