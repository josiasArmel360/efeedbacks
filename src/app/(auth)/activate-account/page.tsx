import { Metadata } from "next";
import { Suspense } from "react";
import { ShieldCheck, UserCheck, KeyRound } from "lucide-react";

import { ResetPasswordForm } from "@/components/pages/auth/reset-password-form";
import { LeftImageSide } from "@/components/left-image-side";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Activation de compte ",
  description: "Initialisation et première connexion administrateur",
};

export const instant = false;

interface Props {
  searchParams: Promise<{ token?: string; error?: string }>;
}

function ActivateAccountSkeleton() {
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

export default function ActivateAccountPage({ searchParams }: Props) {
  return (
    <div className="flex min-h-screen">
      <LeftImageSide
        badge="BIENVENUE DANS L'ÉQUIPE"
        title={"Activation de votre accès\nAdministrateur Qualité"}
        subTitle="Un compte vous a été créé pour participer à l'instruction des avis et au suivi de la bientraitance de notre établissement."
        items={[
          {
            icon: UserCheck,
            title: "Rôle attribué",
            description:
              "Bénéficiez des droits d'instruction des avis patients et du personnel soignant.",
          },
          {
            icon: KeyRound,
            title: "Définition de votre clé secrète",
            description:
              "Choisissez un mot de passe personnel pour finaliser l'ouverture de votre compte.",
          },
          {
            icon: ShieldCheck,
            title: "Engagement de confidentialité",
            description:
              "Les informations traitées sont soumises aux exigences légales du secret professionnel hospitalier.",
          },
        ]}
      />

      <div className="flex w-full md:flex-1 items-center justify-center p-8 bg-background">
        <Suspense fallback={<ActivateAccountSkeleton />}>
          <ActivateAccountContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function ActivateAccountContent({ searchParams }: Props) {
  const { token, error } = await searchParams;
  return (
    <ResetPasswordForm
      token={token}
      error={error}
      title="Activation de votre compte"
      description="Définissez votre mot de passe personnel pour commencer à utiliser l'application."
      submitLabel="Activer mon compte & Accéder"
      successTitle="Compte activé avec succès"
      successDescription="Vous pouvez désormais vous connecter avec votre nouveau mot de passe."
    />
  );
}
