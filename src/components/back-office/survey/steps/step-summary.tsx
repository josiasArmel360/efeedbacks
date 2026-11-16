"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { ThumbsUp, ThumbsDown, Lightbulb, ShieldCheck } from "lucide-react";

import {
  RadioGroupButtonInput,
  RatingInput,
  TextareaInput,
} from "@/components/inputs";
import type { Department } from "@/lib/types";
import type { SubmitFeedbackPayload } from "@/lib/db/queries/feedback/validator";

interface StepSummaryProps {
  form: UseFormReturn<SubmitFeedbackPayload>;
  departments: Department[];
  lockedDepartment?: Department | null;
  disabled?: boolean;
}

const RECOMMENDATION_OPTIONS = [
  { label: "Oui, sans hésitation", value: "oui" },
  { label: "Mitigé / Sous réserves", value: "mitige" },
  { label: "Non, pas particulièrement", value: "non" },
];

export const StepSummary = ({
  form,
  departments,
  lockedDepartment,
  disabled,
}: StepSummaryProps) => {
  const actorType = useWatch({ control: form.control, name: "actorType" });
  const isAnonymous = useWatch({ control: form.control, name: "isAnonymous" });
  const authorName = useWatch({ control: form.control, name: "authorName" });
  const departmentId = useWatch({
    control: form.control,
    name: "departmentId",
  });

  const selectedDepartment =
    lockedDepartment || departments.find((d) => d.id === departmentId);

  const actorLabelMap: Record<string, string> = {
    malade: "Patient / Usager",
    parent_malade: "Parent / Proche accompagnant",
    personnel_soignant: "Personnel Soignant",
    personnel: "Personnel Administratif / Support",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          Note globale & Expression libre
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Partagez votre bilan général et vos suggestions concrètes
          d'amélioration.
        </p>
      </div>

      {/* Note globale principale */}
      <div className="rounded-2xl border-2 border-primary/20 bg-linear-to-br from-primary/5 via-card to-background p-5 sm:p-7 space-y-4">
        <RatingInput
          control={form.control}
          name="overallRating"
          label="Quelle est votre appréciation générale de votre prise en charge ?"
          description="Attribuez une note globale sur 5 étoiles."
          size="lg"
          required={true}
          disabled={disabled}
        />
      </div>

      {/* Recommandation */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4">
        <RadioGroupButtonInput
          control={form.control}
          name="recommendation"
          label="Recommanderiez-vous cet établissement ou ce service à vos proches ?"
          options={RECOMMENDATION_OPTIONS}
          required={true}
          disabled={disabled}
        />
      </div>

      {/* Verbatims qualitatifs */}
      <div className="space-y-5">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">
            Commentaires libres & Retours qualitatifs
          </h4>
          <p className="text-xs text-muted-foreground">
            Vos mots permettent aux comités d'amélioration de comprendre
            précisément le vécu des soignés et des soignants.
          </p>
        </div>

        <div className="space-y-4">
          <TextareaInput
            control={form.control}
            name="positivePoints"
            label="Points forts & Aspects positifs"
            placeholder="Ce que vous avez particulièrement apprécié : qualité de l'accueil, humanité des soignants, explications médicales..."
            rows={3}
            disabled={disabled}
            icon={ThumbsUp}
          />

          <TextareaInput
            control={form.control}
            name="negativePoints"
            label="Points faibles & Dysfonctionnements constatés"
            placeholder="Ce qui a manqué ou vous a dérangé : délais d'attente, gestion de la douleur, propreté, signalétique, bruit..."
            rows={3}
            disabled={disabled}
            icon={ThumbsDown}
          />

          <TextareaInput
            control={form.control}
            name="suggestions"
            label="Vos suggestions constructives"
            placeholder="Vos idées ou pistes concrètes pour progresser ensemble..."
            rows={3}
            disabled={disabled}
            icon={Lightbulb}
          />
        </div>
      </div>

      {/* Récapitulatif avant envoi */}
      <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 sm:p-5 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Récapitulatif avant validation
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Profil :</span>
            <p className="font-semibold text-foreground">
              {actorLabelMap[actorType] || actorType}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Confidentialité :</span>
            <p className="font-semibold text-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              {isAnonymous
                ? "100% Anonyme"
                : `Nominatif (${authorName || "Précisé"})`}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Service ciblé :</span>
            <p className="font-semibold text-foreground truncate">
              {selectedDepartment?.name || "Non spécifié"}
            </p>
          </div>
        </div>
      </div>

      {/* Champ Honeypot invisible */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
        style={{ display: "none" }}
        {...form.register("website")}
      />
    </div>
  );
};
