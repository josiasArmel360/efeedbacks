"use client";

import React from "react";
import { Control, Path } from "react-hook-form";

import {
  DatePickerInput,
  NumericInput,
  RadioGroupButtonInput,
  RatingInput,
  SelectInput,
  TextInput,
  TextareaInput,
} from "@/components/inputs";
import type { SurveyField } from "@/lib/types";
import type { SubmitFeedbackPayload } from "@/lib/db/queries/feedback/validator";

export interface SurveyFieldRendererProps {
  field: SurveyField;
  control: Control<SubmitFeedbackPayload>;
  disabled?: boolean;
}

export const SurveyFieldRenderer = ({
  field,
  control,
  disabled,
}: SurveyFieldRendererProps) => {
  const fieldName = `answers.${field.id}` as Path<SubmitFeedbackPayload>;

  const options = (field.options || []).map((opt) => ({
    label: opt,
    value: opt,
  }));

  switch (field.fieldType) {
    case "rating_5":
      return (
        <RatingInput
          control={control}
          name={fieldName}
          label={field.label}
          description={field.description || undefined}
          required={field.isRequired}
          disabled={disabled}
          size="md"
        />
      );

    case "text":
      return (
        <TextInput
          control={control}
          name={fieldName}
          label={field.label}
          description={field.description || undefined}
          required={field.isRequired}
          disabled={disabled}
          placeholder="Saisissez votre réponse..."
        />
      );

    case "number":
      return (
        <NumericInput
          control={control}
          name={fieldName}
          label={field.label}
          description={field.description || undefined}
          required={field.isRequired}
          disabled={disabled}
          placeholder="0"
          isInteger={true}
        />
      );

    case "radio":
      return (
        <RadioGroupButtonInput
          control={control}
          name={fieldName}
          label={field.label}
          description={field.description || undefined}
          required={field.isRequired}
          disabled={disabled}
          options={options}
        />
      );

    case "select":
      return (
        <SelectInput
          control={control}
          name={fieldName}
          label={field.label}
          description={field.description || undefined}
          required={field.isRequired}
          disabled={disabled}
          options={options}
          placeholder="Sélectionnez une réponse..."
        />
      );

    case "textarea":
      return (
        <TextareaInput
          control={control}
          name={fieldName}
          label={field.label}
          description={field.description || undefined}
          required={field.isRequired}
          disabled={disabled}
          rows={3}
          placeholder="Précisez votre réponse..."
        />
      );

    case "date":
      return (
        <DatePickerInput
          control={control}
          name={fieldName}
          label={field.label}
          description={field.description || undefined}
          required={field.isRequired}
          disabled={disabled}
          placeholder="Sélectionner une date..."
          fromYear={1920}
          toYear={new Date().getFullYear() + 5}
        />
      );

    default:
      return null;
  }
};
