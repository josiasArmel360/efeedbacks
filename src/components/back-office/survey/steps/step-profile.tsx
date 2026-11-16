"use client";

import React from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import {
  HeartHandshake,
  Users,
  Stethoscope,
  Building2,
  Lock,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import { PhoneInput, TextInput } from "@/components/inputs";
import type { ActorType } from "@/lib/types";
import type { SubmitFeedbackPayload } from "@/lib/db/queries/feedback/validator";
import { cn } from "@/lib/utils";

interface StepProfileProps {
  form: UseFormReturn<SubmitFeedbackPayload>;
  disabled?: boolean;
}

const ACTOR_OPTIONS: {
  key: ActorType;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  activeBorderClass: string;
}[] = [
  {
    key: "malade",
    title: "Patient / Usager",
    badge: "Pris en charge",
    description:
      "Vous êtes actuellement patient ou avez récemment reçu des soins.",
    icon: HeartHandshake,
    colorClass: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    activeBorderClass: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5",
  },
  {
    key: "parent_malade",
    title: "Parent / Proche",
    badge: "Accompagnant",
    description:
      "Vous accompagnez un membre de votre famille ou un proche hospitalisé.",
    icon: Users,
    colorClass: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    activeBorderClass:
      "border-purple-500 ring-2 ring-purple-500/20 bg-purple-500/5",
  },
  {
    key: "personnel_soignant",
    title: "Personnel Soignant",
    badge: "Équipe médicale",
    description:
      "Médecin, interne, infirmier(e), aide-soignant(e), sage-femme...",
    icon: Stethoscope,
    colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    activeBorderClass:
      "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5",
  },
  {
    key: "personnel",
    title: "Personnel de Soutien",
    badge: "Admin & Logistique",
    description:
      "Accueil, admissions, logistique, entretien, technique, informatique...",
    icon: Building2,
    colorClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    activeBorderClass:
      "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5",
  },
];

export const StepProfile = ({ form, disabled }: StepProfileProps) => {
  const currentActor = useWatch({ control: form.control, name: "actorType" });
  const isAnonymous = useWatch({ control: form.control, name: "isAnonymous" });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Sélection du Profil */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            1. Quel est votre statut au sein de l'établissement ?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Le questionnaire s'adaptera automatiquement à votre point de vue.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {ACTOR_OPTIONS.map((opt) => {
            const isSelected = currentActor === opt.key;
            const Icon = opt.icon;

            return (
              <button
                key={opt.key}
                type="button"
                disabled={disabled}
                onClick={() => {
                  form.setValue("actorType", opt.key, { shouldValidate: true });
                }}
                className={cn(
                  "relative flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer hover:shadow-md",
                  isSelected
                    ? cn("shadow-sm", opt.activeBorderClass)
                    : "border-border/70 hover:border-border hover:bg-muted/30",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                <div
                  className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200",
                    opt.colorClass,
                    isSelected && "scale-105",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">
                      {opt.title}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {opt.description}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4 text-primary animate-in zoom-in-50">
                    <CheckCircle2 className="h-5 w-5 fill-primary text-background" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Confidentialité & Anonymat */}
      <div className="space-y-4 pt-2 border-t border-border/50">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            2. Modalité de dépôt : Souhaitez-vous rester anonyme ?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            L'anonymat protège votre identité. Si vous choisissez de vous
            identifier, vos coordonnées restent strictement confidentielles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option Anonyme */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              form.setValue("isAnonymous", true, { shouldValidate: true });
            }}
            className={cn(
              "relative flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer hover:shadow-md",
              isAnonymous
                ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5 shadow-sm"
                : "border-border/70 hover:border-border hover:bg-muted/30",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <div
              className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
                isAnonymous
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Lock className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-foreground">
                  100% Anonyme
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Recommandé
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Aucun nom ni coordonnée ne vous sera demandé. Votre liberté
                d'expression est totale.
              </p>
            </div>

            {isAnonymous && (
              <div className="absolute top-4 right-4 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50">
                <CheckCircle2 className="h-5 w-5 fill-emerald-600 text-background" />
              </div>
            )}
          </button>

          {/* Option Nominatif */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              form.setValue("isAnonymous", false, { shouldValidate: true });
            }}
            className={cn(
              "relative flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer hover:shadow-md",
              !isAnonymous
                ? "border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm"
                : "border-border/70 hover:border-border hover:bg-muted/30",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <div
              className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
                !isAnonymous
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <UserCheck className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-foreground">
                  Avis Nominatif
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vous indiquez votre identité afin que la direction ou le service
                puisse vous apporter une réponse personnalisée.
              </p>
            </div>

            {!isAnonymous && (
              <div className="absolute top-4 right-4 text-primary animate-in zoom-in-50">
                <CheckCircle2 className="h-5 w-5 fill-primary text-background" />
              </div>
            )}
          </button>
        </div>

        {/* Formulaire conditionnel Nominatif */}
        {!isAnonymous && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 space-y-4 animate-in fade-in-50 slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>
                Vos coordonnées ne seront jamais publiées publiquement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                control={form.control}
                name="authorName"
                label="Nom et Prénom"
                placeholder="Ex. KONAN ALFRED"
                required={true}
                disabled={disabled}
                uppercase
              />

              <TextInput
                control={form.control}
                name="authorRoleOrRoom"
                label={
                  currentActor === "malade" || currentActor === "parent_malade"
                    ? "Chambre/Lit (optionnel)"
                    : "Fonction (optionnel)"
                }
                placeholder={
                  currentActor === "malade" || currentActor === "parent_malade"
                    ? "Ex. Chambre 204, Lit B"
                    : "Ex. Infirmier, Auxilliaire"
                }
                disabled={disabled}
              />

              <PhoneInput
                control={form.control}
                name="authorPhone"
                label="Numéro de téléphone (optionnel)"
                placeholder="Ex. 06 12 34 56 78"
                disabled={disabled}
              />

              <TextInput
                control={form.control}
                name="authorEmail"
                type="email"
                label="Adresse email (optionnel)"
                placeholder="Ex. marie.dupont@example.com"
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
