"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Copy,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Star,
  UserCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import type { Feedback } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FollowUpTicketCardProps {
  feedback: Feedback;
}

export const FollowUpTicketCard: React.FC<FollowUpTicketCardProps> = ({
  feedback,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(feedback.code);
      setCopied(true);
      toast.success("Code de suivi copié dans le presse-papiers.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le code.");
    }
  };

  const formattedCreatedAt = (() => {
    try {
      return format(new Date(feedback.createdAt), "dd MMM yyyy 'à' HH:mm", {
        locale: fr,
      });
    } catch {
      return "Date inconnue";
    }
  })();

  const hasWrittenFeedback =
    Boolean(feedback.positivePoints) ||
    Boolean(feedback.negativePoints) ||
    Boolean(feedback.suggestions) ||
    Boolean(feedback.answers && feedback.answers.length > 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Carte Récépissé & Synthèse */}
      <Card className="border-border/60 shadow-xs py-0 gap-0 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 bg-muted/25 px-6 py-5">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Récépissé Officiel de Suivi
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xl sm:text-2xl font-black text-primary tracking-wide">
                {feedback.code}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="h-7 px-2.5 text-xs gap-1.5 font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge status={feedback.actorType} size="md" />
            <Badge status={feedback.priority} size="md" />
            <Badge status={feedback.status} size="md" />
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Grille Bento des Métadonnées */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-xl border border-border/50 bg-muted/15 p-3.5 space-y-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                Service concerné
              </span>
              <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                {feedback.department?.name || "Service général / Établissement"}
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/15 p-3.5 space-y-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Date de soumission
              </span>
              <p className="text-xs sm:text-sm font-bold text-foreground font-mono">
                {formattedCreatedAt}
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/15 p-3.5 space-y-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                {feedback.isAnonymous ? (
                  <Lock className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                )}
                Confidentialité
              </span>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                {feedback.isAnonymous
                  ? "Dépôt 100 % Anonyme"
                  : feedback.authorName || "Dépôt Identifié"}
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/15 p-3.5 space-y-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Satisfaction globale
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "h-3.5 w-3.5",
                        s <= Math.round(feedback.overallRating)
                          ? "fill-amber-400 text-amber-500"
                          : "text-muted-foreground/25",
                      )}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs font-black text-foreground">
                  {feedback.overallRating}/5
                </span>
              </div>
            </div>
          </div>

          {/* 2. Encart Réponse Officielle & Actions Correctives */}
          {feedback.correctiveAction ? (
            <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/8 p-5 space-y-2.5">
              <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 shrink-0">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold">
                    Mesures &amp; Actions Correctives de l&apos;Établissement
                  </h4>
                  <p className="text-[11px] opacity-85">
                    Réponse officielle consignée par la Cellule Qualité
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line pl-10">
                {feedback.correctiveAction}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 flex items-start gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0 mt-0.5">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground">
                  {feedback.status === "traite"
                    ? "Votre dossier a été instruit et clôturé"
                    : "Votre avis fait l'objet d'un suivi attentif"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feedback.status === "traite"
                    ? "Votre retour a bien été pris en compte dans nos indicateurs qualité et transmis aux équipes concernées."
                    : "Dès que la cellule qualité aura finalisé l'instruction et consigné les actions correctives, celles-ci apparaîtront directement dans cet espace."}
                </p>
              </div>
            </div>
          )}

          {/* 3. Détails pliables du témoignage soumis */}
          {hasWrittenFeedback && (
            <div className="pt-2 border-t border-border/50 space-y-4">
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="flex items-center justify-between w-full text-left py-1 text-xs font-extrabold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                  <span>Récapitulatif des éléments transmis</span>
                </span>
                {showDetails ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {showDetails && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {feedback.positivePoints && (
                      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          Points positifs soulignés
                        </span>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                          {feedback.positivePoints}
                        </p>
                      </div>
                    )}

                    {feedback.negativePoints && (
                      <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 space-y-1.5">
                        <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400">
                          Points d&apos;insatisfaction
                        </span>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                          {feedback.negativePoints}
                        </p>
                      </div>
                    )}

                    {feedback.suggestions && (
                      <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 p-4 space-y-1.5">
                        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
                          Suggestions d&apos;amélioration
                        </span>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                          {feedback.suggestions}
                        </p>
                      </div>
                    )}
                  </div>

                  {feedback.answers && feedback.answers.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Réponses détaillées au questionnaire (
                        {feedback.answers.length})
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {feedback.answers.map((ans) => (
                          <div
                            key={ans.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background p-3 text-xs"
                          >
                            <span className="font-medium text-muted-foreground">
                              {ans.fieldLabelSnapshot}
                            </span>
                            <span className="font-mono font-bold text-foreground shrink-0">
                              {ans.valueNumber !== null &&
                              ans.valueNumber !== undefined
                                ? `${ans.valueNumber}/5`
                                : ans.valueText || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

