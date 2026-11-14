"use client";

import { useId } from "react";
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

interface TextInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  placeholder?: string;
  description?: string;
  uppercase?: boolean;
  type?: "text" | "email";
  autoComplete?: string;
  className?: string;
  readOnly?: boolean;
  icon?: LucideIcon;
  prefix?: string;
  suffix?: string;
  size?: "sm" | "lg";
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  optionButton?: React.ReactNode;
  required?: boolean;
  maxLength?: number;
}

interface TextInputFieldProps {
  inputId: string;
  label?: string;
  placeholder?: string;
  description?: string;
  uppercase?: boolean;
  type?: "text" | "email";
  autoComplete?: string;
  className?: string;
  readOnly?: boolean;
  icon?: LucideIcon;
  prefix?: string;
  suffix?: string;
  size?: "sm" | "lg";
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  optionButton?: React.ReactNode;
  required?: boolean;
  maxLength?: number;
  error?: { message?: string };
}

const TextInputField = ({
  inputId,
  label,
  placeholder,
  description,
  uppercase = false,
  type,
  autoComplete,
  className,
  readOnly,
  icon: Icon,
  prefix,
  suffix,
  size = "lg",
  value,
  onChange,
  disabled,
  optionButton,
  required,
  maxLength,
  error,
}: TextInputFieldProps) => {
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
          value={value ?? ""}
          maxLength={maxLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          type={type}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => {
            const val = e.target.value;
            const transformed =
              type === "email"
                ? val.toLowerCase()
                : uppercase
                  ? val.toUpperCase()
                  : val;
            onChange?.(transformed);
          }}
          className={cn(
            size === "sm" ? "h-8" : "h-9",
            (Icon || prefix) && "pl-9",
            (readOnly || disabled) && "cursor-not-allowed",
            "transition-all duration-200",
            className,
          )}
        />

        {optionButton}

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

export const TextInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onChange,
  ...rest
}: TextInputProps<T>) => {
  const generatedId = useId();
  const effectiveId = inputId ?? generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <TextInputField
            {...rest}
            inputId={effectiveId}
            value={field.value}
            onChange={field.onChange}
            disabled={formState.isSubmitting || disabled}
            error={fieldState.error}
          />
        )}
      />
    );
  }

  // Standalone mode when react-hook-form is not used
  return (
    <TextInputField
      {...rest}
      inputId={effectiveId}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
