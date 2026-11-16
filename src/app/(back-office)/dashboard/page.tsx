import { Suspense } from "react";
import { Metadata } from "next";
import { TrendingUp } from "lucide-react";

import {
  DashboardSkeleton,
  DashboardView,
} from "@/components/back-office/dashboard/dashboard-view";
import { Header } from "@/components/back-office/header";
import { requireAccess } from "@/lib/db/queries/access-control/service";
import { getDashboardKPIs } from "@/lib/db/server/feedbacks";
import { getAll as getAllUsers } from "@/lib/db/queries/user/service";
import { RESOURCE } from "@/lib/config/access.modules";
import { APP_NAME } from "@/lib/constants";
import { buildBreadcrumbs } from "@/lib/helper/breadcrumbs";

export const metadata: Metadata = {
  title: "Tableau de Bord Qualité",
  description: `Tableau de bord de pilotage exécutif et indicateurs de bientraitance sur ${APP_NAME}.`,
};

export const instant = false;

async function DashboardData() {
  const [kpis, users] = await Promise.all([getDashboardKPIs(), getAllUsers()]);

  return <DashboardView initialData={kpis} users={users} />;
}

export default async function DashboardPage() {
  const hasAccess = await requireAccess(RESOURCE.DASHBOARD, "read");
  if (!hasAccess) return null;

  return (
    <div className="space-y-4">
      <Header
        title="Tableau de Bord Qualité"
        description="Vue synthétique des retours d'expérience, baromètres de satisfaction et alertes prioritaires."
        icon={TrendingUp}
        breadcrumbs={buildBreadcrumbs("Tableau de bord")}
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </div>
  );
}
