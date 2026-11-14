"use client";

import React from "react";
import {
  Clock,
  LucideIcon,
  Mail,
  MailOpen,
  CircleX,
  Inbox,
  CheckCircle2,
  Send,
  XCircle,
  RotateCcw,
  Circle,
  AlertTriangle,
  Ban,
  ShieldCheck,
  Building2,
  UserPlus,
  Lock,
  Unlock,
  AlertOctagon,
  FileText,
  FileCheck,
  Sparkles,
  HelpCircle,
  FlaskConical,
  Receipt,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UCFirst } from "@/lib/helper/utility";

// Types des statuts système et métier supportés
export type SystemStatus =
  // --- États de succès / Validation ---
  | "solde"
  | "active"
  | "actif"
  | "traite"
  | "traitee"
  | "complete"
  | "confirme"
  | "confirmee"
  | "valide"
  | "validee"
  | "verifie"
  | "realise"
  | "realisee"
  | "termine"
  | "terminee"
  | "justifie"
  | "justifiee"
  | "approuve"
  | "approuvee"
  | "accepte"
  | "acceptee"
  | "livree"
  | "paye"
  | "payee"
  | "reçu"
  | "recu"
  | "collecte"
  | "collectee"
  | "pret"
  | "prete"
  | "publiee"
  | "libre"
  | "effectuee"
  | "interesse"
  | "reverse"
  | "reversee"
  // --- États d'erreur / Annulation / Rejet ---
  | "inactive"
  | "inactif"
  | "annule"
  | "annulee"
  | "non_retenu"
  | "refuse"
  | "refusee"
  | "non_justifie"
  | "non_justifiee"
  | "rejete"
  | "rejetee"
  | "revoque"
  | "revoquee"
  | "expire"
  | "expiree"
  | "non_livree"
  | "impaye"
  | "impayee"
  | "non_paye"
  | "non_payee"
  | "bloque"
  | "bloquee"
  | "resilie"
  | "resiliee"
  | "echec"
  | "aucun"
  // --- États d'attente / Planification ---
  | "en_attente"
  | "en_attente_verification"
  | "en_attente_validation"
  | "en_attente_signature"
  | "a_reverser"
  | "non_applicable"
  | "planifie"
  | "planifiee"
  | "reporte"
  | "reportee"
  | "suspendu"
  | "suspendue"
  | "a_verifier"
  | "a_revoir"
  | "en_maintenance"
  | "occupe"
  | "vendu"
  | "partiel"
  | "partielle"
  | "prescrit"
  | "prescrite"
  | "relance"
  | "relancee"
  // --- États en cours / Traitement ---
  | "nouveau"
  | "en_cours"
  | "en_revue"
  | "en_reflexion"
  | "soumis"
  | "soumise"
  | "transmis"
  | "transmise"
  | "envoye"
  | "envoyee"
  | "brouillon"
  // --- Caisse & Sessions ---
  | "ouverte"
  | "ouvert"
  | "fermee"
  | "ferme"
  // --- Facturation ---
  | "facture"
  | "facturee"
  | "non_facture"
  | "non_facturee"
  | "exonere"
  | "exoneree"
  | "dispense"
  // --- Prescription / Prise en charge ---
  | "interne"
  | "externe"
  | "faible"
  | "normal"
  | "normale"
  | "haute"
  | "urgent"
  | "urgente"
  | "tres_urgent"
  | "critique"
  | "espece"
  | "assurance"
  | "mixte"
  | "assure"
  | "assuree"
  | "non_assure"
  | "non_assuree"
  // --- Catégories Patients & Rôles ---
  | "malade"
  | "parent_malade"
  | "personnel_soignant"
  | "personnel"
  | "oui"
  | "non"
  | "mitige"
  | "vip"
  | "urgence"
  | "indigent"
  | "prisonnier"
  // --- Messagerie / Courriers ---
  | "non_lue"
  | "entrant"
  | "lue"
  | "sortant";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "purple"
  | "orange"
  | "outline"
  | "default"
  | "secondary"
  | "destructive"
  | "ghost"
  | "link";


