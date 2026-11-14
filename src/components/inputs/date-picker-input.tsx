"use client";

import { useId } from "react";
import { format, isValid, parse, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  placeholder?: string;
  disablePrevDate?: boolean;
  disableNextDate?: boolean;
  fromYear?: number;
  toYear?: number;
  displayFormat?: string;
  size?: "sm" | "lg";
  transparent?: boolean;
  className?: string;
  description?: string;
  value?: Date | string;
  onChange?: (date?: Date) => void;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
}

interface DatePickerFieldProps {
  inputId: string;
  label?: string;
  placeholder?: string;
  disablePrevDate?: boolean;
  disableNextDate?: boolean;
  fromYear?: number;
  toYear?: number;
  displayFormat?: string;
  size?: "sm" | "lg";
  transparent?: boolean;
  className?: string;
  description?: string;
  value?: Date | string;
  onChange?: (date?: Date) => void;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  error?: { message?: string };
}

const parseDateValue = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return isValid(value) ? value : undefined;
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Format ISO ou avec tiret (yyyy-MM-dd ou RFC/ISO complet)
  if (trimmed.includes("-")) {
    const parsedIso = parseISO(trimmed);
    if (isValid(parsedIso)) return parsedIso;

    const parsedYmd = parse(trimmed, "yyyy-MM-dd", new Date());
    if (isValid(parsedYmd)) return parsedYmd;
  }

  // Format français usuel (dd/MM/yyyy)
  if (trimmed.includes("/")) {
    const parsedFr = parse(trimmed, "dd/MM/yyyy", new Date());
    if (isValid(parsedFr)) return parsedFr;
  }

  // Fallback
  const fallback = new Date(trimmed);
  return isValid(fallback) ? fallback : undefined;
};

const DatePickerField = ({
  inputId,
  label,
  placeholder = "Sélectionner une date",
  disablePrevDate = false,
  disableNextDate = false,
  fromYear = new Date().getFullYear() - 3,
  toYear = new Date().getFullYear() + 2,
  displayFormat = "PPP",
  size = "lg",
  transparent = false,
  className,
  description,
  value,
  onChange,
  disabled,
  required,
  readOnly = false,
  error,
}: DatePickerFieldProps) => {
  const currentDate = parseDateValue(value);

  return (
    <Field data-invalid={!!error} className="flex flex-col gap-1.5">
      {label && (
        <FieldLabel htmlFor={inputId}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </FieldLabel>
      )}
      <Popover modal={true}>
        <PopoverTrigger
          render={
            <Button
              id={inputId}
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                size === "sm" ? "h-8" : "h-9",
                !value && "text-muted-foreground",
                transparent && "bg-transparent hover:bg-transparent",
                (readOnly || disabled) &&
                  "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-100",
                className,
              )}
              disabled={disabled || readOnly}
            >
              {currentDate ? (
                format(currentDate, displayFormat, { locale: fr })
              ) : (
                <span>{placeholder}</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={onChange}
            locale={fr}
            captionLayout="dropdown"
            disabled={(date) => {
              let isDisabled = !!disabled || !!readOnly;
              const today = new Date(new Date().setHours(0, 0, 0, 0));

              if (disablePrevDate) {
                isDisabled = isDisabled || date < today;
              }
              if (disableNextDate) {
                isDisabled = isDisabled || date > today;
              }

              return isDisabled;
            }}
            startMonth={fromYear ? new Date(fromYear, 0) : undefined}
            endMonth={toYear ? new Date(toYear, 11) : undefined}
          />
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const DatePickerInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onChange,
  ...rest
}: DatePickerInputProps<T>) => {
  const generatedId = useId();
  const effectiveId = inputId ?? generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <DatePickerField
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
    <DatePickerField
      {...rest}
      inputId={effectiveId}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
