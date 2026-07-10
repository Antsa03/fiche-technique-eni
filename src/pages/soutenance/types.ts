import type { User } from "@/services/auth.service";

// Enseignant = encadreur pédagogique (cf. backend-memo §6). PK: sigle_ens.
export interface Enseignant {
  sigle_ens: string;
  user?: User | null;
  grade?: { code_grade: string; description_grade: string };
  specialite?: { code_specialite: string; description_specialite: string };
}

// FormationPratique : le stage de l'étudiant. On ne type ici que ce dont
// la page soutenance a besoin.
export interface FormationPratique {
  id: string;
  theme: string;
  encadreur_pedagogique?: Enseignant | null;
}

// Tranche horaire (cf. backend-memo §6). PK: code_tranche_horaire.
export interface TrancheHoraire {
  code_tranche_horaire: string;
  libelle_tranche_horaire?: string;
}

// Salle (cf. backend-memo §6). PK: num_salle.
export interface Salle {
  num_salle: string;
  capacite_salle?: string;
  visio_disponible?: boolean;
}

// Une cellule (tranche × salle) du tableau de répartition, vue étudiant.
// Si la salle est prise, on affiche l'occupant (étudiant + jury) en lecture
// seule ; sinon elle est réservable (si l'encadreur est libre sur ce créneau).
export interface SalleDisponibilite {
  num_salle: string;
  capacite_salle?: string;
  disponible: boolean;
  // Détails de la soutenance en place (uniquement si occupée).
  soutenance_id?: string;
  is_own?: boolean; // la soutenance de l'étudiant connecté
  etudiant?: string;
  encadreur?: string;
  rapporteur?: string;
  president?: string;
  examinateur?: string;
}

// Une ligne du tableau : une tranche horaire, la dispo de l'encadreur sur ce
// créneau, et l'état de chaque salle.
export interface TrancheDisponibilite {
  code_tranche_horaire: string;
  libelle_tranche_horaire?: string;
  encadreur_disponible: boolean;
  salles: SalleDisponibilite[];
}

// Créneau choisi par l'étudiant dans la grille : tranche horaire (+ libellé
// lisible) et salle. La date est celle sélectionnée au-dessus de la grille.
export interface CreneauChoisi {
  code_tranche_horaire: string;
  libelle_tranche_horaire?: string;
  num_salle: string;
}

// Rôle d'un membre du jury (cf. backend-memo §6). PK: code_role_jury.
export interface RoleJury {
  code_role_jury: string;
  description_role_jury: string;
}

// Répartition = un membre du jury affecté à une soutenance.
export interface JuryMembre {
  id: string;
  enseignant: Enseignant;
  role_membre_jury: RoleJury;
}

// Une inscription rattachée à une formation pratique (occupant d'une soutenance).
export interface InscriptionSoutenance {
  note_pv?: number | null;
  parcours?: { code_parcours?: string } | null;
  etudiant?: { matricule?: string; user?: User | null } | null;
}

// La formation pratique telle que renvoyée imbriquée dans une soutenance.
export interface FormationPratiqueSoutenance {
  id: string;
  theme?: string;
  encadreur_pedagogique?: Enseignant | null;
  inscriptions?: InscriptionSoutenance[];
}

// Soutenance renvoyée par GET /soutenance (filtré par date ou formation).
// heure_soutenance porte le code de la tranche horaire ; lieu porte la salle.
export interface Soutenance {
  id: string;
  date_soutenance: string;
  heure_soutenance: string | null;
  // Salle : le backend la stocke dans `lieu` (= num_salle), pas dans un objet.
  lieu?: string | null;
  formation_pratique?: FormationPratiqueSoutenance | null;
  membre_jury?: JuryMembre[];
  // Indicateur de PV généré. La forme exacte est à confirmer côté backend ;
  // on teste plusieurs noms de champ possibles dans le composant.
  pv?: { id: string } | null;
  proces_verbal?: { id: string } | null;
  has_pv?: boolean;
}

// Un fichier renvoyé par l'API (cf. FileType du backend-memo).
export interface ApiFile {
  id: string;
  path: string;
}

// Élément d'historique : PV de soutenance de l'étudiant.
export interface PvHistoriqueItem {
  id: string;
  date_pv: string;
  note_pv: number | null;
  file?: ApiFile | null;
  soutenance?: { date_soutenance?: string } | null;
}

// Élément d'historique : mémoire déposé par l'étudiant.
export interface MemoireHistoriqueItem {
  id: string;
  createdAt?: string;
  theme?: string;
  file?: ApiFile | null;
  path?: string;
}

// ----- Affichage du PV de soutenance (document officiel) -----
// Forme de `row` telle que fournie au composant AfficherPVSoutenance
// (cf. spec — données parfois absentes, d'où les optionnels).

interface UserPV {
  nom?: string;
  prenoms?: string;
  titre?: { description_titre?: string };
}
export interface EnseignantPV {
  grade?: { code_grade?: string };
  user?: UserPV;
}
interface MembreJuryPV {
  role_membre_jury?: { code_role_jury?: string };
  enseignant?: EnseignantPV;
}
interface NoteParCriterePV {
  id: string;
  valeur_note_par_critere: number | string;
  bareme?: {
    valeur_bareme?: number | string;
    critere_notation_pv?: {
      description_critere_notation_pv?: string;
      createdAt?: string;
    };
  };
}

export interface PvRow {
  note_pv: number;
  inscription?: {
    code_inscription?: string;
    niveau?: { code_niveau?: string };
    annee_universitaire?: { code_au?: string };
    parcours?: {
      description_parcours?: string;
      mention?: { description_mention?: string };
    };
    etudiant?: { matricule?: string; user?: UserPV };
  };
  soutenance?: {
    date_soutenance?: string;
    nom_rapporteur_externe?: string | null;
    prenoms_rapporteur_externe?: string | null;
    titre_rapporteur_externe?: string | null;
    membre_jury?: MembreJuryPV[];
    formation_pratique?: {
      theme?: string;
      etablissement_accueil?: { raison_sociale?: string; adresse_ea?: string };
      encadreur_pedagogique?: EnseignantPV;
    };
  };
  note_par_critere?: NoteParCriterePV[];
}
