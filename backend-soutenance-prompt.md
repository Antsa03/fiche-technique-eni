# Prompt Backend — Endpoints requis pour la fonctionnalité « Soutenance »

> À donner au développeur backend (ou à un assistant IA côté back) pour **créer / confirmer** les endpoints dont le frontend ENI Practice a besoin pour la page `/soutenance`.
> Conventions du projet (rappel, cf. `backend-memo.md`) : JWT `Authorization: Bearer <token>`, versioning `/v1`, relations envoyées en **objets imbriqués** (pas de FK plate), pagination `{ data, hasNextPage }`, PK métier en `code_*` / `sigle_*` ou `id` UUID.

## Contexte fonctionnel

Sur la page `/soutenance`, un **étudiant connecté** doit pouvoir :

1. Voir son stage (`FormationPratique`) et son **encadreur pédagogique** (`Enseignant`).
2. **Choisir une date de soutenance** — uniquement si un encadreur pédagogique lui est assigné. Il saisit une **date + une tranche horaire**, l'app demande au backend si l'encadreur est **disponible** (oui/non), puis confirme.
3. **Déposer la version finale de son mémoire** en PDF.

Ci-dessous, chaque endpoint attendu. Marqué **[À CRÉER]**, **[À CONFIRMER]** ou **[EXISTE]**.

---

## 1. Récupérer le stage de l'étudiant connecté — **[À CRÉER de préférence]**

Le token de login renvoie un `User` **sans matricule**. Le front ne peut donc pas retrouver facilement l'inscription/le stage de l'étudiant. Deux options :

### Option A (recommandée) — endpoint dédié « mon stage »

```
GET /v1/formation/pratiques/me
Auth : Bearer (rôle etudiant)
```

Réponse `200` : la `FormationPratique` de l'étudiant connecté, avec au minimum :

```jsonc
{
  "id": "uuid",
  "theme": "….",
  "encadreur_pedagogique": {          // null si non encore assigné
    "sigle_ens": "RAF",
    "user": { "nom": "…", "prenoms": "…" }
  }
}
```

Si l'étudiant n'a pas de stage → `404`.

### Option B — via les inscriptions (si pas d'endpoint dédié)

Le front utilisera alors `GET /v1/inscriptions` et filtrera. Dans ce cas il faut :
- que `GET /v1/inscriptions` accepte un filtre par étudiant connecté (ex. `?etudiant=me` ou un filtre par `user.id`), **et**
- que chaque `Inscription` renvoie **`formation_pratique` imbriqué avec `encadreur_pedagogique`** (lui-même avec `sigle_ens` + `user`).

> ⚠️ Merci d'indiquer laquelle des deux options est disponible.

---

## 2. Liste des tranches horaires — **[EXISTE ? à confirmer]**

Utilisé pour peupler le `select` de tranche horaire.

```
GET /v1/tranche-horaires
Auth : Bearer
```

Réponse `200` (paginée `{ data, hasNextPage }` ou tableau) :

```jsonc
[
  { "code_tranche_horaire": "T1", "libelle_tranche_horaire": "08h00 - 10h00" },
  { "code_tranche_horaire": "T2", "libelle_tranche_horaire": "10h00 - 12h00" }
]
```

> ⚠️ Le `libelle_tranche_horaire` (texte lisible) n'est **pas** dans les types documentés. Merci de l'ajouter, sinon le front n'affichera que le code.

---

## 3. Vérifier la disponibilité de l'encadreur — **[À CRÉER / À CONFIRMER]**

Le front envoie **une date + une tranche horaire**, l'API répond **oui/non**.

```
GET /v1/enseignant/disponible/:sigle_ens
      ?date_soutenance=2026-07-20
      &code_tranche_horaire=T1
Auth : Bearer
```

- `:sigle_ens` = PK de l'`Enseignant` (encadreur pédagogique).
- Réponse `200` attendue :

```jsonc
{ "disponible": true }
```

> ⚠️ **À figer avec le back** :
> - Noms exacts des query params (`date_soutenance`, `code_tranche_horaire` ?).
> - Forme exacte de la réponse. Le front accepte `true`/`false` brut ou un objet `{ disponible | available | est_disponible: boolean }`.
> - Comportement si indisponible : soit `200 { disponible:false }`, soit un statut `409/422` (le front traite les deux comme « indisponible »).

