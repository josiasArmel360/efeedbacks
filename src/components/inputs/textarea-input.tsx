"use client";

import { useId } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextareaInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  rows?: number;
  icon?: LucideIcon;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

interface TextareaFieldProps {
  inputId: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  rows?: number;
  icon?: LucideIcon;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: { message?: string };
}

const TextareaField = ({
  inputId,
  label,
  placeholder,
  rows = 2,
  icon: Icon,
  className,
  value,
  onChange,
  disabled,
  required,
  description,
  error,
}: TextareaFieldProps) => {
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
          <div className="absolute left-3 top-3 text-muted-foreground pointer-events-none">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <Textarea
          id={inputId}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={cn(Icon && "pl-9", className)}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

/**
 * Composant TextareaInput public, compatible RHF et Autonome
 */
export const TextareaInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onChange,
  ...rest
}: TextareaInputProps<T>) => {
  const generatedId = useId();
  const effectiveId = inputId ?? generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <TextareaField
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
    <TextareaField
      {...rest}
      inputId={effectiveId}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
