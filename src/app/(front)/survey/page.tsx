import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { PublicNavbar } from "@/components/front/navbar";
import { PublicFooter } from "@/components/front/footer";
import {
  SurveySkeleton,
  SurveyView,
} from "@/components/back-office/survey/survey-view";
import { getOne as getTenant } from "@/lib/db/server/tenants";
import { getActive as getActiveDepartments } from "@/lib/db/server/departments";
import { getPublicSections } from "@/lib/db/server/forms-builder";
import { ACTOR_TYPE, APP_NAME } from "@/lib/constants";
import type { ActorType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Questionnaire de Qualité & Bientraitance",
  description: `Partagez votre avis ou suggestion en toute liberté, de façon 100% anonyme ou nominative sur la plateforme ${APP_NAME}.`,
};

export const instant = false;

interface SurveyPageProps {
  searchParams: Promise<{ actor?: string; service?: string }>;
}

async function SurveyData({ searchParams }: SurveyPageProps) {
  await connection();
  const params = await searchParams;

  const initialActor =
    params.actor && ACTOR_TYPE.includes(params.actor as ActorType)
      ? (params.actor as ActorType)
      : undefined;

  const [tenant, departments, sections] = await Promise.all([
    getTenant(),
    getActiveDepartments(),
    getPublicSections(),
  ]);

  const presetDepartment = params.service
    ? departments.find((d) => d.id === params.service) || null
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
      <PublicNavbar />
      <SurveyView
        tenant={tenant}
        departments={departments}
        sections={sections}
        lockedDepartment={presetDepartment}
        initialActorType={initialActor}
      />
      <PublicFooter />
    </div>
  );
}

export default function SurveyPage({ searchParams }: SurveyPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <PublicNavbar />
          <SurveySkeleton />
          <PublicFooter />
        </div>
      }
    >
      <SurveyData searchParams={searchParams} />
    </Suspense>
  );
}
