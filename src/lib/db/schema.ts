import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import {
  FeedbackPriority,
  FeedbackStatus,
  SurveyFieldType,
  type ActorType,
  type AllowedModule,
  type Recommendation,
} from "@/lib/types";

// ============================================================================
// 0. DONNEES DE STRUCTURE
// ============================================================================
export const tenant = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 30 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  description: text("description"),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ============================================================================
// 1. POLITIQUES D'ACCÈS (MULTI-TENANT & 100% DYNAMIQUE)
// ============================================================================
export const accessPolicy = pgTable(
  "access_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 120 }).notNull(),
    description: text("description"),
    allowedModules: jsonb("allowed_modules")
      .$type<AllowedModule[]>()
      .notNull()
      .default([]),
    hasFullAccess: boolean("has_full_access").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("access_policies_code_unique")
      .on(table.code)
      .where(sql`deleted_at IS NULL`),
    index("access_policies_deleted_idx").on(table.deletedAt),
  ],
);

// ============================================================================
// 2. UTILISATEURS & AUTHENTIFICATION (BETTER-AUTH + TENANT)
// ============================================================================
export const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    policyId: uuid("policy_id")
      .references(() => accessPolicy.id, { onDelete: "restrict" })
      .notNull(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    phoneNumber: varchar("phone_number", { length: 30 }),
    job: text("job"),
    twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
    banned: boolean("banned").notNull().default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("user_policy_id_idx").on(table.policyId),
    index("user_deleted_idx").on(table.deletedAt),
  ],
);

export const session = pgTable(
  "session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    uniqueIndex("account_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const twoFactor = pgTable(
  "two_factors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    verified: boolean("verified").default(false).notNull(),
    failedVerificationCount: integer("failed_verification_count")
      .default(0)
      .notNull(),
    lockedUntil: timestamp("locked_until"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("two_factors_user_id_idx").on(table.userId)],
);

export const permissionException = pgTable(
  "user_permission_exceptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),
    allowedModules: jsonb("allowed_modules").$type<AllowedModule[]>().notNull(),
    hasFullAccess: boolean("has_full_access").default(false).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("user_perm_exc_user_id_idx").on(table.userId)],
);

// ============================================================================
// 3. SERVICES HOSPITALIERS / DÉPARTEMENTS
// ============================================================================
export const department = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ============================================================================
// 4. MOTEUR DE QUESTIONNAIRE DYNAMIQUE (SECTIONS & CRITÈRES)
// ============================================================================
export const surveySection = pgTable("survey_section", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetActors: jsonb("target_actors").$type<ActorType[]>().notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const surveyField = pgTable(
  "survey_field",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    sectionId: uuid("section_id")
      .notNull()
      .references(() => surveySection.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 255 }).notNull(),
    description: text("description"),
    fieldType: varchar("field_type", { length: 50 })
      .$type<SurveyFieldType>()
      .notNull(),
    options: jsonb("options").$type<string[]>(),
    targetActors: jsonb("target_actors").$type<ActorType[]>().notNull(),
    isRequired: boolean("is_required").notNull().default(true),
    orderIndex: integer("order_index").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("survey_field_section_id_idx").on(table.sectionId)],
);

// ============================================================================
// 5. RETOURS & AVIS DES ACTEURS (FEEDBACKS)
// ============================================================================
export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    actorType: varchar("actor_type", { length: 50 })
      .$type<ActorType>()
      .notNull(),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    authorName: varchar("author_name", { length: 150 }),
    authorEmail: varchar("author_email", { length: 255 }),
    authorPhone: varchar("author_phone", { length: 30 }),
    authorRoleOrRoom: varchar("author_role_or_room", { length: 100 }),
    departmentId: uuid("service_id").references(() => department.id, {
      onDelete: "set null",
    }),
    visitDate: varchar("visit_date", { length: 20 }),
    overallRating: integer("overall_rating").notNull().default(5),
    recommendation: varchar("recommendation", {
      length: 20,
    }).$type<Recommendation>(),
    positivePoints: text("positive_points"),
    negativePoints: text("negative_points"),
    suggestions: text("suggestions"),
    answersSnapshot: jsonb("answers_snapshot").$type<Record<string, unknown>>(),
    status: varchar("status", { length: 50 })
      .notNull()
      .$type<FeedbackStatus>()
      .default("nouveau"),
    priority: varchar("priority", { length: 50 })
      .$type<FeedbackPriority>()
      .notNull()
      .default("normale"),
    assignedToUserId: uuid("assigned_to_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    internalNotes: text("internal_notes"),
    correctiveAction: text("corrective_action"),
    treatedAt: timestamp("treated_at"),
    treatedByUserId: uuid("treated_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("feedback_status_idx").on(table.status),
    index("feedback_priority_idx").on(table.priority),
    index("feedback_actor_type_idx").on(table.actorType),
    index("feedback_code_idx").on(table.code),
    index("feedback_created_at_idx").on(table.createdAt),
  ],
);

export const feedbackAnswer = pgTable(
  "feedback_answer",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => feedback.id, { onDelete: "cascade" }),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => surveyField.id, { onDelete: "cascade" }),
    fieldLabelSnapshot: varchar("field_label_snapshot", {
      length: 255,
    }).notNull(),
    valueNumber: integer("value_number"),
    valueText: text("value_text"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("feedback_answer_feedback_id_idx").on(table.feedbackId),
    index("feedback_answer_field_id_idx").on(table.fieldId),
  ],
);

// ============================================================================
// RELATIONS
// ============================================================================

export const accessPolicyRelations = relations(accessPolicy, ({ many }) => ({
  users: many(user),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  policy: one(accessPolicy, {
    fields: [user.policyId],
    references: [accessPolicy.id],
  }),
  sessions: many(session),
  accounts: many(account),
  twoFactor: one(twoFactor),
  twoFactors: many(twoFactor),
  permissionException: one(permissionException),
  assignedFeedbacks: many(feedback, { relationName: "feedback_assigned_to" }),
  treatedFeedbacks: many(feedback, { relationName: "feedback_treated_by" }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}));

export const permissionExceptionRelations = relations(
  permissionException,
  ({ one }) => ({
    user: one(user, {
      fields: [permissionException.userId],
      references: [user.id],
    }),
  }),
);

export const departmentRelations = relations(department, ({ many }) => ({
  feedbacks: many(feedback),
}));

export const surveySectionRelations = relations(surveySection, ({ many }) => ({
  fields: many(surveyField),
}));

export const surveyFieldRelations = relations(surveyField, ({ one, many }) => ({
  section: one(surveySection, {
    fields: [surveyField.sectionId],
    references: [surveySection.id],
  }),
  answers: many(feedbackAnswer),
}));

export const feedbackRelations = relations(feedback, ({ one, many }) => ({
  department: one(department, {
    fields: [feedback.departmentId],
    references: [department.id],
  }),
  assignedTo: one(user, {
    fields: [feedback.assignedToUserId],
    references: [user.id],
    relationName: "feedback_assigned_to",
  }),
  treatedBy: one(user, {
    fields: [feedback.treatedByUserId],
    references: [user.id],
    relationName: "feedback_treated_by",
  }),
  answers: many(feedbackAnswer),
}));

export const feedbackAnswerRelations = relations(feedbackAnswer, ({ one }) => ({
  feedback: one(feedback, {
    fields: [feedbackAnswer.feedbackId],
    references: [feedback.id],
  }),
  field: one(surveyField, {
    fields: [feedbackAnswer.fieldId],
    references: [surveyField.id],
  }),
}));
