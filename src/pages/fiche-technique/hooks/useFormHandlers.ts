import { useCallback } from "react";
import {
  fillEtablissementData,
  fillEncadreurData,
  resetEtablissementFields,
  resetEncadreurFields,
} from "../utils/formUtils";
import toast from "react-hot-toast";
import { addFicheTechnique } from "@/services/api";

interface UseFormHandlersProps {
  setValue: any; // UseFormSetValue type from react-hook-form
}

export const useFormHandlers = ({ setValue }: UseFormHandlersProps) => {
  const handleEtablissementExistantChange = useCallback(
    (etablissementId: string) => {
      fillEtablissementData(etablissementId, setValue);
    },
    [setValue]
  );

  const handleEncadreurExistantChange = useCallback(
    (encadreurId: string) => {
      fillEncadreurData(encadreurId, setValue);
    },
    [setValue]
  );

  const handleEtablissementTypeChange = useCallback(
    (type: "nouveau" | "existant") => {
      setValue("etablissement.type", type);
      if (type === "nouveau") {
        resetEtablissementFields(setValue);
      }
    },
    [setValue]
  );

  const handleEncadreurTypeChange = useCallback(
    (type: "nouveau" | "existant") => {
      setValue("encadreur.type", type);
      if (type === "nouveau") {
        resetEncadreurFields(setValue);
      }
    },
    [setValue]
  );

  // La logique de soumission du formulaire
  const onSubmit = useCallback(async (data: any) => {    
    const inscriptions = data.stagiaire.stagiaires.map((s: string) => {
      const code = s.split(" - ")[0].trim();
      return { code_inscription: code };
    });    
    
    const formatedData = {
      theme: data.sujet.theme,
      descriptif: data.sujet.descriptif,
      objectif: data.sujet.objectif,
      moyen_logiciel: data.aspectTechnique.moyenLogiciel,
      moyen_materiel: data.aspectTechnique.moyenMateriel,
      planning_previsionnel: data.aspectTechnique.planningPrevisionnel,
      nombre_stagiaire: inscriptions.length.toString(),
      autorisation_soutenance:false,
      debut: "2025-10-28T14:30:00Z",
      est_rapporte:false,
      specialite: {
        code_specialite: data.sujet.orientation
      },
      etat: {
        code_statut: 'REM',
      },
      inscriptions,
      ...(data.encadreur.encadreurExistantId && {
        encadreur_professionnel: {
          id: data.encadreur.encadreurExistantId,
        },
      }),...(data.etablissement.etablissementExistantId && {
        etablissement_accueil: {
          sigle_ea: data.etablissement.etablissementExistantId,
        },
      }),
      nouveau_enc_pro: {
        email: data.encadreur.user.email || "test@gmail.com",
        password: "********",
        nom: data.encadreur.user.nom || "example",
        prenoms: data.encadreur.user.prenoms || "example@gmail.com",
        contact: data.encadreur.user.contact || "example",
        etablissement_accueils: []
      },
      nouveau_ea: {
        sigle_ea: data.etablissement.sigle_ea || data.etablissement.etablissementExistantId,
        site_web_ea: data.etablissement.site_web_ea || "www.com",
        contact_ea: data.etablissement.contact_ea || "test",
        email_ea: data.etablissement.email_ea || "test@gmail.com",
        adresse_ea: data.etablissement.adresse_ea || "test",
        raison_sociale: data.etablissement.raison_sociale || "test",
        responsable_ea: data.etablissement.responsable_ea || "test",
        encadreur_professionnels: []
      }


    }
    try{
      console.log(formatedData);
      
      await addFicheTechnique(formatedData)
      toast.success("Fiche technique soumise avec succès !");
      // window.location.href = '/';
    }
    catch (error){
      console.log(error);  
      toast.error("Erreur d'envoi");
    }
    
  }, []);

  return {
    handleEtablissementExistantChange,
    handleEncadreurExistantChange,
    handleEtablissementTypeChange,
    handleEncadreurTypeChange,
    onSubmit,
  };
};
