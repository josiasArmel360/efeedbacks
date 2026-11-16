"use client";

import React, { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Hospital,
  Info,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/badge";
import {
  PhoneInput,
  TextInput,
  TextareaInput,
  formatPhoneNumber,
} from "@/components/inputs";
import {
  ActionsButton,
  CancelButton,
  SubmitButton,
} from "@/components/buttons";
import { Loader } from "@/components/image";

import { usePermissions } from "@/hooks/use-permissions";
import { RESOURCE } from "@/lib/config/access.modules";
import {
  resolveUploadedFile,
  useUploadThing,
  type FileInputItem,
} from "@/lib/uploadthing";
import { create, getOne, update } from "@/lib/db/server/tenants";
import {
  TenantFormSchema,
  type TenantFormData,
} from "@/lib/db/queries/tenant/validator";
import type { FormMode, Tenant } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo (aligné sur ourFileRouter.image)
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/avif",
]);

const urlToFileInputItem = (url?: string | null): FileInputItem | null => {
  if (!url) return null;
  return {
    url,
    key: url,
    name: "logo-etablissement",
    size: 0,
    type: "image/png",
  };
};

const revokeIfBlob = (url?: string | null) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

interface EstablishmentViewProps {
  initialTenant: Tenant | null;
  resource?: string;
}

