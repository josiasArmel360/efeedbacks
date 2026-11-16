"use client";

import { useId } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

interface CheckboxInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label: string;
  id?: string;
  className?: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}

interface CheckboxFieldProps {
  id?: string;
  inputId?: string;
  label: string;
  className?: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: { message?: string };
}

const CheckboxField = ({
  id,
  inputId,
  label,
  className,
  description,
  checked,
  onCheckedChange,
  disabled,
  required,
  error,
}: CheckboxFieldProps) => {
  const resolvedId = inputId || id;

  return (
    <Field
      data-invalid={!!error}
      className={cn(
        "flex flex-col gap-1.5",
        description && "border p-3 rounded-md flex flex-col gap-2",
      )}
    >
      <div className="flex flex-row items-center space-x-2 space-y-0 rounded-xs">
        <Checkbox
          id={resolvedId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="border-primary data-[state=checked]:bg-primary"
        />

        <div className="space-y-1 leading-none">
          <FieldLabel
            className={cn("text-sm font-medium cursor-pointer", className)}
            htmlFor={resolvedId}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FieldLabel>
        </div>
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const CheckboxInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  id,
  disabled,
  checked,
  onCheckedChange,
  ...rest
}: CheckboxInputProps<T>) => {
  const generatedId = useId();
  const resolvedId = inputId || id || name || generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <CheckboxField
            {...rest}
            inputId={resolvedId}
            id={resolvedId}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={formState.isSubmitting || disabled}
            error={fieldState.error}
          />
        )}
      />
    );
  }

  // Standalone mode when react-hook-form is not used
  return (
    <CheckboxField
      {...rest}
      inputId={resolvedId}
      id={resolvedId}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  );
};
