import type { ApiFile } from "./types";

// Résout l'URL téléchargeable d'un fichier renvoyé par l'API.
// Les fichiers sont stockés côté backend (./files) ; on préfixe l'origine du
// backend si le path est relatif. TODO(backend): confirmer comment les
// fichiers sont servis (path absolu, /files/..., ou endpoint dédié).
export const resolveFileUrl = (
  file?: ApiFile | null,
  fallbackPath?: string
): string | null => {
  const path = file?.path ?? fallbackPath;
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  let origin = "";
  try {
    origin = new URL(import.meta.env.VITE_API_BASE_URL).origin;
  } catch {
    origin = "";
  }
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
};
