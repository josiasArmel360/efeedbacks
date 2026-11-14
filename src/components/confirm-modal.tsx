"use client";

import {
  NumericInput,
  PasswordInput,
  TextareaInput,
  TextInput,
} from "@/components/inputs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface FieldProps {
  label?: string;
  placeholder?: string;
  type?: "text" | "password" | "number" | "email" | "textarea";
  required?: boolean;
  description?: string;
  icon?: LucideIcon;
  errMessage?: string;
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (fieldValue?: string) => Promise<void>;
  description?: string;
  notice?: string | null;
  tone?: "danger" | "info";
  field?: FieldProps;
}

export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  description,
  notice,
  tone,
  field,
}: ConfirmModalProps) => {
  const [isPending, setIsPending] = useState(false);
  const isDanger = tone ? tone === "danger" : Boolean(notice);

  const formSchema = z.object({
    fieldValue: field?.required
      ? z.string().min(1, field.errMessage || "Ce champ est requis")
      : z.string().optional(),
  });
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fieldValue: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: { fieldValue?: string }) => {
    setIsPending(true);
    try {
      await onConfirm(values.fieldValue);
      onClose();
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'exécution de cette action",
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleConfirm = () => {
    if (field) {
      form.handleSubmit(onSubmit)();
    } else {
      onSubmit({ fieldValue: undefined });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-100 gap-4 p-6">
        <AlertDialogHeader className="flex flex-col items-center gap-4">
          <div className="mx-auto">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                isDanger ? "bg-red-100" : "bg-blue-100",
              )}
            >
              {isDanger ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : (
                <Info className="h-6 w-6 text-blue-600" />
              )}
            </div>
          </div>

          <div className="space-y-2 w-full">
            <AlertDialogTitle className="text-xl font-semibold tracking-tight text-center">
              Confirmation requise
            </AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-muted-foreground text-sm text-center leading-relaxed">
                {description}
              </AlertDialogDescription>
            )}
          </div>
        </AlertDialogHeader>

        {notice && (
          <div
            className={cn(
              "rounded-lg border-l-4 p-4",
              isDanger
                ? "border-red-500 bg-red-50/50"
                : "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10",
            )}
          >
            <div className="flex gap-3">
              {isDanger ? (
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              ) : (
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
              <p
                className={cn(
                  "text-sm font-medium leading-tight",
                  isDanger
                    ? "text-red-900"
                    : "text-blue-900 dark:text-blue-200",
                )}
              >
                {notice}
              </p>
            </div>
          </div>
        )}

        {field && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {(field.type === "text" || field.type === "email") && (
              <TextInput
                control={form.control}
                name="fieldValue"
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
                description={field.description}
                icon={field.icon}
              />
            )}

            {field.type === "number" && (
              <NumericInput
                control={form.control}
                name="fieldValue"
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
                description={field.description}
                icon={field.icon}
              />
            )}

            {field.type === "password" && (
              <PasswordInput
                control={form.control}
                name="fieldValue"
                label={field.label}
                placeholder={field.placeholder}
                description={field.description}
                icon={field.icon}
              />
            )}
            {field.type === "textarea" && (
              <TextareaInput
                control={form.control}
                name="fieldValue"
                label={field.label}
                placeholder={field.placeholder}
                description={field.description}
                icon={field.icon}
              />
            )}
          </form>
        )}

        <AlertDialogFooter className="flex gap-3">
          <Button
            variant="outline"
            className="text-muted-foreground hover:bg-secondary h-10"
            onClick={onClose}
            disabled={isPending}
          >
            Annuler
          </Button>

          <Button
            variant={isDanger ? "destructive" : "default"}
            className="flex-1 shadow-sm border transition-all h-10"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2" />
                Traitement...
              </div>
            ) : (
              "Confirmer l'action"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
