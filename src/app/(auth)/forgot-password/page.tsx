import { Metadata } from "next";
import { CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { LeftImageSide } from "@/components/auth/left-image-side";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisation sécurisée de mot de passe administratif",
};

export const instant = false;

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen">
      <LeftImageSide
        badge="ASSISTANCE & RÉCUPÉRATION"
        title={"Restauration sécurisée\nde vos identifiants"}
        subTitle="Vous avez égaré vos identifiants ? Suivez les étapes de vérification pour réinitialiser votre accès administrateur."
        items={[
          {
            icon: Mail,
            title: "Lien à usage unique expédié",
            description:
              "Un lien d'accès sécurisé et temporaire est immédiatement acheminé à votre adresse email professionnelle.",
          },
          {
            icon: KeyRound,
            title: "Création d'un mot de passe fort",
            description:
              "Définissez une clé d'accès robuste respectant les normes de sécurité informatique sanitaire.",
          },
          {
            icon: CheckCircle2,
            title: "Reprise immédiate de votre veille",
            description:
              "Retrouvez l'accès complet au tableau de bord des réclamations et aux instructions d'avis.",
          },
        ]}
        banner={{
          icon: ShieldCheck,
          title: "Intégrité & Chiffrement",
          description:
            "Les demandes de réinitialisation sont strictement confidentielles et horodatées pour prévenir toute usurpation.",
        }}
      />

      <div className="flex w-full md:flex-1 items-center justify-center p-8 bg-background">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
