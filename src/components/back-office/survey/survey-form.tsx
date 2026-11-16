"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, Control, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/image";
import { SurveyStepper } from "./survey-stepper";
import { StepProfile } from "./steps/step-profile";
import { StepContext } from "./steps/step-context";
import { StepCriteria } from "./steps/step-criteria";
import { StepSummary } from "./steps/step-summary";
import {
  buildSubmitFeedbackSchema,
  SubmitFeedbackPayload,
} from "@/lib/db/queries/feedback/validator";
import { submit as submitFeedbackAction } from "@/lib/db/server/feedbacks";
import type { ActorType, Department, SurveySection } from "@/lib/types";
import { APP_NAME } from "@/lib/constants";

const LOCAL_STORAGE_DRAFT_KEY = `${APP_NAME.replace(" ", "_").toLowerCase()}_survey_draft`;

interface SurveyDraftSyncProps {
  control: Control<SubmitFeedbackPayload>;
  step: number;
}

const SurveyDraftSync: React.FC<SurveyDraftSyncProps> = ({ control, step }) => {
  const formValues = useWatch({ control });

  useEffect(() => {
    if (typeof window === "undefined" || !formValues) return;
    try {
      const draftData = {
        actorType: formValues.actorType,
        isAnonymous: formValues.isAnonymous,
        departmentId: formValues.departmentId,
        visitDate: formValues.visitDate,
        overallRating: formValues.overallRating,
        recommendation: formValues.recommendation,
        positivePoints: formValues.positivePoints,
        negativePoints: formValues.negativePoints,
        suggestions: formValues.suggestions,
        answers: formValues.answers,
        step,
      };
      localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(draftData));
    } catch (err) {
      console.warn("Erreur sauvegarde brouillon:", err);
    }
  }, [formValues, step]);

  return null;
};

export interface SurveyFormProps {
  departments: Department[];
  sections: SurveySection[];
  lockedDepartment?: Department | null;
  initialActorType?: ActorType;
  onSuccess: (result: { code: string; payload: SubmitFeedbackPayload }) => void;
}

