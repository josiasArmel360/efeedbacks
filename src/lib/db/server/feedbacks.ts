"use server";

import * as feedback from "@/lib/db/queries/feedback/service";

export const submit = feedback.submit;
export const update = feedback.update;
export const remove = feedback.remove;
export const getOne = feedback.getOne;
export const getByCode = feedback.getByCode;
export const getAll = feedback.getAll;
export const getDashboardKPIs = feedback.getDashboardKPIs;


