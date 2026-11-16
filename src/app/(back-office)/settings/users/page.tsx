import { Suspense } from "react";
import { Metadata } from "next";
import { UsersRound } from "lucide-react";

import { UserView } from "@/components/back-office/settings/user-view";
import { TableSkeleton } from "@/components/data-table";
import { Header } from "@/components/back-office/header";
import {
  requireAccess,
  getPolicies,
} from "@/lib/db/queries/access-control/service";
import { getAll as getAllUsers } from "@/lib/db/queries/user/service";
import { RESOURCE } from "@/lib/config/access.modules";
import { APP_NAME } from "@/lib/constants";
import { buildBreadcrumbs } from "@/lib/helper/breadcrumbs";

export const metadata: Metadata = {
  title: "Gestion des Utilisateurs",
  description: `Gestion des comptes collaborateurs et accès d'encadrement sur ${APP_NAME}.`,
};

export const instant = false;

async function UsersData() {
  const [users, policies] = await Promise.all([getAllUsers(), getPolicies()]);
  return <UserView initial={users} policies={policies} />;
}

export default async function UsersPage() {
  const hasAccess = await requireAccess(RESOURCE.USER, "read");
  if (!hasAccess) return null;

  return (
    <div className="space-y-4">
      <Header
        title="Gestion des Collaborateurs"
        description="Consultez et administrez les comptes des soignants et auditeurs autorisés à instruire les avis et piloter la qualité."
        icon={UsersRound}
        breadcrumbs={buildBreadcrumbs("Utilisateurs", [
          { label: "Paramètres", href: "/settings" },
        ])}
      />

      <Suspense fallback={<TableSkeleton columnsCount={5} showToolbar />}>
        <UsersData />
      </Suspense>
    </div>
  );
}
