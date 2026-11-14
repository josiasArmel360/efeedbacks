"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  Building2,
  ListOrdered,
  Star,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardDepartmentStat } from "@/lib/db/queries/feedback/service";
import { cn } from "@/lib/utils";

const deptChartConfig = {
  count: {
    label: "Volume d'avis",
    color: "var(--chart-1)",
  },
  avgRating: {
    label: "Note moyenne (/5)",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

interface DashboardDepartmentsCardProps {
  departmentStats: DashboardDepartmentStat[];
}

export const DashboardDepartmentsCard = ({
  departmentStats,
}: DashboardDepartmentsCardProps) => {
  const [viewMode, setViewMode] = useState<"list" | "chart">("list");

  const chartData = departmentStats.slice(0, 7).map((d) => ({
    name: d.name.length > 20 ? `${d.name.slice(0, 18)}…` : d.name,
    fullName: d.name,
    count: d.count,
    avgRating: d.avgRating,
  }));

  return (
    <Card className="border-border/60 shadow-2xs py-0 gap-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Satisfaction par Service Hospitalier
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Scores moyens, volumes d&apos;avis et alertes par unité de soin.
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {departmentStats.length > 0 && (
            <div className="inline-flex items-center rounded-lg border border-border/60 bg-background p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-7 px-2 text-xs rounded-md gap-1 font-semibold",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ListOrdered className="h-3.5 w-3.5" />
                Palmarès
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("chart")}
                className={cn(
                  "h-7 px-2 text-xs rounded-md gap-1 font-semibold",
                  viewMode === "chart"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <BarChart2 className="h-3.5 w-3.5" />
                Graphique
              </Button>
            </div>
          )}

          <Link href="/hospital-management/departments">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <span>Services</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        {departmentStats.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Aucune donnée par service enregistrée pour le moment.
          </div>
        ) : viewMode === "chart" ? (
          <ChartContainer
            config={deptChartConfig}
            className="aspect-auto h-67.5 w-full"
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={125}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[0, 6, 6, 0]}
                barSize={18}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="space-y-2.5 max-h-67.5 overflow-y-auto pr-1">
            {departmentStats.map((serv, idx) => {
              const ratingPct = Math.round((serv.avgRating / 5) * 100);
              return (
                <div
                  key={serv.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-muted/15 hover:bg-muted/35 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-black font-mono text-primary">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground truncate">
                          {serv.name}
                        </span>
                        {serv.urgentCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="h-3 w-3" />
                            {serv.urgentCount}
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 w-full max-w-50 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            serv.avgRating >= 4
                              ? "bg-emerald-500"
                              : serv.avgRating >= 3
                                ? "bg-amber-500"
                                : "bg-rose-500",
                          )}
                          style={{ width: `${ratingPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="block font-mono font-semibold text-foreground text-[11px]">
                        {serv.count} avis
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {serv.treatedCount} traités
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-bold font-mono text-foreground bg-background px-2.5 py-1 rounded-lg border border-border/60 shadow-2xs">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      <span>{serv.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
