import { Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle2, ShieldCheck, Activity } from "lucide-react";

import { EmailVerifiedView } from "@/components/auth/email-verified-view";
import { LeftImageSide } from "@/components/auth/left-image-side";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Confirmation d'email",
  description: "Statut de la vérification de votre adresse email",
};

export const instant = false;

interface Props {
  searchParams: Promise<{ error?: string; token?: string }>;
}

function EmailVerifiedSkeleton() {
  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <Skeleton className="h-14 w-14 rounded-2xl mx-auto" />
      <Skeleton className="h-7 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

export default function EmailVerifiedPage({ searchParams }: Props) {
  return (
    <div className="flex min-h-screen">
      <LeftImageSide
        badge="VALIDATION DE COMPTE"
        title={"Authentification de\nvotre identité médicale"}
        subTitle="Votre adresse email certifie votre rattachement à la direction qualité et aux instances soignantes de l'établissement."
        items={[
          {
            icon: CheckCircle2,
            title: "Validation automatique",
            description:
              "Votre jeton de certification est traité avec succès par le serveur d'authentification.",
          },
          {
            icon: Activity,
            title: "Accès complet aux retours",
            description:
              "Consultez les questionnaires remplis par les usagers et pilotez les plans d'action.",
          },
          {
            icon: ShieldCheck,
            title: "Gouvernance sécurisée",
            description:
              "Vos accès sont protégés conformément aux politiques de sécurité de votre établissement.",
          },
        ]}
      />

      <div className="flex w-full md:flex-1 items-center justify-center p-8 bg-background">
        <Suspense fallback={<EmailVerifiedSkeleton />}>
          <EmailVerifiedContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function EmailVerifiedContent({ searchParams }: Props) {
  const { error, token } = await searchParams;
  return <EmailVerifiedView error={error} token={token} />;
}
