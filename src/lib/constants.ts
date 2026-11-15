export const APP_NAME = "eFeedbacks";

export const UNAUTHORIZED_MESSAGE =
  "Vous n'êtes pas autorisé à effectuer cette action";
export const DELETE_ACCESS_DENIED_MESSAGE =
  "Vous n'avez pas la permission de supprimer cette ressource";
export const UPDATE_ACCESS_DENIED_MESSAGE =
  "Vous n'avez pas la permission de modifier cette ressource";
export const CREATE_ACCESS_DENIED_MESSAGE =
  "Vous n'avez pas la permission de créer cette ressource";
export const READ_ACCESS_DENIED_MESSAGE =
  "Vous n'avez pas la permission de lire cette ressource";

export const CRUD_ACTIONS = ["read", "create", "update", "delete"] as const;

export const ACTOR_TYPE = [
  "malade",
  "parent_malade",
  "personnel_soignant",
  "personnel",
] as const;

export const SURVEY_FIELD_TYPE = [
  "rating_5",
  "text",
  "number",
  "radio",
  "select",
  "textarea",
  "date",
] as const;

export const FEEDBACK_PRIORITY = [
  "faible",
  "normale",
  "haute",
  "urgente",
] as const;

export const FEEDBACK_STATUS = ["nouveau", "en_cours", "traite"] as const;

export const RECOMMENDATION = ["oui", "non", "mitige"] as const;
