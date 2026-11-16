import { APP_NAME } from "@/lib/constants";
import type { User } from "@/lib/types";
import * as auth from "./model";
import { useAuthStore } from "./store";
import type { SignInPayload } from "./validator";

const store = () => useAuthStore.getState();

export const hydrate = async () => {
  store().setStatus("loading");
  try {
    const user = await auth.getClientSession();
    if (user) store().setUser(user);
    else store().reset();
  } catch {
    store().reset();
  }
};

export const signIn = async (payload: SignInPayload) => {
  const result = await auth.signIn(payload);
  if (!("FA2Redirect" in result)) store().setUser(result);
  return result;
};

export const forgotPassword = async (email: string) => {
  await auth.requestPasswordReset(email);
};

export const resetPassword = async (payload: {
  newPassword: string;
  token: string;
}) => {
  await auth.changePassword(payload);
};

export const sendVerificationEmail = async (payload: {
  email: string;
  callbackURL?: string;
}) => {
  await auth.requestVerificationEmail(payload);
};

export const verifyEmail = async (token: string) => {
  await auth.verifyEmailToken(token);
};

export const changeEmail = async (payload: {
  newEmail: string;
  callbackURL?: string;
}) => {
  await auth.requestEmailChange(payload);
};

export const updatePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}) => {
  await auth.updatePassword(payload);
};

export const enable2FA = async (password: string) => {
  return await auth.enable2FA(password);
};

export const verify2FA = async (code: string) => {
  const user = await auth.verify2FA(code);
  const currentUser = store().user;
  if (currentUser) {
    store().updateUser({ twoFactorEnabled: true });
  } else {
    store().setUser(user);
  }
  return user;
};

export const disable2FA = async (password: string) => {
  await auth.disable2FA(password);
  store().updateUser({ twoFactorEnabled: false });
};

export const listSessions = async () => {
  return await auth.listSessions();
};

export const revokeSession = async (token: string) => {
  await auth.revokeSession(token);
};

export const revokeOtherSessions = async () => {
  await auth.revokeOtherSessions();
};

export const signOut = async () => {
  try {
    await auth.signOut();
  } finally {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `${APP_NAME.toLowerCase()}_auth_logout`,
          Date.now().toString(),
        );
      } catch {}
    }
    store().reset();
  }
};

export const updateUser = (patch: Partial<User>) => {
  store().updateUser(patch);
};
