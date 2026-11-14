import {
  createUser,
  updateUser,
  updateOwnProfile,
  updateOwnAvatar,
  deleteUser,
  banUser,
  restoreUser,
  getUser,
  getUsers,
  type UserFilterOptions,
} from "./model";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateProfilePayload,
  UpdateProfileAvatarPayload,
  DeleteUserPayload,
  UserBanPayload,
  RestoreUserPayload,
} from "./validator";

export const create = async (payload: CreateUserPayload) => {
  return await createUser(payload);
};

export const update = async (payload: UpdateUserPayload) => {
  return await updateUser(payload);
};

export const updateProfile = async (payload: UpdateProfilePayload) => {
  return await updateOwnProfile(payload);
};

export const updateAvatar = async (payload: UpdateProfileAvatarPayload) => {
  return await updateOwnAvatar(payload);
};

export const remove = async (payload: DeleteUserPayload) => {
  return await deleteUser(payload);
};

export const ban = async (payload: UserBanPayload) => {
  return await banUser(payload);
};

export const restore = async (payload: RestoreUserPayload) => {
  return await restoreUser(payload);
};

export const getAll = async (options?: UserFilterOptions) => {
  return await getUsers(options);
};

export const getOne = async (id: string) => {
  return await getUser(id);
};

export type { UserFilterOptions };
