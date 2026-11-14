"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserRound, Briefcase, Mail } from "lucide-react";

import { TextInput, SelectWithSearchInput } from "@/components/inputs";
import {
  ActionsButton,
  CancelButton,
  SubmitButton,
} from "@/components/buttons";
import { Notice } from "@/components/notice";

import { create, update } from "@/lib/db/server/users";
import { UserFormSchema, UserFormData } from "@/lib/db/queries/user/validator";
import { FormMode, User, AccessPolicy } from "@/lib/types";

interface UserFormProps {
  mode: FormMode;
  user?: User | null;
  policies?: AccessPolicy[];
  onSuccess?: (mode: FormMode) => void;
  canUpdate?: boolean;
}

export const UserForm = ({
  mode: initialMode,
  user,
  policies = [],
  onSuccess,
  canUpdate = true,
}: UserFormProps) => {
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [prevMode, setPrevMode] = useState<FormMode>(initialMode);
  const [isPending, startTransition] = useTransition();

  if (initialMode !== prevMode) {
    setPrevMode(initialMode);
    setMode(initialMode);
  }

  const isPreviewMode = mode === "preview";

  const form = useForm<UserFormData>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      job: user?.job || "",
      policyId: user?.policyId || "",
    },
  });

  const onSubmit = (values: UserFormData) => {
    startTransition(async () => {
      try {
        const result =
          mode === "create"
            ? await create(values)
            : await update({ ...values, id: user!.id });

        if (result?.serverError || result?.validationErrors) {
          toast.error(
            result?.serverError ||
              "Une erreur est survenue lors de l'enregistrement de l'utilisateur",
          );
          return;
        }

        if (result?.data?.success) {
          toast.success(result.data.message);
          onSuccess?.(mode);
          if (mode === "create") {
            form.reset();
          } else {
            setMode("preview");
          }
        }
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(err.message || "Une erreur interne est survenue.");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* 1. Identification de base */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <TextInput
            control={form.control}
            name="name"
            label="Nom complet"
            placeholder="Ex: Dr. Martin Diane, Aïcha Traoré..."
            icon={UserRound}
            disabled={isPreviewMode || isPending}
            required
          />
        </div>

        <TextInput
          control={form.control}
          name="email"
          type="email"
          label="Adresse email"
          placeholder="Ex: d.martin@etablissement.org"
          icon={Mail}
          disabled={isPreviewMode || isPending}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          control={form.control}
          name="job"
          label="Fonction / Service d'affectation"
          placeholder="Ex: Responsable Qualité, Médecin Chef, Surveillant..."
          icon={Briefcase}
          disabled={isPreviewMode || isPending}
        />

        <SelectWithSearchInput
          control={form.control}
          name="policyId"
          label="Rôle système attribué"
          options={policies.map((p) => ({ value: p.id, label: p.name }))}
          disabled={isPreviewMode || isPending}
          required
        />
      </div>

      <Notice
        description={
          mode === "create"
            ? "Un mot de passe temporaire robuste sera généré automatiquement et transmis par email à l'utilisateur lors de la création de son compte."
            : "Cette adresse email constitue l'identifiant unique servant à l'utilisateur pour s'authentifier dans l'application."
        }
      />

      {isPreviewMode ? (
        <ActionsButton
          variant="secondary"
          icon="Pencil"
          onClick={() => setMode("update")}
          label="Modifier les informations"
          className="w-full"
          hasAccess={canUpdate}
          size="lg"
        />
      ) : (
        <div className={"flex gap-4"}>
          <CancelButton
            onClick={() => {
              form.reset();
              if (mode === "update") setMode("preview");
            }}
          />
          <SubmitButton isLoading={isPending} className={"flex-1"}>
            {mode === "create" ? "Enregistrer" : "Mettre à jour"}
          </SubmitButton>
        </div>
      )}
    </form>
  );
};
