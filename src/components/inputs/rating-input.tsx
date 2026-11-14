"use client";

import { useId, useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Star } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export const RATING_EMOTIONS: Record<number, { label: string; color: string }> = {
  1: { label: "Très insatisfait", color: "text-rose-600 dark:text-rose-400" },
  2: { label: "Insatisfait", color: "text-amber-600 dark:text-amber-400" },
  3: { label: "Moyen / Neutre", color: "text-yellow-600 dark:text-yellow-400" },
  4: { label: "Satisfait", color: "text-teal-600 dark:text-teal-400" },
  5: { label: "Très satisfait", color: "text-emerald-600 dark:text-emerald-400" },
};

export interface RatingInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  description?: string;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  required?: boolean;
  showEmotionalLabel?: boolean;
  className?: string;
}

interface RatingFieldProps {
  inputId: string;
  label?: string;
  description?: string;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  value?: number;
  onChange?: (val: number) => void;
  disabled?: boolean;
  required?: boolean;
  showEmotionalLabel?: boolean;
  className?: string;
  error?: { message?: string };
}

const sizeConfig = {
  sm: {
    star: "h-4 w-4",
    gap: "gap-1",
    text: "text-xs",
  },
  md: {
    star: "h-6 w-6",
    gap: "gap-2",
    text: "text-sm",
  },
  lg: {
    star: "h-8 w-8 sm:h-9 sm:w-9",
    gap: "gap-2.5 sm:gap-3",
    text: "text-sm sm:text-base font-semibold",
  },
};

const RatingField = ({
  inputId,
  label,
  description,
  maxRating = 5,
  size = "md",
  value = 0,
  onChange,
  disabled,
  required,
  showEmotionalLabel = true,
  className,
  error,
}: RatingFieldProps) => {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const activeValue = hoveredValue !== null ? hoveredValue : (value || 0);
  const currentEmotion = RATING_EMOTIONS[activeValue];
  const cfg = sizeConfig[size] || sizeConfig.md;

  const handleSelect = (val: number) => {
    if (disabled) return;
    onChange?.(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(maxRating, (value || 0) + 1);
      onChange?.(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(1, (value || 0) - 1);
      onChange?.(prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange?.(1);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange?.(maxRating);
    } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
      const num = parseInt(e.key, 10);
      if (num <= maxRating) {
        e.preventDefault();
        onChange?.(num);
      }
    }
  };

  return (
    <Field data-invalid={!!error} className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <FieldLabel htmlFor={inputId} className="cursor-pointer">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FieldLabel>
      )}

      {description && <FieldDescription>{description}</FieldDescription>}

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-1">
        <div
          id={inputId}
          role="radiogroup"
          aria-label={label || "Note d'évaluation"}
          aria-required={required}
          className={cn("inline-flex items-center", cfg.gap)}
          onMouseLeave={() => setHoveredValue(null)}
        >
          {Array.from({ length: maxRating }, (_, i) => {
            const starNumber = i + 1;
            const isFilled = starNumber <= activeValue;

            return (
              <button
                key={starNumber}
                type="button"
                role="radio"
                aria-checked={value === starNumber}
                aria-label={`${starNumber} sur ${maxRating} étoiles`}
                disabled={disabled}
                tabIndex={disabled ? -1 : (value === starNumber || (!value && starNumber === 1) ? 0 : -1)}
                onClick={() => handleSelect(starNumber)}
                onMouseEnter={() => !disabled && setHoveredValue(starNumber)}
                onFocus={() => !disabled && setHoveredValue(starNumber)}
                onBlur={() => setHoveredValue(null)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "relative rounded-lg p-1 transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:scale-115 active:scale-95",
                )}
              >
                <Star
                  className={cn(
                    cfg.star,
                    "transition-colors duration-150",
                    isFilled
                      ? "fill-amber-400 text-amber-500 drop-shadow-xs"
                      : "text-muted-foreground/30 hover:text-amber-300",
                  )}
                />
              </button>
            );
          })}
        </div>

        {showEmotionalLabel && currentEmotion && (
          <span
            className={cn(
              "font-medium transition-all duration-200 animate-in fade-in-50",
              cfg.text,
              currentEmotion.color,
            )}
          >
            {currentEmotion.label}
          </span>
        )}
      </div>

      <FieldError>{error?.message}</FieldError>
    </Field>
  );
};

export const RatingInput = <T extends FieldValues = FieldValues>({
  control,
  name,
  inputId,
  label,
  description,
  maxRating = 5,
  size = "md",
  value,
  onChange,
  disabled,
  required,
  showEmotionalLabel = true,
  className,
}: RatingInputProps<T>) => {
  const generatedId = useId();
  const effectiveId = inputId || generatedId;

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <RatingField
            inputId={effectiveId}
            label={label}
            description={description}
            maxRating={maxRating}
            size={size}
            value={typeof field.value === "number" ? field.value : 0}
            onChange={(val) => {
              field.onChange(val);
              onChange?.(val);
            }}
            disabled={disabled}
            required={required}
            showEmotionalLabel={showEmotionalLabel}
            className={className}
            error={error}
          />
        )}
      />
    );
  }

  return (
    <RatingField
      inputId={effectiveId}
      label={label}
      description={description}
      maxRating={maxRating}
      size={size}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      showEmotionalLabel={showEmotionalLabel}
      className={className}
    />
  );
};
