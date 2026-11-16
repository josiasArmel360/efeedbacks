import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { UTApi } from "uploadthing/server";

import { db } from "@/lib/db/client";
import { ActionError, safeAc } from "@/lib/helper/auth-action";
import { canDo, generateRandomPassword } from "@/lib/helper/utility";
import {
  CREATE_ACCESS_DENIED_MESSAGE,
  DELETE_ACCESS_DENIED_MESSAGE,
  UPDATE_ACCESS_DENIED_MESSAGE,
} from "@/lib/constants";
import {
  CreateUserSchema,
  UpdateUserSchema,
  UpdateProfileSchema,
  UpdateProfileAvatarSchema,
  DeleteUserSchema,
  UserBanSchema,
  RestoreUserSchema,
} from "./validator";
import { user, session, account } from "@/lib/db/schema";
import { RESOURCE } from "@/lib/config/access.modules";
import { sendWelcomeEmail } from "@/components/mails/mailer";
import type { User } from "@/lib/types";

const RES = RESOURCE.USER;

export interface UserFilterOptions {
  policyId?: string;
  banned?: boolean;
  includeDeleted?: boolean;
}

export const createUser = safeAc
  .inputSchema(CreateUserSchema)
  .action(async ({ parsedInput: values, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "create", fullAccess)) {
        throw new ActionError(CREATE_ACCESS_DENIED_MESSAGE);
      }

      const email = values.email.toLowerCase().trim();

      // Vérification de l'unicité globale de l'adresse email
      const existing = await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      });

      if (existing) {
        throw new ActionError(
          `Un utilisateur avec l'adresse email "${email}" existe déjà.`,
        );
      }

      const existingRole = await db.query.accessPolicy.findFirst({
        where: (r, { eq }) => eq(r.id, values.policyId),
      });
      if (!existingRole) {
        throw new ActionError("Role introuvable");
      }

      const id = crypto.randomUUID();
      const now = new Date();
      const tempPassword = generateRandomPassword();
      const hashedPassword = await hashPassword(tempPassword);

      const [createdUser] = await db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(user)
          .values({
            id,
            policyId: values.policyId,
            name: values.name.trim(),
            email,
            job: values.job?.trim() || null,
            emailVerified: false,
            banned: false,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        await tx.insert(account).values({
          accountId: id,
          providerId: "credential",
          userId: id,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        });

        return [newUser];
      });

      // Envoi de l'email de bienvenue
      try {
        await sendWelcomeEmail({
          userEmail: email,
          userName: values.name.trim(),
          tempPassword,
        });
      } catch (mailErr) {
        console.warn("[createUser] Échec envoi email de bienvenue:", mailErr);
      }

      revalidatePath("/settings/users");
      return {
        success: true,
        message:
          "Utilisateur créé avec succès. Ses accès de connexion ont été configurés.",
        id: createdUser.id,
      };
    } catch (error) {
      console.error("Erreur serveur (createUser):", error);
      throw error;
    }
  });

export const updateUser = safeAc
  .inputSchema(UpdateUserSchema)
  .action(async ({ parsedInput: data, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "update", fullAccess)) {
        throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.id, data.id),
      });

      if (!existing) {
        throw new ActionError("Utilisateur introuvable.");
      }

      // Si l'email est modifié, vérifier qu'il n'est pas déjà pris
      const newEmail = data.email.toLowerCase().trim();
      if (newEmail !== existing.email.toLowerCase()) {
        const emailCheck = await db.query.user.findFirst({
          where: (u, { eq }) => eq(u.email, newEmail),
        });
        if (emailCheck) {
          throw new ActionError(
            `L'adresse email "${newEmail}" est déjà utilisée par un autre compte.`,
          );
        }
      }

      const existingRole = await db.query.accessPolicy.findFirst({
        where: (r, { eq }) => eq(r.id, data.policyId),
      });
      if (!existingRole) {
        throw new ActionError("Role introuvable");
      }

      const now = new Date();

      await db.transaction(async (tx) => {
        await tx
          .update(user)
          .set({
            name: data.name.trim(),
            email: newEmail,
            job: data.job?.trim() || null,
            policyId: data.policyId,
            updatedAt: now,
          })
          .where(eq(user.id, data.id));

        // Si un nouveau mot de passe est renseigné
        if (data.password && data.password.trim().length >= 8) {
          const hashedPassword = await hashPassword(data.password);
          await tx
            .update(account)
            .set({
              password: hashedPassword,
              updatedAt: now,
            })
            .where(
              and(
                eq(account.userId, data.id),
                eq(account.providerId, "credential"),
              ),
            );
        }
      });

      revalidatePath("/settings/users");
      return {
        success: true,
        message: "Utilisateur modifié avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (updateUser):", error);
      throw error;
    }
  });

