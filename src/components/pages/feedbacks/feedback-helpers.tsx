import { ACTOR_OPTIONS } from "@/components/pages/hospital-management/survey-section-form";
import { ACTOR_LABEL_MAP } from "@/components/pages/hospital-management/forms-builder-helpers";
import type {
  Feedback,
  FeedbackPriority,
  FeedbackStatus,
  Recommendation,
} from "@/lib/types";

export { ACTOR_OPTIONS, ACTOR_LABEL_MAP };

export const FEEDBACK_STATUS_OPTIONS = [
  { value: "nouveau", label: "Nouveau à instruire" },
  { value: "en_cours", label: "En cours d'examen" },
  { value: "traite", label: "Traité & résolu" },
];

export const FEEDBACK_STATUS_LABEL_MAP: Record<FeedbackStatus, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  traite: "Traité",
};

export const FEEDBACK_PRIORITY_OPTIONS = [
  { value: "faible", label: "Priorité faible" },
  { value: "normale", label: "Priorité normale" },
  { value: "haute", label: "Priorité haute" },
  { value: "urgente", label: "Priorité urgente" },
];

export const FEEDBACK_PRIORITY_LABEL_MAP: Record<FeedbackPriority, string> = {
  faible: "Faible",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

export const RECOMMENDATION_LABEL_MAP: Record<Recommendation, string> = {
  oui: "Oui",
  non: "Non",
  mitige: "Mitigé",
};

export interface FeedbackStatusCounts {
  nouveau: number;
  en_cours: number;
  traite: number;
  total: number;
}

export const computeStatusCounts = (
  rows: Feedback[],
): FeedbackStatusCounts => {
  let nouveau = 0;
  let en_cours = 0;
  let traite = 0;

  for (const f of rows) {
    if (f.status === "nouveau") nouveau++;
    else if (f.status === "en_cours") en_cours++;
    else if (f.status === "traite") traite++;
  }

  return { nouveau, en_cours, traite, total: rows.length };
};

export interface FeedbackKpis {
  total: number;
  avgRating: number | null;
  recommendationRate: number | null;
  urgentOpen: number;
  avgTreatmentHours: number | null;
}

export const computeFeedbackKpis = (rows: Feedback[]): FeedbackKpis => {
  const total = rows.length;
  if (total === 0) {
    return {
      total: 0,
      avgRating: null,
      recommendationRate: null,
      urgentOpen: 0,
      avgTreatmentHours: null,
    };
  }

  let ratingSum = 0;
  let recommendationCount = 0;
  let recommendedYes = 0;
  let urgentOpen = 0;
  let treatedWithDatesCount = 0;
  let totalTreatmentHours = 0;

  for (const f of rows) {
    ratingSum += Number(f.overallRating) || 0;

    if (f.recommendation) {
      recommendationCount++;
      if (f.recommendation === "oui") {
        recommendedYes++;
      }
    }

    if (
      (f.priority === "haute" || f.priority === "urgente") &&
      f.status !== "traite"
    ) {
      urgentOpen++;
    }

    if (f.status === "traite" && f.treatedAt && f.createdAt) {
      const start = new Date(f.createdAt).getTime();
      const end = new Date(f.treatedAt).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
        totalTreatmentHours += (end - start) / (1000 * 60 * 60);
        treatedWithDatesCount++;
      }
    }
  }

  return {
    total,
    avgRating: Number((ratingSum / total).toFixed(1)),
    recommendationRate:
      recommendationCount > 0
        ? Math.round((recommendedYes / recommendationCount) * 100)
        : null,
    urgentOpen,
    avgTreatmentHours:
      treatedWithDatesCount > 0
        ? Number((totalTreatmentHours / treatedWithDatesCount).toFixed(1))
        : null,
  };
};

export const formatTreatmentDelay = (hours: number | null): string => {
  if (hours === null) return "—";
  if (hours < 1) return "< 1 h";
  if (hours < 24) return `${Math.round(hours)} h`;
  return `${(hours / 24).toFixed(1)} j`;
};

