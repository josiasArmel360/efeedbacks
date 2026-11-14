import { Metadata } from "next";
import { Suspense } from "react";
import { Lock, ShieldAlert, Smartphone } from "lucide-react";

import { TwoFactorForm } from "@/components/pages/auth/two-factor-form";
import { LeftImageSide } from "@/components/left-image-side";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Double Authentification",
  description: "Validation de sécurité renforcée par code 2FA",
};

export const instant = false;

interface Props {
  searchParams: Promise<{ callback?: string }>;
}

function TwoFactorSkeleton() {
  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <Skeleton className="h-12 w-12 rounded-2xl mx-auto" />
      <Skeleton className="h-7 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <Skeleton className="h-12 w-48 mx-auto rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

export default function TwoFactorPage({ searchParams }: Props) {
  return (
    <div className="flex min-h-screen">
      <LeftImageSide
        badge="SÉCURITÉ RENFORCÉE 2FA"
        title={"Authentification\nà Double Facteur"}
        subTitle="Une couche supplémentaire de protection pour préserver la stricte confidentialité des données de santé et de bientraitance."
        items={[
          {
            icon: Smartphone,
            title: "Code à usage unique",
            description:
              "Ouvrez votre application d'authentification (Google Authenticator, Microsoft Authenticator, etc.).",
          },
          {
            icon: Lock,
            title: "Protection contre les intrusions",
            description:
              "Même en cas de compromission du mot de passe, vos accès restent infranchissables.",
          },
          {
            icon: ShieldAlert,
            title: "Traçabilité des connexions",
            description:
              "Chaque session validée par 2FA est consignée dans le journal d'audit de sécurité.",
          },
        ]}
      />

      <div className="flex w-full md:flex-1 items-center justify-center p-8 bg-background">
        <Suspense fallback={<TwoFactorSkeleton />}>
          <TwoFactorContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function TwoFactorContent({ searchParams }: Props) {
  const { callback } = await searchParams;
  return <TwoFactorForm callback={callback} />;
}
