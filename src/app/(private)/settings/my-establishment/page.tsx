import { Suspense } from "react";
import { Metadata } from "next";
import { Hospital } from "lucide-react";

import {
  EstablishmentSkeleton,
  EstablishmentView,
} from "@/components/pages/settings/establishment-view";
import { Header } from "@/components/header";

import { getOne } from "@/lib/db/server/tenants";
import { requireAccess } from "@/lib/db/queries/access-control/service";

import { RESOURCE } from "@/lib/config/access.modules";
import { APP_NAME } from "@/lib/constants";
import { buildBreadcrumbs } from "@/lib/helper/breadcrumbs";

export const metadata: Metadata = {
  title: "Mon Établissement",
  description: `Configuration de l'identité, du logo et des coordonnées officielles de l'établissement sur ${APP_NAME}.`,
};

export const instant = false;

async function EstablishmentData() {
  const tenant = await getOne();
  return (
    <EstablishmentView initialTenant={tenant} resource={RESOURCE.SETTING} />
  );
}

export default async function MyEstablishmentPage() {
  const hasAccess = await requireAccess(RESOURCE.SETTING, "read");
  if (!hasAccess) return null;

  return (
    <div className="space-y-4">
      <Header
        title="Profil & Identité de l'Établissement"
        description="Gérez dynamiquement le nom officiel, le logo et les coordonnées de votre établissement affichés sur les questionnaires et supports qualité."
        icon={Hospital}
        breadcrumbs={buildBreadcrumbs("Mon établissement", [
          { label: "Paramètres", href: "/settings" },
        ])}
      />

      <Suspense fallback={<EstablishmentSkeleton />}>
        <EstablishmentData />
      </Suspense>
    </div>
  );
}
