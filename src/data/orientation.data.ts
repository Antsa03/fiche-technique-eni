export interface Orientation {
  value: string;
  label: string;
  description: string;
}

export const orientations: Orientation[] = [
  {
    value: "GB",
    label: "GB - Génie logiciel et base de données",
    description:
      "Conception et développement d'applications, gestion de bases de données",
  },
  {
    value: "ASR",
    label: "ASR - Administration Système et Réseaux",
    description: "Administration des systèmes informatiques et réseaux",
  },
  {
    value: "IA",
    label: "IA - Intelligence Artificielle",
    description: "Machine learning, deep learning, traitement de données",
  },
  {
    value: "DevOps",
    label: "DevOps",
    description:
      "Intégration continue, déploiement automatisé, infrastructure as code",
  },
];

// Fonction utilitaire pour obtenir une orientation par sa valeur
export const getOrientationByValue = (
  value: string
): Orientation | undefined => {
  return orientations.find((orientation) => orientation.value === value);
};

// Fonction utilitaire pour formater le label complet
export const formatOrientationLabel = (orientation: Orientation): string => {
  return orientation.label;
};
