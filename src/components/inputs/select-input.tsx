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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string | null;
}

interface SelectInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  description?: string;
  className?: string;
  icon?: LucideIcon;
  size?: "sm" | "lg";
  value?: string | null;
  onValueChange?: (value: string) => void;
  transparent?: boolean;
  disabled?: boolean;
  required?: boolean;
}

interface SelectFieldProps {
  inputId: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  description?: string;
  className?: string;
  icon?: LucideIcon;
  size?: "sm" | "lg";
  value?: string | null;
  onValueChange?: (val: string | null) => void;
  transparent?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: { message?: string };
}

const ucFirst = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const SelectField = ({
  inputId,
  label,
  placeholder,
  options,
  description,
  className = "w-full",
  icon: Icon,
  size = "lg",
  value,
  onValueChange,
  transparent = false,
  disabled,
  required,
  error,
}: SelectFieldProps) => {
  return (
    <Field data-invalid={!!error} className="flex flex-col gap-1.5">
      {label && (
        <FieldLabel htmlFor={inputId}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </FieldLabel>
      )}

      <Select
        items={options}
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
      >
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <SelectTrigger
            id={inputId}
            className={cn(
              transparent && "bg-transparent hover:bg-transparent",
              !value && "text-muted-foreground",
              Icon && "pl-9",
              className,
            )}
            size={size === "sm" ? "sm" : "default"}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </div>

        <SelectContent alignItemWithTrigger={false} align="start">
          <SelectGroup>
            {options.map((option, index) => (
              <SelectItem
                key={option.value ?? `option-${index}`}
                value={option.value}
              >
                {ucFirst(option.label)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const SelectInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onValueChange,
  ...rest
}: SelectInputProps<T>) => {
  const generatedId = useId();
  const effectiveId = inputId ?? generatedId;

  if (name && control) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <SelectField
            {...rest}
            inputId={effectiveId}
            value={field.value}
            onValueChange={field.onChange}
            disabled={formState.isSubmitting || disabled}
            error={fieldState.error}
          />
        )}
      />
    );
  }

  // Standalone mode when react-hook-form is not used
  return (
    <SelectField
      {...rest}
      inputId={effectiveId}
      value={value}
      onValueChange={(val) => {
        if (val !== null) {
          onValueChange?.(val);
        }
      }}
      disabled={disabled}
    />
  );
};
