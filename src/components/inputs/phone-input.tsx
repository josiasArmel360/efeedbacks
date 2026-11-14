"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import Flag from "react-world-flags";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

// --- Types et Données ---
import { Country, COUNTRIES } from "@/lib/helper/countries";

interface PhoneInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  defaultCountry?: string;
  onPaste?: () => void;
  size?: "sm" | "lg";
  transparent?: boolean;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

interface PhoneInputFieldProps {
  inputId: string;
  label?: string;
  description?: string;
  placeholder?: string;
  defaultCountry?: string;
  onPaste?: () => void;
  size?: "sm" | "lg";
  transparent?: boolean;
  className?: string;
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: { message?: string };
}

const PhoneInputField = ({
  inputId,
  label,
  description,
  placeholder = "01 02 03 04 05",
  defaultCountry = "CI",
  size = "lg",
  transparent = false,
  className,
  value = "",
  onChange,
  onPaste,
  disabled,
  required,
  error,
}: PhoneInputFieldProps) => {
  const [open, setOpen] = React.useState(false);

  // Recherche du pays correspondant au dial_code présent dans la value
  const safeValue = typeof value === "string" ? value : "";
  const selectedCountry = React.useMemo(() => {
    const country = COUNTRIES.find((c) => safeValue.startsWith(c.dial_code));
    return (
      country ||
      COUNTRIES.find((c) => c.code === defaultCountry) ||
      COUNTRIES[0]
    );
  }, [safeValue, defaultCountry]);

  // Numéro local sans indicatif
  const phoneNumber = safeValue.startsWith(selectedCountry.dial_code)
    ? safeValue.replace(selectedCountry.dial_code, "").trim()
    : safeValue;

  const handleCountrySelect = (country: Country) => {
    setOpen(false);
    const newFullNumber = `${country.dial_code}${phoneNumber.replace(/\s/g, "")}`;
    onChange?.(newFullNumber);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const limitedInput = digits.slice(0, selectedCountry.length);

    if (limitedInput === "") {
      onChange?.("");
    } else {
      onChange?.(`${selectedCountry.dial_code} ${limitedInput}`.trim());
    }
  };

  const formatDisplay = (val: string) => {
    return val.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  };

  const handleCustomPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData
      .replace(/\D/g, "")
      .slice(0, selectedCountry.length);
    onChange?.(`${selectedCountry.dial_code} ${digits}`);
    onPaste?.();
  };

  return (
    <Field data-invalid={!!error} className="flex flex-col gap-1.5">
      {label && (
        <FieldLabel htmlFor={inputId}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </FieldLabel>
      )}

      <div className={cn("flex rounded-md w-full", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                disabled={disabled}
                className={cn(
                  "rounded-r-none border-r-0 px-3 flex items-center gap-2 shrink-0",
                  size === "sm" ? "h-8" : "h-9",
                  transparent && "bg-transparent hover:bg-transparent",
                )}
                type="button"
              >
                <Flag code={selectedCountry.code} className="w-5" />
                <span className="text-sm font-mono">
                  {selectedCountry.dial_code}
                </span>
                <ChevronsUpDown className="h-3 w-3 opacity-50" />
              </Button>
            }
          />
          <PopoverContent className="w-62.5 p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un pays..." />
              <CommandList>
                <CommandEmpty>Aucun pays.</CommandEmpty>
                <CommandGroup>
                  {COUNTRIES.map((c) => (
                    <CommandItem
                      key={c.code}
                      value={`${c.name} ${c.dial_code}`}
                      onSelect={() => handleCountrySelect(c)}
                      className="flex gap-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedCountry.code === c.code
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <Flag code={c.code} className="w-5" />
                      <span className="flex-1 text-sm">{c.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.dial_code}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Input
          id={inputId}
          type="tel"
          value={formatDisplay(phoneNumber)}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          disabled={disabled}
          onPaste={handleCustomPaste}
          className={cn(
            "rounded-l-none focus-visible:ring-offset-0 flex-1",
            size === "sm" ? "h-8" : "h-9",
          )}
        />
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const PhoneInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  disabled,
  value,
  onChange,
  ...rest
}: PhoneInputProps<T>) => {
  const generatedId = React.useId();
  const effectiveId = inputId ?? generatedId;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, formState, fieldState }) => (
          <PhoneInputField
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
    <PhoneInputField
      {...rest}
      inputId={effectiveId}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

/**
 * Formate un numéro de téléphone pour l'affichage
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, "");
  const country = COUNTRIES.find((c) => cleaned.startsWith(c.dial_code));

  if (!country) return phone;

  const number = cleaned.substring(country.dial_code.length);
  const formatted = number.replace(/(\d{2})(?=\d)/g, "$1 ").trim();

  return `${country.dial_code} ${formatted}`;
};

/**
 * Extrait l'indicatif pays d'un numéro
 */
export const getCountryFromPhone = (phone: string): Country | undefined => {
  const cleaned = phone.replace(/\s/g, "");
  return COUNTRIES.find((c) => cleaned.startsWith(c.dial_code));
};
