"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Briefcase,
  Mail,
  Pencil,
  Phone,
  Shield,
  UserCheck,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/badge";
import { Notice } from "@/components/notice";
import {
  PhoneInput,
  TextInput,
  formatPhoneNumber,
} from "@/components/inputs";
import { CancelButton, SubmitButton } from "@/components/buttons";

import { useAuth } from "@/hooks/use-auth";
import {
  UpdateProfileSchema,
  type UpdateProfilePayload,
} from "@/lib/db/queries/user/validator";
import { updateProfile } from "@/lib/db/server/users";
import { UCFirst } from "@/lib/helper/utility";
import type { FormMode, User } from "@/lib/types";

interface ProfileInfoFormProps {
  user: User;
  onUserUpdated: (updated: User) => void;
}

export const ProfileInfoForm = ({
  user,
  onUserUpdated,
}: ProfileInfoFormProps) => {
  const router = useRouter();
  const { changeEmail, updateUser } = useAuth();
  const [mode, setMode] = useState<FormMode>("preview");
  const [isPending, startTransition] = useTransition();

  const isPreview = mode === "preview";

  const form = useForm<UpdateProfilePayload>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      job: user.job || "",
    },
  });

  const handleEnterEdit = () => {
    form.reset({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      job: user.job || "",
    });
    setMode("update");
  };

  const handleCancelEdit = () => {
    form.reset({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      job: user.job || "",
    });
    setMode("preview");
  };

  const onSubmit = (values: UpdateProfilePayload) => {
    startTransition(async () => {
      try {
        const res = await updateProfile({
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber || null,
          job: values.job || null,
        });

        if (res?.serverError) {
          toast.error(res.serverError);
          return;
        }

        if (res?.validationErrors) {
          toast.error("Veuillez vérifier les champs du formulaire.");
          return;
        }

        const newEmail = values.email.trim().toLowerCase();
        const emailChanged = newEmail !== user.email.toLowerCase();

        if (emailChanged) {
          await changeEmail({
            newEmail,
            callbackURL: "/profile",
          });
        }

        const patch = {
          name: values.name.trim(),
          job: values.job?.trim() || null,
          phoneNumber: values.phoneNumber?.trim() || null,
        };

        // Mise à jour immédiate du store Zustand (Navbar + Sidebar) et de l'état local
        updateUser(patch);
        onUserUpdated({ ...user, ...patch });

        if (emailChanged) {
          toast.success("Profil mis à jour avec succès", {
            description:
              "Un email de confirmation a été envoyé à votre nouvelle adresse pour valider le changement.",
          });
        } else {
          toast.success(
            res?.data?.message ||
              "Vos informations personnelles ont été mises à jour.",
          );
        }

        setMode("preview");
        router.refresh();
      } catch (err) {
        console.error("Erreur mise à jour profil:", err);
        toast.error(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la sauvegarde.",
        );
      }
    });
  };

  return (
    <Card className="border-border/60 shadow-xs py-0 gap-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/50 bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <UserRound className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Informations personnelles & professionnelles
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {isPreview
                ? "Consultez les informations associées à votre compte utilisateur."
                : "Modifiez votre identité, votre fonction et vos coordonnées de contact."}
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEnterEdit}
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Modifier
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isPreview ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/50 bg-muted/15 p-4 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5 text-primary" />
                  Nom complet
                </span>
                <p className="text-sm font-bold text-foreground">
                  {UCFirst(user.name)}
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/15 p-4 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  Fonction / Poste
                </span>
                <p className="text-sm font-bold text-foreground">
                  {user.job ? (
                    UCFirst(user.job)
                  ) : (
                    <span className="text-muted-foreground font-normal italic">
                      Non renseignée
                    </span>
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/15 p-4 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  Adresse email
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-foreground break-all">
                    {user.email}
                  </p>
                  <Badge
                    status={user.emailVerified ? "verifie" : "en_attente"}
                    size="sm"
                  >
                    {user.emailVerified ? "Vérifié" : "Non vérifié"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/15 p-4 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  Téléphone
                </span>
                <p className="text-sm font-bold text-foreground">
                  {user.phoneNumber ? (
                    formatPhoneNumber(user.phoneNumber)
                  ) : (
                    <span className="text-muted-foreground font-normal italic">
                      Non renseigné
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3.5">
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Politique d&apos;accès
                  </span>
                </div>
                <Badge variant="default" size="sm" showIcon={false}>
                  {user.policy?.name || "Utilisateur"}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3.5">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Statut du compte
                  </span>
                </div>
                <Badge status={user.banned ? "suspendu" : "actif"} size="sm" />
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextInput
                control={form.control}
                name="name"
                label="Nom et prénoms"
                placeholder="Ex : Dr. Kouassi Jean"
                icon={UserRound}
                disabled={isPending}
                required
              />

              <TextInput
                control={form.control}
                name="job"
                label="Fonction / Poste occupé"
                placeholder="Ex : Responsable Qualité"
                icon={Briefcase}
                disabled={isPending}
              />

              <TextInput
                control={form.control}
                name="email"
                type="email"
                label="Adresse email professionnelle"
                placeholder="nom@etablissement.ci"
                icon={Mail}
                disabled={isPending}
                required
              />

              <PhoneInput
                control={form.control}
                name="phoneNumber"
                label="Numéro de téléphone"
                defaultCountry="CI"
                disabled={isPending}
              />
            </div>

            <Notice description="Si vous modifiez votre email, un lien de validation sera envoyé à la nouvelle adresse." />

            <div className="flex items-center gap-3">
              <CancelButton onClick={handleCancelEdit} disabled={isPending} />
              <SubmitButton isLoading={isPending} className="flex-1">
                Enregistrer les modifications
              </SubmitButton>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

