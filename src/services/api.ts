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
export const sendPasswordResetCode = async (data: ForgotPasswordFormData) => {
  // TODO: Implémenter l'envoi du code secret par email
  // Pour l'instant, fonction vide comme demandé
  console.log("Envoi du code secret pour:", data.email);
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
  console.log("sigle voar", sigle_ea);

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