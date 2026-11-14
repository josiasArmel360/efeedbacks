"use client";

import { useId, useMemo, useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { X, ChevronsUpDown } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ItemOption {
  label: string;
  value: string;
}

export interface ItemWithDataInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  emptyDataText?: string;
  data?: string[];
  options?: ItemOption[];
  allowCustomInput?: boolean;
  value?: string[];
  onChange?: (items: string[]) => void;
}

interface ItemWithDataFieldProps {
  inputId: string;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  emptyDataText?: string;
  data?: string[];
  options?: ItemOption[];
  allowCustomInput?: boolean;
  value?: string[];
  onChange?: (items: string[]) => void;
  error?: { message?: string };
}

/**
 * Vue de présentation interne unifiée (100% DRY)
 */
function ItemWithDataField({
  inputId,
  label,
  placeholder,
  searchPlaceholder,
  description,
  className,
  disabled,
  required,
  emptyDataText = "Aucun résultat trouvé.",
  data,
  options,
  allowCustomInput = true,
  value = [],
  onChange,
  error,
}: ItemWithDataFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const resolvedOptions = useMemo((): ItemOption[] => {
    if (options && options.length > 0) return [...options];
    if (data && data.length > 0)
      return data.map((d) => ({ label: d, value: d }));
    return [];
  }, [options, data]);

  const optionMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of resolvedOptions) {
      map.set(opt.value, opt.label);
    }
    return map;
  }, [resolvedOptions]);

  const valueArray = Array.isArray(value) ? value : [];

  const handleAdd = () => {
    if (!allowCustomInput) return;
    const trimmed = inputValue.trim();
    if (trimmed && !valueArray.includes(trimmed)) {
      onChange?.([...valueArray, trimmed]);
      setInputValue("");
    }
  };

  const handleRemove = (itemToRemove: string) => {
    onChange?.(valueArray.filter((item) => item !== itemToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
      setOpen(false);
    }
  };

  return (
    <Field data-invalid={!!error} className="flex flex-col gap-1.5">
      {label && (
        <FieldLabel htmlFor={inputId}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </FieldLabel>
      )}

      {!disabled && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                id={inputId}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-between font-normal text-muted-foreground bg-background",
                  className,
                )}
                disabled={disabled}
              >
                {placeholder || "Ajouter un élément..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            }
          />
          <PopoverContent
            className="w-(--anchor-width) min-w-(--anchor-width) p-0 shadow-lg"
            align="start"
          >
            <Command>
              <CommandInput
                placeholder={searchPlaceholder || "Rechercher ou ajouter..."}
                value={inputValue}
                onValueChange={setInputValue}
                onKeyDown={handleKeyDown}
              />
              <CommandList className="max-h-60">
                <CommandEmpty>{emptyDataText}</CommandEmpty>
                {resolvedOptions.length > 0 && (
                  <CommandGroup>
                    {resolvedOptions
                      .filter((opt) => !valueArray.includes(opt.value))
                      .map((opt) => (
                        <CommandItem
                          key={opt.value}
                          value={opt.label}
                          onSelect={() => {
                            if (!valueArray.includes(opt.value)) {
                              onChange?.([...valueArray, opt.value]);
                            }
                            setOpen(false);
                            setInputValue("");
                          }}
                          className="cursor-pointer"
                        >
                          {opt.label}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {valueArray.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2 bg-muted/50 rounded-md">
          {valueArray.map((item) => {
            const displayLabel = optionMap.get(item) || item;
            return (
              <div
                key={item}
                className={cn(
                  "px-2 py-1 text-xs flex items-center space-x-1 border rounded-lg bg-background text-foreground",
                  disabled && "opacity-80 bg-muted/30",
                )}
              >
                <span>{displayLabel}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    disabled={disabled}
                    className="rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        disabled && (
          <p className="text-xs text-muted-foreground italic p-1">
            Aucun élément sélectionné.
          </p>
        )
      )}

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
}

/**
 * Composant ItemWithDataInput public, compatible RHF et Autonome
 */
export const ItemWithDataInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onChange,
  ...rest
}: ItemWithDataInputProps<T>) => {
  const generatedId = useId();
  const effectiveId = inputId ?? generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <ItemWithDataField
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
    <ItemWithDataField
      {...rest}
      inputId={effectiveId}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
