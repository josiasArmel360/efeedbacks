"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Sparkles, Building2 } from "lucide-react";

import { SurveyForm } from "./survey-form";
import { SurveySuccess } from "./survey-success";
import type { ActorType, Department, SurveySection, Tenant } from "@/lib/types";
import type { SubmitFeedbackPayload } from "@/lib/db/queries/feedback/validator";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface SurveyViewProps {
  tenant?: Pick<
    Tenant,
    "name" | "logo" | "city" | "address" | "phoneNumber"
  > | null;
  departments: Department[];
  sections: SurveySection[];
  lockedDepartment?: Department | null;
  initialActorType?: ActorType;
}

export const SurveyView = ({
  tenant,
  departments,
  sections,
  lockedDepartment,
  initialActorType,
}: SurveyViewProps) => {
  const [submission, setSubmission] = useState<{
    code: string;
    payload: SubmitFeedbackPayload;
  } | null>(null);

  const actorLabelMap: Record<string, string> = {
    malade: "Patient / Usager",
    parent_malade: "Parent / Proche accompagnant",
    personnel_soignant: "Personnel Soignant",
    personnel: "Personnel Administratif & Support",
  };

  return (
    <main className="flex-1 relative overflow-hidden py-8 sm:py-12 md:py-16">
      {/* Trame de fond subtile */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.08),rgba(0,0,0,0))]" />

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-8 sm:space-y-10">
        {/* En-tête Hero si pas encore soumis */}
        {!submission && (
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>DÉMARCHE QUALITÉ & BIENTRAITANCE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-[1.2]">
              Partagez votre retour d'expérience
            </h1>

            {lockedDepartment ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/25">
                <Building2 className="h-4 w-4 shrink-0" />
                <span>
                  Questionnaire ciblé pour le service :{" "}
                  <strong>{lockedDepartment.name}</strong>
                </span>
              </div>
            ) : (
              <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
                Patients, accompagnants ou soignants : vos retours orientent
                concrètement les améliorations de notre établissement. 100%
                libre, anonyme ou nominatif.
              </p>
            )}
          </div>
        )}

        {/* Formulaire ou Écran de succès */}
        {submission ? (
          <SurveySuccess
            code={submission.code}
            actorTypeLabel={
              actorLabelMap[submission.payload.actorType] ||
              submission.payload.actorType
            }
            isAnonymous={submission.payload.isAnonymous}
            authorName={submission.payload.authorName}
            department={
              lockedDepartment ||
              departments.find(
                (d) => d.id === submission.payload.departmentId,
              ) ||
              null
            }
            visitDate={
              submission.payload.visitDate
                ? format(submission.payload.visitDate, "dd/MM/yyyy")
                : null
            }
            overallRating={submission.payload.overallRating}
            recommendation={submission.payload.recommendation}
            tenant={tenant}
          />
        ) : (
          <SurveyForm
            departments={departments}
            sections={sections}
            lockedDepartment={lockedDepartment}
            initialActorType={initialActorType}
            onSuccess={(res) => setSubmission(res)}
          />
        )}
      </div>
    </main>
  );
};

export const SurveySkeleton = () => {
  return (
    <main className="flex-1 py-12">
      <div className="container mx-auto max-w-4xl px-4 space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <Skeleton className="h-6 w-48 mx-auto rounded-full" />
          <Skeleton className="h-10 w-3/4 mx-auto rounded-xl" />
          <Skeleton className="h-4 w-2/3 mx-auto rounded-lg" />
        </div>

        <Card className="border-border/60 shadow-xl overflow-hidden">
          <div className="h-1.5 w-full bg-muted animate-pulse" />
          <CardContent className="p-6 sm:p-10 space-y-8">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
            <div className="space-y-4 pt-4">
              <Skeleton className="h-6 w-1/3 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            </div>
            <div className="flex justify-between pt-6 border-t border-border/50">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
