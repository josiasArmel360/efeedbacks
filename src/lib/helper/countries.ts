export interface Country {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
  length: number;
}

export const COUNTRIES: readonly Country[] = [
  // 🇨🇮 Afrique de l'Ouest (Zone UEMOA principalement)
  {
    name: "Côte d'Ivoire",
    dial_code: "+225",
    code: "CI",
    flag: "🇨🇮",
    length: 10,
  },
  { name: "Sénégal", dial_code: "+221", code: "SN", flag: "🇸🇳", length: 9 },
  { name: "Mali", dial_code: "+223", code: "ML", flag: "🇲🇱", length: 8 },
  {
    name: "Burkina Faso",
    dial_code: "+226",
    code: "BF",
    flag: "🇧🇫",
    length: 8,
  },
  { name: "Bénin", dial_code: "+229", code: "BJ", flag: "🇧🇯", length: 8 },
  { name: "Togo", dial_code: "+228", code: "TG", flag: "🇹🇬", length: 8 },
  { name: "Niger", dial_code: "+227", code: "NE", flag: "🇳🇪", length: 8 },
  { name: "Guinée", dial_code: "+224", code: "GN", flag: "🇬🇳", length: 9 },

  // 🌍 Afrique Centrale & autres
  { name: "Cameroun", dial_code: "+237", code: "CM", flag: "🇨🇲", length: 9 },
  { name: "Gabon", dial_code: "+241", code: "GA", flag: "🇬🇦", length: 8 }, // 7 ou 8 selon l'opérateur, 8 est la norme mobile
  { name: "RD Congo", dial_code: "+243", code: "CD", flag: "🇨🇩", length: 9 },
  { name: "Madagascar", dial_code: "+261", code: "MG", flag: "🇲🇬", length: 9 },
  { name: "Maroc", dial_code: "+212", code: "MA", flag: "🇲🇦", length: 9 },
  { name: "Algérie", dial_code: "+213", code: "DZ", flag: "🇩🇿", length: 9 },

  // 🇪🇺 Europe
  { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷", length: 9 },
  { name: "Belgique", dial_code: "+32", code: "BE", flag: "🇧🇪", length: 9 },
  { name: "Suisse", dial_code: "+41", code: "CH", flag: "🇨🇭", length: 9 },
  { name: "Luxembourg", dial_code: "+352", code: "LU", flag: "🇱🇺", length: 9 },
  { name: "Allemagne", dial_code: "+49", code: "DE", flag: "🇩🇪", length: 11 },

  // 🌎 Amériques
  { name: "Canada", dial_code: "+1", code: "CA", flag: "🇨🇦", length: 10 },
  { name: "États-Unis", dial_code: "+1", code: "US", flag: "🇺🇸", length: 10 },
  { name: "Mexique", dial_code: "+52", code: "MX", flag: "🇲🇽", length: 10 },
] as const;
