import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import {
  SurveySkeleton,
  SurveyView,
} from "@/components/pages/survey/survey-view";
import { getOne as getTenant } from "@/lib/db/server/tenants";
import {
  getOne as getDepartment,
  getActive as getActiveDepartments,
} from "@/lib/db/server/departments";
import { getPublicSections } from "@/lib/db/server/forms-builder";
import { ACTOR_TYPE, APP_NAME } from "@/lib/constants";
import type { ActorType } from "@/lib/types";

export const instant = false;

interface DepartmentSurveyPageProps {
  params: Promise<{ departmentId: string }>;
  searchParams: Promise<{ actor?: string }>;
}

export async function generateMetadata({
  params,
}: DepartmentSurveyPageProps): Promise<Metadata> {
  const { departmentId } = await params;
  const dept = await getDepartment(departmentId);

  if (!dept || !dept.isActive) {
    return {
      title: "Service introuvable",
    };
  }

  return {
    title: `Avis & Évaluation — ${dept.name}`,
    description: `Partagez votre retour d'expérience sur le service ${dept.name} au sein de ${APP_NAME}.`,
  };
}

async function DepartmentSurveyData({
  params,
  searchParams,
}: DepartmentSurveyPageProps) {
  const { departmentId } = await params;
  const search = await searchParams;

  const department = await getDepartment(departmentId);

  if (!department || !department.isActive) {
    notFound();
  }

  const initialActor =
    search.actor && ACTOR_TYPE.includes(search.actor as ActorType)
      ? (search.actor as ActorType)
      : undefined;

  const [tenant, allDepartments, sections] = await Promise.all([
    getTenant(),
    getActiveDepartments(),
    getPublicSections(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
      <PublicNavbar />
      <SurveyView
        tenant={tenant}
        departments={allDepartments}
        sections={sections}
        lockedDepartment={department}
        initialActorType={initialActor}
      />
      <PublicFooter />
    </div>
  );
}

export default function DepartmentSurveyPage({
  params,
  searchParams,
}: DepartmentSurveyPageProps) {
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
      <DepartmentSurveyData params={params} searchParams={searchParams} />
    </Suspense>
  );
}
