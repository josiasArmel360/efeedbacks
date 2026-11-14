import { authClient } from "@/lib/auth-client";
import { SignInPayload } from "./validator";
import { User } from "@/lib/types";

type RawUser = typeof authClient.$Infer.Session.user;
export type Session = typeof authClient.$Infer.Session.session;

export type SignInResult = User | { FA2Redirect: true };

export const formatUser = (user: RawUser): User =>
  ({
    ...user,
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
    banned: Boolean(user.banned),
  }) as User;

export const requestPasswordReset = async (email: string) => {
  const { error } = await authClient.requestPasswordReset({
    email,
    redirectTo: "/reset-password",
  });
  if (error) {
    throw new Error(
      "Une erreur est survenue lors de la réinitialisation du mot de passe",
    );
  }
};

export const changePassword = async (payload: {
  newPassword: string;
  token: string;
}) => {
  const { error } = await authClient.resetPassword({
    newPassword: payload.newPassword,
    token: payload.token,
  });
  if (error) {
    throw new Error(
      "Une erreur est survenue lors de la réinitialisation du mot de passe",
    );
  }
};

export const updatePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}) => {
  const { error } = await authClient.changePassword({
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
    revokeOtherSessions: payload.revokeOtherSessions,
  });
  if (error) {
    throw new Error(
      error.message ||
        "Impossible de modifier le mot de passe. Vérifiez votre mot de passe actuel.",
    );
  }
};

export const requestEmailChange = async (payload: {
  newEmail: string;
  callbackURL?: string;
}) => {
  const { error } = await authClient.changeEmail({
    newEmail: payload.newEmail,
    callbackURL: payload.callbackURL || "/profile",
  });
  if (error) {
    throw new Error(
      error.message ||
        "Impossible d'initier le changement d'adresse électronique.",
    );
  }
};

export const requestVerificationEmail = async (payload: {
  email: string;
  callbackURL?: string;
}) => {
  const { error } = await authClient.sendVerificationEmail({
    email: payload.email,
    callbackURL: payload.callbackURL || "/email-verified",
  });
  if (error) {
    throw new Error(
      "Une erreur est survenue lors de l'envoi de l'email de vérification",
    );
  }
};

export const verifyEmailToken = async (token: string) => {
  const { error } = await authClient.verifyEmail({
    query: { token },
  });
  if (error) {
    throw new Error(
      "Une erreur est survenue lors de la vérification de l'email",
    );
  }
};

export const getClientSession = async (): Promise<User | null> => {
  const { data, error } = await authClient.getSession();
  if (error || !data?.user) return null;
  return formatUser(data.user);
};

export const signIn = async (payload: SignInPayload): Promise<SignInResult> => {
  const { data, error } = await authClient.signIn.email({
    ...payload,
    rememberMe: payload.rememberMe ?? false,
  });

  if (error) {
    throw error || new Error("Email ou mot de passe incorrect");
  }

  if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
    return { FA2Redirect: true };
  }

  if (!data?.user) {
    throw new Error("Email ou mot de passe incorrect");
  }

  return formatUser(data.user);
};

export const enable2FA = async (password: string): Promise<string> => {
  const { data, error } = await authClient.twoFactor.enable({ password });
  if (error) {
    throw new Error(
      typeof error === "string"
        ? error
        : error.message || "Mot de passe incorrect.",
    );
  }
  if (!data || !("totpURI" in data) || !data.totpURI) {
    throw new Error("Impossible de générer la clé d'authentification 2FA.");
  }
  return data.totpURI;
};

export const verify2FA = async (code: string): Promise<User> => {
  const { data, error } = await authClient.twoFactor.verifyTotp({ code });
  if (error || !data?.user) {
    throw error || new Error("Code 2FA invalide");
  }
  return formatUser(data.user);
};

export const disable2FA = async (password: string): Promise<void> => {
  const { error } = await authClient.twoFactor.disable({ password });
  if (error) {
    throw new Error(
      typeof error === "string"
        ? error
        : error.message || "Mot de passe incorrect.",
    );
  }
};

export const listSessions = async (): Promise<Session[]> => {
  const { data, error } = await authClient.listSessions();
  if (error) {
    throw new Error(
      error.message || "Impossible de récupérer les sessions actives.",
    );
  }
  return data ?? [];
};

export const revokeSession = async (token: string): Promise<void> => {
  const { error } = await authClient.revokeSession({ token });
  if (error) {
    throw new Error(error.message || "Impossible de révoquer cette session.");
  }
};

export const revokeOtherSessions = async (): Promise<void> => {
  const { error } = await authClient.revokeOtherSessions();
  if (error) {
    throw new Error(
      error.message || "Impossible de révoquer les autres sessions actives.",
    );
  }
};

export const signOut = async () => {
  const { error } = await authClient.signOut();
  if (error) {
    throw error;
  }
};
