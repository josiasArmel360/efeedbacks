import {
  createSurveySection,
  updateSurveySection,
  deleteSurveySection,
  getSurveySection,
  getSurveySections,
  getPublicSurveySections as fetchPublicSurveySections,
  createSurveyField,
  updateSurveyField,
  deleteSurveyField,
  getSurveyField,
  getSurveyFields,
  type SurveySectionFilterOptions,
  type SurveyFieldFilterOptions,
} from "./model";
import type {
  CreateSurveySectionPayload,
  UpdateSurveySectionPayload,
  DeleteSurveySectionPayload,
  CreateSurveyFieldPayload,
  UpdateSurveyFieldPayload,
  DeleteSurveyFieldPayload,
} from "./validator";

// ============================================================================
// SECTIONS THÉMATIQUES
// ============================================================================

export const createSection = async (payload: CreateSurveySectionPayload) => {
  return await createSurveySection(payload);
};

export const updateSection = async (payload: UpdateSurveySectionPayload) => {
  return await updateSurveySection(payload);
};

export const removeSection = async (payload: DeleteSurveySectionPayload) => {
  return await deleteSurveySection(payload);
};

export const getAllSections = async (options?: SurveySectionFilterOptions) => {
  return await getSurveySections(options);
};

export const getPublicSections = async () => {
  return await fetchPublicSurveySections();
};

export const getOneSection = async (id: string) => {
  return await getSurveySection(id);
};

// ============================================================================
// CRITÈRES & QUESTIONS
// ============================================================================

export const createField = async (payload: CreateSurveyFieldPayload) => {
  return await createSurveyField(payload);
};

export const updateField = async (payload: UpdateSurveyFieldPayload) => {
  return await updateSurveyField(payload);
};

export const removeField = async (payload: DeleteSurveyFieldPayload) => {
  return await deleteSurveyField(payload);
};

export const getAllFields = async (options?: SurveyFieldFilterOptions) => {
  return await getSurveyFields(options);
};

export const getOneField = async (id: string) => {
  return await getSurveyField(id);
};

export type {
  SurveySectionFilterOptions,
  SurveyFieldFilterOptions,
  CreateSurveySectionPayload,
  UpdateSurveySectionPayload,
  DeleteSurveySectionPayload,
  CreateSurveyFieldPayload,
  UpdateSurveyFieldPayload,
  DeleteSurveyFieldPayload,
};

