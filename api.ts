/**
 * ENI Practice — Client API pour le frontend
 * ------------------------------------------------------------------
 * Fichier prêt à copier dans le projet front (ex. `src/lib/api.ts`).
 * Dépendance : `axios`  ->  npm i axios
 *
 * Contient :
 *   - un client axios (baseURL + injection du token + refresh auto sur 401)
 *   - tous les types de réponses/paylods
 *   - les fonctions d'appel groupées par ressource
 *
 * Doc de référence : docs/architecture-backend-pour-frontend.md
 * Source de vérité des champs : http://localhost:8002/practice/api/docs (Swagger)
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

/* ==================================================================
 * 1. Configuration
 * ================================================================== */

export const BASE_URL = 'http://localhost:8002/practice/api/v1';

/** Adapte ces helpers si tu stockes les tokens ailleurs (cookies, store…). */
export const tokenStore = {
  get token() {
    return localStorage.getItem('token');
  },
  set token(v: string | null) {
    v ? localStorage.setItem('token', v) : localStorage.removeItem('token');
  },
  get refreshToken() {
    return localStorage.getItem('refreshToken');
  },
  set refreshToken(v: string | null) {
    v
      ? localStorage.setItem('refreshToken', v)
      : localStorage.removeItem('refreshToken');
  },
  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpires');
  },
};

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/* ---- Injection du token sur chaque requête ---- */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ---- Refresh automatique sur 401 (une seule tentative par requête) ---- */
let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refreshToken = tokenStore.refreshToken;
  if (!refreshToken) return null;
  try {
    // Appel "brut" (sans intercepteur) : le Bearer = le refreshToken.
    const { data } = await axios.post<RefreshResponse>(
      `${BASE_URL}/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } },
    );
    tokenStore.token = data.token;
    tokenStore.refreshToken = data.refreshToken;
    localStorage.setItem('tokenExpires', String(data.tokenExpires));
    return data.token;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const isAuthRoute = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      refreshing = refreshing ?? doRefresh();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

/* ==================================================================
 * 2. Types transverses
 * ================================================================== */

export enum RoleId {
  admin = 1,
  user = 2,
  rsm = 3,
  scolarite = 4,
  encadreur_pro = 5,
  etudiant = 6,
  enseignant = 7,
}

export enum StatusId {
  active = 1,
  inactive = 2,
}

export interface Paginated<T> {
  data: T[];
  hasNextPage: boolean;
}

export interface PaginationQuery {
  page?: number; // défaut 1
  limit?: number; // défaut 10, max 50
}

/** Erreur de validation renvoyée par le backend (HTTP 422). */
export interface ApiValidationError {
  status: number;
  errors: Record<string, string>; // { champ: "cleDErreur" } -> à traduire
}

export interface Role {
  id: number;
  name?: string;
}
export interface Status {
  id: number;
  name?: string;
}
export interface FileType {
  id: string;
  path: string;
}

/* ==================================================================
 * 3. Types métier (réponses `domain`)
 * ================================================================== */

export interface User {
  id: string;
  email: string | null;
  provider: string;
  socialId?: string | null;
  nom: string | null;
  prenoms: string | null;
  contact: string | null;
  titre?: Titre;
  photo?: FileType | null;
  role?: Role | null;
  status?: Status;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Etudiant {
  matricule: string; // PK
  user?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface Enseignant {
  sigle_ens: string; // PK
  user?: User | null;
  statut_ens: StatutEnseignant;
  grade: Grade;
  specialite: Specialite;
  createdAt: string;
  updatedAt: string;
}

export interface StatutEnseignant {
  code_statut: string; // PK
  description_statut: string;
  createdAt: string;
  updatedAt: string;
}
export interface Grade {
  code_grade: string; // PK
  description_grade: string;
  createdAt: string;
  updatedAt: string;
}
export interface Specialite {
  code_specialite: string; // PK
  description_specialite: string;
  createdAt: string;
  updatedAt: string;
}
export interface Titre {
  code_titre: string; // PK
  description_titre: string;
  createdAt: string;
  updatedAt: string;
}
export interface Maitrise {
  id: string; // PK (UUID)
  specialite: Specialite;
  enseignant: Enseignant;
  createdAt: string;
  updatedAt: string;
}

export interface AnneeUniversitaire {
  code_au: string; // PK
  createdAt: string;
  updatedAt: string;
}
export interface Niveau {
  code_niveau: string; // PK
  description_niveau?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Mention {
  code_mention: string; // PK
  description_mention: string;
  createdAt: string;
  updatedAt: string;
}
export interface Parcours {
  code_parcours: string; // PK
  description_parcours: string;
  mention: Mention;
  createdAt: string;
  updatedAt: string;
}

export interface Inscription {
  code_inscription: string; // PK
  etudiant: Etudiant;
  niveau: Niveau;
  parcours: Parcours;
  annee_universitaire: AnneeUniversitaire;
  formation_pratique: FormationPratique | null;
  visa_financier: boolean;
  visa_pedagogique: boolean;
  autorisation_stage: boolean;
  note_pratique: number | null;
  note_grille_evaluation: number | null;
  note_pv: number | null;
  evaluations: Evaluation[];
  createdAt: string;
  updatedAt: string;
}

export interface EtablissementAccueil {
  sigle_ea: string; // PK
  raison_sociale: string;
  responsable_ea: string;
  contact_ea: string;
  email_ea?: string;
  adresse_ea?: string;
  site_web_ea?: string;
  encadreur_professionnels: EncadreurProfessionnel[];
  createdAt: string;
  updatedAt: string;
}
export interface EncadreurProfessionnel {
  id: string; // PK (UUID)
  user?: User | null;
  etablissement_accueils: EtablissementAccueil[];
  createdAt: string;
  updatedAt: string;
}
export interface StatutStage {
  code_statut: string; // PK
  description_statut: string;
  createdAt: string;
  updatedAt: string;
}
export interface EtatStage {
  id: string; // PK (UUID)
  statut_stage: StatutStage;
  formation_pratique: FormationPratique;
  createdAt: string;
  updatedAt: string;
}
export interface FormationPratique {
  id: string; // PK (UUID)
  theme: string;
  descriptif: string;
  objectif: string;
  moyen_logiciel: string;
  moyen_materiel: string;
  nombre_stagiaire: string;
  est_rapporte: boolean;
  autorisation_soutenance: boolean;
  planning_previsionnel: string;
  debut: string;
  etat: StatutStage;
  specialite: Specialite;
  etablissement_accueil: EtablissementAccueil;
  encadreur_pedagogique?: Enseignant | null;
  encadreur_professionnel: EncadreurProfessionnel;
  inscriptions: Inscription[];
  createdAt: string;
  updatedAt: string;
}

export interface Rubrique {
  code_rubrique: string; // PK
  description_rubrique: string;
  criteres: Critere[];
  createdAt: string;
  updatedAt: string;
}
export interface Critere {
  code_critere: string; // PK
  description_critere: string;
  rubrique: Rubrique;
  points: Point[];
  createdAt: string;
  updatedAt: string;
}
export interface Valeur {
  code_valeur: string; // PK
  description_valeur: string;
  createdAt: string;
  updatedAt: string;
}
export interface Point {
  id: string; // PK (UUID)
  critere: Critere;
  valeur: Valeur;
  annee_universitaire: AnneeUniversitaire;
  valeur_point: number;
  createdAt: string;
  updatedAt: string;
}
export interface Evaluation {
  id: string; // PK (UUID)
  inscription: Inscription;
  critere: Critere;
  valeur: Valeur;
  createdAt: string;
  updatedAt: string;
}
export interface CritereNotationPV {
  code_critere_notation_pv: string; // PK
  description_critere_notation_pv: string;
  createdAt: string;
  updatedAt: string;
}
export interface Bareme {
  id: string; // PK (UUID)
  niveau: Niveau;
  critere_notation_pv: CritereNotationPV;
  annee_universitaire: AnneeUniversitaire;
  valeur_bareme: number;
  createdAt: string;
  updatedAt: string;
}
export interface NoteParCritere {
  id: string; // PK (UUID)
  pv_soutenance: ProcesVerbalSoutenance;
  bareme?: Bareme;
  valeur_note_par_critere: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleJury {
  code_role_jury: string; // PK
  description_role_jury: string;
  createdAt: string;
  updatedAt: string;
}
export interface Salle {
  num_salle: string; // PK
  capacite_salle: string;
  visio_disponible: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface TrancheHoraire {
  code_tranche_horaire: string; // PK
  createdAt: string;
  updatedAt: string;
}
export interface Repartition {
  id: string; // PK (UUID)
  soutenance: Soutenance;
  enseignant: Enseignant;
  role_membre_jury: RoleJury;
  createdAt: string;
  updatedAt: string;
}
export interface Soutenance {
  id: string; // PK (UUID)
  formation_pratique: FormationPratique;
  date_soutenance: string;
  heure_soutenance: string | null;
  lieu: string | null;
  nom_rapporteur_externe: string | null;
  prenoms_rapporteur_externe: string | null;
  titre_rapporteur_externe: string | null;
  membre_jury: Repartition[];
  createdAt: string;
  updatedAt: string;
}
export interface ProcesVerbalSoutenance {
  id: string; // PK (UUID)
  note_pv: number;
  date_pv: string;
  soutenance: Soutenance;
  inscription: Inscription;
  note_par_critere: NoteParCritere[];
  createdAt: string;
  updatedAt: string;
}

/* ==================================================================
 * 4. Authentification
 * ================================================================== */

export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: User;
}
export interface RefreshResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
}

export interface RegisterPayload {
  email: string;
  password: string; // min 6
  nom: string;
  prenoms: string;
  contact: string;
}

export const auth = {
  async login(email: string, password: string) {
    const { data } = await api.post<LoginResponse>('/auth/email/login', {
      email,
      password,
    });
    tokenStore.token = data.token;
    tokenStore.refreshToken = data.refreshToken;
    localStorage.setItem('tokenExpires', String(data.tokenExpires));
    return data;
  },

  register: (payload: RegisterPayload) =>
    api.post<void>('/auth/email/register', payload).then((r) => r.data),

  confirmEmail: (hash: string) =>
    api.post<void>('/auth/email/confirm', { hash }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post<void>('/auth/forgot/password', { email }).then((r) => r.data),

  resetPassword: (password: string, hash: string) =>
    api
      .post<void>('/auth/reset/password', { password, hash })
      .then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),

  updateMe: (payload: Partial<User>) =>
    api.patch<User>('/auth/me', payload).then((r) => r.data),

  async logout() {
    try {
      await api.post<void>('/auth/logout');
    } finally {
      tokenStore.clear();
      localStorage.removeItem('tokenExpires');
    }
  },

  loginWithGoogle: (idToken: string) =>
    api
      .post<LoginResponse>('/auth/google/login', { idToken })
      .then((r) => r.data),

  isAuthenticated: () => Boolean(tokenStore.token),
};

/* ==================================================================
 * 5. Fabrique CRUD générique
 * ================================================================== */

/**
 * Génère les 5 opérations CRUD d'une ressource.
 * @param path  chemin de base (ex. 'etudiant', 'annee/universitaire')
 *
 * Rappel : pour lier une relation, on envoie un objet avec sa clé primaire.
 *   ex. { niveau: { code_niveau: 'M2' }, etudiant: { matricule: '123' } }
 */
function crud<TEntity, TCreate = Partial<TEntity>, TUpdate = Partial<TCreate>>(
  path: string,
) {
  return {
    list: (query: PaginationQuery = {}) =>
      api
        .get<Paginated<TEntity>>(`/${path}`, { params: query })
        .then((r) => r.data),

    get: (id: string) =>
      api.get<TEntity>(`/${path}/${id}`).then((r) => r.data),

    create: (payload: TCreate) =>
      api.post<TEntity>(`/${path}`, payload).then((r) => r.data),

    update: (id: string, payload: TUpdate) =>
      api.patch<TEntity>(`/${path}/${id}`, payload).then((r) => r.data),

    remove: (id: string) =>
      api.delete<void>(`/${path}/${id}`).then((r) => r.data),
  };
}

/** Upload multipart (import Excel, fichiers…) : `POST /<path>` avec un champ `file`. */
function uploadFile<T = unknown>(path: string, file: File, field = 'file') {
  const form = new FormData();
  form.append(field, file);
  return api
    .post<T>(`/${path}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
}

/* ==================================================================
 * 6. Ressources
 * ================================================================== */

/* ---- Personnes / scolarité ---- */
export const etudiants = {
  ...crud<Etudiant>('etudiant'),
  importExcel: (file: File) => uploadFile('etudiant/upload/data', file),
};

export const enseignants = {
  ...crud<Enseignant>('enseignant'),
  disponibles: (query: PaginationQuery = {}) =>
    api
      .get<Paginated<Enseignant>>('/enseignant/disponible', { params: query })
      .then((r) => r.data),
  disponible: (id: string) =>
    api.get<Enseignant>(`/enseignant/disponible/${id}`).then((r) => r.data),
  statistiques: () =>
    api.get('/enseignant/statistique').then((r) => r.data),
  importExcel: (file: File) => uploadFile('enseignant/upload/data', file),
};

export const statutEnseignants = crud<StatutEnseignant>('statut/enseignant');
export const grades = crud<Grade>('grade');
export const specialites = crud<Specialite>('specialites');
export const maitrises = crud<Maitrise>('maitrise');
export const titres = crud<Titre>('titres');
export const users = crud<User>('users'); // admin only

/* ---- Cursus ---- */
export const anneeUniversitaires =
  crud<AnneeUniversitaire>('annee/universitaire');
export const niveaux = crud<Niveau>('niveau');
export const mentions = crud<Mention>('mentions');
export const parcours = crud<Parcours>('parcours');

export const inscriptions = {
  ...crud<Inscription>('inscriptions'),
  autoriserASoutenir: (payload: unknown) =>
    api
      .post<Inscription>('/inscriptions/autoriser-a-soutenir', payload)
      .then((r) => r.data),
  statistiques: () =>
    api.get('/inscriptions/statistique').then((r) => r.data),
};

/* ---- Stage ---- */
export const etablissementAccueils = {
  ...crud<EtablissementAccueil>('etablissement-accueils'),
  importExcel: (file: File) =>
    uploadFile('etablissement-accueils/upload/data', file),
  affecterEncadreurPro: (id: string, payload: unknown) =>
    api
      .patch<EtablissementAccueil>(
        `/etablissement-accueils/affect/encadreur-pro/${id}`,
        payload,
      )
      .then((r) => r.data),
};

export const encadreurProfessionnels = crud<EncadreurProfessionnel>(
  'encadreur/professionnel',
);
export const statutStages = crud<StatutStage>('statut-stages');
export const etatStages = crud<EtatStage>('etat-stages');

export const formationPratiques = {
  ...crud<FormationPratique>('formation/pratiques'),
  importExcel: (file: File) =>
    uploadFile('formation/pratiques/upload/data', file),
  rapporter: (payload: unknown) =>
    api
      .post<FormationPratique>('/formation/pratiques/rapporter', payload)
      .then((r) => r.data),
  affecterEncadreurPedagogique: (payload: unknown) =>
    api
      .post<FormationPratique>(
        '/formation/pratiques/affect/encadreur-pedagogique',
        payload,
      )
      .then((r) => r.data),
};

export const repartitions = crud<Repartition>('repartitions');

/* ---- Évaluation ---- */
export const rubriques = crud<Rubrique>('rubriques');
export const criteres = crud<Critere>('criteres');
export const valeurs = crud<Valeur>('valeurs');
export const points = crud<Point>('points');
export const baremes = crud<Bareme>('baremes');
export const evaluations = crud<Evaluation>('evaluations'); // rôle rsm
export const noteParCriteres = crud<NoteParCritere>('note/par-critere');

/* ---- Soutenance ---- */
export const soutenances = crud<Soutenance>('soutenance');
export const procesVerbalSoutenances =
  crud<ProcesVerbalSoutenance>('pv'); // rôle rsm
export const critereNotationPVs =
  crud<CritereNotationPV>('critere-notation-p-vs');
export const roleJuries = crud<RoleJury>('role-juries');
export const salles = crud<Salle>('salles');
export const trancheHoraires = crud<TrancheHoraire>('tranche-horaires');

/* ---- Fichiers ---- */
export const files = {
  upload: (file: File) => uploadFile<{ file: FileType }>('files/upload', file),
};

/* ==================================================================
 * 7. Helper d'extraction d'erreur (facultatif)
 * ================================================================== */

/** Retourne le map d'erreurs de validation d'une erreur axios, ou null. */
export function getValidationErrors(
  error: unknown,
): Record<string, string> | null {
  const err = error as AxiosError<ApiValidationError>;
  if (err?.response?.status === 422 && err.response.data?.errors) {
    return err.response.data.errors;
  }
  return null;
}
