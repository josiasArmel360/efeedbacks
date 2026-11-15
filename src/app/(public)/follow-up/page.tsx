import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import {
  FollowUpSkeleton,
  FollowUpView,
} from "@/components/pages/follow-up/follow-up-view";
import { getByCode } from "@/lib/db/server/feedbacks";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Suivi de Dossier",
  description: `Consultez en temps réel l'avancement du traitement de votre avis et les actions correctives engagées sur ${APP_NAME}.`,
};

export const instant = false;

interface FollowUpPageProps {
  searchParams: Promise<{ code?: string }>;
}

async function FollowUpData({ searchParams }: FollowUpPageProps) {
  await connection();
  const params = await searchParams;
  const code = params.code?.trim().toUpperCase() || "";

  const initialFeedback = code ? await getByCode(code) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
      <PublicNavbar />
      <FollowUpView initialCode={code} initialFeedback={initialFeedback} />
      <PublicFooter />
    </div>
  );
}

export default function FollowUpPage({ searchParams }: FollowUpPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <PublicNavbar />
          <FollowUpSkeleton />
          <PublicFooter />
        </div>
      }
    >
      <FollowUpData searchParams={searchParams} />
    </Suspense>
  );
}
