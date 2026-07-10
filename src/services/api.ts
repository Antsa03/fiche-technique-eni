import type { LoginFormData } from "@/schema/login.schema";
import type {
  ForgotPasswordFormData,
  VerifyCodeFormData,
  ChangePasswordFormData,
  ResetPasswordFormData,
} from "@/schema/password.schema";
import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 403) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      return Promise.reject(error);
    }
    if (error.response && error.response.status === 401) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(
          baseURL + "/v1/auth/refresh",
          {},
          {
            headers: { authorization: `Bearer ${refreshToken}` },
          }
        );
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        originalRequest.headers.authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        window.location.href = '/';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials: LoginFormData) => {
  return api.post("/v1/auth/email/login", credentials);
};

// Password Management APIs
export const sendPasswordResetCode = async () => {
  // TODO: Implémenter l'envoi du code secret par email
  // Pour l'instant, fonction vide comme demandé
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

export const verifyResetCode = async (data: VerifyCodeFormData) => {
  // TODO: Implémenter la vérification du code secret
  return api.post("/v1/auth/verify-reset-code", data);
};

export const forgotPassword = async (data: ForgotPasswordFormData) => {
  return api.post("/v1/auth/forgot-password", data);
};

export const resetPassword = async (data: ResetPasswordFormData) => {
  return api.post("/v1/auth/reset-password", data);
};

export const changePassword = async (data: ChangePasswordFormData) => {
  return api.post("/v1/auth/change-password", data);
};

export const getEtablissementAccueil = async (
  limit?: number,
  page?: number,
  sigle_ea?: string
) => {
  let url = "/v1/etablissement-accueils";

  const params = [];
  if (limit) params.push(`limit=${limit}`);
  if (page) params.push(`page=${page}`);
  if (sigle_ea) params.push(`sigle_ea=${sigle_ea}`);

  if (params.length > 0) url += `?${params.join("&")}`;

  return api.get(url);
};
export const getParcours = async (limit?: number, page?: number) => {
  let url = "/v1/parcours";

  const params = [];
  if (limit) params.push(`limit=${limit}`);
  if (page) params.push(`page=${page}`);
  if (params.length > 0) url += `?${params.join("&")}`;

  return api.get(url);
};
export const getSpecialite = async (limit?: number, page?: number) => {
  let url = "/v1/specialites";

  const params = [];
  if (limit) params.push(`limit=${limit}`);
  if (page) params.push(`page=${page}`);
  if (params.length > 0) url += `?${params.join("&")}`;

  return api.get(url);
};
export const getEncadreurPro = async (
  limit?: number,
  page?: number,
  id?: string
) => {
  let url = "/v1/encadreur/professionnel";

  const params = [];
  if (limit) params.push(`limit=${limit}`);
  if (page) params.push(`page=${page}`);
  if (id) params.push(`id=${id}`);
  if (params.length > 0) url += `?${params.join("&")}`;

  return api.get(url);
};
export const getInscriptions = async (
  limit?: number,
  page?: number,
  niveau?: string,
  anne_univ?: string,
  parcours?: string,
  etudiant?: string,
  etat_formation_pratique?: string
) => {
  let url = "/v1/inscriptions";

  const params = [];
  if (limit) params.push(`limit=${limit}`);
  if (page) params.push(`page=${page}`);
  if (parcours) params.push(`parcours=${parcours}`);
  if (niveau) params.push(`niveau=${niveau}`);
  if (anne_univ) params.push(`annee_univ=${anne_univ}`);
  if (etudiant) params.push(`etudiant=${etudiant}`);
  if (etat_formation_pratique)
    params.push(`etat_formation_pratique=${etat_formation_pratique}`);
  if (params.length > 0) url += `?${params.join("&")}`;

  return api.get(url);
};

export const addFicheTechnique = async (data: any) => {
  return api.post('v1/formation/pratiques', data);
};

// Mise à jour de la fiche technique (formation pratique) existante de l'étudiant.
export const updateFicheTechnique = async (id: string, data: any) => {
  return api.patch(`v1/formation/pratiques/${encodeURIComponent(id)}`, data);
};

// ----- Soutenance : sélection de date + dépôt du mémoire -----

// Stage (FormationPratique) de l'étudiant connecté, encadreur_pedagogique inclus.
// Répond 404 si l'étudiant n'a aucune formation pratique.
export const getMyFormationPratique = async () => {
  return api.get("/v1/formation/pratiques/me");
};

// Liste des tranches horaires possibles (pour peupler le select).
export const getTrancheHoraires = async () => {
  return api.get("/v1/tranche-horaires");
};

// Vérifie si un enseignant (encadreur pédagogique) est disponible pour une
// date + tranche horaire données. Répond { disponible: boolean }.
// :id = sigle_ens de l'enseignant. code_tranche_horaire est un alias de heure.
export const checkEnseignantDisponible = async (
  id: string,
  dateSoutenance: string,
  codeTrancheHoraire: string
) => {
  return api.get(`/v1/enseignant/disponible/${encodeURIComponent(id)}`, {
    params: {
      date_soutenance: dateSoutenance,
      code_tranche_horaire: codeTrancheHoraire,
    },
  });
};

// Liste des salles (pour construire la grille des disponibilités).
export const getSalles = async () => {
  return api.get("/v1/salles");
};

// Soutenances déjà posées à une date donnée. Sert à déduire les salles prises
// et les créneaux où l'encadreur est déjà engagé (grille des disponibilités).
// Le backend attend date_soutenance au format ISO (Date.toISOString()) ; si le
// filtre est ignoré, le front refiltre par date côté client.
export const getSoutenancesByDate = async (
  dateSoutenanceISO: string,
  limit = 50
) => {
  return api.get("/v1/soutenance", {
    params: { limit, date_soutenance: dateSoutenanceISO },
  });
};

// Flux étudiant : enregistre la date + tranche + salle choisie. Le backend
// revalide la disponibilité de l'encadreur ET de la salle, crée/rejoue la
// soutenance (tranche dans heure_soutenance, salle rattachée) et crée
// automatiquement le rapporteur du jury (une Repartition dont l'enseignant est
// l'encadreur pédagogique) — cf. backend-soutenance-prompt.md §4.
export const chooseSoutenanceDate = async (data: Record<string, unknown>) => {
  return api.post("/v1/soutenance/choisir-date", data);
};

// Soutenance existante d'une formation pratique (pour afficher/re-choisir,
// afficher le jury, et savoir si un PV a été généré).
export const getSoutenanceByFormation = async (formationPratiqueId: string) => {
  return api.get("/v1/soutenance", {
    params: { formation_pratique: formationPratiqueId },
  });
};

// Historique des PV de soutenance de l'étudiant connecté.
// TODO(backend): endpoint étudiant à créer (/pv est réservé au rôle rsm).
export const getMesPvs = async () => {
  return api.get("/v1/pv/me");
};

// Historique des mémoires déposés par l'étudiant connecté.
// TODO(backend): nécessite de persister les dépôts de mémoire et d'exposer
// cet endpoint (le mémoire n'est pas rattaché au modèle actuellement).
export const getMesMemoires = async () => {
  return api.get("/v1/formation/pratiques/me/memoires");
};

// Dépôt de la version finale du mémoire en PDF (multipart, champ "file").
// Stocké dans ./files ; renvoie { file: { id, path } }. Aucun lien n'est
// persisté sur la formation pratique côté backend.
export const submitMemoire = async (
  formationPratiqueId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(
    `/v1/formation/pratiques/memoire/${encodeURIComponent(formationPratiqueId)}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};