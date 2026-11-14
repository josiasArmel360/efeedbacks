import { Metadata } from "next";
import { CheckCircle2, Mail, ShieldCheck, Activity } from "lucide-react";

import { LeftImageSide } from "@/components/left-image-side";
import { VerifyEmailForm } from "@/components/pages/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Vérification d'e-mail",
  description: "Confirmation d'adresse de messagerie professionnelle",
};

export const instant = false;

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen">
      <LeftImageSide
        badge="CERTIFICATION DU COMPTE"
        title={"Vérifiez votre adresse\ne-mail professionnelle"}
        subTitle="Cette confirmation garantit la légitimité des notifications et des alertes sanitaires urgentes adressées à votre service."
        items={[
          {
            icon: Mail,
            title: "Lien de vérification expédié",
            description:
              "Consultez votre messagerie professionnelle et suivez les instructions transmises.",
          },
          {
            icon: CheckCircle2,
            title: "Activation en un clic",
            description:
              "Cliquez sur le lien certifié pour valider sans délai votre adresse.",
          },
          {
            icon: Activity,
            title: "Réception des alertes critiques",
            description:
              "Assurez-vous de recevoir en temps réel les signalements de notes dégradées requérant votre attention.",
          },
        ]}
        banner={{
          icon: ShieldCheck,
          title: "Confiance & Déontologie",
          description:
            "La vérification de chaque adresse contribue au respect scrupuleux du secret médical et à la protection des données.",
        }}
      />

      <div className="flex w-full md:flex-1 items-center justify-center p-8 bg-background">
        <VerifyEmailForm />
      </div>
    </div>
  );
}
