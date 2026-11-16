import { Suspense } from "react";
import { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { AccessControlView } from "@/components/back-office/settings/access-policy-view";
import { TableSkeleton } from "@/components/data-table";
import { Header } from "@/components/back-office/header";

import {
  requireAccess,
  getPolicies,
} from "@/lib/db/queries/access-control/service";

import { RESOURCE } from "@/lib/config/access.modules";
import { APP_NAME } from "@/lib/constants";
import { buildBreadcrumbs } from "@/lib/helper/breadcrumbs";

export const metadata: Metadata = {
  title: "Gestion des droits d'accès",
  description: `Gouvernance des rôles et matrice des habilitations sur ${APP_NAME}.`,
};

export const instant = false;

async function AccessRightsData() {
  const policies = await getPolicies();
  return <AccessControlView initial={policies} resource={RESOURCE.ACC_RIGHT} />;
}

export default async function AccessRightsPage() {
  const hasAccess = await requireAccess(RESOURCE.ACC_RIGHT, "read");
  if (!hasAccess) return null;

  return (
    <div className="space-y-4">
      <Header
        title="Droits d'Accès & Rôles"
        description="Gérez les profils métiers hospitaliers, configurez la matrice CRUD par module et attribuez des dérogations personnalisées."
        icon={ShieldCheck}
        breadcrumbs={buildBreadcrumbs("Droits d'accès", [
          { label: "Paramètres", href: "/settings" },
        ])}
      />

      <Suspense fallback={<TableSkeleton columnsCount={5} />}>
        <AccessRightsData />
      </Suspense>
    </div>
  );
}
