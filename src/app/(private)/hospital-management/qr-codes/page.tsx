import { Suspense } from "react";
import { Metadata } from "next";
import { QrCode } from "lucide-react";

import { QrCodesView } from "@/components/pages/hospital-management/qr-codes-view";
import { TableSkeleton } from "@/components/data-table";
import { Header } from "@/components/header";

import { requireAccess } from "@/lib/db/queries/access-control/service";
import { getOne as getTenant } from "@/lib/db/server/tenants";
import { getAll as getAllDepartments } from "@/lib/db/server/departments";

import { RESOURCE } from "@/lib/config/access.modules";
import { APP_NAME } from "@/lib/constants";
import { buildBreadcrumbs } from "@/lib/helper/breadcrumbs";

export const metadata: Metadata = {
  title: "Générateur de QR Codes",
  description: `Génération et impression des affiches QR code par service sur ${APP_NAME}.`,
};

export const instant = false;

async function QrCodesData() {
  const [tenant, departments] = await Promise.all([
    getTenant(),
    getAllDepartments(),
  ]);

  const rawBaseUrl =
    (process.env.NEXT_PUBLIC_APP_URL as string) || "http://localhost:3000";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  return (
    <QrCodesView
      tenant={tenant}
      departments={departments}
      baseUrl={baseUrl}
      resource={RESOURCE.QR_CODES}
    />
  );
}

export default async function QrCodesPage() {
  const hasAccess = await requireAccess(RESOURCE.QR_CODES, "read");
  if (!hasAccess) return null;

  return (
    <div className="space-y-4">
      <div className="print:hidden">
        <Header
          title="Générateur de QR Codes Sanitaires"
          description="Générez et imprimez des fiches QR code prêtes à afficher en chambre, en salle d'attente ou aux comptoirs d'accueil."
          icon={QrCode}
          breadcrumbs={buildBreadcrumbs("QR Codes & Affichage", [
            { label: "Gestion Hospitalière", href: "/hospital-management" },
          ])}
        />
      </div>

      <Suspense fallback={<TableSkeleton columnsCount={4} />}>
        <QrCodesData />
      </Suspense>
    </div>
  );
}