export const updateOwnProfile = safeAc
  .inputSchema(UpdateProfileSchema)
  .action(async ({ parsedInput: data, ctx: { user: currentUser } }) => {
    try {
      const existing = await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.id, currentUser.id),
      });

      if (!existing) {
        throw new ActionError("Profil utilisateur introuvable.");
      }

      const updatedName = data.name.trim();
      const updatedJob = data.job?.trim() || null;
      const updatedPhoneNumber = data.phoneNumber?.trim() || null;

      await db
        .update(user)
        .set({
          name: updatedName,
          job: updatedJob,
          phoneNumber: updatedPhoneNumber,
          updatedAt: new Date(),
        })
        .where(eq(user.id, currentUser.id));

      revalidatePath("/profile");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Vos informations personnelles ont été mises à jour.",
        user: {
          name: updatedName,
          job: updatedJob,
          phoneNumber: updatedPhoneNumber,
        },
      };
    } catch (error) {
      console.error("Erreur serveur (updateOwnProfile):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError(
            "Impossible de mettre à jour vos informations personnelles.",
          );
    }
  });

export const updateOwnAvatar = safeAc
  .inputSchema(UpdateProfileAvatarSchema)
  .action(async ({ parsedInput: data, ctx: { user: currentUser } }) => {
    try {
      const existing = await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.id, currentUser.id),
      });

      if (!existing) {
        throw new ActionError("Profil utilisateur introuvable.");
      }

      const oldImage = existing.image;
      const nextImage = data.image?.trim() || null;

      await db
        .update(user)
        .set({
          image: nextImage,
          updatedAt: new Date(),
        })
        .where(eq(user.id, currentUser.id));

      if (oldImage && oldImage !== nextImage && oldImage.includes("/f/")) {
        const fileKey = oldImage.split("/f/")[1];
        if (fileKey) {
          try {
            const utapi = new UTApi();
            await utapi.deleteFiles(fileKey);
          } catch (cleanupErr) {
            console.warn(
              "[updateOwnAvatar] Échec suppression ancien avatar:",
              cleanupErr,
            );
          }
        }
      }

      revalidatePath("/profile");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: nextImage
          ? "Photo de profil mise à jour avec succès."
          : "Photo de profil supprimée avec succès.",
        image: nextImage,
      };
    } catch (error) {
      console.error("Erreur serveur (updateOwnAvatar):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de modifier la photo de profil.");
    }
  });

