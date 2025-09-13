import type { User } from "@/services/auth.service";

export interface SpecialiteTheme {
    code_specialite: string,
    description_specialite: string,
}
export interface EncadreurProAPI {
    id: string,
    user: User,
}
export interface NiveauAPI {
    code_niveau: string,
    description_niveau: string,
}
export interface ParcoursAPI {
    code_parcours: string,
    description_parcours: string,
}
export interface FormationPratiqueAPI {
    id: string,
}
export interface EtudiantAPI {
    matricule: string,
    user: User,
}
export interface InscriptionsAPI {
    code_inscription: string,
    etudiant: EtudiantAPI,
    niveau: NiveauAPI,
    parcours: ParcoursAPI,
}