// Helpers partagés pour la génération PDF (html2pdf/html2canvas) des documents
// officiels de la soutenance (PV, accusé de réception de mémoire).

// Tailwind v4 expose ses variables de thème en oklch, que html2canvas ne sait
// pas parser. On remplace temporairement ces variables sur :root par des rgb
// le temps de la capture, puis on restaure via la fonction retournée.
const OKLCH_VAR_FALLBACKS: Record<string, string> = {
  "--background": "#ffffff",
  "--foreground": "#475569",
  "--card": "#ffffff",
  "--card-foreground": "#164e63",
  "--popover": "#ffffff",
  "--popover-foreground": "#475569",
  "--primary": "#164e63",
  "--primary-foreground": "#ffffff",
  "--secondary": "#10b981",
  "--secondary-foreground": "#ffffff",
  "--muted": "#f8fafc",
  "--muted-foreground": "#64748b",
  "--accent": "#10b981",
  "--accent-foreground": "#ffffff",
  "--destructive": "#e53e3e",
  "--destructive-foreground": "#ffffff",
  "--border": "#d1d5db",
  "--input": "#ffffff",
  "--ring": "#164e63",
  "--chart-1": "#3b82f6",
  "--chart-2": "#10b981",
  "--chart-3": "#eab308",
  "--chart-4": "#ef4444",
  "--chart-5": "#a855f7",
  "--sidebar": "#f8fafc",
  "--sidebar-foreground": "#475569",
  "--sidebar-primary": "#164e63",
  "--sidebar-primary-foreground": "#ffffff",
  "--sidebar-accent": "#10b981",
  "--sidebar-accent-foreground": "#ffffff",
  "--sidebar-border": "#d1d5db",
  "--sidebar-ring": "#10b981",
};

export const overrideOklchVars = (): (() => void) => {
  const root = document.documentElement;
  const previous: Record<string, string> = {};
  Object.entries(OKLCH_VAR_FALLBACKS).forEach(([key, value]) => {
    previous[key] = root.style.getPropertyValue(key);
    root.style.setProperty(key, value);
  });
  return () => {
    Object.entries(previous).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value);
      else root.style.removeProperty(key);
    });
  };
};