---

## 4. Enregistrer la date de soutenance — **[EXISTE : POST /v1/soutenance/choisir-date]**

Le front (flux étudiant) appelle **`POST /v1/soutenance/choisir-date`**.

```
POST /v1/soutenance/choisir-date
Auth : Bearer (rôle etudiant)
```

### 🔴 Changement demandé : accepter la salle (`lieu`)

**DTO actuel** (`ChoisirDateSoutenanceDto`, confirmé via Swagger `localhost:8002/docs-json`) :

```jsonc
{
  "formation_pratique": { "id": "uuid" },      // FormationPratiqueDto
  "date_soutenance": "2026-07-20",
  "tranche_horaire": { "code_tranche_horaire": "T1" }  // TrancheHoraireDto
}
```

L'étudiant choisit désormais **une salle** dans la grille de répartition, mais le
DTO **n'a aucun champ salle** → la salle envoyée est ignorée et `lieu` reste
`null` en base. **Merci d'ajouter `lieu`** au `ChoisirDateSoutenanceDto` et de le
persister sur la soutenance (même champ `lieu` que `CreateSoutenanceDto`) :

```jsonc
{
  "formation_pratique": { "id": "uuid" },
  "date_soutenance": "2026-07-20",
  "tranche_horaire": { "code_tranche_horaire": "T1" },
  "lieu": "Salle 009"                          // ← À AJOUTER (= num_salle)
}
```

> C'est **exactement** ce que le front envoie déjà. Rien d'autre à changer côté
> front une fois le champ accepté et persisté.

> ⚠️ **À figer** : le serveur devrait **revalider** avant enregistrement que la
> salle n'est pas déjà prise sur ce (date, tranche) et renvoyer `409/422` sinon
> (garde anti-collision si deux étudiants réservent le même créneau).
>
> ℹ️ `POST /v1/soutenance/choisir-date` renvoie la `Soutenance` créée (avec son
> `id` et `lieu`), et `GET /v1/soutenance?formation_pratique=<id>` permet de
> ré-afficher/re-choisir tant que ce n'est pas verrouillé.

### 4.a — Création automatique du rapporteur — **[À CRÉER côté backend]**

Règle métier : **au moment du choix de la date**, le backend doit **créer
automatiquement le rapporteur du jury**. Le rapporteur **est l'encadreur
pédagogique** de la formation pratique. Concrètement, `choisir-date` crée (de
façon **idempotente** — pas de doublon si on re-choisit la date) une
`Repartition` :

```jsonc
{
  "soutenance":       { "id": "<id de la soutenance créée>" },
  "enseignant":       { "sigle_ens": "<sigle de l'encadreur pédagogique>" },
  "role_membre_jury": { "code_role_jury": "<code du rôle RAPPORTEUR>" }
}
```

> ⚠️ **À figer** : le `code_role_jury` exact correspondant au rôle « rapporteur »
> (table `/v1/role-juries`).
>
> ℹ️ **Côté front** : le verrouillage de la date **ne tient pas compte** de ce
> rapporteur. La date ne se verrouille que lorsqu'un membre de jury **autre que
> l'encadreur pédagogique** est ajouté par la scolarité (cf. §6). Le rapporteur
> auto ne doit donc **pas** déclencher le verrou tout seul.

### 4.b — Grille des disponibilités (date → créneaux + salles libres) — **[PAS de nouvel endpoint : dérivé de l'existant]**

Nouveau flux front : l'étudiant **choisit d'abord une date** (aujourd'hui par
défaut), puis l'app affiche **le tableau de répartition complet** de cette date
— mêmes colonnes que la vue scolarité (Heure, Salle, Étudiant, Encadreur,
Rapporteur, Président, Examinateur), en **lecture seule**. Il peut cliquer une
**salle libre** sur un créneau où son **encadreur pédagogique est disponible**
pour confirmer (§4).

Le front **ne demande pas** d'endpoint dédié : il compose la grille à partir de
trois appels existants —

