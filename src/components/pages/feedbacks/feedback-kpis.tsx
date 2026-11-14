"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  RotateCcw,
  Star,
  ThumbsUp,
  Timer,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  formatTreatmentDelay,
  type FeedbackKpis as FeedbackKpisData,
  type FeedbackStatusCounts,
} from "./feedback-helpers";

type KpiTone = "amber" | "blue" | "emerald" | "neutral" | "rose";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: KpiTone;
  active?: boolean;
  onClick?: () => void;
}

const TONE_CLASSES: Record<
  KpiTone,
  { box: string; active: string }
> = {
  amber: {
    box: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    active: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5",
  },
  blue: {
    box: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    active: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5",
  },
  emerald: {
    box: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    active: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5",
  },
  rose: {
    box: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    active: "border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5",
  },
  neutral: {
    box: "bg-muted text-muted-foreground border-border/60",
    active: "border-primary ring-2 ring-primary/20 bg-primary/5",
  },
};

export const KpiCard = ({
  label,
  value,
  sublabel,
  icon: Icon,
  tone,
  active = false,
  onClick,
}: KpiCardProps) => {
  const toneStyle = TONE_CLASSES[tone];
  const baseClassName = cn(
    "rounded-xl border border-border/60 bg-card p-4 text-left transition-all flex items-center justify-between gap-3 shadow-2xs",
    onClick && "cursor-pointer hover:border-border",
    active && toneStyle.active,
  );

  const content = (
    <React.Fragment>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground truncate">
          {label}
        </p>
        <p className="text-2xl font-black text-foreground font-mono mt-0.5">
          {value}
        </p>
        {sublabel && (
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {sublabel}
          </p>
        )}
      </div>
      <div
        className={cn(
          "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs",
          toneStyle.box,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
    </React.Fragment>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={baseClassName}>
        {content}
      </button>
    );
  }

  return <div className={baseClassName}>{content}</div>;
};

interface FeedbackKpisProps {
  statusCounts: FeedbackStatusCounts;
  kpis: FeedbackKpisData;
  activeStatus: string;
  activePriority: string;
  onStatusSelect: (status: string) => void;
  onUrgentToggle: () => void;
}

export const FeedbackKpis = ({
  statusCounts,
  kpis,
  activeStatus,
  activePriority,
  onStatusSelect,
  onUrgentToggle,
}: FeedbackKpisProps) => {
  const isUrgentFilterActive =
    activePriority === "urgente" || activePriority === "haute";

  return (
    <div className="space-y-3.5">
      {/* Ligne 1 : Compteurs de statut cliquables */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          label="Total des avis"
          value={statusCounts.total}
          sublabel="Selon les filtres actifs"
          icon={Inbox}
          tone="neutral"
          active={activeStatus === "all"}
          onClick={() => onStatusSelect("all")}
        />
        <KpiCard
          label="Nouveaux à instruire"
          value={statusCounts.nouveau}
          sublabel="En attente de prise en charge"
          icon={Clock}
          tone="amber"
          active={activeStatus === "nouveau"}
          onClick={() =>
            onStatusSelect(activeStatus === "nouveau" ? "all" : "nouveau")
          }
        />
        <KpiCard
          label="En cours d'examen"
          value={statusCounts.en_cours}
          sublabel="Instruction ouverte"
          icon={RotateCcw}
          tone="blue"
          active={activeStatus === "en_cours"}
          onClick={() =>
            onStatusSelect(activeStatus === "en_cours" ? "all" : "en_cours")
          }
        />
        <KpiCard
          label="Traités & Résolus"
          value={statusCounts.traite}
          sublabel="Dossiers clôturés"
          icon={CheckCircle2}
          tone="emerald"
          active={activeStatus === "traite"}
          onClick={() =>
            onStatusSelect(activeStatus === "traite" ? "all" : "traite")
          }
        />
      </div>

      {/* Ligne 2 : KPI qualité en temps réel sur les lignes affichées */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          label="Note moyenne globale"
          value={kpis.avgRating !== null ? `${kpis.avgRating} / 5` : "—"}
          sublabel={`Sur ${kpis.total} avis affichés`}
          icon={Star}
          tone="amber"
        />
        <KpiCard
          label="Taux de recommandation"
          value={
            kpis.recommendationRate !== null
              ? `${kpis.recommendationRate}%`
              : "—"
          }
          sublabel="Part d'avis favorables (Oui)"
          icon={ThumbsUp}
          tone="emerald"
        />
        <KpiCard
          label="Alertes prioritaires"
          value={kpis.urgentOpen}
          sublabel="Haute / Urgente non traitées"
          icon={AlertTriangle}
          tone="rose"
          active={isUrgentFilterActive}
          onClick={onUrgentToggle}
        />
        <KpiCard
          label="Délai moyen de traitement"
          value={formatTreatmentDelay(kpis.avgTreatmentHours)}
          sublabel="Du dépôt à la clôture"
          icon={Timer}
          tone="blue"
        />
      </div>
    </div>
  );
};

export const FeedbackKpisSkeleton = () => {
  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`kpi-row1-${idx}`}
            className="rounded-xl border border-border/60 bg-card p-4 flex items-center justify-between gap-3"
          >
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-7 w-14" />
              <Skeleton className="h-2.5 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`kpi-row2-${idx}`}
            className="rounded-xl border border-border/60 bg-card p-4 flex items-center justify-between gap-3"
          >
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-2.5 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

