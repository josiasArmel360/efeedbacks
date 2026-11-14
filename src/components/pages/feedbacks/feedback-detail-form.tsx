"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  ShieldAlert,
  Star,
  User as UserIcon,
} from "lucide-react";

import { Badge } from "@/components/badge";
import { SelectInput, TextareaInput } from "@/components/inputs";
import {
  ActionsButton,
  CancelButton,
  SubmitButton,
} from "@/components/buttons";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { getOne, update } from "@/lib/db/server/feedbacks";
import {
  FeedbackTreatmentSchema,
  type FeedbackTreatmentData,
} from "@/lib/db/queries/feedback/validator";
import type { Feedback, FeedbackAnswer, FormMode, User } from "@/lib/types";
import {
  FEEDBACK_PRIORITY_OPTIONS,
  FEEDBACK_STATUS_OPTIONS,
} from "./feedback-helpers";

interface FeedbackDetailFormProps {
  mode: FormMode;
  feedback: Feedback;
  users: User[];
  onSuccess?: (mode: FormMode) => void;
  canUpdate?: boolean;
}

export const FeedbackDetailForm = ({
  mode: initialMode,
  feedback,
  users,
  onSuccess,
  canUpdate = true,
}: FeedbackDetailFormProps) => {
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [prevMode, setPrevMode] = useState<FormMode>(initialMode);
  const [isPending, startTransition] = useTransition();

  const [answers, setAnswers] = useState<FeedbackAnswer[]>(
    feedback.answers || [],
  );
  const [loadingAnswers, setLoadingAnswers] = useState<boolean>(
    !feedback.answers,
  );

  if (initialMode !== prevMode) {
    setPrevMode(initialMode);
    setMode(initialMode);
  }

  const isPreviewMode = mode === "preview";

  useEffect(() => {
    let active = true;
    const loadDetail = async () => {
      setLoadingAnswers(true);
      try {
        const full = await getOne(feedback.id);
        if (active && full?.answers) {
          setAnswers(full.answers);
        }
      } catch {
        // Ignore silent fetch error in detail modal
      } finally {
        if (active) setLoadingAnswers(false);
      }
    };

    loadDetail();
    return () => {
      active = false;
    };
  }, [feedback.id]);

  const userOptions = [
    { value: "none", label: "Non assigné" },
    ...users.map((u) => ({
      value: u.id,
      label: `${u.name} (${u.email})`,
    })),
  ];

  const form = useForm<FeedbackTreatmentData>({
    resolver: zodResolver(FeedbackTreatmentSchema),
    defaultValues: {
      status: feedback.status || "nouveau",
      priority: feedback.priority || "normale",
      assignedToUserId: feedback.assignedToUserId || "none",
      internalNotes: feedback.internalNotes || "",
      correctiveAction: feedback.correctiveAction || "",
    },
  });

  const onSubmit = (values: FeedbackTreatmentData) => {
    startTransition(async () => {
      try {
        const result = await update({
          id: feedback.id,
          ...values,
          assignedToUserId:
            values.assignedToUserId === "none" ? null : values.assignedToUserId,
        });

        if (result?.serverError || result?.validationErrors) {
          toast.error(
            result?.serverError ||
              "Une erreur est survenue lors de l'enregistrement de l'instruction.",
          );
          return;
        }

        if (result?.data?.success) {
          toast.success(result.data.message);
          onSuccess?.(mode);
          setMode("preview");
        }
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(err.message || "Une erreur interne est survenue.");
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. Bandeau récapitulatif de l'avis */}
      <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black text-primary">
              {feedback.code}
            </span>
            <Badge status={feedback.actorType} size="sm" />
            <Badge status={feedback.priority} size="sm" />
            <Badge status={feedback.status} size="sm" />
          </div>

          <div className="flex items-center gap-3">
            {feedback.recommendation && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Recommandation :</span>
                <Badge status={feedback.recommendation} size="sm" />
              </div>
            )}
            <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>{feedback.overallRating} / 5</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Métadonnées déposant & service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1.5">
            <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
              Déposant & Confidentialité
            </p>
            {feedback.isAnonymous ? (
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Dépôt anonyme</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <UserIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{feedback.authorName || "Identifié (sans nom)"}</span>
                </div>
                {feedback.authorEmail && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span>{feedback.authorEmail}</span>
                  </div>
                )}
                {feedback.authorPhone && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{feedback.authorPhone}</span>
                  </div>
                )}
              </div>
            )}
            {feedback.authorRoleOrRoom && (
              <p className="text-muted-foreground">
                Chambre / Fonction :{" "}
                <span className="font-medium text-foreground">
                  {feedback.authorRoleOrRoom}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
              Contexte hospitalier
            </p>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{feedback.department?.name || "Service non spécifié"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                Déposé le{" "}
                {format(new Date(feedback.createdAt), "dd MMM yyyy à HH:mm", {
                  locale: fr,
                })}
              </span>
            </div>
            {feedback.visitDate && (
              <p className="text-muted-foreground">
                Date de visite :{" "}
                <span className="font-medium text-foreground">
                  {feedback.visitDate}
                </span>
              </p>
            )}
            {feedback.treatedAt && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Traité le{" "}
                  {format(new Date(feedback.treatedAt), "dd MMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Expression libre (Points forts, Points faibles, Suggestions) */}
      {(feedback.positivePoints ||
        feedback.negativePoints ||
        feedback.suggestions) && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            Expression libre de l&apos;usager
          </h4>
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            {feedback.positivePoints && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  Points forts appréciés
                </p>
                <p className="text-foreground whitespace-pre-line">
                  {feedback.positivePoints}
                </p>
              </div>
            )}
            {feedback.negativePoints && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                <p className="font-semibold text-rose-700 dark:text-rose-400 mb-1">
                  Points faibles / Dysfonctionnements signalés
                </p>
                <p className="text-foreground whitespace-pre-line">
                  {feedback.negativePoints}
                </p>
              </div>
            )}
            {feedback.suggestions && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  Suggestions d&apos;amélioration
                </p>
                <p className="text-foreground whitespace-pre-line">
                  {feedback.suggestions}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Réponses détaillées au questionnaire dynamique */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ClipboardCheck className="h-3.5 w-3.5 text-primary" />
          Réponses aux critères du questionnaire
        </h4>

        {loadingAnswers ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ) : answers.length === 0 ? (
          <p className="text-xs text-muted-foreground italic rounded-lg border border-dashed p-3">
            Aucune réponse spécifique aux critères enregistrée pour cet avis.
          </p>
        ) : (
          <div className="rounded-lg border divide-y text-xs">
            {answers.map((ans) => (
              <div
                key={ans.id}
                className="flex items-center justify-between gap-4 px-3 py-2.5"
              >
                <span className="font-medium text-foreground">
                  {ans.fieldLabelSnapshot}
                </span>
                <span className="font-mono font-semibold text-primary shrink-0">
                  {ans.valueNumber !== null && ans.valueNumber !== undefined
                    ? `${ans.valueNumber} / 5`
                    : ans.valueText || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* 4. Formulaire d'instruction & suivi qualité */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          Instruction & Suivi Qualité
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectInput
            control={form.control}
            name="status"
            label="Statut de traitement"
            options={FEEDBACK_STATUS_OPTIONS}
            disabled={isPreviewMode || isPending}
            required
          />

          <SelectInput
            control={form.control}
            name="priority"
            label="Niveau de priorité"
            options={FEEDBACK_PRIORITY_OPTIONS}
            disabled={isPreviewMode || isPending}
            required
          />

          <SelectInput
            control={form.control}
            name="assignedToUserId"
            label="Responsable assigné"
            options={userOptions}
            disabled={isPreviewMode || isPending}
          />
        </div>

        <TextareaInput
          control={form.control}
          name="internalNotes"
          label="Notes d'instruction internes"
          placeholder="Observations de l'équipe qualité, éléments d'enquête interne..."
          disabled={isPreviewMode || isPending}
        />

        <TextareaInput
          control={form.control}
          name="correctiveAction"
          label="Action corrective engagée"
          placeholder="Mesures correctives prises ou planifiées suite à cet avis..."
          disabled={isPreviewMode || isPending}
        />

        {isPreviewMode ? (
          <ActionsButton
            variant="secondary"
            icon="Pencil"
            onClick={() => setMode("update")}
            label="Instruire / Mettre à jour le dossier"
            className="w-full"
            hasAccess={canUpdate}
            size="lg"
          />
        ) : (
          <div className="flex gap-4">
            <CancelButton
              onClick={() => {
                form.reset();
                setMode("preview");
              }}
            />
            <SubmitButton isLoading={isPending} className="flex-1">
              Enregistrer l'instruction
            </SubmitButton>
          </div>
        )}
      </form>
    </div>
  );
};