export const banUser = safeAc
  .inputSchema(UserBanSchema)
  .action(
    async ({
      parsedInput: data,
      ctx: { modules, fullAccess, user: currentUser },
    }) => {
      try {
        if (!canDo(modules, RES, "update", fullAccess)) {
          throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
        }

        if (data.id === currentUser.id) {
          throw new ActionError(
            "Vous ne pouvez pas suspendre votre propre compte utilisateur.",
          );
        }

        const existing = await db.query.user.findFirst({
          where: (u, { eq }) => eq(u.id, data.id),
        });

        if (!existing) {
          throw new ActionError("Utilisateur introuvable.");
        }

        await db
          .update(user)
          .set({
            banned: true,
            banReason: data.banReason.trim(),
            banExpires: data.banExpires ?? null,
            updatedAt: new Date(),
          })
          .where(eq(user.id, data.id));

        // Révocation instantanée de toutes les sessions actives sur tous les terminaux
        await db.delete(session).where(eq(session.userId, data.id));

        revalidatePath("/settings/users");
        return {
          success: true,
          message: "Compte utilisateur suspendu avec succès.",
        };
      } catch (error) {
        console.error("Erreur serveur (banUser):", error);
        throw error;
      }
    },
  );

export const restoreUser = safeAc
  .inputSchema(RestoreUserSchema)
  .action(async ({ parsedInput, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "update", fullAccess)) {
        throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.id, parsedInput.id),
      });

      if (!existing) {
        throw new ActionError("Utilisateur introuvable.");
      }

      await db
        .update(user)
        .set({
          banned: false,
          banReason: null,
          banExpires: null,
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, parsedInput.id));

      revalidatePath("/settings/users");
      return {
        success: true,
        message: "Compte utilisateur réactivé avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (restoreUser):", error);
      throw error;
    }
  });

export const deleteUser = safeAc
  .inputSchema(DeleteUserSchema)
  .action(
    async ({
      parsedInput,
      ctx: { modules, fullAccess, user: currentUser },
    }) => {
      try {
        if (!canDo(modules, RES, "delete", fullAccess)) {
          throw new ActionError(DELETE_ACCESS_DENIED_MESSAGE);
        }

        if (parsedInput.id === currentUser.id) {
          throw new ActionError(
            "Vous ne pouvez pas supprimer votre propre compte utilisateur.",
          );
        }

        const existing = await db.query.user.findFirst({
          where: (u, { eq }) => eq(u.id, parsedInput.id),
        });

        if (!existing) {
          throw new ActionError("Utilisateur introuvable.");
        }

        // Soft-delete avec motif et révocation de session
        await db
          .update(user)
          .set({
            deletedAt: new Date(),
            banned: true,
            banReason: "Compte supprimé par l'administrateur",
            updatedAt: new Date(),
          })
          .where(eq(user.id, parsedInput.id));

        // Déconnexion forcée immédiate sur tous les appareils
        await db.delete(session).where(eq(session.userId, parsedInput.id));

        revalidatePath("/settings/users");
        return {
          success: true,
          message: "Compte utilisateur supprimé avec succès.",
        };
      } catch (error) {
        console.error("Erreur serveur (deleteUser):", error);
        throw error;
      }
    },
  );

export const getUser = async ({
  id,
  email,
}: {
  id?: string;
  email?: string;
}): Promise<User | null> => {
  try {
    const user = await db.query.user.findFirst({
      where: (u, { eq }) => {
        if (id) return eq(u.id, id);
        if (email) return eq(u.email, email);
        return undefined;
      },
      with: { policy: { columns: { id: true, name: true, code: true } } },
    });

    return user ?? null;
  } catch (error) {
    console.error("Erreur serveur (getUser):", error);
    throw error;
  }
};

export const getUsers = async (
  options?: UserFilterOptions,
): Promise<User[]> => {
  try {
    const res = await db.query.user.findMany({
      where: (u, { and, eq, isNull }) => {
        const conditions = [
          options?.includeDeleted ? undefined : isNull(u.deletedAt),
          options?.policyId ? eq(u.policyId, options.policyId) : undefined,
          options?.banned !== undefined
            ? eq(u.banned, options.banned)
            : undefined,
        ].filter(Boolean);

        return conditions.length > 0 ? and(...conditions) : undefined;
      },
      with: { policy: { columns: { id: true, name: true, code: true } } },
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });

    return (res as User[]) || [];
  } catch (error) {
    console.error("Erreur serveur (getUsers):", error);
    return [];
  }
};
