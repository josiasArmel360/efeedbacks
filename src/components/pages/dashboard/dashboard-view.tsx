"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardKPIs } from "@/lib/db/server/feedbacks";
import {
  buildDashboardKPIsFromFeedbacks,
  type DashboardKPIsData,
} from "@/lib/helper/dashboard-kpis";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

import { DashboardKpis } from "./dashboard-kpis";
import { DashboardTrendChart } from "./dashboard-trend-chart";
import { DashboardActorsChart } from "./dashboard-actors-chart";
import { DashboardDistributionChart } from "./dashboard-distribution-chart";
import { DashboardDepartmentsCard } from "./dashboard-departments-card";
import { DashboardRecentTable } from "./dashboard-recent-table";

type PeriodFilter = "all" | "7d" | "30d" | "90d";

const PERIOD_OPTIONS: { value: PeriodFilter; label: string; days?: number }[] =
  [
    { value: "all", label: "Toute la période" },
    { value: "7d", label: "7 jours", days: 7 },
    { value: "30d", label: "30 jours", days: 30 },
    { value: "90d", label: "90 jours", days: 90 },
  ];

interface DashboardViewProps {
  initialData: DashboardKPIsData;
  users?: User[];
}

export const DashboardView = ({
  initialData,
  users = [],
}: DashboardViewProps) => {
  const [rawData, setRawData] = useState<DashboardKPIsData>(initialData);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [cutoffTimestamp, setCutoffTimestamp] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSelectPeriod = useCallback((nextPeriod: PeriodFilter) => {
    setPeriod(nextPeriod);
    const option = PERIOD_OPTIONS.find((p) => p.value === nextPeriod);
    if (!option?.days) {
      setCutoffTimestamp(null);
    } else {
      setCutoffTimestamp(Date.now() - option.days * 24 * 60 * 60 * 1000);
    }
  }, []);

  const activeData = useMemo(() => {
    if (period === "all" || cutoffTimestamp === null) return rawData;

    const filtered = rawData.allFeedbacks.filter(
      (f) => new Date(f.createdAt).getTime() >= cutoffTimestamp,
    );

    return buildDashboardKPIsFromFeedbacks(filtered);
  }, [rawData, period, cutoffTimestamp]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const fresh = await getDashboardKPIs();
      setRawData(fresh);
      toast.success("Indicateurs du tableau de bord actualisés.");
    } catch {
      toast.error("Impossible d'actualiser les données du tableau de bord.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Barre de contrôle : Filtre temporel & Actualisation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Période d'analyse :</span>
          </div>
          <div className="inline-flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5 flex-wrap">
            {PERIOD_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleSelectPeriod(opt.value)}
                className={cn(
                  "h-7 px-3 text-xs rounded-md font-semibold transition-all",
                  period === opt.value
                    ? "bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 text-xs gap-1.5 font-semibold self-end sm:self-auto"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
          />
          <span>Actualiser les données</span>
        </Button>
      </div>

      {/* 1. Cartes KPIs Exécutifs */}
      <DashboardKpis data={activeData} />

      {/* 2. Courbe d'évolution & Répartition des répondants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardTrendChart
            monthlyTrend={activeData.monthlyTrend}
            dailyTrend={activeData.dailyTrend}
          />
        </div>
        <div className="lg:col-span-1">
          <DashboardActorsChart data={activeData} />
        </div>
      </div>

      {/* 3. Distribution des notes & Palmarès des services hospitaliers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <DashboardDistributionChart data={activeData} />
        </div>
        <div className="lg:col-span-7">
          <DashboardDepartmentsCard
            departmentStats={activeData.departmentStats}
          />
        </div>
      </div>

      {/* 4. Derniers Avis Reçus */}
      <DashboardRecentTable
        recentFeedbacks={activeData.recentFeedbacks}
        users={users}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3">
        <Skeleton className="h-8 w-72 rounded-lg" />
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`dash-kpi-skel-${idx}`}
            className="rounded-xl border border-border/60 bg-card p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-2.5 w-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-90 w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-90 w-full rounded-xl lg:col-span-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="h-85 w-full rounded-xl lg:col-span-5" />
        <Skeleton className="h-85 w-full rounded-xl lg:col-span-7" />
      </div>

      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
};
