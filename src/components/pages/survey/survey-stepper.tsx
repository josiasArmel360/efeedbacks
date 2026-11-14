"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SurveyStepItem {
  id: number;
  label: string;
  shortLabel: string;
}

export const SURVEY_STEPS: SurveyStepItem[] = [
  { id: 1, label: "Profil & Statut", shortLabel: "Profil" },
  { id: 2, label: "Service & Contexte", shortLabel: "Service" },
  { id: 3, label: "Critères Qualité", shortLabel: "Critères" },
  { id: 4, label: "Note & Synthèse", shortLabel: "Synthèse" },
];

interface SurveyStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  className?: string;
}

export const SurveyStepper: React.FC<SurveyStepperProps> = ({
  currentStep,
  onStepClick,
  className,
}) => {
  const progressPercent = ((currentStep - 1) / (SURVEY_STEPS.length - 1)) * 100;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Barre de progression fine */}
      <div className="relative h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-primary to-primary/80 transition-all duration-400 ease-out rounded-full"
          style={{ width: `${Math.max(10, progressPercent)}%` }}
        />
      </div>

      {/* Étapes circulaires numérotées */}
      <div className="flex items-center justify-between relative">
        {SURVEY_STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = step.id < currentStep;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 text-center transition-all duration-200 group focus:outline-hidden",
                isClickable
                  ? "cursor-pointer hover:opacity-80"
                  : "cursor-default",
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300",
                  isCompleted &&
                    "bg-primary text-primary-foreground shadow-xs",
                  isCurrent &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-sm scale-110",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-muted text-muted-foreground border border-border/70",
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  step.id
                )}
              </div>

              <span
                className={cn(
                  "text-[11px] sm:text-xs font-medium transition-colors hidden sm:inline-block",
                  isCurrent && "font-bold text-primary",
                  isCompleted && "text-foreground",
                  !isCompleted && !isCurrent && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors sm:hidden",
                  isCurrent && "font-bold text-primary",
                  isCompleted && "text-foreground",
                  !isCompleted && !isCurrent && "text-muted-foreground",
                )}
              >
                {step.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

