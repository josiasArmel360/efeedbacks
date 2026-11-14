"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MailX } from "lucide-react";

import { Logo } from "@/components/image";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { verifyEmail } from "@/lib/db/queries/auth/service";
import { Loader } from "@/components/loader";

interface EmailVerifiedViewProps {
  error?: string;
  token?: string;
}

const getErrorMessage = (code?: string) => {
  if (!code) {
    return "Une erreur est survenue lors de la vérification de votre adresse email. Le lien est peut-être expiré ou invalide.";
  }

  switch (code) {
    case "TOKEN_EXPIRED":
      return "Le lien de vérification a expiré. Pour des raisons de sécurité, les liens ont une durée de validité limitée.";
    case "INVALID_TOKEN":
      return "Le lien de vérification est invalide ou a déjà été utilisé.";
    case "USER_NOT_FOUND":
      return "Aucun compte utilisateur correspondant à ce lien n'a été trouvé.";
    case "INVALID_USER":
      return "L'utilisateur associé à cette demande ne correspond pas au compte connecté.";
    case "EMAIL_MISMATCH":
      return "L'adresse email ne correspond pas à celle attendue pour cette vérification.";
    case "EMAIL_ALREADY_VERIFIED":
      return "Votre adresse email est déjà vérifiée. Vous pouvez vous connecter à votre compte.";
    default:
      return code.length > 25
        ? code
        : "Une erreur est survenue lors de la vérification de votre email. Veuillez demander un nouveau lien.";
  }
};

export const EmailVerifiedView = ({ error, token }: EmailVerifiedViewProps) => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token && !error ? "loading" : error ? "error" : "success",
  );
  const [activeError, setActiveError] = useState<string | undefined>(error);

  useEffect(() => {
    if (token && !error) {
      let isMounted = true;
      verifyEmail(token)
        .then(() => {
          if (isMounted) setStatus("success");
        })
        .catch((err: unknown) => {
          if (isMounted) {
            setStatus("error");
            const message =
              (err as { message?: string })?.message || "INVALID_TOKEN";
            setActiveError(message);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [token, error]);

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
      {status !== "loading" && (
        <div className="flex flex-col space-y-2 text-center">
          <div className="mb-2 flex justify-center">
            <Logo />
          </div>
        </div>
      )}

      {status === "loading" && <LoadingSection />}
      {status === "error" && <ErrorSection errorCode={activeError} />}
      {status === "success" && <SuccessSection />}
    </div>
  );
};

const LoadingSection = () => (
  <div className="space-y-4 text-center py-6">
    <div className="flex justify-center">
      <Loader text="Vérification en cours..." />
    </div>

    <p className="text-sm text-muted-foreground font-medium">
      Veuillez patienter pendant que nous validons votre adresse email.
    </p>
  </div>
);

const ErrorSection = ({ errorCode }: { errorCode?: string }) => {
  const message = getErrorMessage(errorCode);

  return (
    <div className="space-y-5 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-destructive">
        Échec de la vérification
      </h1>

      <div className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-foreground/90">
        <MailX className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <p className="text-sm text-start font-medium leading-relaxed">
          {message}
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <Link href="/verify-email" className="w-full block">
          <Button className="w-full font-semibold py-5">
            Demander un nouveau lien
          </Button>
        </Link>

        <Link
          href="/sign-in"
          className="text-sm font-semibold text-primary hover:underline transition-all block text-center"
        >
          Retour à la page de connexion
        </Link>
      </div>
    </div>
  );
};

const SuccessSection = () => (
  <div className="space-y-5 text-center">
    <h1 className="text-3xl font-bold tracking-tight text-foreground">
      Email vérifié avec succès
    </h1>

    <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-foreground/90">
      <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
      <p className="text-sm text-start font-medium leading-relaxed">
        Votre adresse email a été validée. Vous pouvez maintenant accéder en
        toute sécurité aux services de {APP_NAME}.
      </p>
    </div>

    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-start space-y-1">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
        Important
      </p>
      <p className="text-sm font-medium text-foreground/80 leading-relaxed">
        Utilisez votre adresse email et votre mot de passe pour vous connecter à
        votre espace.
      </p>
    </div>

    <div className="pt-2">
      <Link href="/sign-in" className="w-full block">
        <Button className="w-full font-semibold py-4.5">
          Aller à la page de connexion
        </Button>
      </Link>
    </div>
  </div>
);
