import {
  createTenant,
  updateTenant,
  deleteTenant,
  getTenant,
} from "./model";
import type {
  CreateTenantPayload,
  UpdateTenantPayload,
  DeleteTenantPayload,
  TenantFormData,
} from "./validator";

export const create = async (payload: CreateTenantPayload) => {
  return await createTenant(payload);
};

export const update = async (payload: UpdateTenantPayload) => {
  return await updateTenant(payload);
};

export const remove = async (payload: DeleteTenantPayload) => {
  return await deleteTenant(payload);
};

export const getOne = async () => {
  return await getTenant();
};

export type {
  CreateTenantPayload,
  UpdateTenantPayload,
  DeleteTenantPayload,
  TenantFormData,
};

