import { cache } from "react";
import { headers } from "next/headers";
// import { redirect } from "next/navigation";
import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins/two-factor";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { APP_NAME } from "@/lib/constants";
import {
  sendChangeEmailConfirmationEmail,
  sendDeleteAccountVerificationEmail,
  sendEmailVerificationEmail,
  sendResetPasswordEmail,
  sendTwoFactorOtpEmail,
  sendWelcomeEmail,
} from "@/components/mails/mailer";
import type { AccessPolicy, User } from "@/lib/types";
import { createAuthMiddleware } from "better-auth/api";

const isProd = process.env.IS_PROD === "true";
const baseUrl = process.env.NEXT_PUBLIC_APP_URL as string;

export const auth = betterAuth({
  appName: APP_NAME,
  trustedOrigins: [baseUrl],
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg" }),

  advanced: {
    cookiePrefix: APP_NAME.toLowerCase(),
    database: { generateId: "uuid" },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60 * 72, // 72 heures
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendResetPasswordEmail({
          user: { email: user.email, name: user.name },
          url,
          appName: auth.options.appName,
        });
      } catch (error) {
        console.error(
          "[Auth] Échec de l'envoi de réinitialisation de mot de passe:",
          error,
        );
        throw new APIError("INTERNAL_SERVER_ERROR", {
          message:
            "Impossible d'envoyer l'email de réinitialisation ou d'activation. Veuillez réessayer ou contacter le support.",
        });
      }
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmailVerificationEmail({
          user: { email: user.email, name: user.name },
          url,
          appName: auth.options.appName,
        });
      } catch (error) {
        console.error(
          "[Auth] Échec de l'envoi de vérification d'email:",
          error,
        );
        throw new APIError("INTERNAL_SERVER_ERROR", {
          message: "Impossible d'envoyer l'email de vérification.",
        });
      }
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // 1 jour
    freshAge: 0,
    cookieCache: { enabled: true, maxAge: 60 * 60 },
    cookie: { secure: isProd, httpOnly: true, sameSite: "lax", path: "/" },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.includes("change-email")) {
        const user = ctx.context.newSession?.user || ctx.context.session?.user;
        if (user && ctx.body?.newEmail) {
          try {
            await sendChangeEmailConfirmationEmail({
              user: {
                name: user.name,
                newEmail: ctx.body.newEmail,
                oldEmail: user.email,
              },
              appName: APP_NAME,
            });
          } catch (error) {
            console.error("Erreur (Change Email Endpoint Hook):", error);
          }
        }
      }

      if (ctx.path.includes("delete-user")) {
        const user = ctx.context.session?.user;
        if (user) {
          try {
            await sendDeleteAccountVerificationEmail({
              user: { email: user.email, name: user.name },
              // url: `${baseUrl}/goodbye`,
              appName: APP_NAME,
            });
          } catch (error) {
            console.error("Erreur (Delete User Endpoint Hook):", error);
          }
        }
      }
    }),
  },

  user: {
    additionalFields: {
      policyId: { type: "string", required: true },
      phoneNumber: { type: "string", required: false },
      job: { type: "string", required: false },
      banned: { type: "boolean", required: false, defaultValue: false },
      banReason: { type: "string", required: false },
      banExpires: { type: "date", required: false },
      deletedAt: { type: "date", required: false },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({
        user,
        newEmail,
        url,
      }: {
        user: { email: string; name: string };
        newEmail: string;
        url: string;
      }) => {
        try {
          await sendEmailVerificationEmail({
            user: { email: newEmail, name: user.name },
            url,
            appName: auth.options.appName,
          });
          await sendChangeEmailConfirmationEmail({
            user: { name: user.name, newEmail, oldEmail: user.email },
            appName: auth.options.appName,
          });
        } catch (error) {
          console.error("[Auth] Échec d'envoi du changement d'email:", error);
        }
      },
    },
    deleteUser: {
      enabled: false,
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          try {
            await sendWelcomeEmail({
              userEmail: createdUser.email,
              userName: createdUser.name,
              appName: auth.options.appName,
            });
          } catch (error) {
            console.error("[Auth] Échec envoi email de bienvenue:", error);
          }
        },
      },
    },
    session: {
      create: {
        before: async (session, ctx) => {
          const user = await db.query.user.findFirst({
            where: (u) => eq(u.id, session.userId),
          });
          if (user?.banned || user?.deletedAt) {
            throw new APIError("FORBIDDEN", {
              message: user?.banned
                ? "Votre compte a été suspendu."
                : "Votre compte a été supprimé.",
            });
          }

          const oneWeek = 60 * 60 * 24 * 7;
          const onMonth = 60 * 60 * 24 * 30;
          const rememberMe = (ctx?.body?.rememberMe as boolean) ?? false;
          const expiresIn = rememberMe ? onMonth : oneWeek;
          const expiresAt = new Date(Date.now() + expiresIn * 1000);

          return {
            data: {
              ...session,
              expiresAt,
            },
          };
        },
      },
    },
  },

  plugins: [
    twoFactor({
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          try {
            await sendTwoFactorOtpEmail({
              userEmail: user.email,
              userName: user.name,
              otp,
              appName: auth.options.appName,
            });
          } catch (error) {
            console.error("[Auth] Échec de l'envoi du code 2FA:", error);
          }
        },
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session.session;

export const getSession = cache(
  async (): Promise<{
    session?: typeof auth.$Infer.Session.session | null;
    user?: User | null;
  }> => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { session: null, user: null };
    }

    let policy: Pick<AccessPolicy, "id" | "name" | "code"> | null = null;
    const policyId = (session.user as unknown as { policyId?: string })?.policyId;

    if (policyId) {
      const pol = await db.query.accessPolicy.findFirst({
        where: (p, { and, eq, isNull }) =>
          and(eq(p.id, policyId), isNull(p.deletedAt)),
        columns: { id: true, name: true, code: true },
      });
      policy = pol ?? null;
    }

    return {
      session: session.session,
      user: {
        ...session.user,
        twoFactorEnabled: Boolean(session.user.twoFactorEnabled),
        banned: Boolean(session.user.banned),
        policy,
      } as User,
    };
  },
);
