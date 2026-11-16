import { Suspense } from "react";
import { Metadata } from "next";
import { MessageSquareMore } from "lucide-react";

import { FeedbackView } from "@/components/back-office/feedbacks/feedback-view";
import { FeedbackKpisSkeleton } from "@/components/back-office/feedbacks/feedback-kpis";
import { TableSkeleton } from "@/components/data-table";
import { Header } from "@/components/back-office/header";

import { getAll } from "@/lib/db/server/feedbacks";
import { getAll as getAllDepartments } from "@/lib/db/server/departments";
import { getAll as getAllUsers } from "@/lib/db/queries/user/service";
import { requireAccess } from "@/lib/db/queries/access-control/service";

import { RESOURCE } from "@/lib/config/access.modules";
import { APP_NAME } from "@/lib/constants";
import { buildBreadcrumbs } from "@/lib/helper/breadcrumbs";

export const metadata: Metadata = {
  title: "Avis & Réponses",
  description: `Traitement des retours d'expérience, gestion des priorités et suivi des actions correctives sur ${APP_NAME}.`,
};

export const instant = false;

async function FeedbacksData() {
  const [feedbacks, departments, users] = await Promise.all([
    getAll(),
    getAllDepartments(),
    getAllUsers(),
  ]);

  return (
    <FeedbackView
      initial={feedbacks}
      departments={departments}
      users={users}
      resource={RESOURCE.FEEDBACK}
    />
  );
}

export default async function FeedbacksPage() {
  const hasAccess = await requireAccess(RESOURCE.FEEDBACK, "read");
  if (!hasAccess) return null;

  return (
    <div className="space-y-4">
      <Header
        title="Traitement & Instruction des Avis"
        description="Consultez l'ensemble des retours des patients, proches et personnels, instruisez les signalements prioritaires et consignez les actions correctives."
        icon={MessageSquareMore}
        breadcrumbs={buildBreadcrumbs("Avis & Réponses")}
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            <FeedbackKpisSkeleton />
            <TableSkeleton columnsCount={8} showToolbar />
          </div>
        }
      >
        <FeedbacksData />
      </Suspense>
    </div>
  );
}
