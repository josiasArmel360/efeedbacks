"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { BarChart3, CheckCircle2, Clock, RotateCcw } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardKPIsData } from "@/lib/db/queries/feedback/service";

const ratingChartConfig = {
  count: {
    label: "Nombre d'avis",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const STAR_COLORS: Record<number, string> = {
  5: "var(--chart-3)",
  4: "var(--chart-1)",
  3: "var(--chart-4)",
  2: "#fb923c",
  1: "var(--chart-5)",
};

interface DashboardDistributionChartProps {
  data: DashboardKPIsData;
}

export const DashboardDistributionChart = ({
  data,
}: DashboardDistributionChartProps) => {
  return (
    <Card className="border-border/60 shadow-2xs py-0 gap-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Distribution des Notes & Flux d&apos;Instruction
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Pyramide de satisfaction (1 à 5 étoiles) et état
              d&apos;avancement.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-5">
        <ChartContainer
          config={ratingChartConfig}
          className="aspect-auto h-46.25 w-full"
        >
          <BarChart
            data={data.ratingDistribution}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <YAxis
              dataKey="rating"
              type="category"
              tickLine={false}
              axisLine={false}
              width={44}
              className="font-mono font-semibold"
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.35 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="count"
              radius={[0, 6, 6, 0]}
              barSize={20}
              isAnimationActive
              animationDuration={950}
              animationEasing="ease-out"
            >
              {data.ratingDistribution.map((entry) => (
                <Cell
                  key={`star-${entry.star}`}
                  fill={STAR_COLORS[entry.star] || "var(--chart-1)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        {/* Synthèse de l'entonnoir de traitement */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-border/50">
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 space-y-1">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="text-[11px] font-semibold">Nouveaux</span>
              <Clock className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-black font-mono text-foreground tabular-nums">
              {data.statusCounts.nouveau}
            </p>
          </div>

          <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 p-3 space-y-1">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
              <span className="text-[11px] font-semibold">En cours</span>
              <RotateCcw className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-black font-mono text-foreground tabular-nums">
              {data.statusCounts.en_cours}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 space-y-1">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-[11px] font-semibold">Traités</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-black font-mono text-foreground tabular-nums">
              {data.statusCounts.traite}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