export type BadgeSize = "sm" | "md" | "lg";

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  variant: BadgeVariant;
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: SystemStatus | string | boolean;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: LucideIcon | null;
  showIcon?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const statusConfig: Record<string, StatusConfig> = {
  // --- Succès / Validation / Actif ---
  solde: { label: "Soldé", icon: CheckCircle2, variant: "success" },
  active: { label: "Actif", icon: CheckCircle2, variant: "success" },
  actif: { label: "Actif", icon: CheckCircle2, variant: "success" },
  traite: { label: "Traité", icon: CheckCircle2, variant: "success" },
  traitee: { label: "Traitée", icon: CheckCircle2, variant: "success" },
  complete: { label: "Complète", icon: CheckCircle2, variant: "success" },
  confirme: { label: "Confirmé", icon: CheckCircle2, variant: "success" },
  confirmee: { label: "Confirmée", icon: CheckCircle2, variant: "success" },
  realise: { label: "Réalisé", icon: CheckCircle2, variant: "success" },
  realisee: { label: "Réalisée", icon: CheckCircle2, variant: "success" },
  termine: { label: "Terminé", icon: CheckCircle2, variant: "success" },
  terminee: { label: "Terminée", icon: CheckCircle2, variant: "success" },
  justifie: { label: "Justifié", icon: CheckCircle2, variant: "success" },
  justifiee: { label: "Justifiée", icon: CheckCircle2, variant: "success" },
  valide: { label: "Validé", icon: CheckCircle2, variant: "success" },
  validee: { label: "Validée", icon: CheckCircle2, variant: "success" },
  verifie: { label: "Vérifié", icon: ShieldCheck, variant: "success" },
  approuve: { label: "Approuvé", icon: CheckCircle2, variant: "success" },
  approuvee: { label: "Approuvée", icon: CheckCircle2, variant: "success" },
  accepte: { label: "Accepté", icon: UserCheck, variant: "success" },
  acceptee: { label: "Acceptée", icon: UserCheck, variant: "success" },
  livree: { label: "Livrée", icon: CheckCircle2, variant: "success" },
  paye: { label: "Payé", icon: CheckCircle2, variant: "success" },
  payee: { label: "Payée", icon: CheckCircle2, variant: "success" },
  reçu: { label: "Reçu", icon: CheckCircle2, variant: "success" },
  recu: { label: "Reçu", icon: CheckCircle2, variant: "success" },
  collecte: { label: "Collecté", icon: FlaskConical, variant: "success" },
  collectee: { label: "Collectée", icon: FlaskConical, variant: "success" },
  pret: { label: "Prêt", icon: FileCheck, variant: "success" },
  prete: { label: "Prête", icon: FileCheck, variant: "success" },
  publiee: { label: "Publiée", icon: CheckCircle2, variant: "success" },
  libre: { label: "Libre", icon: CheckCircle2, variant: "success" },
  effectuee: { label: "Effectuée", icon: CheckCircle2, variant: "success" },
  interesse: { label: "Intéressé", icon: Sparkles, variant: "success" },
  reverse: { label: "Reversé", icon: CheckCircle2, variant: "success" },
  reversee: { label: "Reversée", icon: CheckCircle2, variant: "success" },
  assure: { label: "Assuré", icon: ShieldCheck, variant: "success" },
  assuree: { label: "Assuré(e)", icon: ShieldCheck, variant: "success" },
  ouverte: { label: "Ouverte", icon: Unlock, variant: "success" },
  ouvert: { label: "Ouvert", icon: Unlock, variant: "success" },

  // --- Erreur / Annulation / Inactif / Rejet ---
  inactive: { label: "Inactif", icon: CircleX, variant: "error" },
  inactif: { label: "Inactif", icon: CircleX, variant: "error" },
  annulee: { label: "Annulée", icon: XCircle, variant: "error" },
  annule: { label: "Annulé", icon: XCircle, variant: "error" },
  non_retenu: { label: "Non retenu", icon: XCircle, variant: "neutral" },
  refuse: { label: "Refusé", icon: XCircle, variant: "error" },
  refusee: { label: "Refusée", icon: XCircle, variant: "error" },
  rejete: { label: "Rejeté", icon: Ban, variant: "error" },
  rejetee: { label: "Rejetée", icon: Ban, variant: "error" },
  revoque: { label: "Révoqué", icon: Ban, variant: "error" },
  revoquee: { label: "Révoquée", icon: Ban, variant: "error" },
  expire: { label: "Expiré", icon: XCircle, variant: "error" },
  expiree: { label: "Expirée", icon: XCircle, variant: "error" },
  non_justifie: { label: "Non justifié", icon: XCircle, variant: "error" },
  non_justifiee: { label: "Non justifiée", icon: XCircle, variant: "error" },
  non_livree: { label: "Non livrée", icon: XCircle, variant: "error" },
  impaye: { label: "Impayé", icon: XCircle, variant: "error" },
  impayee: { label: "Impayée", icon: XCircle, variant: "error" },
  non_paye: { label: "Non payé", icon: XCircle, variant: "error" },
  non_payee: { label: "Non payée", icon: XCircle, variant: "error" },
  resilie: { label: "Résilié", icon: Ban, variant: "error" },
  resiliee: { label: "Résiliée", icon: Ban, variant: "error" },
  echec: { label: "Échec vérif.", icon: XCircle, variant: "error" },
  aucun: { label: "Aucun document", icon: Circle, variant: "neutral" },
  fermee: { label: "Fermée", icon: Lock, variant: "error" },
  ferme: { label: "Fermé", icon: Lock, variant: "error" },
  critique: { label: "Critique", icon: AlertOctagon, variant: "error" },
  urgence: { label: "Urgence", icon: AlertOctagon, variant: "error" },

  // --- Attente / Planification / Attention ---
  en_attente: { label: "En attente", icon: Clock, variant: "warning" },
  en_attente_verification: { label: "En attente vérif.", icon: Clock, variant: "warning" },
  en_attente_validation: { label: "En attente validation", icon: Clock, variant: "warning" },
  en_attente_signature: { label: "En attente signature", icon: Clock, variant: "warning" },
  a_reverser: { label: "À reverser", icon: Clock, variant: "warning" },
  non_applicable: { label: "Non applicable", icon: Circle, variant: "neutral" },
  planifie: { label: "Planifié", icon: Clock, variant: "warning" },
  planifiee: { label: "Planifiée", icon: Clock, variant: "warning" },
  reporte: { label: "Reporté", icon: Clock, variant: "warning" },
  reportee: { label: "Reportée", icon: Clock, variant: "warning" },
  suspendu: { label: "Suspendu", icon: Clock, variant: "warning" },
  suspendue: { label: "Suspendue", icon: Ban, variant: "orange" },
  a_verifier: { label: "À vérifier", icon: AlertTriangle, variant: "warning" },
  en_maintenance: { label: "En maintenance", icon: AlertTriangle, variant: "warning" },
  occupe: { label: "Occupé", icon: Lock, variant: "info" },
  vendu: { label: "Vendu", icon: CheckCircle2, variant: "purple" },
  partiel: { label: "Partiel", icon: RotateCcw, variant: "warning" },
  partielle: { label: "Partielle", icon: RotateCcw, variant: "warning" },
  a_revoir: { label: "À revoir", icon: AlertTriangle, variant: "warning" },
  prescrit: { label: "Prescrit", icon: FileText, variant: "warning" },
  relance: { label: "Relancé", icon: RotateCcw, variant: "warning" },
  urgent: { label: "Urgent", icon: AlertTriangle, variant: "warning" },
  urgente: { label: "Urgente", icon: AlertTriangle, variant: "warning" },
  tres_urgent: { label: "Très urgent", icon: AlertOctagon, variant: "error" },
  vip: { label: "VIP", icon: Sparkles, variant: "warning" },

  // --- En cours / Processus / Info ---
  en_cours: { label: "En cours", icon: RotateCcw, variant: "info" },
  en_revue: { label: "En revue", icon: Clock, variant: "info" },
  en_reflexion: { label: "En réflexion", icon: Clock, variant: "info" },
  soumis: { label: "Soumis", icon: Circle, variant: "info" },
  soumise: { label: "Soumise", icon: Circle, variant: "info" },
  transmis: { label: "Transmis", icon: Send, variant: "info" },
  transmise: { label: "Transmise", icon: Send, variant: "info" },
  envoye: { label: "Envoyé", icon: Send, variant: "info" },
  envoyee: { label: "Envoyée", icon: Send, variant: "info" },
  interne: { label: "Interne", icon: UserPlus, variant: "info" },
  mixte: { label: "Mixte", icon: Receipt, variant: "info" },

  // --- Courriers & Spécifiques ---
  non_lue: { label: "Non lue", icon: Mail, variant: "info" },
  entrant: { label: "Entrant", icon: Inbox, variant: "info" },
  sortant: { label: "Sortant", icon: Send, variant: "orange" },
  externe: { label: "Externe", icon: Building2, variant: "orange" },
  prisonnier: { label: "Prisonnier", icon: ShieldCheck, variant: "orange" },
  lue: { label: "Lue", icon: MailOpen, variant: "neutral" },
  brouillon: { label: "Brouillon", icon: FileText, variant: "neutral" },
  non_facture: { label: "Non facturé", icon: Receipt, variant: "neutral" },
  non_facturee: { label: "Non facturée", icon: Receipt, variant: "neutral" },
  facture: { label: "Facturé", icon: Receipt, variant: "purple" },
  facturee: { label: "Facturée", icon: Receipt, variant: "purple" },
  exonere: { label: "Exonéré", icon: ShieldCheck, variant: "neutral" },
  exoneree: { label: "Exonérée", icon: ShieldCheck, variant: "neutral" },
  dispense: { label: "Dispensé", icon: ShieldCheck, variant: "neutral" },
  non_assure: { label: "Non assuré", icon: Circle, variant: "neutral" },
  non_assuree: { label: "Non assuré(e)", icon: Circle, variant: "neutral" },
  indigent: { label: "Indigent", icon: HelpCircle, variant: "purple" },
  assurance: { label: "Assurance", icon: ShieldCheck, variant: "purple" },
  espece: { label: "Espèce", icon: CheckCircle2, variant: "success" },
  normal: { label: "Normal", icon: CheckCircle2, variant: "neutral" },
  normale: { label: "Normale", icon: CheckCircle2, variant: "neutral" },
  nouveau: { label: "Nouveau", icon: Clock, variant: "warning" },
  faible: { label: "Faible", icon: Circle, variant: "neutral" },
  haute: { label: "Haute", icon: AlertTriangle, variant: "orange" },
  malade: { label: "Patient", icon: UserCheck, variant: "info" },
  parent_malade: { label: "Proche", icon: UserPlus, variant: "purple" },
  personnel_soignant: { label: "Soignant", icon: ShieldCheck, variant: "success" },
  personnel: { label: "Personnel", icon: Building2, variant: "neutral" },
  oui: { label: "Oui", icon: CheckCircle2, variant: "success" },
  non: { label: "Non", icon: XCircle, variant: "error" },
  mitige: { label: "Mitigé", icon: HelpCircle, variant: "warning" },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

const iconSizes: Record<BadgeSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

const variantClasses: Record<BadgeVariant, string> = {
  success:
    "bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  warning:
    "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  error:
    "bg-rose-100/80 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  info: "bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  neutral:
    "bg-slate-100/80 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  purple:
    "bg-purple-100/80 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  orange:
    "bg-orange-100/80 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  outline:
    "bg-background text-foreground border-border/80 dark:border-border/60",
  default:
    "bg-primary/10 text-primary border-primary/20",
  secondary:
    "bg-secondary text-secondary-foreground border-transparent",
  destructive:
    "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:border-destructive/40",
  ghost:
    "hover:bg-muted hover:text-muted-foreground border-transparent",
  link:
    "text-primary underline-offset-4 hover:underline border-transparent",
};


export const Badge: React.FC<BadgeProps> = ({
  status,
  variant: propVariant,
  size = "md",
  icon: PropIcon,
  showIcon = true,
  children,
  className,
  ...props
}) => {
  // 1. Détermination du statut normalisé si présent
  let config: StatusConfig | null = null;
  if (status !== undefined && status !== null) {
    let normalizedStatus = status;
    if (typeof status === "boolean") {
      normalizedStatus = status ? "active" : "inactive";
    }

    const statusKey = String(normalizedStatus).toLowerCase();
    config = statusConfig[statusKey] || {
      label: UCFirst(String(normalizedStatus).replace(/_/g, " ")) || "Inconnu",
      icon: Clock,
      variant: "neutral",
    };
  }

  // 2. Priorité de la variante et de l'icône
  const finalVariant = propVariant || config?.variant || "neutral";
  const IconComponent =
    PropIcon !== undefined ? PropIcon : showIcon && config ? config.icon : null;
  const content = children ?? config?.label;

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-full border transition-all duration-200 shadow-2xs whitespace-nowrap select-none",
        sizeClasses[size],
        variantClasses[finalVariant],
        className,
      )}
      {...props}
    >
      {IconComponent && (
        <IconComponent size={iconSizes[size]} className="shrink-0" />
      )}
      {content}
    </span>
  );
};

// Alias pour compatibilité directe avec le nom `StatusBadge`
export const StatusBadge = Badge;

export default Badge;
