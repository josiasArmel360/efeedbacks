"use server";

import * as accessControl from "@/lib/db/queries/access-control/service";

export const createPolicy = accessControl.createPolicy;
export const updatePolicy = accessControl.updatePolicy;
export const removePolicy = accessControl.deletePolicy;
export const getPolicy = accessControl.getPolicy;
export const getPolicies = accessControl.getPolicies;
export const manageAccess = accessControl.manageAccess;

export const saveException = accessControl.saveException;
export const removeException = accessControl.removeException;
export const getException = accessControl.getException;
