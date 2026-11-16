import { Suspense } from "react";
import { Metadata } from "next";
import { Building2 } from "lucide-react";

import { DepartmentView } from "@/components/back-office/hospital-management/department-view";
import { TableSkeleton } from "@/components/data-table";
import { Header } from "@/components/back-office/header";

import { getAll } from "@/lib/db/server/departments";
import { requireAccess } from "@/lib/db/queries/access-control/service";

import { RESOURCE } from "@/lib/config/access.modules";
import { APP_NAME } from "@/lib/constants";
import { buildBreadcrumbs } from "@/lib/helper/breadcrumbs";

export const metadata: Metadata = {
  title: "Services & Pôles Hospitaliers",
  description: `Cartographie et gestion des départements et pôles de soins sur ${APP_NAME}.`,
};

export const instant = false;

async function DepartmentsData() {
  const departments = await getAll();
  return (
    <DepartmentView initial={departments} resource={RESOURCE.DEPARTMENT} />
  );
}

export default async function DepartmentsPage() {
  const hasAccess = await requireAccess(RESOURCE.DEPARTMENT, "read");
  if (!hasAccess) return null;

  return (
    <div className="space-y-4">
      <Header
        title="Services & Pôles Hospitaliers"
        description="Cartographie des services hospitaliers, gestion de l'ordre d'affichage dans les questionnaires publics et statut de disponibilité."
        icon={Building2}
        breadcrumbs={buildBreadcrumbs("Services & Pôles", [
          { label: "Gestion Hospitalière", href: "/hospital-management" },
        ])}
      />

      <Suspense fallback={<TableSkeleton columnsCount={5} />}>
        <DepartmentsData />
      </Suspense>
    </div>
  );
}
