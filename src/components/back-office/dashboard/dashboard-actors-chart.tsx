"use client";

import React, { useEffect, useState } from "react";
import { Label, Pie, PieChart } from "recharts";
import { Users } from "lucide-react";

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

const actorsChartConfig = {
  malade: {
    label: "Malades / Patients",
    color: "var(--chart-1)",
  },
  parent_malade: {
    label: "Parents / Proches",
    color: "var(--chart-2)",
  },
  personnel_soignant: {
    label: "Personnel soignant",
    color: "var(--chart-3)",
  },
  personnel: {
    label: "Personnel administratif",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

interface DashboardActorsChartProps {
  data: DashboardKPIsData;
}

export const DashboardActorsChart = ({ data }: DashboardActorsChartProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const totalActors =
    data.actorCounts.malade +
    data.actorCounts.parent_malade +
    data.actorCounts.personnel_soignant +
    data.actorCounts.personnel;

  const safeTotal = totalActors || 1;

  const actorRows = [
    {
      key: "malade",
      label: "Malades / Patients",
      count: data.actorCounts.malade,
      pct: Math.round((data.actorCounts.malade / safeTotal) * 100),
      dotClass: "bg-(--chart-1)",
      barClass: "bg-(--chart-1)",
      fill: "var(--color-malade)",
    },
    {
      key: "parent_malade",
      label: "Parents / Proches",
      count: data.actorCounts.parent_malade,
      pct: Math.round((data.actorCounts.parent_malade / safeTotal) * 100),
      dotClass: "bg-(--chart-2)",
      barClass: "bg-(--chart-2)",
      fill: "var(--color-parent_malade)",
    },
    {
      key: "personnel_soignant",
      label: "Personnel soignant",
      count: data.actorCounts.personnel_soignant,
      pct: Math.round((data.actorCounts.personnel_soignant / safeTotal) * 100),
      dotClass: "bg-(--chart-3)",
      barClass: "bg-(--chart-3)",
      fill: "var(--color-personnel_soignant)",
    },
    {
      key: "personnel",
      label: "Autre personnel",
      count: data.actorCounts.personnel,
      pct: Math.round((data.actorCounts.personnel / safeTotal) * 100),
      dotClass: "bg-(--chart-4)",
      barClass: "bg-(--chart-4)",
      fill: "var(--color-personnel)",
    },
  ];

  const pieData =
    totalActors > 0
      ? actorRows.map((r) => ({
          actor: r.key,
          count: r.count,
          fill: r.fill,
        }))
      : [
          {
            actor: "malade",
            count: 1,
            fill: "var(--muted)",
          },
        ];

  return (
    <Card className="border-border/60 shadow-2xs py-0 gap-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Répartition des Répondants
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Proportion de chaque catégorie d&apos;acteur.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-5">
        <ChartContainer
          config={actorsChartConfig}
          className="mx-auto aspect-square max-h-[190px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="actor" />}
            />
            <Pie
              data={pieData}
              dataKey="count"
              nameKey="actor"
              innerRadius={56}
              outerRadius={80}
              strokeWidth={3}
              paddingAngle={totalActors > 0 ? 3 : 0}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-black font-mono"
                        >
                          {totalActors}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className="fill-muted-foreground text-[11px] font-medium"
                        >
                          Répondants
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="space-y-3">
          {actorRows.map((item) => (
            <div key={item.key} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-foreground">
                  <span
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.dotClass}`}
                  />
                  {item.label}
                </span>
                <span className="text-muted-foreground font-mono">
                  {totalActors > 0 ? `${item.pct}%` : "0%"} ({item.count})
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${item.barClass}`}
                  style={{
                    width: mounted && totalActors > 0 ? `${item.pct}%` : "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
