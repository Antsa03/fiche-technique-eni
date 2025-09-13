import type { InscriptionsAPI } from "@/pages/fiche-technique/types/type";

export interface Etudiant {
  matricule: string;
  nom: string;
  prenom: string;
}

export const etudiants: Etudiant[] = [
  {
    matricule: "ETU001",
    nom: "ANDRIAMANANA",
    prenom: "Hery",
  },
  {
    matricule: "ETU002",
    nom: "RASOAMANANA",
    prenom: "Mialy",
  },
  {
    matricule: "ETU003",
    nom: "RAKOTOMALALA",
    prenom: "Jean",
  },
  {
    matricule: "ETU004",
    nom: "RANDRIANARISOA",
    prenom: "Marie",
  },
  {
    matricule: "ETU005",
    nom: "RAZAFY",
    prenom: "Paul",
  },
  {
    matricule: "ETU006",
    nom: "RAHARISON",
    prenom: "Sophie",
  },
  {
    matricule: "ETU007",
    nom: "ANDRIAMAMPIANINA",
    prenom: "Luc",
  },
  {
    matricule: "ETU008",
    nom: "RATSIMBAZAFY",
    prenom: "Anna",
  },
  {
    matricule: "ETU009",
    nom: "RAKOTONDRAZAKA",
    prenom: "Pierre",
  },
  {
    matricule: "ETU010",
    nom: "RAMAROSON",
    prenom: "Claire",
  },
  {
    matricule: "ETU011",
    nom: "RAZANAMAHEFA",
    prenom: "Tsiry",
  },
  {
    matricule: "ETU012",
    nom: "ANDRIANAIVO",
    prenom: "Faly",
  },
  {
    matricule: "ETU013",
    nom: "RAKOTONDRABE",
    prenom: "Naina",
  },
  {
    matricule: "ETU014",
    nom: "RAMANANTSOA",
    prenom: "Aina",
  },
  {
    matricule: "ETU015",
    nom: "RAZAFINDRAKOTO",
    prenom: "Hanta",
  },
  {
    matricule: "ETU016",
    nom: "ANDRIANJAFY",
    prenom: "Volatiana",
  },
  {
    matricule: "ETU017",
    nom: "RABEMANANJARA",
    prenom: "Tahiry",
  },
  {
    matricule: "ETU018",
    nom: "RAKOTONIAINA",
    prenom: "Sitraka",
  },
  {
    matricule: "ETU019",
    nom: "RANDRIANASOLO",
    prenom: "Henintsoa",
  },
  {
    matricule: "ETU020",
    nom: "RAZAFIMANDIMBY",
    prenom: "Mahery",
  },
];

// Fonction utilitaire pour formater le nom complet
export const formatEtudiantName = (etudiant: Etudiant): string => {
  return `${etudiant.nom} ${etudiant.prenom}`;
};

// Fonction utilitaire pour formater avec matricule
export const formatEtudiantWithMatricule = (inscription: InscriptionsAPI): string => {
  return `${inscription.etudiant.matricule} - ${inscription.etudiant.user.nom} ${inscription.etudiant.user.prenoms}`;
};
