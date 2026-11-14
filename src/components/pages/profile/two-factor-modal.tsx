"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/modal";
import { Notice } from "@/components/notice";
import { OTPInput, PasswordInput } from "@/components/inputs";
import { CancelButton, SubmitButton } from "@/components/buttons";

import { useAuth } from "@/hooks/use-auth";
import {
  PasswordPromptSchema,
  TwoFactorFormSchema,
  type PasswordPromptPayload,
  type TwoFactorPayload,
} from "@/lib/db/queries/auth/validator";

export type TwoFactorModalStep = "idle" | "password" | "verify" | "disable";

interface StepProps {
  onCancel: () => void;
  onSuccess: (totpUri?: string) => void;
}

const Enable2FAPasswordForm = ({ onCancel, onSuccess }: StepProps) => {
  const { enable2FA } = useAuth();
  const form = useForm<PasswordPromptPayload>({
    resolver: zodResolver(PasswordPromptSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: PasswordPromptPayload) => {
    try {
      const totpUri = await enable2FA(values.password);
      onSuccess(totpUri);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'activation du 2FA.",
      );
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Notice description="Confirmez votre mot de passe actuel pour générer votre clé de sécurité et démarrer la configuration 2FA." />

      <PasswordInput
        control={form.control}
        name="password"
        label="Mot de passe actuel"
        placeholder="Entrez votre mot de passe"
        disabled={form.formState.isSubmitting}
        icon={Lock}
        autoFocus
        required
      />

      <div className="flex items-center gap-3">
        <CancelButton
          onClick={onCancel}
          disabled={form.formState.isSubmitting}
        />
        <SubmitButton
          isLoading={form.formState.isSubmitting}
          className="flex-1"
        >
          Continuer
        </SubmitButton>
      </div>
    </form>
  );
};

const Verify2FAStepForm = ({
  totpUri,
  onCancel,
  onSuccess,
}: StepProps & { totpUri?: string }) => {
  const { verify2FA } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const form = useForm<TwoFactorPayload>({
    resolver: zodResolver(TwoFactorFormSchema),
    defaultValues: { code: "" },
  });

  const code = useWatch({
    control: form.control,
    name: "code",
    defaultValue: "",
  });

  useEffect(() => {
    let active = true;
    if (totpUri) {
      QRCode.toDataURL(totpUri, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: "H",
      })
        .then((url) => {
          if (active) setQrDataUrl(url);
        })
        .catch((err) => {
          console.error("Erreur génération QR 2FA:", err);
        });
    }
    return () => {
      active = false;
    };
  }, [totpUri]);

  const onSubmit = async (values: TwoFactorPayload) => {
    try {
      await verify2FA(values.code);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Impossible de vérifier le code OTP.",
      );
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Notice description="Scannez ce QR Code avec votre application d'authentification (Google Authenticator, Authy, Microsoft Authenticator), puis saisissez le code à 6 chiffres généré." />

      {totpUri && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/20 p-4">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt="QR Code 2FA"
              className="h-44 w-44 rounded-lg border border-border/50 bg-white p-2 shadow-xs"
              width={1000}
              height={1000}
            />
          ) : (
            <Skeleton className="h-44 w-44 rounded-lg" />
          )}
        </div>
      )}

      <OTPInput
        control={form.control}
        name="code"
        label="Code OTP à 6 chiffres"
        required
      />

      <div className="flex items-center gap-3">
        <CancelButton
          onClick={onCancel}
          disabled={form.formState.isSubmitting}
        />
        <SubmitButton
          isLoading={form.formState.isSubmitting}
          disabled={!code || code.length !== 6}
          className="flex-1"
        >
          Vérifier et activer
        </SubmitButton>
      </div>
    </form>
  );
};

const Disable2FAPasswordForm = ({ onCancel, onSuccess }: StepProps) => {
  const { disable2FA } = useAuth();
  const form = useForm<PasswordPromptPayload>({
    resolver: zodResolver(PasswordPromptSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: PasswordPromptPayload) => {
    try {
      await disable2FA(values.password);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la désactivation du 2FA.",
      );
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Notice description="La désactivation de la double authentification réduit le niveau de protection de votre compte. Saisissez votre mot de passe pour confirmer." />

      <PasswordInput
        control={form.control}
        name="password"
        label="Confirmez votre mot de passe"
        placeholder="Entrez votre mot de passe actuel"
        disabled={form.formState.isSubmitting}
        icon={Lock}
        autoFocus
        required
      />

      <div className="flex items-center gap-3">
        <CancelButton
          onClick={onCancel}
          disabled={form.formState.isSubmitting}
        />
        <SubmitButton
          isLoading={form.formState.isSubmitting}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1"
        >
          Désactiver le 2FA
        </SubmitButton>
      </div>
    </form>
  );
};

interface TwoFactorModalProps {
  open: boolean;
  step: TwoFactorModalStep;
  totpUri?: string;
  onClose: () => void;
  onStepChange: (step: TwoFactorModalStep, totpUri?: string) => void;
  onStatusChange: (enabled: boolean) => void;
}

export const TwoFactorModal = ({
  open,
  step,
  totpUri,
  onClose,
  onStepChange,
  onStatusChange,
}: TwoFactorModalProps) => {
  const router = useRouter();

  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      icon={step === "disable" ? ShieldAlert : ShieldCheck}
      title={
        step === "password"
          ? "Activation 2FA"
          : step === "verify"
            ? "Configuration 2FA"
            : "Désactivation 2FA"
      }
      description={
        step === "password"
          ? "Vérification de votre identité."
          : step === "verify"
            ? "Association de votre application OTP."
            : "Retrait de la protection à double facteur."
      }
      className="md:max-w-sm"
    >
      {step === "password" && (
        <Enable2FAPasswordForm
          onCancel={onClose}
          onSuccess={(uri) => onStepChange("verify", uri)}
        />
      )}

      {step === "verify" && (
        <Verify2FAStepForm
          totpUri={totpUri}
          onCancel={onClose}
          onSuccess={() => {
            onStatusChange(true);
            toast.success("Double authentification (2FA) activée avec succès.");
            onClose();
            router.refresh();
          }}
        />
      )}

      {step === "disable" && (
        <Disable2FAPasswordForm
          onCancel={onClose}
          onSuccess={() => {
            onStatusChange(false);
            toast.success("Double authentification (2FA) désactivée.");
            onClose();
            router.refresh();
          }}
        />
      )}
    </Modal>
  );
};