export const EstablishmentView = ({
  initialTenant,
  resource = RESOURCE.SETTING,
}: EstablishmentViewProps) => {
  const { canDo } = usePermissions();

  const canCreate = canDo(resource, "create");
  const canUpdate = canDo(resource, "update");

  const [tenant, setTenant] = useState<Tenant | null>(initialTenant);
  const [mode, setMode] = useState<FormMode>(
    initialTenant ? "preview" : "create",
  );
  const [logoItem, setLogoItem] = useState<FileInputItem | null>(() =>
    urlToFileInputItem(initialTenant?.logo),
  );
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();

  const { startUpload, isUploading } = useUploadThing("image", {
    onUploadProgress: (p) => setUploadProgress(p),
  });

  const isPreviewMode = mode === "preview";
  const isBusy = isPending || isUploading;
  const canEditLogo =
    !isPreviewMode && !isBusy && (mode === "create" ? canCreate : canUpdate);

  const form = useForm<TenantFormData>({
    resolver: zodResolver(TenantFormSchema),
    defaultValues: {
      name: initialTenant?.name || "",
      email: initialTenant?.email || "",
      phoneNumber: initialTenant?.phoneNumber || "",
      city: initialTenant?.city || "",
      address: initialTenant?.address || "",
      description: initialTenant?.description || "",
      logo: initialTenant?.logo || "",
    },
  });

  const watchedValues = useWatch({ control: form.control });

  const handleLogoFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0 || !canEditLogo) return;
    const file = files[0];

    const isAllowedMime =
      ALLOWED_MIME_TYPES.has(file.type) || file.type.startsWith("image/");
    if (!isAllowedMime) {
      toast.error(
        "Format d'image non supporté. Utilisez PNG, JPG, WEBP ou SVG.",
      );
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      toast.error("La taille du logo ne doit pas dépasser 2 Mo.");
      return;
    }

    revokeIfBlob(logoItem?.url);

    const previewUrl = URL.createObjectURL(file);
    setLogoItem({
      url: previewUrl,
      key: "",
      name: file.name,
      size: file.size,
      type: file.type || "image/png",
      file,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    if (!canEditLogo) return;
    revokeIfBlob(logoItem?.url);
    setLogoItem(null);
    form.setValue("logo", "", { shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelEdit = () => {
    revokeIfBlob(logoItem?.url);
    setLogoItem(urlToFileInputItem(tenant?.logo));
    form.reset({
      name: tenant?.name || "",
      email: tenant?.email || "",
      phoneNumber: tenant?.phoneNumber || "",
      city: tenant?.city || "",
      address: tenant?.address || "",
      description: tenant?.description || "",
      logo: tenant?.logo || "",
    });
    setMode("preview");
  };

  const onSubmit = (values: TenantFormData) => {
    startTransition(async () => {
      try {
        setUploadProgress(0);

        const uploadedMedia = await resolveUploadedFile(logoItem, startUpload);
        const finalLogoUrl = uploadedMedia?.url ?? null;

        const payload: TenantFormData = {
          ...values,
          logo: finalLogoUrl,
        };

        const result =
          mode === "create"
            ? await create(payload)
            : await update({ ...payload, id: tenant!.id });

        if (result?.serverError || result?.validationErrors) {
          toast.error(
            result?.serverError ||
              "Une erreur est survenue lors de l'enregistrement des informations.",
          );
          return;
        }

        if (result?.data?.success) {
          toast.success(result.data.message);

          const freshTenant = await getOne();
          if (freshTenant) {
            setTenant(freshTenant);
            setLogoItem(urlToFileInputItem(freshTenant.logo));
            form.reset({
              name: freshTenant.name || "",
              email: freshTenant.email || "",
              phoneNumber: freshTenant.phoneNumber || "",
              city: freshTenant.city || "",
              address: freshTenant.address || "",
              description: freshTenant.description || "",
              logo: freshTenant.logo || "",
            });
          }
          setMode("preview");
        }
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(
          err.message ||
            "Une erreur est survenue lors du téléversement ou de la sauvegarde.",
        );
      }
    });
  };

  const displayName =
    watchedValues.name?.trim() || tenant?.name || "Nouvel Établissement";
  const displayEmail = watchedValues.email?.trim() || tenant?.email || null;
  const displayPhone =
    watchedValues.phoneNumber?.trim() || tenant?.phoneNumber || null;
  const displayCity = watchedValues.city?.trim() || tenant?.city || null;
  const displayAddress =
    watchedValues.address?.trim() || tenant?.address || null;
  const isPendingLocalLogo = Boolean(logoItem?.file);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* =====================================================================
       * COLONNE GAUCHE : CARTE DE PROFIL & SÉLECTEUR DE LOGO (OPTION A)
       * ===================================================================== */}
      <Card className="lg:col-span-4 border-border/70 shadow-2xs">
        <CardHeader className="pb-4 text-center items-center">
          {/* Cadre interactif du Logo (128x128) */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div
              role={canEditLogo ? "button" : undefined}
              tabIndex={canEditLogo ? 0 : -1}
              onClick={() => {
                if (canEditLogo) fileInputRef.current?.click();
              }}
              onKeyDown={(e) => {
                if (canEditLogo && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canEditLogo) setIsDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragActive(false);
                if (canEditLogo) {
                  handleLogoFileSelect(e.dataTransfer.files);
                }
              }}
              className={cn(
                "group relative h-32 w-32 rounded-2xl border-2 bg-muted/25 flex items-center justify-center overflow-hidden shadow-xs transition-all",
                canEditLogo
                  ? "cursor-pointer border-dashed border-primary/40 hover:border-primary"
                  : "border-border/70",
                isDragActive && "border-primary bg-primary/10 scale-[1.02]",
              )}
              title={
                canEditLogo
                  ? "Cliquez ou glissez-déposez une image pour modifier le logo"
                  : displayName
              }
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.svg,image/*"
                disabled={!canEditLogo}
                className="sr-only"
                onChange={(e) => handleLogoFileSelect(e.target.files)}
              />

              {logoItem?.url ? (
                <Image
                  src={logoItem.url}
                  alt={displayName}
                  fill
                  unoptimized
                  className="object-contain p-2.5"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground p-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Hospital className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-medium">Aucun logo</span>
                </div>
              )}

              {/* Overlay Caméra en mode create / update */}
              {canEditLogo && (
                <div className="absolute inset-0 bg-slate-950/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-2">
                  <Camera className="h-5 w-5" />
                  <span className="text-[11px] font-semibold leading-tight text-center">
                    {logoItem ? "Remplacer le logo" : "Ajouter un logo"}
                  </span>
                </div>
              )}
            </div>

            {/* Badge d'indication si un nouveau fichier local est en attente d'upload */}
            {isPendingLocalLogo && !isUploading && (
              <Badge variant="warning" size="sm" icon={Sparkles}>
                Nouveau logo prêt à être enregistré
              </Badge>
            )}

            {/* Boutons d'action explicites sur le logo en mode create / update */}
            {!isPreviewMode && (
              <div className="space-y-1.5 w-full flex flex-col items-center">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canEditLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {logoItem ? "Changer le logo" : "Choisir un logo"}
                  </Button>

                  {logoItem && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!canEditLogo}
                      onClick={handleRemoveLogo}
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Retirer
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  PNG, JPG, WEBP ou SVG • Max 2 Mo
                </p>
              </div>
            )}

            {/* Barre de progression UploadThing */}
            {isUploading && (
              <div className="w-full rounded-lg border border-primary/25 bg-primary/5 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-primary">
                  <span className="flex items-center gap-1.5">
                    <Loader size="xs" theme="white" />
                    Téléversement du logo...
                  </span>
                  <span>
                    {Math.min(100, Math.max(0, Math.round(uploadProgress)))}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(8, uploadProgress))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Intitulé & badge d'état du profil */}
          <div className="space-y-1.5 pt-2">
            <CardTitle className="text-base font-bold text-foreground leading-snug">
              {displayName}
            </CardTitle>
            <div className="flex items-center justify-center gap-2">
              {tenant ? (
                <Badge status="actif" size="sm" icon={CheckCircle2}>
                  Établissement configuré
                </Badge>
              ) : (
                <Badge status="nouveau" size="sm">
                  Initialisation requise
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4 space-y-3 text-xs">
          <p className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
            Récapitulatif des coordonnées
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground">
                  Email officiel
                </p>
                <p className="font-medium text-foreground truncate">
                  {displayEmail || "Non renseigné"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground">
                  Standard téléphonique
                </p>
                <p className="font-medium text-foreground font-mono">
                  {displayPhone
                    ? formatPhoneNumber(displayPhone)
                    : "Non renseigné"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground">
                  Localisation
                </p>
                <p className="font-medium text-foreground">
                  {displayCity || displayAddress
                    ? [displayCity, displayAddress].filter(Boolean).join(" — ")
                    : "Non renseignée"}
                </p>
              </div>
            </div>

            {tenant?.updatedAt && (
              <div className="flex items-start gap-2.5 pt-1 border-t border-border/50">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-muted-foreground">
                    Dernière mise à jour
                  </p>
                  <p className="font-medium text-foreground">
                    {format(new Date(tenant.updatedAt), "dd MMM yyyy à HH:mm", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* =====================================================================
       * COLONNE DROITE : FORMULAIRE DYNAMIQUE (CREATE / PREVIEW / UPDATE)
       * ===================================================================== */}
      <Card className="lg:col-span-8 border-border/70 shadow-2xs">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                {mode === "create"
                  ? "Initialisation du profil de l'établissement"
                  : mode === "preview"
                    ? "Informations générales de l'établissement"
                    : "Modification des informations de l'établissement"}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {mode === "create"
                  ? "Renseignez les coordonnées officielles et le logo de votre structure pour personnaliser les questionnaires et documents."
                  : mode === "preview"
                    ? "Consultez les données d'identité de l'établissement affichées sur les supports publics et rapports."
                    : "Mettez à jour les coordonnées, la description ou le logo de l'établissement."}
              </p>
            </div>

            <Badge
              variant={
                mode === "preview"
                  ? "neutral"
                  : mode === "create"
                    ? "warning"
                    : "info"
              }
              size="sm"
            >
              {mode === "preview"
                ? "Mode lecture"
                : mode === "create"
                  ? "Premier enregistrement"
                  : "Mode édition"}
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-5">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Section 1 : Identité de la structure */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Identité de la structure
              </h4>

              <TextInput
                control={form.control}
                name="name"
                label="Nom officiel de l'établissement"
                placeholder="Ex: Centre Hospitalier Universitaire, Clinique Sainte-Marie..."
                icon={Hospital}
                disabled={isPreviewMode || isBusy}
                required
              />

              <TextareaInput
                control={form.control}
                name="description"
                label="Présentation / Slogan de l'établissement"
                placeholder="Ex: Établissement de santé de référence engagé dans l'écoute des patients et l'amélioration continue de la qualité des soins..."
                disabled={isPreviewMode || isBusy}
              />
            </div>

            <Separator />

            {/* Section 2 : Coordonnées & Localisation */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Coordonnées & Localisation
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  control={form.control}
                  name="email"
                  type="email"
                  label="Adresse email officielle"
                  placeholder="Ex: contact@hopital-reference.org"
                  icon={Mail}
                  disabled={isPreviewMode || isBusy}
                  required
                />

                <PhoneInput
                  control={form.control}
                  name="phoneNumber"
                  label="Téléphone standard / Accueil"
                  disabled={isPreviewMode || isBusy}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  control={form.control}
                  name="city"
                  label="Ville / Commune"
                  placeholder="Ex: Abidjan, Cocody..."
                  icon={Building2}
                  disabled={isPreviewMode || isBusy}
                />

                <TextInput
                  control={form.control}
                  name="address"
                  label="Adresse géographique / Situation"
                  placeholder="Ex: Boulevard Latrille, face au CHU..."
                  icon={MapPin}
                  disabled={isPreviewMode || isBusy}
                />
              </div>
            </div>

            {/* Note d'information contextuelle */}
            <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                {mode === "create"
                  ? "Aucun établissement n'est encore configuré dans la base de données. Cet enregistrement initialisera le profil officiel utilisé sur les fiches QR et les en-têtes."
                  : "Ces informations (nom, logo, coordonnées) sont utilisées dynamiquement sur les formulaires d'évaluation usagers et les supports imprimables sans nécessiter de modification du code."}
              </span>
            </div>

            {/* Barre d'actions selon le mode (preview / create / update) */}
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
              <div className="flex gap-4">
                {mode === "update" && (
                  <CancelButton onClick={handleCancelEdit} />
                )}
                <SubmitButton
                  isLoading={isBusy}
                  disabled={mode === "create" ? !canCreate : !canUpdate}
                  className="flex-1"
                >
                  {mode === "create"
                    ? "Initialiser l'établissement"
                    : "Mettre à jour"}
                </SubmitButton>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export const EstablishmentSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <Card className="lg:col-span-4 border-border/70">
        <CardHeader className="items-center space-y-3 pb-4">
          <Skeleton className="h-32 w-32 rounded-2xl" />
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-5 w-32 rounded-full" />
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-3">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>

      <Card className="lg:col-span-8 border-border/70">
        <CardHeader className="space-y-2 pb-4">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-3.5 w-96 max-w-full" />
        </CardHeader>
        <Separator />
        <CardContent className="pt-5 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
};