export const SurveyForm = ({
  departments,
  sections,
  lockedDepartment,
  initialActorType,
  onSuccess,
}: SurveyFormProps) => {
  const [step, setStep] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (
          parsed.step &&
          typeof parsed.step === "number" &&
          parsed.step >= 1 &&
          parsed.step <= 4
        ) {
          return parsed.step;
        }
      }
    } catch {
      // Ignorer l'erreur d'analyse du brouillon
    }
    return 1;
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Tous les champs plats pour le schéma dynamique Zod
  const allFields = useMemo(() => {
    return sections
      .filter((section) => section.isActive)
      .flatMap((section) => section.fields || []);
  }, [sections]);

  const schema = useMemo(
    () => buildSubmitFeedbackSchema(allFields),
    [allFields],
  );

  const form = useForm<SubmitFeedbackPayload>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      actorType: initialActorType || "malade",
      isAnonymous: true,
      authorName: "",
      authorEmail: "",
      authorPhone: "",
      authorRoleOrRoom: "",
      departmentId: lockedDepartment?.id || departments[0]?.id || null,
      visitDate: new Date(),
      overallRating: 5,
      recommendation: "oui",
      positivePoints: "",
      negativePoints: "",
      suggestions: "",
      answers: {},
      website: "",
    },
  });

  // 1. Restauration du brouillon depuis localStorage au premier montage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        // On restaure les réponses non nominatives
        if (parsed.actorType) form.setValue("actorType", parsed.actorType);
        if (parsed.isAnonymous !== undefined)
          form.setValue("isAnonymous", parsed.isAnonymous);
        if (parsed.departmentId && !lockedDepartment)
          form.setValue("departmentId", parsed.departmentId);
        if (parsed.visitDate) {
          const d = new Date(parsed.visitDate);
          if (!isNaN(d.getTime())) {
            form.setValue("visitDate", d);
          }
        }
        if (parsed.overallRating)
          form.setValue("overallRating", parsed.overallRating);
        if (parsed.recommendation)
          form.setValue("recommendation", parsed.recommendation);
        if (parsed.positivePoints)
          form.setValue("positivePoints", parsed.positivePoints);
        if (parsed.negativePoints)
          form.setValue("negativePoints", parsed.negativePoints);
        if (parsed.suggestions)
          form.setValue("suggestions", parsed.suggestions);
        if (parsed.answers && typeof parsed.answers === "object") {
          form.setValue("answers", parsed.answers);
        }
      }
    } catch (e) {
      console.warn("Impossible de restaurer le brouillon:", e);
    }
  }, [form, lockedDepartment]);

  // Navigation Étape Suivante avec validation ciblée
  const handleNextStep = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (step === 1) {
      const valid = await form.trigger([
        "actorType",
        "isAnonymous",
        "authorName",
        "authorEmail",
        "authorPhone",
        "authorRoleOrRoom",
      ]);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await form.trigger(["departmentId", "visitDate"]);
      if (valid) setStep(3);
    } else if (step === 3) {
      const currentActor = form.getValues("actorType");
      const requiredFields = allFields.filter(
        (f) =>
          f.isActive && f.targetActors?.includes(currentActor) && f.isRequired,
      );

      const fieldNames = requiredFields.map(
        (f) => `answers.${f.id}` as Path<SubmitFeedbackPayload>,
      );

      const valid =
        fieldNames.length > 0 ? await form.trigger(fieldNames) : true;
      if (valid) setStep(4);
    }
  };

  const handlePrevStep = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setStep((s) => Math.max(1, s - 1));
  };

  // Soumission finale du formulaire
  const onSubmit = async (values: SubmitFeedbackPayload) => {
    // Sécurité stricte : empêcher toute soumission tant qu'on n'est pas à l'étape finale (4)
    if (step !== 4) {
      await handleNextStep();
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitFeedbackAction(values);

      if (res?.serverError) {
        toast.error(res.serverError);
        return;
      }

      if (res?.validationErrors) {
        toast.error("Veuillez vérifier les informations saisies.");
        return;
      }

      if (res?.data?.success && res.data.code) {
        // VIDAGE IMMÉDIAT DU BROUILLON LOCALSTORAGE
        if (typeof window !== "undefined") {
          localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
        }

        toast.success(res.data.message || "Avis enregistré avec succès !");
        onSuccess({
          code: res.data.code,
          payload: values,
        });
      } else {
        toast.error(
          "Une erreur est survenue lors de l'enregistrement de l'avis.",
        );
      }
    } catch (err) {
      console.error("Erreur soumission formulaire:", err);
      toast.error("Impossible d'envoyer votre avis. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-xl overflow-hidden bg-card/95 backdrop-blur-md">
      {/* Synchronisation continue du brouillon via useWatch sans re-render du formulaire */}
      <SurveyDraftSync control={form.control} step={step} />

      <CardContent className="p-4 sm:p-6 space-y-8">
        {/* Stepper de progression */}
        <SurveyStepper
          currentStep={step}
          onStepClick={(targetStep) => {
            if (targetStep < step) setStep(targetStep);
          }}
        />

        {/* Formulaire à étapes */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              step < 4 &&
              (e.target as HTMLElement).tagName !== "TEXTAREA"
            ) {
              e.preventDefault();
              handleNextStep();
            }
          }}
          className="space-y-8"
        >
          {step === 1 && <StepProfile form={form} disabled={isSubmitting} />}

          {step === 2 && (
            <StepContext
              form={form}
              departments={departments}
              lockedDepartment={lockedDepartment}
              disabled={isSubmitting}
            />
          )}

          {step === 3 && (
            <StepCriteria
              form={form}
              sections={sections}
              disabled={isSubmitting}
            />
          )}

          {step === 4 && (
            <StepSummary
              form={form}
              departments={departments}
              lockedDepartment={lockedDepartment}
              disabled={isSubmitting}
            />
          )}

          {/* Boutons de navigation */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-border/50">
            {step > 1 ? (
              <Button
                key="survey-prev-button"
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="rounded-xl h-11 px-5 border-border/80 hover:bg-muted/50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>Précédent</span>
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                key="survey-next-button"
                type="button"
                onClick={handleNextStep}
                disabled={isSubmitting}
                className="rounded-xl h-11 px-6 font-semibold shadow-md bg-linear-to-r from-primary to-primary/90 hover:opacity-95"
              >
                <span>Continuer</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                key="survey-submit-button"
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl h-11 px-7 font-bold shadow-lg shadow-primary/20 bg-linear-to-r from-primary to-primary/90 hover:opacity-95 text-primary-foreground"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader size="xs" theme="white" />
                    <span>Patientez…</span>
                  </div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Valider & Transmettre mon avis
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
