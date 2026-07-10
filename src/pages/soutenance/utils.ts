import { AuthService } from "@/services/auth.service";
import type { ApiFile } from "./types";

// Une formation pratique peut regrouper plusieurs stagiaires (donc plusieurs
// inscriptions). Retrouve l'inscription de l'étudiant connecté en comparant
// `etudiant.user.id` à l'utilisateur du token ; à défaut, retombe sur la 1re
// (cas où le backend n'en renvoie déjà qu'une, filtrée serveur).
export const pickInscriptionEtudiant = <
  T extends { etudiant?: { user?: { id?: string } | null } | null }
>(
  inscriptions?: T[] | null
): T | undefined => {
  if (!inscriptions?.length) return undefined;
  const userId = AuthService.getUser()?.id;
  return (
    (userId && inscriptions.find((i) => i.etudiant?.user?.id === userId)) ||
    inscriptions[0]
  );
};

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
