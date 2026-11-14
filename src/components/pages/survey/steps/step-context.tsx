"use client";

import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Building2, Lock } from "lucide-react";

import { DatePickerInput, SelectWithSearchInput } from "@/components/inputs";
import type { Department } from "@/lib/types";
import type { SubmitFeedbackPayload } from "@/lib/db/queries/feedback/validator";

interface StepContextProps {
  form: UseFormReturn<SubmitFeedbackPayload>;
  departments: Department[];
  lockedDepartment?: Department | null;
  disabled?: boolean;
}

export const StepContext = ({
  form,
  departments,
  lockedDepartment,
  disabled,
}: StepContextProps) => {
  // Verrouillage automatique si un service spécifique est ciblé par l'URL
  useEffect(() => {
    if (lockedDepartment?.id) {
      form.setValue("departmentId", lockedDepartment.id, {
        shouldValidate: true,
      });
    }
  }, [lockedDepartment, form]);

  const departmentOptions = departments
    .map((d) => ({
      label: d.name,
      value: d.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          Contexte de votre venue & Service hospitalier
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Précisez le service hospitalier concerné pour diriger vos remarques
          vers la bonne équipe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lockedDepartment ? (
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Service sélectionné via QR Code
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-foreground">
                    {lockedDepartment.name}
                  </h4>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Lock className="h-3 w-3" />
                <span>Verrouillé</span>
              </span>
            </div>

            {lockedDepartment.description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-12">
                {lockedDepartment.description}
              </p>
            )}
          </div>
        ) : (
          <SelectWithSearchInput
            control={form.control}
            name="departmentId"
            label="Service hospitalier ou département"
            description="Choisissez le service où vous avez été soigné, accueilli ou affecté."
            placeholder="Rechercher un service hospitalier..."
            options={departmentOptions}
            disabled={disabled}
            icon={Building2}
          />
        )}

        <DatePickerInput
          control={form.control}
          name="visitDate"
          label="Date de votre passage / période concernée"
          placeholder="Ex. 14 novembre 2026, ou Semaine dernière"
          description="Facultatif : permet de situer précisément votre séjour ou votre vacation."
          disabled={disabled}
        />
      </div>
    </div>
  );
};
