"use client";

import { useId } from "react";
import { format, isValid, parse, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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

interface DateTimePickerInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  disablePrevDate?: boolean;
  disableNextDate?: boolean;
  fromYear?: number;
  toYear?: number;
  size?: "sm" | "lg";
  transparent?: boolean;
  className?: string;
  description?: string;
  value?: Date | string;
  onChange?: (date?: Date) => void;
  disabled?: boolean;
  required?: boolean;
}

interface DateTimeFieldProps {
  inputId: string;
  label?: string;
  disablePrevDate?: boolean;
  disableNextDate?: boolean;
  fromYear?: number;
  toYear?: number;
  size?: "sm" | "lg";
  transparent?: boolean;
  className?: string;
  description?: string;
  value?: Date | string;
  onChange?: (date?: Date) => void;
  disabled?: boolean;
  required?: boolean;
  error?: { message?: string };
}

const parseDateValue = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return isValid(value) ? value : undefined;
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.includes("-")) {
    const parsedIso = parseISO(trimmed);
    if (isValid(parsedIso)) return parsedIso;

    const parsedYmd = parse(trimmed, "yyyy-MM-dd", new Date());
    if (isValid(parsedYmd)) return parsedYmd;
  }

  if (trimmed.includes("/")) {
    const parsedFr = parse(trimmed, "dd/MM/yyyy", new Date());
    if (isValid(parsedFr)) return parsedFr;
  }

  const fallback = new Date(trimmed);
  return isValid(fallback) ? fallback : undefined;
};

const DateTimeField = ({
  inputId,
  label,
  disablePrevDate = false,
  disableNextDate = false,
  fromYear = new Date().getFullYear() - 2,
  toYear = new Date().getFullYear() + 2,
  size = "lg",
  transparent = false,
  className,
  description,
  value,
  onChange,
  disabled,
  required,
  error,
}: DateTimeFieldProps) => {
  const currentDate = parseDateValue(value);
  const timeValue = currentDate ? format(currentDate, "HH:mm") : "12:00";

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const [hours, minutes] = timeValue.split(":").map(Number);
    date.setHours(hours, minutes);
    onChange?.(date);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newDate = currentDate ? new Date(currentDate) : new Date();
    newDate.setHours(hours, minutes);
    onChange?.(newDate);
  };

  return (
    <Field data-invalid={!!error} className="flex flex-col gap-1.5">
      {label && (
        <FieldLabel htmlFor={inputId}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </FieldLabel>
      )}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id={inputId}
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                size === "sm" ? "h-8" : "h-9",
                !currentDate && "text-muted-foreground",
                transparent && "bg-transparent hover:bg-transparent",
                className,
              )}
              disabled={disabled}
            >
              {currentDate
                ? format(currentDate, "PPP à HH:mm", { locale: fr })
                : "Choisir date & heure"}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0 gap-2!" align="start">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleDateSelect}
            locale={fr}
            disabled={(date) => {
              let isDisabled = !!disabled;
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
          <div className="p-3 border-t flex items-center justify-end gap-2">
            <span className="text-xs font-medium">Heure</span>
            <Input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              disabled={disabled}
              className="h-9 w-24"
            />
          </div>
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const DateTimePickerInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onChange,
  ...rest
}: DateTimePickerInputProps<T>) => {
  const generatedId = useId();
  const effectiveId = inputId ?? generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <DateTimeField
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
    <DateTimeField
      {...rest}
      inputId={effectiveId}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
