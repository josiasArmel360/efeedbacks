"use server";

import * as formsBuilder from "@/lib/db/queries/form-builder/service";

// Sections thématiques
export const createSection = formsBuilder.createSection;
export const updateSection = formsBuilder.updateSection;
export const removeSection = formsBuilder.removeSection;
export const getAllSections = formsBuilder.getAllSections;
export const getPublicSections = formsBuilder.getPublicSections;
export const getOneSection = formsBuilder.getOneSection;

// Critères & Questions
export const createField = formsBuilder.createField;
export const updateField = formsBuilder.updateField;
export const removeField = formsBuilder.removeField;
export const getAllFields = formsBuilder.getAllFields;
export const getOneField = formsBuilder.getOneField;
