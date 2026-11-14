import type { Feedback } from "@/lib/types";

export interface DashboardDepartmentStat {
  id: string;
  name: string;
  count: number;
  avgRating: number;
  urgentCount: number;
  treatedCount: number;
}

export interface DashboardTrendPoint {
  key: string;
  label: string;
  received: number;
  treated: number;
  avgRating: number;
}

export interface DashboardRatingPoint {
  star: number;
  rating: string;
  count: number;
  percentage: number;
}

export interface DashboardKPIsData {
  total: number;
  averageRating: number;
  pendingCount: number;
  urgentCount: number;
  lowRatingCount: number;
  treatedCount: number;
  resolutionRate: number;
  anonymousCount: number;
  identifiedCount: number;
  recommendationRate: number | null;
  avgTreatmentHours: number | null;
  actorCounts: {
    malade: number;
    parent_malade: number;
    personnel_soignant: number;
    personnel: number;
  };
  statusCounts: {
    nouveau: number;
    en_cours: number;
    traite: number;
  };
  priorityCounts: {
    faible: number;
    normale: number;
    haute: number;
    urgente: number;
  };
  recommendationCounts: {
    oui: number;
    mitige: number;
    non: number;
  };
  ratingDistribution: DashboardRatingPoint[];
  monthlyTrend: DashboardTrendPoint[];
  dailyTrend: DashboardTrendPoint[];
  departmentStats: DashboardDepartmentStat[];
  recentFeedbacks: Feedback[];
  allFeedbacks: Feedback[];
}

const MONTH_LABELS_FR = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

