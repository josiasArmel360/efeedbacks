"use client";

import { useId } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export interface RadioOption {
  label: string;
  value: string;
  className?: string;
  activeClassName?: string;
}

export interface RadioGroupButtonInputProps<
  T extends FieldValues = FieldValues,
> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  options: RadioOption[];
  className?: string;
  description?: string;
  size?: "sm" | "lg";
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

interface RadioGroupFieldProps {
  groupId: string;
  inputId?: string;
  label?: string;
  options: RadioOption[];
  className?: string;
  description?: string;
  size?: "sm" | "lg";
  value?: string;
  onValueChange?: (val: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: { message?: string };
}

const RadioGroupField = ({
  groupId,
  inputId,
  label,
  options,
  className,
  description,
  size = "lg",
  value,
  onValueChange,
  disabled,
  required,
  error,
}: RadioGroupFieldProps) => {
  const effectiveId = inputId || groupId;

  return (
    <Field
      data-invalid={!!error}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {label && (
        <FieldLabel
          htmlFor={
            options.length > 0 ? `${effectiveId}-${options[0].value}` : effectiveId
          }
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </FieldLabel>
      )}

      <RadioGroup
        id={effectiveId}
        onValueChange={onValueChange}
        value={value}
        disabled={disabled}
        className="flex flex-wrap gap-3"
      >
        {options.map((option) => {
          const itemId = `${effectiveId}-${option.value}`;
          const isSelected = value === option.value;

          return (
            <div key={option.value} className="flex-1 space-y-0">
              <RadioGroupItem
                value={option.value}
                id={itemId}
                className="sr-only hidden"
              />
              <label
                htmlFor={itemId}
                onClick={() => {
                  if (!disabled) {
                    onValueChange?.(option.value);
                  }
                }}
                className={cn(
                  "flex items-center justify-center rounded-md border-2 border-muted bg-popover cursor-pointer transition-all hover:bg-accent hover:text-accent-foreground font-medium text-center min-w-full",
                  size === "sm"
                    ? "h-8 text-xs px-3 py-1"
                    : "h-9 text-sm px-4 py-2",
                  isSelected
                    ? option.activeClassName ||
                        "border-primary bg-accent ring-1 ring-primary"
                    : option.className || "",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </RadioGroup>

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const RadioGroupButtonInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onChange,
  ...rest
}: RadioGroupButtonInputProps<T>) => {
  const generatedId = useId();
  const resolvedGroupId = inputId || name || generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <RadioGroupField
            {...rest}
            groupId={resolvedGroupId}
            inputId={resolvedGroupId}
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled || formState.isSubmitting}
            error={fieldState.error}
          />
        )}
      />
    );
  }

  // Standalone mode when react-hook-form is not used
  return (
    <RadioGroupField
      {...rest}
      groupId={resolvedGroupId}
      inputId={resolvedGroupId}
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    />
  );
};
