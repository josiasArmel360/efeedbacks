"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon, LucideIcon } from "lucide-react";
import { Control, FieldValues, Path, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

interface PasswordInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  icon?: LucideIcon;
  description?: string;
  size?: "sm" | "lg";
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

interface PasswordFieldProps {
  inputId: string;
  label?: string;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  icon?: LucideIcon;
  description?: string;
  size?: "sm" | "lg";
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: { message?: string };
}

const PasswordField = ({
  inputId,
  label,
  placeholder = "••••••••",
  className,
  autoComplete,
  autoFocus,
  icon: Icon,
  description,
  size = "lg",
  value,
  onChange,
  disabled,
  required,
  error,
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = React.useState(false);

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

        <Input
          id={inputId}
          type={showPassword ? "text" : "password"}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          className={cn(
            "pr-10",
            size === "sm" ? "h-8" : "h-9",
            Icon && "pl-9",
            "transition-all duration-200",
            className,
          )}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title={showPassword ? "Masquer" : "Afficher"}
        >
          {showPassword ? (
            <EyeOffIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </button>
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const PasswordInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onChange,
  ...rest
}: PasswordInputProps<T>) => {
  const generatedId = React.useId();
  const effectiveId = inputId ?? generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <PasswordField
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
    <PasswordField
      {...rest}
      inputId={effectiveId}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