export function buildDashboardKPIsFromFeedbacks(
  items: Feedback[],
): DashboardKPIsData {
  const total = items.length;

  const actorCounts = {
    malade: 0,
    parent_malade: 0,
    personnel_soignant: 0,
    personnel: 0,
  };

  const statusCounts = {
    nouveau: 0,
    en_cours: 0,
    traite: 0,
  };

  const priorityCounts = {
    faible: 0,
    normale: 0,
    haute: 0,
    urgente: 0,
  };

  const recommendationCounts = {
    oui: 0,
    mitige: 0,
    non: 0,
  };

  const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  let ratingSum = 0;
  let anonymousCount = 0;
  let identifiedCount = 0;
  let urgentCount = 0;
  let lowRatingCount = 0;
  let treatedWithDatesCount = 0;
  let totalTreatmentHours = 0;

  const deptMap = new Map<
    string,
    {
      id: string;
      name: string;
      count: number;
      ratingSum: number;
      urgentCount: number;
      treatedCount: number;
    }
  >();

  for (const f of items) {
    const rating = Math.min(
      5,
      Math.max(1, Math.round(Number(f.overallRating) || 5)),
    );
    ratingSum += Number(f.overallRating) || 0;
    starCounts[rating] = (starCounts[rating] || 0) + 1;

    if (rating <= 2) {
      lowRatingCount++;
    }

    if (f.isAnonymous) {
      anonymousCount++;
    } else {
      identifiedCount++;
    }

    if (f.actorType in actorCounts) {
      actorCounts[f.actorType as keyof typeof actorCounts]++;
    }

    if (f.status in statusCounts) {
      statusCounts[f.status as keyof typeof statusCounts]++;
    }

    if (f.priority in priorityCounts) {
      priorityCounts[f.priority as keyof typeof priorityCounts]++;
    }

    if (
      (f.priority === "haute" || f.priority === "urgente") &&
      f.status !== "traite"
    ) {
      urgentCount++;
    }

    if (f.recommendation && f.recommendation in recommendationCounts) {
      recommendationCounts[
        f.recommendation as keyof typeof recommendationCounts
      ]++;
    }

    if (f.status === "traite" && f.treatedAt && f.createdAt) {
      const start = new Date(f.createdAt).getTime();
      const end = new Date(f.treatedAt).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
        totalTreatmentHours += (end - start) / (1000 * 60 * 60);
        treatedWithDatesCount++;
      }
    }

    const deptId = f.department?.id || f.departmentId || "general";
    const deptName = f.department?.name || "Service général / Non spécifié";
    const existingDept = deptMap.get(deptId) || {
      id: deptId,
      name: deptName,
      count: 0,
      ratingSum: 0,
      urgentCount: 0,
      treatedCount: 0,
    };

    existingDept.count++;
    existingDept.ratingSum += Number(f.overallRating) || 0;
    if (
      (f.priority === "haute" || f.priority === "urgente") &&
      f.status !== "traite"
    ) {
      existingDept.urgentCount++;
    }
    if (f.status === "traite") {
      existingDept.treatedCount++;
    }
    deptMap.set(deptId, existingDept);
  }

  const averageRating = total > 0 ? Number((ratingSum / total).toFixed(1)) : 0;
  const pendingCount = statusCounts.nouveau + statusCounts.en_cours;
  const treatedCount = statusCounts.traite;
  const resolutionRate =
    total > 0 ? Math.round((treatedCount / total) * 100) : 0;

  const totalRecommendations =
    recommendationCounts.oui +
    recommendationCounts.mitige +
    recommendationCounts.non;

  const recommendationRate =
    totalRecommendations > 0
      ? Math.round((recommendationCounts.oui / totalRecommendations) * 100)
      : null;

  const avgTreatmentHours =
    treatedWithDatesCount > 0
      ? Number((totalTreatmentHours / treatedWithDatesCount).toFixed(1))
      : null;

  const ratingDistribution: DashboardRatingPoint[] = [5, 4, 3, 2, 1].map(
    (star) => ({
      star,
      rating: `${star} ★`,
      count: starCounts[star] || 0,
      percentage:
        total > 0 ? Math.round(((starCounts[star] || 0) / total) * 100) : 0,
    }),
  );

  // Série mensuelle sur les 6 derniers mois
  const now = new Date();
  const monthlyBuckets = new Map<
    string,
    { label: string; received: number; treated: number; ratingSum: number }
  >();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${MONTH_LABELS_FR[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
    monthlyBuckets.set(key, { label, received: 0, treated: 0, ratingSum: 0 });
  }

  // Série quotidienne sur les 14 derniers jours
  const dailyBuckets = new Map<
    string,
    { label: string; received: number; treated: number; ratingSum: number }
  >();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    dailyBuckets.set(key, { label, received: 0, treated: 0, ratingSum: 0 });
  }

  for (const f of items) {
    const created = new Date(f.createdAt);
    if (!Number.isNaN(created.getTime())) {
      const mKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
      const mBucket = monthlyBuckets.get(mKey);
      if (mBucket) {
        mBucket.received++;
        if (f.status === "traite") mBucket.treated++;
        mBucket.ratingSum += Number(f.overallRating) || 0;
      }

      const dKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}-${String(created.getDate()).padStart(2, "0")}`;
      const dBucket = dailyBuckets.get(dKey);
      if (dBucket) {
        dBucket.received++;
        if (f.status === "traite") dBucket.treated++;
        dBucket.ratingSum += Number(f.overallRating) || 0;
      }
    }
  }

  const monthlyTrend: DashboardTrendPoint[] = Array.from(
    monthlyBuckets.entries(),
  ).map(([key, b]) => ({
    key,
    label: b.label,
    received: b.received,
    treated: b.treated,
    avgRating:
      b.received > 0 ? Number((b.ratingSum / b.received).toFixed(1)) : 0,
  }));

  const dailyTrend: DashboardTrendPoint[] = Array.from(
    dailyBuckets.entries(),
  ).map(([key, b]) => ({
    key,
    label: b.label,
    received: b.received,
    treated: b.treated,
    avgRating:
      b.received > 0 ? Number((b.ratingSum / b.received).toFixed(1)) : 0,
  }));

  const departmentStats: DashboardDepartmentStat[] = Array.from(
    deptMap.values(),
  )
    .map((d) => ({
      id: d.id,
      name: d.name,
      count: d.count,
      avgRating: d.count > 0 ? Number((d.ratingSum / d.count).toFixed(1)) : 0,
      urgentCount: d.urgentCount,
      treatedCount: d.treatedCount,
    }))
    .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating);

  return {
    total,
    averageRating,
    pendingCount,
    urgentCount,
    lowRatingCount,
    treatedCount,
    resolutionRate,
    anonymousCount,
    identifiedCount,
    recommendationRate,
    avgTreatmentHours,
    actorCounts,
    statusCounts,
    priorityCounts,
    recommendationCounts,
    ratingDistribution,
    monthlyTrend,
    dailyTrend,
    departmentStats,
    recentFeedbacks: items.slice(0, 8),
    allFeedbacks: items,
  };
}

