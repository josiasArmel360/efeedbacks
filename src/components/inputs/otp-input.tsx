"use client";

import { useId } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface OTPInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "lg";
  maxLength?: number;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

interface OTPFieldProps {
  inputId: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "lg";
  maxLength?: number;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: { message?: string };
}

const OTPField = ({
  inputId,
  label = "Code de vérification",
  description,
  disabled,
  required,
  size = "lg",
  maxLength = 6,
  className,
  value,
  onChange,
  error,
}: OTPFieldProps) => {
  return (
    <Field
      data-invalid={!!error}
      className="flex flex-col items-center gap-1.5"
    >
      {label && (
        <FieldLabel
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-foreground/70"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </FieldLabel>
      )}
      <InputOTP
        id={inputId}
        maxLength={maxLength}
        disabled={disabled}
        value={value}
        onChange={onChange}
      >
        <InputOTPGroup className="flex flex-row items-center justify-between w-full">
          {Array.from({ length: maxLength }, (_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className={cn(
                "text-center font-bold border rounded-lg",
                size === "sm" ? "h-8 w-8 text-lg" : "h-9 w-9 text-xl",
                className,
              )}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const OTPInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onChange,
  ...rest
}: OTPInputProps<T>) => {
  const generatedId = useId();
  const effectiveId = inputId ?? generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <OTPField
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
    <OTPField
      {...rest}
      inputId={effectiveId}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
