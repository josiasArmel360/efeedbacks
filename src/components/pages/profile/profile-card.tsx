"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Calendar,
  Camera,
  Loader2,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/badge";
import { formatPhoneNumber } from "@/components/inputs";

import {
  TwoFactorModal,
  type TwoFactorModalStep,
} from "./two-factor-modal";
import { useAuth } from "@/hooks/use-auth";
import { useUploadThing } from "@/lib/uploadthing";
import { updateAvatar } from "@/lib/db/server/users";
import { getInitials, UCFirst } from "@/lib/helper/utility";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo (aligné sur ourFileRouter.image)
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

interface ProfileCardProps {
  user: User;
  onUserUpdated: (updated: User) => void;
}

export const ProfileCard = ({ user, onUserUpdated }: ProfileCardProps) => {
  const router = useRouter();
  const { updateUser } = useAuth();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.image || null,
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isRemovingAvatar, startRemoveAvatarTransition] = useTransition();

  const [twoFactorModal, setTwoFactorModal] = useState<{
    open: boolean;
    step: TwoFactorModalStep;
    totpUri?: string;
  }>({
    open: false,
    step: "idle",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Nettoyage des URLs blob temporaires
  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const { startUpload, isUploading } = useUploadThing("image", {
    onUploadProgress: (p) => setUploadProgress(p),
    onClientUploadComplete: async (files) => {
      const uploadedUrl = files?.[0]?.ufsUrl;
      if (!uploadedUrl) return;

      try {
        const res = await updateAvatar({ image: uploadedUrl });
        if (res?.serverError) {
          toast.error(res.serverError);
          setAvatarPreview(user.image || null);
          return;
        }

        setAvatarPreview(uploadedUrl);
        onUserUpdated({ ...user, image: uploadedUrl });
        updateUser({ image: uploadedUrl });
        toast.success("Photo de profil mise à jour avec succès.");
        router.refresh();
      } catch (err) {
        console.error("Erreur sauvegarde avatar:", err);
        toast.error("Impossible d'enregistrer la nouvelle photo de profil.");
        setAvatarPreview(user.image || null);
      } finally {
        setUploadProgress(0);
      }
    },
    onUploadError: (error) => {
      console.error("Erreur UploadThing avatar:", error);
      toast.error(
        "Échec du téléversement de l'image (format ou taille invalide).",
      );
      setAvatarPreview(user.image || null);
      setUploadProgress(0);
    },
  });

  const isAvatarBusy = isUploading || isRemovingAvatar;

  const handleSelectAvatarFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || isAvatarBusy) return;

    const isAllowed =
      ALLOWED_MIME_TYPES.has(file.type) || file.type.startsWith("image/");
    if (!isAllowed) {
      toast.error("Format non supporté. Utilisez PNG, JPG ou WEBP.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("La photo de profil ne doit pas dépasser 2 Mo.");
      return;
    }

    const previewBlob = URL.createObjectURL(file);
    setAvatarPreview(previewBlob);

    try {
      await startUpload([file]);
    } catch (err) {
      console.error("Erreur téléversement avatar:", err);
      setAvatarPreview(user.image || null);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = () => {
    if (!user.image || isAvatarBusy) return;

    startRemoveAvatarTransition(async () => {
      try {
        const res = await updateAvatar({ image: null });
        if (res?.serverError) {
          toast.error(res.serverError);
          return;
        }

        setAvatarPreview(null);
        onUserUpdated({ ...user, image: null });
        updateUser({ image: null });
        toast.success("Photo de profil supprimée.");
        router.refresh();
      } catch {
        toast.error("Impossible de supprimer la photo de profil.");
      }
    });
  };

  const handleToggle2FA = () => {
    if (user.twoFactorEnabled) {
      setTwoFactorModal({ open: true, step: "disable" });
    } else {
      setTwoFactorModal({ open: true, step: "password" });
    }
  };

  const handleClose2FAModal = () => {
    setTwoFactorModal({ open: false, step: "idle" });
  };

  return (
    <>
      <Card className="overflow-hidden border-border/60 shadow-xs py-0 gap-0">
        {/* Bandeau supérieur dégradé */}
        <div className="relative h-28 bg-linear-to-br from-primary/20 via-primary/10 to-transparent border-b border-border/40 overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        </div>

        <CardContent className="px-5 pb-6 pt-0">
          {/* Avatar en chevauchement (Option A : changement immédiat au clic/survol) */}
          <div className="-mt-12 flex flex-col items-center text-center">
            <div className="relative group">
              <button
                type="button"
                onClick={() => !isAvatarBusy && fileInputRef.current?.click()}
                disabled={isAvatarBusy}
                className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                title="Cliquez pour modifier votre photo de profil"
              >
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-md border border-border/60">
                  {avatarPreview && (
                    <AvatarImage
                      src={avatarPreview}
                      alt={user.name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Overlay caméra au survol ou loader pendant l'upload */}
                <span
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/55 text-white transition-opacity duration-200",
                    isAvatarBusy
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 cursor-pointer",
                  )}
                >
                  {isAvatarBusy ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      <span className="text-[10px] font-semibold mt-0.5">
                        Photo
                      </span>
                    </>
                  )}
                </span>
              </button>

              {/* Pastille de statut actif */}
              <span
                className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background bg-emerald-500 shadow-xs"
                title="Compte actif"
              />
            </div>

            {/* Barre de progression UploadThing */}
            {isUploading && (
              <div className="mt-2.5 w-40 space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${Math.max(10, uploadProgress)}%` }}
                  />
                </div>
                <p className="text-[10px] font-medium text-muted-foreground">
                  Téléversement… {uploadProgress}%
                </p>
              </div>
            )}

            {/* Actions rapides Avatar */}
            <div className="mt-2.5 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isAvatarBusy}
                onClick={() => fileInputRef.current?.click()}
                className="h-7 px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground gap-1"
              >
                <Camera className="h-3 w-3" />
                Changer la photo
              </Button>

              {user.image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isAvatarBusy}
                  onClick={handleRemoveAvatar}
                  className="h-7 px-2 text-[11px] font-medium text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Retirer
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              className="hidden"
              disabled={isAvatarBusy}
              onChange={(e) => handleSelectAvatarFile(e.target.files)}
            />

            {/* Identité & Rôle */}
            <h3 className="mt-2 text-base font-bold text-foreground tracking-tight">
              {UCFirst(user.name)}
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {user.job ? UCFirst(user.job) : "Membre de l'administration"}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
              <Badge variant="default" size="sm" icon={Shield}>
                {user.policy?.name || "Utilisateur"}
              </Badge>
              <Badge
                status={user.emailVerified ? "verifie" : "en_attente"}
                size="sm"
              >
                {user.emailVerified ? "Email vérifié" : "Email non vérifié"}
              </Badge>
            </div>
          </div>

          <Separator className="my-5 bg-border/50" />

          {/* Bloc Double Authentification (2FA) */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  user.twoFactorEnabled
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                )}
              >
                {user.twoFactorEnabled ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0">
                <Label
                  htmlFor="2fa-switch"
                  className="text-xs font-bold text-foreground cursor-pointer block truncate"
                >
                  Double authentification (2FA)
                </Label>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    user.twoFactorEnabled
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {user.twoFactorEnabled
                    ? "Protection TOTP activée"
                    : "Non activée"}
                </span>
              </div>
            </div>

            <Switch
              id="2fa-switch"
              checked={!!user.twoFactorEnabled}
              onCheckedChange={handleToggle2FA}
              disabled={isAvatarBusy}
            />
          </div>

          <Separator className="my-5 bg-border/50" />

          {/* Coordonnées rapides */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground">
                  Adresse électronique
                </p>
                <p className="font-semibold text-foreground break-all">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground">Téléphone</p>
                <p className="font-semibold text-foreground">
                  {user.phoneNumber
                    ? formatPhoneNumber(user.phoneNumber)
                    : "Non renseigné"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground">
                  Membre depuis
                </p>
                <p className="font-semibold text-foreground">
                  {format(new Date(user.createdAt), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TwoFactorModal
        open={twoFactorModal.open}
        step={twoFactorModal.step}
        totpUri={twoFactorModal.totpUri}
        onClose={handleClose2FAModal}
        onStepChange={(step, totpUri) =>
          setTwoFactorModal({ open: true, step, totpUri })
        }
        onStatusChange={(enabled) =>
          onUserUpdated({ ...user, twoFactorEnabled: enabled })
        }
      />
    </>
  );
};

