// Utils portés depuis le projet CoreUI (front-2026) — comportement identique.

export const dateToWords = (date?: string | null): string => {
  const jours = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const mois = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const d = new Date(date ?? "");
  if (isNaN(d.getTime())) return "";

  const jourSemaine = jours[d.getDay()];
  const jour = d.getDate();
  const moisNom = mois[d.getMonth()];
  const annee = d.getFullYear();

  return `${jourSemaine} ${jour} ${moisNom} ${annee}`;
};

const lettre_0_19 = (note: number | string, zero = true): string => {
  const n = parseInt(String(note), 10);
  switch (n) {
    case 0:
      return zero ? "Zéro" : "";
    case 1:
      return "Un";
    case 2:
      return "Deux";
    case 3:
      return "Trois";
    case 4:
      return "Quatre";
    case 5:
      return "Cinq";
    case 6:
      return "Six";
    case 7:
      return "Sept";
    case 8:
      return "Huit";
    case 9:
      return "Neuf";
    case 10:
      return "Dix";
    case 11:
      return "Onze";
    case 12:
      return "Douze";
    case 13:
      return "Treize";
    case 14:
      return "Quatorze";
    case 15:
      return "Quinze";
    case 16:
      return "Seize";
    case 17:
      return "Dix-sept";
    case 18:
      return "Dix-huit";
    case 19:
      return "Dix-neuf";
    default:
      return "";
  }
};

const lettre_20_59 = (note: number | string): string => {
  const n = parseInt(String(note), 10);
  const dizaine = parseInt(String(n / 10), 10);
  const reste = parseInt(String(n % 10), 10);
  const lettre_reste = lettre_0_19(reste, false);

  if (dizaine === 2)
    return "Vingt" + (lettre_reste ? " " + lettre_reste : "");
  if (dizaine === 3)
    return "Trente" + (lettre_reste ? " " + lettre_reste : "");
  if (dizaine === 4)
    return "Quarante" + (lettre_reste ? " " + lettre_reste : "");
  if (dizaine === 5)
    return "Cinquante" + (lettre_reste ? " " + lettre_reste : "");
  return "";
};

const lettre_60_99 = (note: number | string): string => {
  const n = parseInt(String(note), 10);
  const vingtaine = parseInt(String(n / 20), 10);
  const reste = parseInt(String(n % 20), 10);
  const lettre_reste = lettre_0_19(reste, false);

  switch (vingtaine) {
    case 3:
      return "Soixante" + (lettre_reste ? " " + lettre_reste : "");
    case 4:
      return "Quatre-vingt" + (lettre_reste ? " " + lettre_reste : "");
    default:
      return "";
  }
};

const lettre_0_99 = (note: number | string): string => {
  const n = Number(note);
  if (n <= 19) return lettre_0_19(n);
  if (n <= 59) return lettre_20_59(n);
  if (n <= 99) return lettre_60_99(n);
  return "";
};

export const getLettreNoteTotale = (note?: number | string | null): string => {
  const n = Number(note ?? 0).toFixed(2);

  const avant = parseInt(n, 10);
  const lettre_avant = lettre_0_99(avant);

  let apres = n.toString().split(".")[1];
  let lettre_apres = "";

  while (apres && apres[0] === "0") {
    lettre_apres += " Zéro";
    apres = apres.substring(1);
  }
  if (apres && apres.length > 0) {
    lettre_apres += " " + lettre_0_99(parseInt(apres, 10));
  }

  return lettre_avant + (lettre_apres ? " virgule" + lettre_apres : "");
};
