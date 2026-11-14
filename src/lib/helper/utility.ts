import { AllowedModule, CrudAction } from "../types";

export const UCFirst = (strValue: string) => {
  if (!strValue) return "";
  const str = strValue.toLowerCase();
  return str[0].toUpperCase() + str.slice(1);
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const now = new Date();
export const getCurrentYear = (): number => now.getFullYear();
export const getCurrentMonth = (): number => now.getMonth() + 1;
export const getCurrentDay = (): number => now.getDate();
export const getFullDate = (): Date => now;

export const formatAmount = (amount: number | string): string => {
  if (typeof amount === "string") {
    amount = parseFloat(amount) || 0;
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const canAccess = (
  modules: AllowedModule[],
  resource: string,
  hasFullAccess: boolean,
): boolean => {
  if (hasFullAccess) return true;
  const mod = modules.find((m) => m.resource === resource);
  return !!mod?.hasAccess;
};

export const canDo = (
  modules: AllowedModule[],
  resource: string,
  action: CrudAction,
  hasFullAccess: boolean,
): boolean => {
  if (hasFullAccess) return true;
  const mod = modules.find((m) => m.resource === resource);
  if (!mod?.hasAccess) return false;
  return mod.actions?.includes(action) ?? false;
};

export const getOptionLabel = (
  options: { value: string; label: string }[],
  value: string,
) => {
  const option = options.find((o) => o.value === value);
  return option ? option.label : value;
};

/**
 * Génère un code de référence de suivi unique pour un avis
 * Format : FB-2026-X83K
 */
export const generateFeedbackCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `FB-${year}-${randomPart}`;
};

/**
 * Génère un mot de passe alpha-numérique aléatoire avec au moins
 * 1 lettre miniscule
 * 1 lettre majuscule
 * 1 chiffre
 * 1 caractère spécial
 */
export const generateRandomPassword = (): string => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%&*?+";
  const all = lowercase + uppercase + numbers + special;

  let password = "";

  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = 0; i < 4; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
};
