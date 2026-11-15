import { Metadata } from "next";
import { ShieldCheck, HeartPulse, Activity, Sparkles } from "lucide-react";

import { SignInForm } from "@/components/pages/auth/sign-in-form";
import { LeftImageSide } from "@/components/left-image-side";

export const metadata: Metadata = {
  title: "Connexion Administration",
  description: "Portail administratif de traitement des avis sanitaires",
};

export const instant = false;

interface SignInPageProps {
  searchParams: Promise<{ callback?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callback } = await searchParams;

  return (
    <div className="flex min-h-screen bg-background">
      <LeftImageSide
        badge="GOUVERNANCE DE LA QUALITÉ"
        title={"L'écoute au cœur\nde l'excellence médicale"}
        subTitle="Pilotez la satisfaction des patients, écoutez les remarques soignantes et mettez en œuvre des actions correctives concrètes."
        items={[
          {
            icon: HeartPulse,
            title: "Veille & Bientraitance en temps réel",
            description:
              "Réception instantanée des retours des malades et de leurs proches.",
          },
          {
            icon: Activity,
            title: "Alertes automatiques sur notes dégradées",
            description:
              "Priorisation urgente des signalements requérant une investigation immédiate.",
          },
          {
            icon: ShieldCheck,
            title: "Confidentialité & Rigueur Déontologique",
            description:
              "Garantie de l'anonymat des répondants et traçabilité interne des instructions.",
          },
          {
            icon: Sparkles,
            title: "Indicateurs pour Commissions Qualité",
            description:
              "Exports Excel et rapports statistiques prêts pour les revues de direction.",
          },
        ]}
        stats={[
          { value: "100%", label: "Conforme Bientraitance" },
          { value: "24/7", label: "Disponibilité de la plateforme" },
        ]}
      />

      <div className="flex w-full md:flex-1 items-center justify-center p-8 bg-background">
        <SignInForm callback={callback} />
      </div>
    </div>
  );
}
