import { Suspense } from "react";
import { Metadata } from "next";
import { MessageSquareText, HelpCircle, Layers } from "lucide-react";

import { TableSkeleton } from "@/components/data-table";
import { Header } from "@/components/header";
import { Tabs } from "@/components/tabs";
import { FormFieldBuilder } from "@/components/pages/hospital-management/form-field-builder";
import { FormSectionBuilder } from "@/components/pages/hospital-management/form-section-builder";

import { getAllSections, getAllFields } from "@/lib/db/server/forms-builder";
import { requireAccess } from "@/lib/db/queries/access-control/service";

import { RESOURCE } from "@/lib/config/access.modules";
import { APP_NAME } from "@/lib/constants";
import { buildBreadcrumbs } from "@/lib/helper/breadcrumbs";

export const metadata: Metadata = {
  title: "Concepteur de Questionnaire",
  description: `Configuration des sections thématiques et des critères d'évaluation qualité sur ${APP_NAME}.`,
};

export const instant = false;

async function FormsBuilderData() {
  const [sections, fields] = await Promise.all([
    getAllSections(),
    getAllFields(),
  ]);

  return (
    <Tabs
      defaultValue="sections"
      tabs={[
        {
          value: "sections",
          label: `Sections Thématiques (${sections.length})`,
          icon: Layers,
          content: (
            <FormSectionBuilder
              initialSections={sections}
              resource={RESOURCE.FORM_BUILDER}
            />
          ),
        },
        {
          value: "fields",
          label: `Questions & Critères (${fields.length})`,
          icon: HelpCircle,
          content: (
            <FormFieldBuilder
              initialFields={fields}
              sections={sections}
              resource={RESOURCE.FORM_BUILDER}
            />
          ),
        },
      ]}
    />
  );
}

export default async function FormsBuilderPage() {
  const hasAccess = await requireAccess(RESOURCE.FORM_BUILDER, "read");
  if (!hasAccess) return null;

  return (
    <div className="space-y-4">
      <Header
        title="Concepteur de Questionnaire"
        description="Structurez les sections thématiques, paramétrez les critères de notation et ciblez les questions selon le profil de l'usager ou du personnel."
        icon={MessageSquareText}
        breadcrumbs={buildBreadcrumbs("Questionnaire", [
          { label: "Gestion Hospitalière", href: "/hospital-management" },
        ])}
      />

      <Suspense
        fallback={<TableSkeleton columnsCount={6} showTabs tabsItems={2} />}
      >
        <FormsBuilderData />
      </Suspense>
    </div>
  );
}
