"use client";

import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { LucideIcon } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumericInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  placeholder?: string;
  isInteger?: boolean;
  step?: number;
  min?: number;
  max?: number;
  description?: string;
  className?: string;
  type?: "text" | "number";
  icon?: LucideIcon;
  prefix?: string;
  suffix?: string;
  readOnly?: boolean;
  size?: "sm" | "lg";
  value?: number | string | null;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  nullable?: boolean;
}

interface NumericInputFieldProps {
  inputId: string;
  label?: string;
  placeholder?: string;
  isInteger?: boolean;
  step?: number;
  min?: number;
  max?: number;
  description?: string;
  className?: string;
  type?: "text" | "number";
  icon?: LucideIcon;
  prefix?: string;
  suffix?: string;
  readOnly?: boolean;
  size?: "sm" | "lg";
  value?: number | string | null;
  onChange?: (value: number | string | null) => void;
  disabled?: boolean;
  required?: boolean;
  nullable?: boolean;
  error?: { message?: string };
}

const keyFilter = (
  regex: RegExp,
  event: React.KeyboardEvent<HTMLInputElement>,
) => {
  const key = event.key;
  if (key === "Enter") return;

  const specialKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];

  if (specialKeys.includes(key)) return;

  if (key.length === 1 && !regex.test(key)) {
    event.preventDefault();
  }
};

const NumericInputField = ({
  inputId,
  label,
  placeholder,
  step,
  min,
  max,
  isInteger,
  description,
  className,
  type = "text",
  icon: Icon,
  prefix,
  suffix,
  readOnly,
  size = "lg",
  value,
  onChange,
  disabled,
  required,
  nullable = false,
  error,
}: NumericInputFieldProps) => {
  return (
    <Field data-invalid={!!error} className="flex flex-col gap-1.5">
      {label && (
        <FieldLabel htmlFor={inputId}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </FieldLabel>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Icon className="h-4 w-4" />
          </div>
        )}
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none font-semibold uppercase text-[10px]">
            {prefix}
          </div>
        )}
        <Input
          id={inputId}
          type={type}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onKeyDown={(e) => keyFilter(isInteger ? /^[0-9]$/ : /^[0-9.]$/, e)}
          className={cn(
            size === "sm" ? "h-8" : "h-9",
            (Icon || prefix) && "pl-9",
            (readOnly || disabled) && "cursor-not-allowed",
            "transition-all duration-200",
            className,
          )}
          onChange={(e) => {
            const val = e.target.value;

            // Handle empty input
            if (val === "" || (nullable && val === null)) {
              const emptyVal = nullable ? null : 0;
              onChange?.(emptyVal);
              return;
            }

            // Parse the value
            const parsed = isInteger ? parseInt(val, 10) : parseFloat(val);

            if (isNaN(parsed)) {
              onChange?.(val);
            } else {
              if (!isInteger && val.endsWith(".")) {
                onChange?.(val);
              } else {
                onChange?.(parsed);
              }
            }
          }}
          value={value ?? (nullable ? "" : 0)}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none font-semibold uppercase text-[10px]">
            {suffix}
          </div>
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const NumericInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onChange,
  ...rest
}: NumericInputProps<T>) => {
  const generatedId = React.useId();
  const effectiveId = inputId ?? generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <NumericInputField
            {...rest}
            inputId={effectiveId}
            value={field.value}
            onChange={(val) => {
              field.onChange(val);
              if (typeof val === "number" || val === null) {
                onChange?.(val);
              }
            }}
            disabled={formState.isSubmitting || disabled}
            error={fieldState.error}
          />
        )}
      />
    );
  }

  // Standalone mode when react-hook-form is not used
  return (
    <NumericInputField
      {...rest}
      inputId={effectiveId}
      value={value}
      onChange={(val) => {
        if (typeof val === "number" || val === null) {
          onChange?.(val);
        }
      }}
      disabled={disabled}
    />
  );
};
