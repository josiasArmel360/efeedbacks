"use server";

import * as department from "@/lib/db/queries/department/service";

export const create = department.create;
export const update = department.update;
export const remove = department.remove;
export const getOne = department.getOne;
export const getAll = department.getAll;
export const getActive = department.getActive;

