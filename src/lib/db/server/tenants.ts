"use server";

import * as tenant from "@/lib/db/queries/tenant/service";

export const create = tenant.create;
export const update = tenant.update;
export const remove = tenant.remove;
export const getOne = tenant.getOne;

