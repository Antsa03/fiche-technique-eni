import { Controller, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { formatEtudiantWithMatricule } from "@/data/etudiant.data";
import type { StepContentProps } from "../../types/form.types";
import { useEffect, useState } from "react";
import type { InscriptionsAPI } from "@/pages/fiche-technique/types/type";
import { getInscriptions } from "@/services/api";
import { ANNEE_UNIVERSITAIRE_ACTUELLE } from "@/lib/constants";

export const StagiaireStep = ({ control, trigger }: StepContentProps) => {
  const [selectedParcours, setSelectedParcours] = useState<string>('');
  const [selectedNiveau, setSelectedNiveau] = useState<string>('');
  const [searchEtudiant, setSearchEtudiant] = useState<string>('');
  const [etudiantOptions, setEtudiantOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Surveiller les valeurs des champs du formulaire
  const niveau = useWatch({
    control,
    name: "stagiaire.niveau",
  });

  const parcours = useWatch({
    control,
    name: "stagiaire.parcours",
  });

  // Synchroniser les états locaux avec les valeurs du formulaire
  useEffect(() => {
    setSelectedNiveau(niveau || '');
  }, [niveau]);

  useEffect(() => {
    setSelectedParcours(parcours || '');
  }, [parcours]);

  // Fetch des inscriptions avec gestion d'erreur améliorée
  useEffect(() => {
    const fetchInscriptions = async () => {
      // Ne pas faire d'appel API si les paramètres essentiels sont manquants
      if (!selectedNiveau && !selectedParcours && !searchEtudiant) {
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getInscriptions(
          10, // limit
          0,  // offset (corrigé: devrait commencer à 0, pas 5)
          selectedNiveau,
          ANNEE_UNIVERSITAIRE_ACTUELLE,
          selectedParcours,
          searchEtudiant
        );
        
        const inscriptionsData = response.data?.data || [];        
        setEtudiantOptions(inscriptionsData.map((etudiant: InscriptionsAPI) => formatEtudiantWithMatricule(etudiant))) ;
        
      } catch (err) {
        console.error('Failed to fetch Inscriptions:', err);
        setError('Erreur lors du chargement des inscriptions');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce pour éviter trop d'appels API
    const timeoutId = setTimeout(fetchInscriptions, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedNiveau, selectedParcours, searchEtudiant]);
  
  // Fonctions utilitaires avec validation
  const getMaxStagiaires = (niveauEtude: string): number => {
    switch (niveauEtude) {
      case "L1":
        return 5;
      case "L2":
        return 2;
      case "L3":
        return 1;
      case "M1":
        return 4;
      case "M2":
        return 1;
      default:
        return 5; // Par défaut
    }
  };

  const getMinStagiaires = (niveauEtude: string): number => {
    switch (niveauEtude) {
      case "L1":
        return 4;
      case "L2":
        return 1;
      case "L3":
        return 1;
      case "M1":
        return 3;
      case "M2":
        return 1;
      default:
        return 1; // Par défaut
    }
  };

  const getHelpText = (niveauEtude: string): string => {
    if (!niveauEtude) {
      return "💡 Veuillez d'abord sélectionner un niveau d'étude.";
    }
    
    const min = getMinStagiaires(niveauEtude);
    const max = getMaxStagiaires(niveauEtude);
    
    switch (niveauEtude) {
      case "L1":
        return `💡 Entre ${min} et ${max} stagiaires requis pour le niveau L1.`;
      case "L2":
        return `💡 Maximum ${max} stagiaires pour le niveau L2.`;
      case "L3":
        return `💡 ${max} seul stagiaire autorisé pour le niveau L3.`;
      case "M1":
        return `💡 Entre ${min} et ${max} stagiaires requis pour le niveau M1.`;
      case "M2":
        return `💡 ${max} seul stagiaire autorisé pour le niveau M2.`;
      default:
        return "💡 Veuillez sélectionner un niveau d'étude valide.";
    }
  };

  const maxStagiaires = niveau ? getMaxStagiaires(niveau) : 5;
  const minStagiaires = niveau ? getMinStagiaires(niveau) : 1;
  const helpText = getHelpText(niveau);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            Niveau <span className="text-secondary">*</span>
          </Label>
          <Controller
            name="stagiaire.niveau"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Trigger validation pour les stagiaires dépendants
                    setTimeout(() => trigger("stagiaire.stagiaires"), 100);
                  }} 
                  value={field.value || ""}
                >
                  <SelectTrigger
                    className={`
                      px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200
                      bg-white hover:bg-gray-50 focus:bg-white
                      focus:outline-none focus:ring-0
                      ${
                        fieldState.error
                          ? "border-secondary focus:border-secondary shadow-secondary/20 focus:shadow-secondary/30"
                          : "border-gray-200 focus:border-primary hover:border-gray-300 focus:shadow-primary/20"
                      }
                      ${fieldState.error ? "focus:shadow-lg" : "focus:shadow-md"}
                    `}
                  >
                    <SelectValue placeholder="Sélectionnez le niveau d'étude" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1">L1 - Licence 1ère année</SelectItem>
                    <SelectItem value="L2">L2 - Licence 2ème année</SelectItem>
                    <SelectItem value="L3">L3 - Licence 3ème année</SelectItem>
                    <SelectItem value="M1">M1 - Master 1ère année</SelectItem>
                    <SelectItem value="M2">M2 - Master 2ème année</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <p className="text-sm text-secondary mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            Parcours <span className="text-secondary">*</span>
          </Label>
          <Controller
            name="stagiaire.parcours"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Trigger validation si nécessaire
                    setTimeout(() => trigger("stagiaire.parcours"), 100);
                  }} 
                  value={field.value || ""}
                >
                  <SelectTrigger
                    className={`
                      px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200
                      bg-white hover:bg-gray-50 focus:bg-white
                      focus:outline-none focus:ring-0
                      ${
                        fieldState.error
                          ? "border-secondary focus:border-secondary shadow-secondary/20 focus:shadow-secondary/30"
                          : "border-gray-200 focus:border-primary hover:border-gray-300 focus:shadow-primary/20"
                      }
                      ${fieldState.error ? "focus:shadow-lg" : "focus:shadow-md"}
                    `}
                  >
                    <SelectValue placeholder="Sélectionnez le parcours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GB">
                      GB - Génie et Base de Données
                    </SelectItem>
                    <SelectItem value="ASR">
                      ASR - Administration Système et Réseaux
                    </SelectItem>
                    <SelectItem value="IG">
                      IG - Informatique Générale
                    </SelectItem>
                    <SelectItem value="GID">
                      GID - Gouvernance Ingénierie de Données
                    </SelectItem>
                    <SelectItem value="OCC">
                      OCC - Objets Connectés et Cyber Sécurité
                    </SelectItem>
                    <SelectItem value="ASI">
                      ASI - Audit des Systèmes d'Informations
                    </SelectItem>
                    <SelectItem value="MDi">
                      MDi - Métiers du Digital
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <p className="text-sm text-secondary mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Liste de(s) stagiaire(s) <span className="text-secondary ml-1">*</span>
        </Label>
        <Controller
  name="stagiaire.stagiaires"
  control={control}
  render={({ field, fieldState }) => (
    <div>
      <MultiSelectCombobox
        options={etudiantOptions}
        value={field.value || []}
        onChange={(newValue) => {
          const cleanedValue = Array.isArray(newValue) 
            ? newValue.filter(item => item && item.trim().length > 0)
            : [];
          
          const limitedValue = cleanedValue.slice(0, maxStagiaires);
          
          field.onChange(limitedValue);
          setTimeout(() => trigger("stagiaire.stagiaires"), 100);
        }}
        // Nouvelle prop pour gérer la recherche API
        onSearchChange={(searchValue) => {
          console.log('Recherche API:', searchValue);
          setSearchEtudiant(searchValue);
        }}
        placeholder="Sélectionner les étudiants stagiaires..."
        searchPlaceholder="Rechercher un étudiant par nom, prénom ou matricule..."
        maxItems={maxStagiaires}
        error={!!fieldState.error}
        loading={isLoading} // Afficher l'état de chargement
      />
      
      {/* Messages informatifs */}
      {!isLoading && etudiantOptions.length > 0 && searchEtudiant && (
        <p className="text-xs text-green-600 mt-1">
          ✅ {etudiantOptions.length} étudiant(s) trouvé(s) pour "{searchEtudiant}"
        </p>
      )}
      
      {!isLoading && etudiantOptions.length === 0 && searchEtudiant && (
        <p className="text-xs text-orange-600 mt-1">
          ⚠️ Aucun étudiant trouvé pour "{searchEtudiant}"
        </p>
      )}
      
      {fieldState.error && (
        <p className="text-sm text-secondary mt-1">
          {fieldState.error.message}
        </p>
      )}
      
      {/* Validation en temps réel pour les contraintes min/max */}
      {niveau && field.value && Array.isArray(field.value) && (
        <p
          className={`text-xs mt-1 font-medium ${
            field.value.length < minStagiaires ||
            field.value.length > maxStagiaires
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {field.value.length < minStagiaires
            ? `⚠️ Au moins ${minStagiaires} stagiaire(s) requis pour ${niveau}`
            : field.value.length > maxStagiaires
            ? `⚠️ Maximum ${maxStagiaires} stagiaire(s) autorisé(s) pour ${niveau}`
            : `✅ Nombre de stagiaires valide (${field.value.length}/${maxStagiaires})`}
        </p>
      )}
      
      <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
    </div>
  )}
/>
      </div>
    </div>
  );
};