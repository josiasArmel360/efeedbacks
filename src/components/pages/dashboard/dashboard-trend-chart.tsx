"use client";

import React, { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardTrendPoint } from "@/lib/db/queries/feedback/service";
import { cn } from "@/lib/utils";

const trendChartConfig = {
  received: {
    label: "Avis reçus",
    color: "var(--chart-1)",
  },
  treated: {
    label: "Avis traités",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

interface DashboardTrendChartProps {
  monthlyTrend: DashboardTrendPoint[];
  dailyTrend: DashboardTrendPoint[];
}

export const DashboardTrendChart = ({
  monthlyTrend,
  dailyTrend,
}: DashboardTrendChartProps) => {
  const [scale, setScale] = useState<"monthly" | "daily">("monthly");
  const series = scale === "monthly" ? monthlyTrend : dailyTrend;

  return (
    <Card className="border-border/60 shadow-2xs py-0 gap-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Dynamique des Retours & Résolutions
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Comparaison du flux d&apos;avis déposés et des dossiers clôturés.
            </CardDescription>
          </div>
        </div>

        <div className="inline-flex items-center rounded-lg border border-border/60 bg-background p-0.5 self-start sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setScale("monthly")}
            className={cn(
              "h-7 px-2.5 text-xs rounded-md font-semibold transition-all",
              scale === "monthly"
                ? "bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            6 derniers mois
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setScale("daily")}
            className={cn(
              "h-7 px-2.5 text-xs rounded-md font-semibold transition-all",
              scale === "daily"
                ? "bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            14 derniers jours
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        <ChartContainer
          config={trendChartConfig}
          className="aspect-auto h-[270px] w-full"
        >
          <AreaChart
            key={scale}
            data={series}
            margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillReceived" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-received)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-received)"
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="fillTreated" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-treated)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-treated)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />

            <Area
              dataKey="received"
              type="monotone"
              fill="url(#fillReceived)"
              stroke="var(--color-received)"
              strokeWidth={2.5}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
            <Area
              dataKey="treated"
              type="monotone"
              fill="url(#fillTreated)"
              stroke="var(--color-treated)"
              strokeWidth={2.5}
              isAnimationActive
              animationDuration={1100}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

