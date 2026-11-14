import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartment,
  getDepartments,
  getActiveDepartments,
  type DepartmentFilterOptions,
} from "./model";
import type {
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DeleteDepartmentPayload,
} from "./validator";

export const create = async (payload: CreateDepartmentPayload) => {
  return await createDepartment(payload);
};

export const update = async (payload: UpdateDepartmentPayload) => {
  return await updateDepartment(payload);
};

export const remove = async (payload: DeleteDepartmentPayload) => {
  return await deleteDepartment(payload);
};

export const getAll = async (options?: DepartmentFilterOptions) => {
  return await getDepartments(options);
};

export const getOne = async (id: string) => {
  return await getDepartment(id);
};

export const getActive = async () => {
  return await getActiveDepartments();
};

export type {
  DepartmentFilterOptions,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DeleteDepartmentPayload,
};

