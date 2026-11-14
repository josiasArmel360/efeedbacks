"use client";

import { useId } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, RotateCcw } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { DateRange } from "react-day-picker";
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

export interface DateRangeValue {
  from?: Date | string;
  to?: Date | string;
}

interface DateRangePickerInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  dateRange?: DateRange | undefined;
  setDateRange?: (range: DateRange | undefined) => void;
  value?: DateRange | undefined;
  onChange?: (range: DateRange | undefined) => void;
  size?: "sm" | "lg";
  dateFormat?: "PPP" | "PP" | "P";
  transparent?: boolean;
  description?: string;
  disabled?: boolean;
  required?: boolean;
}

interface DateRangePickerFieldProps {
  inputId: string;
  label?: string;
  placeholder?: string;
  className?: string;
  range?: DateRange;
  onSelectRange?: (range: DateRange | undefined) => void;
  size?: "sm" | "lg";
  dateFormat?: "PPP" | "PP" | "P";
  transparent?: boolean;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  error?: { message?: string };
}

const parseRangeValue = (raw: unknown): DateRange | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as { from?: unknown; to?: unknown };
  const from =
    obj.from instanceof Date
      ? obj.from
      : typeof obj.from === "string"
        ? parseISO(obj.from)
        : undefined;
  const to =
    obj.to instanceof Date
      ? obj.to
      : typeof obj.to === "string"
        ? parseISO(obj.to)
        : undefined;

  return { from, to };
};

const DateRangePickerField = ({
  inputId,
  label,
  placeholder = "Sélectionner une période",
  className,
  range,
  onSelectRange,
  size = "lg",
  dateFormat = "PPP",
  transparent = false,
  description,
  disabled,
  required,
  error,
}: DateRangePickerFieldProps) => {
  const currentFormat =
    dateFormat === "PPP" ? "PPP" : dateFormat === "PP" ? "PP" : "P";

  const formatDateRange = (current?: DateRange) => {
    if (!current?.from) return placeholder;
    if (!current.to || current.from.getTime() === current.to.getTime()) {
      return format(current.from, currentFormat, { locale: fr });
    }
    return `${format(current.from, currentFormat, { locale: fr })} - ${format(
      current.to,
      currentFormat,
      { locale: fr },
    )}`;
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
                "w-full justify-start text-left font-normal gap-2",
                size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm",
                !range?.from && "text-muted-foreground",
                transparent && "bg-transparent hover:bg-transparent",
                className,
              )}
              disabled={disabled}
            >
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{formatDateRange(range)}</span>
            </Button>
          }
        />

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={onSelectRange}
            numberOfMonths={2}
            locale={fr}
            disabled={disabled}
          />
          {range?.from && (
            <div className="flex justify-end p-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectRange?.(undefined)}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                type="button"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Réinitialiser
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const DateRangePickerInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  dateRange,
  setDateRange,
  value,
  onChange,
  ...rest
}: DateRangePickerInputProps<T>) => {
  const generatedId = useId();
  const effectiveId = inputId ?? generatedId;

  if (name && control) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <DateRangePickerField
            {...rest}
            inputId={effectiveId}
            range={parseRangeValue(field.value)}
            onSelectRange={field.onChange}
            disabled={formState.isSubmitting || disabled}
            error={fieldState.error}
          />
        )}
      />
    );
  }

  // Standalone mode when react-hook-form is not used
  const standaloneRange = parseRangeValue(value ?? dateRange);

  return (
    <DateRangePickerField
      {...rest}
      inputId={effectiveId}
      range={standaloneRange}
      onSelectRange={(selected) => {
        onChange?.(selected);
        setDateRange?.({ from: selected?.from, to: selected?.to });
      }}
      disabled={disabled}
    />
  );
};
