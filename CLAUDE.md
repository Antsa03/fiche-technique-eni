# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then produce a production build via Vite; the build fails on any type error
- `npm run lint` — run ESLint over the repo
- `npm run preview` — serve the production build locally

There is no test runner configured in this project.

## Environment

`VITE_API_BASE_URL` (in `.env`) points at the backend REST API (default `http://localhost:8002/practice/api`). All requests are relative to this base and go through `src/services/api.ts`.

## Big-picture architecture

This is a French-language React 19 + TypeScript + Vite SPA for submitting an internship "fiche technique" (technical sheet) to a backend API. UI is built on shadcn/ui (new-york style, in `src/components/ui/`), Tailwind CSS v4 (configured via the `@tailwindcss/vite` plugin, not a `tailwind.config`), and lucide-react icons. The `@/*` path alias maps to `src/` (see `vite.config.ts` and `tsconfig`).

### Routing & auth

`src/App.tsx` defines three routes: `/` (login), `/forgot-password`, and `/formulaire` (the fiche-technique wizard, wrapped in `ProtectedRoute`). Auth is entirely client-side and token-based:

- `AuthService` (`src/services/auth.service.ts`) is a static class that reads/writes `authToken`, `refreshToken`, `tokenExpires`, and `user` in `localStorage`. `isAuthenticated()` checks token presence and expiry.
- `ProtectedRoute` redirects to `/` when not authenticated.
- The axios instance in `src/services/api.ts` attaches the bearer token on every request and has a response interceptor that: on **403** clears tokens; on **401** attempts a token refresh against `/v1/auth/refresh` and retries the original request, redirecting to `/` if refresh fails.

All API calls are centralized as named exports in `src/services/api.ts`. Backend endpoints are versioned under `/v1/...`.

### The fiche-technique multi-step form (the core feature)

Everything lives under `src/pages/fiche-technique/`. This is a 6-step wizard driven by react-hook-form + Zod.

- **`data/steps.data.ts`** is the single source of truth for the step sequence — each entry pairs an `id`, title/subtitle, icon, and its Zod `schema`. `STEPS` order defines the wizard; the last step (`recapitulatif`) is a review step with an empty schema.
- **`schema/fiche-technique.schema.ts`** (note: at repo `src/schema/`, imported via `@/schema`) defines per-section Zod schemas composed into `globalSchema`. The `etablissement` and `encadreur` sections are **`z.discriminatedUnion("type", …)`** on `"existant"` vs `"nouveau"` — the required fields differ by branch. The `stagiaire` schema enforces per-`niveau` min/max stagiaire counts (L1: 4–5, L2: 1–2, L3: 1, M1: 3–4, M2: 1) via `.refine`.
- **`index.tsx`** wires three custom hooks together and renders the current step by index:
  - `hooks/useFormValidation.ts` — creates the `useForm` instance (`zodResolver(globalSchema)`, `mode: "all"`, defaults from `getFormDefaultValues()`).
  - `hooks/useFormNavigation.ts` — owns `currentStep` and `completedSteps`; `nextStep` calls `trigger(STEPS[currentStep].id)` and only advances (and marks the step complete) when that section validates.
  - `hooks/useFormHandlers.ts` — the "existant/nouveau" toggle handlers and, critically, `onSubmit`, which **transforms** the nested form shape into the flat backend payload (snake_case keys, `inscriptions` derived by splitting `"CODE - Name"` strings, `specialite`/`etat` code objects) and POSTs via `addFicheTechnique`.
- **`utils/formUtils.ts`** holds `getFormDefaultValues()` plus the `fill*`/`reset*` helpers that populate or clear section fields when the user switches between an existing record and a new one.
- **`_components/`** is split into `layout/`, `stepper/` (desktop/mobile variants), `form/`, and `steps/` (one component per wizard step). Step components receive the shared react-hook-form `control`/`watch`/`setValue`/`trigger`/`getValues` props (typed as `StepContentProps` in `types/form.types.ts`) and fetch their own option lists from the API (e.g. `StagiaireStep` calls `getInscriptions`).

### Conventions to follow

- UI text, comments, validation messages, and toasts are in **French** — match this.
- Prefer the centralized axios helpers in `src/services/api.ts` over ad-hoc `fetch`/`axios` calls.
- When adding or reordering wizard steps, update `STEPS` in `steps.data.ts`, the matching Zod section in `fiche-technique.schema.ts`, and the `index === currentStep` render branch in `index.tsx` together — they are positionally coupled.
- `src/data/*.data.ts` contain hard-coded seed/mock lists (etudiants, etablissements, encadreurs, orientations) used as fallbacks/options; real data generally comes from the API.
