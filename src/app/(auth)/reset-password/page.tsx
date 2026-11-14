import { Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";

import { ResetPasswordForm } from "@/components/pages/auth/reset-password-form";
import { LeftImageSide } from "@/components/left-image-side";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Réinitialisation de mot de passe",
  description: "Définition d'un nouveau mot de passe administrateur",
};

export const instant = false;

interface Props {
  searchParams: Promise<{ token?: string }>;
}

function ResetPasswordSkeleton() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <Skeleton className="h-12 w-12 rounded-2xl mx-auto" />
        <Skeleton className="h-7 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage({ searchParams }: Props) {
  return (
    <div className="flex min-h-screen">
      <LeftImageSide
        badge="SÉCURITÉ DES ACCÈS"
        title={"Mise à jour de votre\nclé de sécurité"}
        subTitle="Sécurisez votre compte d'encadrement hospitalier avec un mot de passe robuste."
        items={[
          {
            icon: KeyRound,
            title: "Recommandations ANSSI / CNIL",
            description:
              "Au moins 8 caractères, associant majuscules, minuscules, chiffres et caractères spéciaux.",
          },
          {
            icon: ShieldCheck,
            title: "Protection des données de santé",
            description:
              "Un mot de passe unique garantit la confidentialité des avis patients et du personnel.",
          },
          {
            icon: CheckCircle2,
            title: "Validation immédiate",
            description:
              "Dès validation, reconnectez-vous avec vos nouveaux identifiants.",
          },
        ]}
      />

      <div className="flex w-full md:flex-1 items-center justify-center p-8 bg-background">
        <Suspense fallback={<ResetPasswordSkeleton />}>
          <ResetPasswordContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function ResetPasswordContent({ searchParams }: Props) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token} />;
}
