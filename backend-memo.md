# Contexte Backend pour le développement Frontend

> Document de référence à donner à un assistant IA (ou à lire) pour **développer le frontend ENI Practice**.
> Il contient : la config de connexion, l'auth, les conventions d'API, la **liste complète des endpoints**, les **types TypeScript** des réponses et des payloads, et le **modèle relationnel**.
>
> ⚠️ En cas de doute sur un champ, **Swagger fait foi** : `http://localhost:8002/practice/api/docs`.

---

## 1. Configuration de connexion

```
Base URL     : http://localhost:8002/practice/api/v1
Backend      : http://localhost:8002        (BACKEND_DOMAIN / APP_PORT=8002)
Préfixe API  : practice/api                 (API_PREFIX)
Versioning   : v1                           (par URI)
Frontend     : http://localhost:4002        (FRONTEND_DOMAIN — CORS déjà autorisé)
Swagger      : http://localhost:8002/practice/api/docs
```

**Toute route** ci-dessous est relative à la Base URL. Ex : le path `etudiant` → `GET http://localhost:8002/practice/api/v1/etudiant`.

### Client HTTP recommandé (axios)

```ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8002/practice/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Injecte le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 2. Authentification (JWT)

Presque **toutes** les routes exigent un header `Authorization: Bearer <token>`.

### Endpoints

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| `POST` | `/auth/email/login` | `{ email, password }` | `LoginResponse` |
| `POST` | `/auth/email/register` | `{ email, password, nom, prenoms, contact }` | `204` |
| `POST` | `/auth/email/confirm` | `{ hash }` | `204` |
| `POST` | `/auth/forgot/password` | `{ email }` | `204` |
| `POST` | `/auth/reset/password` | `{ password, hash }` | `204` |
| `GET`  | `/auth/me` | — | `User` |
| `PATCH`| `/auth/me` | `Partial<User>` | `User` |
| `POST` | `/auth/refresh` | — *(Bearer = refreshToken)* | `{ token, refreshToken, tokenExpires }` |
| `POST` | `/auth/logout` | — | `204` |
| `DELETE`| `/auth/me` | — | `204` |
| `POST` | `/auth/google/login` | `{ idToken }` | `LoginResponse` |
| `POST` | `/auth/apple/login` | `{ ... }` | `LoginResponse` |
| `POST` | `/auth/twitter/login` | `{ ... }` | `LoginResponse` |

### Réponse de login

```ts
interface LoginResponse {
  token: string;          // JWT d'accès → header Authorization
  refreshToken: string;   // sert à /auth/refresh
  tokenExpires: number;   // timestamp (ms) d'expiration du token
  user: User;
}
```

### Cycle de vie du token (à implémenter côté front)

1. `login` → stocker `token`, `refreshToken`, `tokenExpires`.
2. Envoyer `Authorization: Bearer <token>` partout.
3. Sur `401` **ou** si `Date.now() >= tokenExpires` → `POST /auth/refresh` avec `Authorization: Bearer <refreshToken>` → récupérer un nouveau `token`, puis rejouer la requête.
4. `logout` invalide la session côté serveur.

---

## 3. Rôles

`RoleEnum` (le champ `user.role.id` porte ces valeurs numériques) :

```ts
enum Role {
  admin = 1,
  user = 2,
  rsm = 3,          // Responsable Suivi Mémoire
  scolarite = 4,
  encadreur_pro = 5,
  etudiant = 6,
  enseignant = 7,
}
```

Restrictions connues (guard de rôles côté back → sinon `403`) :
- **`/users/**`** → réservé à `admin`.
- **`/evaluations/**`** et **`/pv/**`** → réservé à `rsm`.

`StatusEnum` (`user.status.id`) : `active = 1`, `inactive = 2`.

---

## 4. Conventions d'API (IMPORTANT pour le front)

### 4.1 CRUD standard

Chaque ressource expose typiquement :

| Action | Méthode & route |
|---|---|
| Créer | `POST /<ressource>` — corps = `Create…Dto` |
| Lister (paginé) | `GET /<ressource>?page=1&limit=10` |
| Détail | `GET /<ressource>/:id` |
| Modifier | `PATCH /<ressource>/:id` — corps = `Partial<Create…Dto>` |
| Supprimer | `DELETE /<ressource>/:id` |

### 4.2 Pagination (« infinity pagination »)

Requête : `?page=<n>&limit=<n>` (`limit` défaut 10, **max 50**).
Réponse d'une liste :

```ts
interface Paginated<T> {
  data: T[];
  hasNextPage: boolean;   // pas de "total" → idéal scroll infini
}
```

### 4.3 Les relations se passent en **objets imbriqués**, pas en foreign keys plates

Pour lier une entité liée, on envoie un **objet contenant sa clé primaire**, pas juste l'id.

```jsonc
// ✅ Créer une inscription → on référence les entités liées par leur PK
POST /inscriptions
{
  "code_inscription": "INS-2026-001",
  "etudiant":            { "matricule": "12345" },
  "niveau":              { "code_niveau": "M2" },
  "parcours":            { "code_parcours": "GB" },
  "annee_universitaire": { "code_au": "2025-2026" }
}
```

> Voir §7 pour la **clé primaire de chaque entité** (certaines sont un code métier, d'autres un `id` UUID).

### 4.4 Ce que renvoie l'API

Les objets JSON suivent les classes `domain/` (voir §6), **pas** les tables SQL. Notamment le `password` de l'utilisateur n'est **jamais** exposé.

### 4.5 Format des erreurs

| Statut | Sens | À faire côté front |
|---|---|---|
| `401` | token absent/expiré/invalide | refresh puis rejouer, sinon rediriger login |
| `403` | rôle insuffisant | masquer/bloquer l'action |
| `404` | ressource inexistante | message "introuvable" |
| `422` | validation métier | afficher les erreurs champ par champ |

Corps d'une erreur `422` :

```jsonc
{
  "status": 422,
  "errors": {
    "email": "emailAlreadyExists",     // clés → à traduire côté front
    "matricule": "maticuleAlreadyExists"
  }
}
```

### 4.6 Uploads (`multipart/form-data`)

Certaines routes attendent un fichier (champ `file`) :
- `POST /files/upload` — upload générique → renvoie un objet fichier `{ file: { id, path } }`.
- Import Excel par module : `POST /etudiant/upload/data`, `/enseignant/upload/data`, `/etablissement-accueils/upload/data`, `/formation/pratiques/upload/data`.

---

## 5. Table complète des endpoints métier

> Toutes ces routes sont protégées par JWT. `:id` = clé primaire (voir §7).
> Sauf mention, chaque ressource offre le CRUD complet (`POST` / `GET` / `GET/:id` / `PATCH/:id` / `DELETE/:id`).

| Ressource (métier) | Path de base | Routes spéciales en plus du CRUD |
|---|---|---|
| Étudiants | `/etudiant` | `POST /etudiant/upload/data` (import Excel) |
| Enseignants | `/enseignant` | `GET /enseignant/disponible`, `GET /enseignant/disponible/:id`, `GET /enseignant/statistique`, `POST /enseignant/upload/data` |
| Statut enseignant | `/statut/enseignant` | — |
| Grades | `/grade` | — |
| Spécialités | `/specialites` | — |
| Maîtrises (ens.⇄spécialité) | `/maitrise` | — |
| Titres | `/titres` | — |
| Utilisateurs (admin) | `/users` | — |
| **Scolarité / cursus** | | |
| Années universitaires | `/annee/universitaire` | — |
| Niveaux | `/niveau` | — |
| Mentions | `/mentions` | — |
| Parcours | `/parcours` | — |
| Inscriptions | `/inscriptions` | `POST /inscriptions/autoriser-a-soutenir`, `GET /inscriptions/statistique` |
| **Stage** | | |
| Établissements d'accueil | `/etablissement-accueils` | `POST /etablissement-accueils/upload/data`, `PATCH /etablissement-accueils/affect/encadreur-pro/:id` |
| Encadreurs professionnels | `/encadreur/professionnel` | — |
| Statut de stage | `/statut-stages` | — |
| État de stage | `/etat-stages` | — |
| Formations pratiques (le stage) | `/formation/pratiques` | `POST /formation/pratiques/upload/data`, `POST /formation/pratiques/rapporter`, `POST /formation/pratiques/affect/encadreur-pedagogique` |
| Répartitions (jury) | `/repartitions` | — |
| **Évaluation** | | |
| Rubriques | `/rubriques` | — |
| Critères | `/criteres` | — |
| Valeurs | `/valeurs` | — |
| Points | `/points` | — |
| Barèmes | `/baremes` | — |
| Évaluations *(rôle rsm)* | `/evaluations` | — |
| Note par critère | `/note/par-critere` | — |
| **Soutenance** | | |
| Soutenances | `/soutenance` | — |
| PV de soutenance *(rôle rsm)* | `/pv` | — |
| Critère notation PV | `/critere-notation-p-vs` | — |
| Rôles jury | `/role-juries` | — |
| Salles | `/salles` | — |
| Tranches horaires | `/tranche-horaires` | — |

---

## 6. Types TypeScript des réponses (`domain`)

> À copier dans le front (ex. `src/types/api.ts`). Champs `createdAt` / `updatedAt` en ISO string (`Date`).
> Les relations sont renvoyées **imbriquées** (objet complet), pas juste leur id.

```ts
// ---------- Transverse ----------
interface Role   { id: number; name?: string }
interface Status { id: number; name?: string }
interface FileType { id: string; path: string }

interface User {
  id: string;
  email: string | null;
  provider: string;              // 'email' | 'google' | ...
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

// ---------- Scolarité / personnes ----------
interface Etudiant {
  matricule: string;             // ⚠️ PK
  user?: User | null;
  createdAt: string; updatedAt: string;
}

interface Enseignant {
  sigle_ens: string;             // ⚠️ PK
  user?: User | null;
  statut_ens: StatutEnseignant;
  grade: Grade;
  specialite: Specialite;
  createdAt: string; updatedAt: string;
}

interface StatutEnseignant { code_statut: string; description_statut: string; createdAt: string; updatedAt: string } // PK: code_statut
interface Grade            { code_grade: string;  description_grade: string;  createdAt: string; updatedAt: string } // PK: code_grade
interface Specialite       { code_specialite: string; description_specialite: string; createdAt: string; updatedAt: string } // PK: code_specialite
interface Titre            { code_titre: string; description_titre: string; createdAt: string; updatedAt: string } // PK: code_titre
interface Maitrise         { id: string; specialite: Specialite; enseignant: Enseignant; createdAt: string; updatedAt: string }

// ---------- Cursus ----------
interface AnneeUniversitaire { code_au: string; createdAt: string; updatedAt: string } // PK: code_au
interface Niveau   { code_niveau: string; description_niveau?: string; createdAt: string; updatedAt: string } // PK: code_niveau
interface Mention  { code_mention: string; description_mention: string; createdAt: string; updatedAt: string } // PK: code_mention
interface Parcours { code_parcours: string; description_parcours: string; mention: Mention; createdAt: string; updatedAt: string } // PK: code_parcours

interface Inscription {
  code_inscription: string;      // ⚠️ PK
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
  createdAt: string; updatedAt: string;
}

// ---------- Stage ----------
interface EtablissementAccueil {
  sigle_ea: string;              // ⚠️ PK
  raison_sociale: string;
  responsable_ea: string;
  contact_ea: string;
  email_ea?: string;
  adresse_ea?: string;
  site_web_ea?: string;
  encadreur_professionnels: EncadreurProfessionnel[];
  createdAt: string; updatedAt: string;
}
interface EncadreurProfessionnel {
  id: string;                    // ⚠️ PK (UUID)
  user?: User | null;
  etablissement_accueils: EtablissementAccueil[];
  createdAt: string; updatedAt: string;
}
interface StatutStage { code_statut: string; description_statut: string; createdAt: string; updatedAt: string } // PK: code_statut
interface EtatStage   { id: string; statut_stage: StatutStage; formation_pratique: FormationPratique; createdAt: string; updatedAt: string }

interface FormationPratique {
  id: string;                    // ⚠️ PK (UUID)
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
  createdAt: string; updatedAt: string;
}

// ---------- Évaluation ----------
interface Rubrique { code_rubrique: string; description_rubrique: string; criteres: Critere[]; createdAt: string; updatedAt: string } // PK: code_rubrique
interface Critere  { code_critere: string; description_critere: string; rubrique: Rubrique; points: Point[]; createdAt: string; updatedAt: string } // PK: code_critere
interface Valeur   { code_valeur: string; description_valeur: string; createdAt: string; updatedAt: string } // PK: code_valeur
interface Point    { id: string; critere: Critere; valeur: Valeur; annee_universitaire: AnneeUniversitaire; valeur_point: number; createdAt: string; updatedAt: string }
interface Evaluation { id: string; inscription: Inscription; critere: Critere; valeur: Valeur; createdAt: string; updatedAt: string }
interface CritereNotationPV { code_critere_notation_pv: string; description_critere_notation_pv: string; createdAt: string; updatedAt: string } // PK: code_critere_notation_pv
interface Bareme {
  id: string;
  niveau: Niveau;
  critere_notation_pv: CritereNotationPV;
  annee_universitaire: AnneeUniversitaire;
  valeur_bareme: number;
  createdAt: string; updatedAt: string;
}
interface NoteParCritere { id: string; pv_soutenance: ProcesVerbalSoutenance; bareme?: Bareme; valeur_note_par_critere: number; createdAt: string; updatedAt: string }

// ---------- Soutenance ----------
interface RoleJury { code_role_jury: string; description_role_jury: string; createdAt: string; updatedAt: string } // PK: code_role_jury
interface Salle    { num_salle: string; capacite_salle: string; visio_disponible: boolean; createdAt: string; updatedAt: string } // PK: num_salle
interface TrancheHoraire { code_tranche_horaire: string; createdAt: string; updatedAt: string } // PK: code_tranche_horaire
interface Repartition { id: string; soutenance: Soutenance; enseignant: Enseignant; role_membre_jury: RoleJury; createdAt: string; updatedAt: string }
interface Soutenance {
  id: string;                    // ⚠️ PK (UUID)
  formation_pratique: FormationPratique;
  date_soutenance: string;
  heure_soutenance: string | null;
  lieu: string | null;
  nom_rapporteur_externe: string | null;
  prenoms_rapporteur_externe: string | null;
  titre_rapporteur_externe: string | null;
  membre_jury: Repartition[];
  createdAt: string; updatedAt: string;
}
interface ProcesVerbalSoutenance {
  id: string;                    // ⚠️ PK (UUID)
  note_pv: number;
  date_pv: string;
  soutenance: Soutenance;
  inscription: Inscription;
  note_par_critere: NoteParCritere[];
  createdAt: string; updatedAt: string;
}
```

---

## 7. Clé primaire (`:id`) par ressource

Le paramètre `:id` des routes `GET/PATCH/DELETE /<ressource>/:id` correspond à :

| Ressource | Clé | Exemple |
|---|---|---|
| Étudiant | `matricule` | `/etudiant/12345` |
| Enseignant | `sigle_ens` | `/enseignant/RAF` |
| Établissement accueil | `sigle_ea` | `/etablissement-accueils/ACME` |
| Encadreur pro, Formation pratique, Soutenance, PV, Barème, Point, Évaluation, Maîtrise, Répartition, État stage, Note par critère | `id` (UUID) | `/soutenance/8f3c…` |
| Année univ. | `code_au` | `/annee/universitaire/2025-2026` |
| Niveau | `code_niveau` | `/niveau/M2` |
| Mention | `code_mention` | |
| Parcours | `code_parcours` | |
| Inscription | `code_inscription` | |
| Grade / Statut ens. / Statut stage | `code_*` | |
| Spécialité / Titre / Rubrique / Critère / Valeur | `code_*` | |
| Rôle jury | `code_role_jury` | |
| Salle | `num_salle` | |
| Critère notation PV | `code_critere_notation_pv` | |

---

## 8. Modèle relationnel (résumé)

```
User ──1:1── Etudiant                 (matricule)
User ──1:1── Enseignant ──*── Maitrise ──*── Specialite
User ──1:1── EncadreurProfessionnel ──*:*── EtablissementAccueil

Etudiant ──*── Inscription ──*── AnneeUniversitaire
                   │  └── Niveau
                   │  └── Parcours ──*:1── Mention
                   └──*:1── FormationPratique
                                │
FormationPratique ──*:1── EtablissementAccueil
                   ├──*:1── EncadreurProfessionnel
                   ├──*:1── Enseignant (encadreur pédagogique)
                   ├──*:1── Specialite
                   └── etat : StatutStage

Inscription ──*── Evaluation ──1── Critere ──*:1── Rubrique
                     └── Valeur
Critere ──*── Point ──1── Valeur, AnneeUniversitaire

Soutenance ──1── FormationPratique
           └──*── Repartition ──1── Enseignant, RoleJury
ProcesVerbalSoutenance ──1── Soutenance, Inscription
                        └──*── NoteParCritere ──1── Bareme
Bareme ──1── Niveau, CritereNotationPV, AnneeUniversitaire
```

**Flux métier global** : un `Etudiant` prend une `Inscription` (année/niveau/parcours) → se voit rattaché à une `FormationPratique` (le stage, dans un `EtablissementAccueil`, avec encadreurs pro + pédagogique) → est `Evalué` (critères/valeurs) → passe une `Soutenance` (jury via `Repartition`) → obtient un `ProcesVerbalSoutenance` avec les notes (`NoteParCritere` / `Bareme`).

---

## 9. Check-list frontend

- [ ] Configurer le client HTTP sur `http://localhost:8002/practice/api/v1`.
- [ ] Auth : login → stocker `token`/`refreshToken`/`tokenExpires` → intercepteur `Bearer` → refresh sur `401`.
- [ ] Copier les types du §6 ; renvoyer les relations en **objets imbriqués** à la création (§4.3).
- [ ] Utiliser la bonne **clé primaire** dans les routes `:id` (§7).
- [ ] Gérer la pagination `{ data, hasNextPage }` et `?page=&limit=`.
- [ ] Traduire les clés d'erreur `422`.
- [ ] Adapter l'UI selon le **rôle** (`admin` → users ; `rsm` → évaluations/PV).
- [ ] Vérifier tout endpoint incertain dans **Swagger** avant intégration.
