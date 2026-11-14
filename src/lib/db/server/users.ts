"use server";

import * as user from "@/lib/db/queries/user/service";

export const create = user.create;
export const update = user.update;
export const updateProfile = user.updateProfile;
export const updateAvatar = user.updateAvatar;
export const remove = user.remove;
export const getOne = user.getOne;
export const getAll = user.getAll;
export const ban = user.ban;
export const restore = user.restore;

