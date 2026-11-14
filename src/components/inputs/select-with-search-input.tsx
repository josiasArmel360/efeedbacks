"use client";

import * as React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Check, ChevronDown, LucideIcon } from "lucide-react";
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
import { getOptionLabel } from "@/lib/helper/utility";

export interface SelectSearchOption {
  label: string;
  value: string;
}

type SelectOption = SelectSearchOption;

interface SelectWithSearchInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  labelIcon?: LucideIcon;
  placeholder?: string;
  searchPlaceholder?: string;
  options: SelectOption[];
  description?: string;
  className?: string;
  icon?: LucideIcon;
  emptyDataText?: string;
  size?: "sm" | "lg";
  value?: string;
  onValueChange?: (value: string) => void;
  transparent?: boolean;
  disabled?: boolean;
  required?: boolean;
}

interface SelectWithSearchFieldProps {
  inputId: string;
  label?: string;
  labelIcon?: LucideIcon;
  placeholder?: string;
  searchPlaceholder?: string;
  options: SelectOption[];
  description?: string;
  className?: string;
  icon?: LucideIcon;
  emptyDataText?: string;
  size?: "sm" | "lg";
  value?: string;
  onValueChange?: (value: string) => void;
  transparent?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: { message?: string };
}

const ucFirst = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const SelectWithSearchField = ({
  inputId,
  label,
  labelIcon: Icon2,
  placeholder = "Sélectionner...",
  searchPlaceholder,
  options,
  description,
  className,
  icon: Icon,
  emptyDataText = "Aucun résultat trouvé.",
  size = "lg",
  value,
  onValueChange,
  transparent = false,
  disabled,
  required,
  error,
}: SelectWithSearchFieldProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Field data-invalid={!!error} className="flex flex-col gap-1.5 w-full">
      {label && (
        <FieldLabel
          htmlFor={inputId}
          className={cn(Icon2 && "flex items-center gap-1")}
        >
          {Icon2 && <Icon2 className="h-4 w-4" />}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </FieldLabel>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={inputId}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "justify-between font-normal relative truncate w-full",
                transparent && "bg-transparent hover:bg-transparent",
                !value && "text-muted-foreground",
                size === "sm" ? "h-8" : "h-9",
                Icon && "pl-9",
                className,
              )}
              disabled={disabled}
            >
              {/* Icône optionnelle à gauche */}
              {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <Icon className="h-4 w-4" />
                </div>
              )}

              {/* Affichage du label sélectionné */}
              <div className="flex-1 text-left truncate">
                {value && value.trim() !== ""
                  ? getOptionLabel(options, value)
                  : placeholder}
              </div>

              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          }
        />

        <PopoverContent
          className="w-(--anchor-width) min-w-(--anchor-width) p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder={
                searchPlaceholder ||
                `Rechercher ${label ? label.toLowerCase() : ""}...`
              }
            />
            <CommandList>
              <CommandEmpty>{emptyDataText}</CommandEmpty>
              <CommandGroup>
                {options.map((option, index) => (
                  <CommandItem
                    key={option.value ?? `option-${index}`}
                    value={option.label}
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    onSelect={() => {
                      onValueChange?.(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        option.value === value
                          ? "opacity-100 text-accent"
                          : "opacity-0",
                      )}
                    />
                    {ucFirst(option.label)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const SelectWithSearchInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onValueChange,
  ...rest
}: SelectWithSearchInputProps<T>) => {
  const generatedId = React.useId();
  const effectiveId = inputId ?? generatedId;

  if (name && control) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <SelectWithSearchField
            {...rest}
            inputId={effectiveId}
            value={field.value}
            onValueChange={(val) => {
              field.onChange(val);
              onValueChange?.(val);
            }}
            disabled={formState.isSubmitting || disabled}
            error={fieldState.error}
          />
        )}
      />
    );
  }

  // Standalone mode when react-hook-form is not used
  return (
    <SelectWithSearchField
      {...rest}
      inputId={effectiveId}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    />
  );
};