1. `GET /v1/tranche-horaires` → les lignes (créneaux), items `{ code_tranche_horaire }`.
2. `GET /v1/salles` → les colonnes (salles), items `{ num_salle }`.
3. `GET /v1/soutenance?date_soutenance=<ISO>` → les soutenances déjà posées ce
   jour-là (date envoyée au format `Date.toISOString()`), d'où le front :
   - remplit chaque **cellule occupée** : `formation_pratique.inscriptions[0].etudiant`
     (matricule + nom), `formation_pratique.encadreur_pedagogique`, et les
     `membre_jury` par rôle (`RAP` rapporteur, `PJ` président, `EXA` examinateur) ;
   - marque la **salle prise** quand une soutenance a ce `heure_soutenance` (code
     tranche) **et** ce `lieu` (= `num_salle`) ;
   - marque l'**encadreur occupé** sur un créneau quand son `sigle_ens` figure
     dans le `membre_jury` d'une soutenance à ce `heure_soutenance` → créneau
     désactivé.

> ⚠️ **Conditions à garantir côté backend pour que ça marche** :
> - `GET /v1/soutenance` **accessible à l'étudiant**, filtre `date_soutenance`
>   (ISO) supporté (à défaut, le front refiltre par date côté client).
> - Chaque soutenance renvoyée doit inclure **`heure_soutenance`**, **`lieu`**
>   (la salle), **`formation_pratique`** imbriqué (avec `inscriptions[].etudiant`
>   et `encadreur_pedagogique`) et **`membre_jury[]`** (avec `role_membre_jury.code_role_jury`
>   + `enseignant.user`).
>   👉 Sans `lieu`, le front ne peut pas savoir quelles salles sont prises
>   (elles apparaîtront toutes libres).
> - `POST /soutenance/choisir-date` (cf. §4) **revalide** l'occupation de la
>   salle à la confirmation (garde anti-collision si deux étudiants réservent le
>   même créneau).

---

## 5. Déposer le mémoire final (PDF) — **[À CRÉER — endpoint dédié]**

```
POST /v1/formation/pratiques/memoire/:id
Auth : Bearer (rôle etudiant)
Content-Type : multipart/form-data
Champ fichier : "file"   (PDF uniquement)
```

