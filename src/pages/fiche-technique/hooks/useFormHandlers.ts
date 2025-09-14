import { useCallback } from "react";
import {
  fillEtablissementData,
  fillEncadreurData,
  resetEtablissementFields,
  resetEncadreurFields,
} from "../utils/formUtils";
import toast from "react-hot-toast";

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
  const onSubmit = useCallback((data: any) => {
    console.log("=== DONNÉES DU FORMULAIRE ===", data);
    toast.success("Demande de stage soumise avec succès !");
  }, []);

  return {
    handleEtablissementExistantChange,
    handleEncadreurExistantChange,
    handleEtablissementTypeChange,
    handleEncadreurTypeChange,
    onSubmit,
  };
};
