import {
  CRUD_ACTIONS,
  ACTOR_TYPE,
  FEEDBACK_STATUS,
  FEEDBACK_PRIORITY,
  SURVEY_FIELD_TYPE,
  RECOMMENDATION,
} from "./constants";

export type FormMode = "create" | "update" | "preview";

export type CrudAction = (typeof CRUD_ACTIONS)[number];

export interface AllowedModule {
  resource: string;
  hasAccess: boolean;
  actions: CrudAction[];
}

export interface Permissions {
  allowedModules: AllowedModule[];
  hasFullAccess: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  description?: string | null;
  logo?: string | null;
}

export interface AccessPolicy {
  id: string;
  name: string;
  code: string;
  allowedModules: AllowedModule[];
  hasFullAccess: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  description?: string | null;
  deletedAt?: Date | null;
}

export interface UserPermissionException {
  id: string;
  userId: string;
  allowedModules: AllowedModule[];
  hasFullAccess: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface User {
  policyId: string;

  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  phoneNumber?: string | null;
  job?: string | null;
  banReason?: string | null;
  banExpires?: Date | null;
  deletedAt?: Date | null;

  permissions?: Permissions | null;
  policy?: Pick<AccessPolicy, "id" | "name" | "code"> | null;
  permissionException?: UserPermissionException | null;
}

export interface Department {
  id: string;
  name: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  description?: string | null;
}

export type ActorType = (typeof ACTOR_TYPE)[number];

export interface SurveySection {
  id: string;
  title: string;
  targetActors: ActorType[];
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  description?: string | null;

  fields?: SurveyField[];
}

export type SurveyFieldType = (typeof SURVEY_FIELD_TYPE)[number];

export interface SurveyField {
  sectionId: string;

  id: string;
  label: string;
  fieldType: SurveyFieldType;
  targetActors: ActorType[];
  isRequired: boolean;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  description?: string | null;
  options?: string[] | null;

  section?: Pick<SurveySection, "id" | "title" | "orderIndex">;
}

export type FeedbackStatus = (typeof FEEDBACK_STATUS)[number];
export type FeedbackPriority = (typeof FEEDBACK_PRIORITY)[number];
export type Recommendation = (typeof RECOMMENDATION)[number];
export interface Feedback {
  departmentId?: string | null;
  treatedByUserId?: string | null;
  assignedToUserId?: string | null;

  id: string;
  code: string;
  actorType: ActorType;
  isAnonymous: boolean;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  createdAt: Date;
  updatedAt: Date;
  authorName?: string | null;
  authorEmail?: string | null;
  authorPhone?: string | null;
  authorRoleOrRoom?: string | null;
  visitDate?: string | null;
  overallRating: number;
  recommendation?: Recommendation | null;
  positivePoints?: string | null;
  negativePoints?: string | null;
  suggestions?: string | null;
  answersSnapshot?: Record<string, unknown> | null;
  internalNotes?: string | null;
  correctiveAction?: string | null;
  treatedAt?: Date | null;

  department?: Department | null;
  assignedTo?: { id: string; name: string; email: string } | null;
  answers?: FeedbackAnswer[];
}

export interface FeedbackAnswer {
  id: string;
  feedbackId: string;
  fieldId: string;
  fieldLabelSnapshot: string;
  valueNumber?: number | null;
  valueText?: string | null;

  feedback?: Feedback | null;
}
