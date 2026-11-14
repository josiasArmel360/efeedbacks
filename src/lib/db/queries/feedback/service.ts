import {
  updateFeedback,
  deleteFeedback,
  submitFeedback,
  getFeedback,
  getFeedbackByCode,
  getFeedbacks,
  getDashboardKPIs as fetchDashboardKPIs,
  type FeedbackFilterOptions,
  type DashboardKPIsData,
  type DashboardDepartmentStat,
  type DashboardTrendPoint,
  type DashboardRatingPoint,
} from "./model";
import type {
  UpdateFeedbackPayload,
  DeleteFeedbackPayload,
  SubmitFeedbackPayload,
  FeedbackTreatmentData,
  TrackFeedbackData,
} from "./validator";

export const submit = async (payload: SubmitFeedbackPayload) => {
  return await submitFeedback(payload);
};

export const update = async (payload: UpdateFeedbackPayload) => {
  return await updateFeedback(payload);
};

export const remove = async (payload: DeleteFeedbackPayload) => {
  return await deleteFeedback(payload);
};

export const getAll = async (options?: FeedbackFilterOptions) => {
  return await getFeedbacks(options);
};

export const getOne = async (id: string) => {
  return await getFeedback(id);
};

export const getByCode = async (code: string) => {
  return await getFeedbackByCode(code);
};

export const getDashboardKPIs = async () => {
  return await fetchDashboardKPIs();
};

export type {
  FeedbackFilterOptions,
  DashboardKPIsData,
  DashboardDepartmentStat,
  DashboardTrendPoint,
  DashboardRatingPoint,
  SubmitFeedbackPayload,
  UpdateFeedbackPayload,
  DeleteFeedbackPayload,
  FeedbackTreatmentData,
  TrackFeedbackData,
};

