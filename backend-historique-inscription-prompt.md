# Prompt Backend — Contexte d'inscription (année univ / niveau / parcours) dans l'historique

> À donner au développeur backend (ou à un assistant IA côté back).
> **Complète** les §7 et §8 de `backend-soutenance-prompt.md` : les endpoints d'historique existent (ou sont à créer), il s'agit ici d'**enrichir leur réponse** avec le contexte d'inscription.
> Conventions du projet (rappel, cf. `backend-memo.md`) : JWT `Authorization: Bearer <token>`, versioning `/v1`, relations envoyées en **objets imbriqués** (pas de FK plate), PK métier en `code_*` / `sigle_*` ou `id` UUID.

## Contexte fonctionnel

Sur la page **Historique** de l'étudiant (`/soutenance/historique`), chaque **procès-verbal** et chaque **mémoire** doit afficher, en plus de ce qui existe déjà :

- l'**année universitaire** (`annee_universitaire.code_au`, ex. `2025-2026`) ;
- le **niveau** (`niveau.description_niveau`, à défaut `niveau.code_niveau`, ex. `M2`) ;
- le **parcours** (`parcours.description_parcours`).

Ces trois infos vivent sur l'entité **`Inscription`** (cf. `backend-memo.md`, `interface Inscription`). Le front les lit :
- pour un **PV** : directement sur `pv.inscription` (le `ProcesVerbalSoutenance` a déjà une relation `inscription`) ;
- pour un **mémoire** : via la chaîne **mémoire → `formation_pratique` → `inscriptions[]`**.

> Le front est **déjà branché** : il ne reste qu'à peupler ces relations dans la réponse. Les valeurs absentes sont ignorées côté front (aucun crash), donc rien ne s'affiche tant que le back ne les renvoie pas.

---

## 1. `GET /v1/pv/me` — ajouter `inscription` imbriqué

Réponse `200` attendue (⚠️ champ **`inscription`** ajouté par rapport à la §7 actuelle) :

```jsonc
[
  {
    "id": "uuid",
    "date_pv": "2026-07-21",
    "note_pv": 16,
    "soutenance": { "date_soutenance": "2026-07-20" },
    "file": { "id": "uuid", "path": "/files/pv-….pdf" },   // si un PDF de PV existe
    "inscription": {                                        // ← À AJOUTER
      "annee_universitaire": { "code_au": "2025-2026" },
      "niveau":  { "code_niveau": "M2", "description_niveau": "Master 2" },
      "parcours": { "description_parcours": "Génie Logiciel" }
    }
  }
]
```

- `ProcesVerbalSoutenance.inscription` existe déjà en base → il suffit de l'**inclure (eager / populate)** avec ses sous-relations `annee_universitaire`, `niveau`, `parcours`.
- Inutile d'envoyer toute l'`Inscription` : les 3 sous-objets ci-dessus suffisent (les envoyer en entier ne gêne pas non plus).

---

## 2. `GET /v1/formation/pratiques/me/memoires` — inclure `formation_pratique.inscriptions[]`

Le mémoire est rattaché à une **`FormationPratique`**, elle-même liée à **une ou plusieurs `Inscription`** (`FormationPratique.inscriptions[]`, cf. `backend-memo.md`) — un stage peut regrouper **plusieurs stagiaires**.

> ⚠️ **Important** : le front **ne prend pas `inscriptions[0]`** mais **l'inscription de l'étudiant connecté**, retrouvée en comparant `inscription.etudiant.user.id` à l'`id` de l'utilisateur du token. Chaque inscription **doit donc inclure `etudiant.user.id`**.
> Deux options possibles côté back (au choix) :
> - **(recommandé)** renvoyer **toutes** les `inscriptions[]` de la formation pratique, chacune avec son `etudiant.user.id` → le front sélectionne la bonne ;
> - ou ne renvoyer **que** l'inscription de l'étudiant connecté (filtrée serveur) dans `inscriptions[]` — dans ce cas `etudiant` peut être omis, le front retombe sur l'unique élément.

Réponse `200` — **forme recommandée** (l'item est le mémoire, portant sa formation pratique) :

```jsonc
[
  {
    "id": "uuid",
    "theme": "…",                                  // thème (fallback: formation_pratique.theme)
    "createdAt": "2026-07-10T09:00:00Z",
    "file": { "id": "uuid", "path": "/files/memoire-….pdf" },
    "formation_pratique": {                         // ← À AJOUTER
      "theme": "…",
      "inscriptions": [
        {
          "annee_universitaire": { "code_au": "2025-2026" },
          "niveau":  { "code_niveau": "M2", "description_niveau": "Master 2" },
          "parcours": { "description_parcours": "Génie Logiciel" },
          "etudiant": { "user": { "id": "uuid-de-l-utilisateur" } }  // ← pour cibler l'étudiant connecté
        }
        // … autres stagiaires du même stage
      ]
    }
  }
]
```

> ℹ️ **Tolérance côté front** (déjà implémentée dans `useHistorique.ts › normalizeMemoire`) : si vous préférez renvoyer une **liste de formations pratiques** portant leur mémoire, le front l'accepte aussi. Formes tolérées :
> - item = **mémoire** avec `formation_pratique.inscriptions[]` (forme recommandée ci‑dessus) ;
> - item = **formation pratique** avec `inscriptions[]` au premier niveau **et** le mémoire sous `memoire: { file, createdAt, theme }` (ou `file` directement sur l'item).
>
> Dans tous les cas, il faut que **`inscriptions[]`** (avec `annee_universitaire`, `niveau`, `parcours`) soit peuplé, et qu'un `file` (avec `path`) soit présent.

> ⚠️ Pré-requis (rappel §5/§8 de `backend-soutenance-prompt.md`) : le dépôt de mémoire doit **persister** un lien `FormationPratique` ⇄ `File` (avec `createdAt`). Sans persistance, cet endpoint ne peut rien renvoyer.

---

## Récapitulatif des décisions attendues

| # | Endpoint | Changement | Détail |
|---|---|---|---|
| 1 | `GET /v1/pv/me` | **Ajouter `inscription`** | Inclure `inscription.{ annee_universitaire.code_au, niveau.code_niveau/description_niveau, parcours.description_parcours }` |
| 2 | `GET /v1/formation/pratiques/me/memoires` | **Ajouter `formation_pratique.inscriptions[]`** | Chaque inscription avec les 3 mêmes sous-objets **+ `etudiant.user.id`** ; front sélectionne l'inscription de l'étudiant connecté (pas `[0]`), ou filtrer serveur pour n'en renvoyer qu'une |

> En cas de doute, **Swagger fait foi** : `http://localhost:8002/practice/api/docs`.
> Côté front, rien de plus à faire : `PvHistoriqueItem.inscription` et `MemoireHistoriqueItem.formation_pratique.inscriptions` sont déjà typés et affichés (`année univ · niveau · parcours`).
