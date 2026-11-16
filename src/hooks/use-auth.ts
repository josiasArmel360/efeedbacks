import { useAuthStore } from "@/lib/db/queries/auth/store";
import * as auth from "@/lib/db/queries/auth/service";

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signIn: auth.signIn,
    forgotPassword: auth.forgotPassword,
    resetPassword: auth.resetPassword,
    changeEmail: auth.changeEmail,
    updatePassword: auth.updatePassword,
    enable2FA: auth.enable2FA,
    verify2FA: auth.verify2FA,
    disable2FA: auth.disable2FA,
    listSessions: auth.listSessions,
    revokeSession: auth.revokeSession,
    revokeOtherSessions: auth.revokeOtherSessions,
    signOut: auth.signOut,
    updateUser: auth.updateUser,
  };
};