- `:id` = `id` UUID de la `FormationPratique`.
- Réponse `200/201` : la formation pratique mise à jour (ou l'objet fichier `{ file: { id, path } }`).

> ⚠️ Le memo ne documente **aucun champ mémoire** sur `FormationPratique`/`Soutenance`. Merci de :
> - créer ce champ (ex. `memoire_pdf` → relation vers l'entité `File`), **et**
> - confirmer le **path exact** et le **nom du champ** du fichier.
> Le front valide déjà : type `application/pdf` et taille ≤ 20 Mo.

---

## 6. Verrouillage de la date + affichage du jury — **[À CONFIRMER dans la réponse de /soutenance]**

Nouvelles règles métier côté front :
- La date **n'est plus modifiable** une fois que **le jury est attribué** par la scolarité.
- La date **n'est plus modifiable** une fois la **soutenance terminée** (PV généré).
- Les **membres du jury** doivent être affichés dès qu'ils sont attribués.

Pour cela, `GET /v1/soutenance?formation_pratique=<id>` doit renvoyer :

```jsonc
{
  "id": "uuid",
  "date_soutenance": "2026-07-20",
  "heure_soutenance": "T1",
  "membre_jury": [                       // Repartition[] — vide tant que non attribué
    {
      "id": "uuid",
      "enseignant": { "sigle_ens": "RAF", "user": { "nom": "…", "prenoms": "…" } },
      "role_membre_jury": { "code_role_jury": "PRES", "description_role_jury": "Président" }
    }
  ],
  "has_pv": false                        // ou "pv": { "id" } / "proces_verbal": { "id" }
}
```

> ⚠️ **À figer** :
> - Inclure `membre_jury` (avec `enseignant.user` + `role_membre_jury`) dans la réponse.
> - Fournir un **indicateur de PV généré** : un booléen `has_pv`, ou l'objet `pv`/`proces_verbal`. Le front teste ces trois formes.
> - Idéalement, le backend **refuse aussi** `POST /soutenance/choisir-date` (409/422) si le jury est attribué ou le PV généré (le verrou front n'est pas suffisant).

---

## 7. Historique des PV de l'étudiant — **[À CRÉER — endpoint étudiant]**

`/pv` est réservé au rôle `rsm` → un étudiant reçoit `403`. Il faut un endpoint dédié :

```
GET /v1/pv/me
Auth : Bearer (rôle etudiant)
```

Réponse `200` (liste, tous cursus/années confondus) :

```jsonc
[
  {
    "id": "uuid",
    "date_pv": "2026-07-21",
    "note_pv": 16,
    "soutenance": { "date_soutenance": "2026-07-20" },
    "file": { "id": "uuid", "path": "/files/pv-….pdf" }   // si un PDF de PV existe
  }
]
```

> Le front affiche date + note + lien de téléchargement (si `file`). Si l'endpoint renvoie `404/501`, le front masque proprement la section.

---

## 8. Historique des mémoires de l'étudiant — **[À CRÉER — dépend de la persistance du mémoire]**

Aujourd'hui le dépôt de mémoire (§5) **ne persiste aucun lien** côté backend. Pour l'historique, il faut :
1. **Persister** chaque dépôt (relation `FormationPratique` ⇄ `File`, avec date).
2. Exposer :

```
GET /v1/formation/pratiques/me/memoires
Auth : Bearer (rôle etudiant)
```

Réponse `200` :

```jsonc
[
  {
    "id": "uuid",
    "theme": "…",                      // thème de la formation pratique liée
    "createdAt": "2026-07-10T09:00:00Z",
    "file": { "id": "uuid", "path": "/files/memoire-….pdf" }
  }
]
```

> Même comportement : `404/501` ⇒ section masquée côté front.

---

## Téléchargement des fichiers (PV / mémoires) — **[À CONFIRMER]**

Le front construit l'URL de téléchargement à partir du `path` renvoyé : si `path` est absolu (`http…`) il l'utilise tel quel, sinon il préfixe l'origine du backend (`http://localhost:8002`).
> ⚠️ Confirmer **comment les fichiers sont servis** (path absolu, route `/files/:id`, ou téléchargement authentifié). Si un header `Authorization` est requis pour télécharger, prévenir : un simple lien `<a href>` ne l'enverra pas.

---

## Récapitulatif des décisions attendues du backend

| # | Endpoint | Statut | À confirmer |
|---|---|---|---|
| 1 | `GET /formation/pratiques/me` | ✅ Confirmé | encadreur_pedagogique inclus, 404 si aucun stage |
| 2 | `GET /tranche-horaires` | À confirmer | Ajouter `libelle_tranche_horaire` (sinon on affiche le code) |
| 3 | `GET /enseignant/disponible/:id` | ✅ Confirmé | `{ disponible: boolean }`, params `date_soutenance` + `code_tranche_horaire` (alias `heure`) |
| 4 | `POST /soutenance/choisir-date` | 🔴 **Ajouter `lieu`** | DTO actuel = `formation_pratique` + `date_soutenance` + `tranche_horaire` (aucune salle). **Ajouter `lieu` (= num_salle)** au `ChoisirDateSoutenanceDto` et le persister, sinon la salle reste `null`. Le front l'envoie déjà. |
| 4.a | Rapporteur auto dans `choisir-date` | **À créer** | Créer (idempotent) une `Repartition` rapporteur = encadreur pédagogique ; figer le `code_role_jury` du rôle rapporteur ; ne verrouille pas la date |
| 4.b | Grille dispo dérivée de `GET /soutenance` | **À confirmer** | Rendre `GET /soutenance` accessible étudiant + filtre `date_soutenance` + inclure `heure_soutenance`, `salle`, `membre_jury[].enseignant.sigle_ens` ; `choisir-date` accepte + revalide `salle.num_salle` |
| 5 | `POST /formation/pratiques/memoire/:id` | ✅ Confirmé | PDF ≤ 20 Mo, champ `file`, renvoie `{ file:{id,path} }` (pas de lien persisté) |
| 6 | `membre_jury` + indicateur PV dans `GET /soutenance` | **À créer/confirmer** | Verrou date + affichage jury |
| 7 | `GET /pv/me` | **À créer** | Historique PV côté étudiant (contourne le guard `rsm`) |
| 8 | `GET /formation/pratiques/me/memoires` | **À créer** | Nécessite de persister les dépôts de mémoire |
| — | Service des fichiers (PV/mémoire) | À confirmer | Path absolu vs route dédiée vs download authentifié |

> En cas de doute, **Swagger fait foi** : `http://localhost:8002/practice/api/docs`.
> Points **6, 7, 8** (+ service des fichiers) sont les nouveaux besoins à figer pour brancher le verrouillage, l'affichage du jury et l'historique.
