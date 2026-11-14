"use server";

import { Resend } from "resend";

import {
  AccountDeletionConfirmationEmail,
  EmailChangeConfirmationEmail,
  EmailVerificationEmail,
  InvitationEmail,
  PasswordResetEmail,
  TwoFactorOtpEmail,
  WelcomeEmail,
} from "@/components/mails";
import { APP_NAME } from "@/lib/constants";

export const sendEmailVerificationEmail = async ({
  user,
  url,
  appName = APP_NAME,
}: {
  user: { email: string; name: string };
  url: string;
  appName?: string;
}) => {
  return sendEmail({
    to: user.email,
    subject: `Vérification de votre adresse email - ${appName}`,
    react: (
      <EmailVerificationEmail
        userName={user.name}
        appName={appName}
        verifyUrl={url}
        expirationTime="72 heures"
      />
    ),
  });
};

export const sendResetPasswordEmail = async ({
  user,
  url,
  appName = APP_NAME,
}: {
  user: { email: string; name: string };
  url: string;
  appName?: string;
}) => {
  return sendEmail({
    to: user.email,
    subject: `Réinitialisation de votre mot de passe - ${appName}`,
    react: (
      <PasswordResetEmail
        userName={user.name}
        appName={appName}
        resetUrl={url}
        expirationTime="72 heures"
      />
    ),
  });
};

export const sendWelcomeEmail = async ({
  userEmail,
  userName,
  appName = APP_NAME,
  tempPassword,
}: {
  userEmail: string;
  userName: string;
  appName?: string;
  tempPassword?: string;
}) => {
  return sendEmail({
    to: userEmail,
    subject: `Bienvenue sur la plateforme ${appName}`,
    react: (
      <WelcomeEmail
        userName={userName}
        appName={appName}
        tempPassword={tempPassword}
      />
    ),
  });
};

export const sendTwoFactorOtpEmail = async ({
  userEmail,
  userName = "Collaborateur",
  otp,
  appName = APP_NAME,
}: {
  userEmail: string;
  userName?: string;
  otp: string;
  appName?: string;
}) => {
  return sendEmail({
    to: userEmail,
    subject: `Votre code de sécurité 2FA : ${otp}`,
    react: (
      <TwoFactorOtpEmail
        userName={userName}
        appName={appName}
        otp={otp}
        expirationMinutes={10}
      />
    ),
  });
};

export const sendChangeEmailConfirmationEmail = async ({
  user,
  appName = APP_NAME,
}: {
  user: { name: string; newEmail: string; oldEmail: string };
  appName?: string;
}) => {
  return sendEmail({
    to: user.oldEmail,
    subject: `Alerte sécurité : Changement d'adresse email - ${appName}`,
    react: (
      <EmailChangeConfirmationEmail
        userName={user.name}
        appName={appName}
        newEmail={user.newEmail}
        oldEmail={user.oldEmail}
      />
    ),
  });
};

export const sendDeleteAccountVerificationEmail = async ({
  user,
  appName = APP_NAME,
}: {
  user: { email: string; name: string };
  appName?: string;
}) => {
  return sendEmail({
    to: user.email,
    subject: `Clôture de compte - ${appName}`,
    react: (
      <AccountDeletionConfirmationEmail
        userName={user.name}
        appName={appName}
      />
    ),
  });
};

export const sendInvitationEmail = async ({
  to,
  tenantName,
  inviterName,
  roleLabel,
  invitationUrl,
  appName = APP_NAME,
}: {
  to: string;
  tenantName: string;
  inviterName?: string;
  roleLabel: string;
  invitationUrl: string;
  appName?: string;
}) => {
  return sendEmail({
    to,
    subject: `Invitation à rejoindre ${tenantName} sur ${appName}`,
    react: (
      <InvitationEmail
        appName={appName}
        tenantName={tenantName}
        inviterName={inviterName}
        roleLabel={roleLabel}
        invitationUrl={invitationUrl}
        expirationHours={72}
      />
    ),
  });
};

interface SendEmailParams {
  to: string;
  subject: string;
  react?: React.ReactNode;
  html?: string;
  text?: string;
}

export const sendEmail = async ({
  to,
  subject,
  react,
  html,
  text,
}: SendEmailParams) => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey.startsWith("test") || !apiKey.startsWith("re_")) {
    console.warn(
      `[Mailer Dev] 📧 RESEND_API_KEY non configurée ou factice (${apiKey}). Envoi simulé pour "${subject}" vers <${to}>.`,
    );
    return { id: "dev-simulated-id" };
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const from = `${APP_NAME} <${fromEmail}>`;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      react,
    });

    if (error) {
      console.error("[Mailer] Erreur Resend:", error);
      if (process.env.IS_PROD === "true") {
        throw new Error(error.message);
      }
      return { id: "dev-error-fallback" };
    }

    return data;
  } catch (err: unknown) {
    console.error("[Mailer] Erreur d'envoi d'email:", err);
    if (process.env.IS_PROD === "true") {
      throw err;
    }
    return { id: "dev-error-fallback" };
  }
};

