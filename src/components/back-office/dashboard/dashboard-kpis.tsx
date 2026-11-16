"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  MessageSquareCheck,
  ShieldAlert,
  Star,
  ThumbsUp,
  Timer,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatTreatmentDelay } from "@/components/back-office/feedbacks/feedback-helpers";
import type { DashboardKPIsData } from "@/lib/db/queries/feedback/service";
import { cn } from "@/lib/utils";

interface DashboardKpisProps {
  data: DashboardKPIsData;
}

export const DashboardKpis = ({ data }: DashboardKpisProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const anonymousPct =
    data.total > 0 ? Math.round((data.anonymousCount / data.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
      {/* KPI 1 : Satisfaction Moyenne */}
      <Card
        style={{ animationDelay: "0ms" }}
        className="border-border/60 shadow-2xs overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-amber-500/40 animate-in fade-in slide-in-from-bottom-3 fill-mode-both py-0"
      >
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Satisfaction Moyenne
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black font-mono text-foreground tabular-nums">
                  {data.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  / 5
                </span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Star className="h-5 w-5 fill-amber-500/20" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-300",
                    s <= Math.round(data.averageRating)
                      ? "fill-amber-400 text-amber-500 scale-100"
                      : "text-muted-foreground/25 scale-95",
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">
              {data.total} évaluations
            </span>
          </div>
        </CardContent>
      </Card>

      {/* KPI 2 : Total des avis reçus */}
      <Card
        style={{ animationDelay: "60ms" }}
        className="border-border/60 shadow-2xs overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40 animate-in fade-in slide-in-from-bottom-3 fill-mode-both py-0"
      >
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Total des avis reçus
              </span>
              <p className="text-2xl sm:text-3xl font-black font-mono text-foreground tabular-nums">
                {data.total}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <MessageSquareCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{data.anonymousCount} anonymes</span>
              <span>{data.identifiedCount} identifiés</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: mounted ? `${anonymousPct}%` : "0%" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI 3 : Avis à instruire & Taux de résolution */}
      <Card
        style={{ animationDelay: "120ms" }}
        className="border-border/60 shadow-2xs overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-amber-500/40 animate-in fade-in slide-in-from-bottom-3 fill-mode-both py-0"
      >
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Avis à instruire
              </span>
              <p className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                {data.pendingCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{data.treatedCount} traités</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {data.resolutionRate}% résolus
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: mounted ? `${data.resolutionRate}%` : "0%",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI 4 : Alertes Prioritaires */}
      <Card
        style={{ animationDelay: "180ms" }}
        className="border-border/60 shadow-2xs overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-rose-500/40 animate-in fade-in slide-in-from-bottom-3 fill-mode-both py-0"
      >
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Alertes Prioritaires
              </span>
              <p className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                {data.urgentCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
            <span>Haute / Urgente ouvertes</span>
            <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
              {data.lowRatingCount} note(s) ≤ 2/5
            </span>
          </div>
        </CardContent>
      </Card>

      {/* KPI 5 : Taux de Recommandation */}
      <Card
        style={{ animationDelay: "240ms" }}
        className="border-border/60 shadow-2xs overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-500/40 animate-in fade-in slide-in-from-bottom-3 fill-mode-both py-0"
      >
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Recommandation
              </span>
              <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {data.recommendationRate !== null
                  ? `${data.recommendationRate}%`
                  : "—"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ThumbsUp className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{data.recommendationCounts.oui} favorables</span>
              <span>{data.recommendationCounts.mitige} mitigés</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width:
                    mounted && data.recommendationRate !== null
                      ? `${data.recommendationRate}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI 6 : Délai Moyen de Traitement */}
      <Card
        style={{ animationDelay: "300ms" }}
        className="border-border/60 shadow-2xs overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-500/40 animate-in fade-in slide-in-from-bottom-3 fill-mode-both py-0"
      >
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Délai de Traitement
              </span>
              <p className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                {formatTreatmentDelay(data.avgTreatmentHours)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Timer className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
            <span>Du dépôt à la clôture</span>
            <span className="font-mono font-semibold text-foreground">
              {data.statusCounts.en_cours} en cours
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
