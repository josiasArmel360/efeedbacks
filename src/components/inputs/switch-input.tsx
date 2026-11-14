"use client";

import { ReactNode, useId } from "react";
import { Control, Path, FieldValues, Controller } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SwitchInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label: ReactNode | ((checked: boolean) => ReactNode);
  description?: ReactNode | ((checked: boolean) => ReactNode);
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  required?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

interface SwitchFieldProps {
  inputId: string;
  label: ReactNode | ((checked: boolean) => ReactNode);
  description?: ReactNode | ((checked: boolean) => ReactNode);
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  required?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  error?: { message?: string };
}

const SwitchField = ({
  inputId,
  label,
  description,
  className,
  labelClassName,
  descriptionClassName,
  disabled,
  size = "lg",
  required,
  checked = false,
  onCheckedChange,
  error,
}: SwitchFieldProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <Field
        orientation="horizontal"
        data-invalid={!!error}
        className={cn(
          "justify-between rounded-lg border p-2 shadow-xs",
          size === "sm" ? "min-h-9" : size === "md" ? "min-h-10" : "min-h-11",
          className,
        )}
      >
        <div className="space-y-0.5">
          <FieldLabel htmlFor={inputId} className={cn("cursor-pointer", labelClassName)}>
            {typeof label === "function" ? label(checked) : label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FieldLabel>

          {description && (
            <FieldDescription className={cn(descriptionClassName)}>
              {typeof description === "function"
                ? description(checked)
                : description}
            </FieldDescription>
          )}
        </div>
        <Switch
          id={inputId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="border-slate-200 dark:border-slate-400"
        />
      </Field>
      {error && <FieldError errors={[error]} />}
    </div>
  );
};

/**
 * Composant SwitchInput public, compatible RHF et Autonome
 */
export const SwitchInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  checked,
  onCheckedChange,
  ...rest
}: SwitchInputProps<T>) => {
  const generatedId = useId();
  const effectiveId = inputId ?? generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <SwitchField
            {...rest}
            inputId={effectiveId}
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
    <SwitchField
      {...rest}
      inputId={effectiveId}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  );
};
