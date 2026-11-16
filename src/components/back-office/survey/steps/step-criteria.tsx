"use client";

import React, { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Sparkles } from "lucide-react";

import { SurveyFieldRenderer } from "../survey-field-renderer";
import type { SurveySection } from "@/lib/types";
import type { SubmitFeedbackPayload } from "@/lib/db/queries/feedback/validator";

interface StepCriteriaProps {
  form: UseFormReturn<SubmitFeedbackPayload>;
  sections: SurveySection[];
  disabled?: boolean;
}

export const StepCriteria = ({
  form,
  sections,
  disabled,
}: StepCriteriaProps) => {
  const actorType = form.watch("actorType");

  // Filtrage des sections et champs correspondant au profil de l'usager
  const visibleSections = useMemo(() => {
    return sections
      .filter((sec) => sec.isActive && sec.targetActors?.includes(actorType))
      .map((sec) => ({
        ...sec,
        fields: (sec.fields || []).filter(
          (f) => f.isActive && f.targetActors?.includes(actorType),
        ),
      }))
      .filter((sec) => sec.fields.length > 0);
  }, [sections, actorType]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          Évaluation détaillée selon votre expérience
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Ces critères d'évaluation sont ciblés spécifiquement pour votre
          profil.
        </p>
      </div>

      {visibleSections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3 bg-muted/20">
          <div className="h-10 w-10 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Aucun critère spécifique requis
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Aucun questionnaire approfondi n'est actif pour ce profil. Vous
            pouvez passer directement à l'étape suivante pour attribuer votre
            note globale et exprimer vos suggestions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleSections.map((section, idx) => (
            <div
              key={section.id}
              className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-5 shadow-2xs"
            >
              {/* En-tête de section */}
              <div className="border-b border-border/50 pb-3 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Section {idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-foreground">
                    {section.title}
                  </h4>
                  {section.description && (
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Liste des champs dynamiques */}
              <div className="grid grid-cols-1 gap-5">
                {section.fields?.map((field) => (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-xl bg-muted/25 border border-border/40 transition-colors hover:bg-muted/40"
                  >
                    <SurveyFieldRenderer
                      field={field}
                      control={form.control}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
