"use client";

import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, Clock, FileCheck2, RotateCcw } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { Feedback, FeedbackStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FollowUpTimelineProps {
  feedback: Feedback;
}

const STATUS_STEP_INDEX: Record<FeedbackStatus, number> = {
  nouveau: 1,
  en_cours: 2,
  traite: 3,
};

function formatTimelineDate(date?: Date | string | null): string | null {
  if (!date) return null;
  try {
    return format(new Date(date), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  } catch {
    return null;
  }
}

export const FollowUpTimeline = ({ feedback }: FollowUpTimelineProps) => {
  const currentStep = STATUS_STEP_INDEX[feedback.status] ?? 1;
  const createdDateStr = formatTimelineDate(feedback.createdAt);
  const updatedDateStr = formatTimelineDate(feedback.updatedAt);
  const treatedDateStr = formatTimelineDate(feedback.treatedAt);

  const steps = [
    {
      index: 1,
      title: "Dépôt enregistré",
      subtitle: createdDateStr ? `Reçu le ${createdDateStr}` : "Dossier créé",
      description:
        "Votre avis a été enregistré avec succès dans la boîte à suggestions électronique et un numéro de suivi unique lui a été attribué.",
      icon: FileCheck2,
      done: currentStep >= 1,
      active: currentStep === 1,
    },
    {
      index: 2,
      title: "Instruction en cours",
      subtitle:
        currentStep === 2
          ? "Examen par la Cellule Qualité"
          : currentStep > 2
            ? "Instruction complétée"
            : "En attente de prise en charge",
      description:
        "Les référents qualité et le responsable du service concerné analysent votre retour afin d'identifier les mesures appropriées.",
      icon: RotateCcw,
      done: currentStep >= 2,
      active: currentStep === 2,
    },
    {
      index: 3,
      title: "Dossier traité & clôturé",
      subtitle:
        currentStep === 3 && (treatedDateStr || updatedDateStr)
          ? `Clôturé le ${treatedDateStr || updatedDateStr}`
          : "Décision & Actions correctives",
      description:
        "L'instruction est terminée. Les conclusions ou actions correctives engagées par l'établissement sont affichées ci-dessous.",
      icon: CheckCircle2,
      done: currentStep >= 3,
      active: currentStep === 3,
    },
  ];

  const progressPct = currentStep === 1 ? 18 : currentStep === 2 ? 55 : 100;

  return (
    <Card className="border-border/60 shadow-xs py-0 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-foreground">
              Avancement du traitement de votre dossier
            </h3>
            <p className="text-xs text-muted-foreground">
              Suivi en temps réel du cycle d&apos;instruction qualité.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary self-start sm:self-auto">
            <Clock className="h-3.5 w-3.5" />
            <span>Étape {currentStep} sur 3</span>
          </span>
        </div>

        {/* Barre de progression globale */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out",
              currentStep === 3
                ? "bg-emerald-500"
                : currentStep === 2
                  ? "bg-blue-500"
                  : "bg-primary",
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Grille des 3 étapes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.index}
                className={cn(
                  "relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 space-y-3",
                  step.active
                    ? "border-primary/50 bg-primary/5 shadow-xs ring-2 ring-primary/10"
                    : step.done
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border/50 bg-muted/15 opacity-70",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                      step.active
                        ? "border-primary/30 bg-primary text-primary-foreground shadow-2xs"
                        : step.done
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "border-border/60 bg-background text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {step.active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                      En cours
                    </span>
                  ) : step.done ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Validé
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-bold text-muted-foreground/60">
                      0{step.index}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-foreground">
                    {step.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-primary">
                    {step.subtitle}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
