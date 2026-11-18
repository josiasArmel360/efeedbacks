"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { toast } from "sonner";
import {
  CloudUpload,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Film,
  ImageOff,
  Presentation,
  Star,
  Trash2,
} from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { FileInputItem } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { Loader } from "../image";

type FileInputValue = FileInputItem[] | FileInputItem | null;

interface FileInputProps<T extends FieldValues = FieldValues> {
  control?: Control<T>;
  name?: Path<T>;
  inputId?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  many?: boolean;
  allowedExtensions?: string[];
  accept?: string;
  maxFiles?: number;
  maxImageCount?: number;
  maxVideoCount?: number;
  maxSizeMB?: number;
  maxImageSizeMB?: number;
  maxVideoSizeMB?: number;
  isUploading?: boolean;
  uploadProgress?: number;
  showCoverBadge?: boolean;
  value?: FileInputValue;
  onValueChange?: (value: FileInputValue) => void;
}

const normalizeExtension = (ext: string): string => {
  const clean = ext.trim().toLowerCase();
  if (!clean) return "";
  return clean.startsWith(".") ? clean : `.${clean}`;
};

const getFileExtension = (fileName?: string): string => {
  if (!fileName) return "";
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
};

const inferMimeFromName = (file: File): string => {
  if (file.type) return file.type;
  const ext = getFileExtension(file.name);
  if ([".jpg", ".jpeg"].includes(ext)) return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".avif") return "image/avif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".xlsx")
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === ".xls") return "application/vnd.ms-excel";
  if (ext === ".csv") return "text/csv";
  if (ext === ".docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === ".doc") return "application/msword";
  if (ext === ".pptx")
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (ext === ".ppt") return "application/vnd.ms-powerpoint";
  return "application/octet-stream";
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return "0 Ko";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} Ko`;
  return `${(kb / 1024).toFixed(1)} Mo`;
};

const toItemsArray = (rawValue: unknown): FileInputItem[] => {
  if (!rawValue) return [];
  if (Array.isArray(rawValue)) return rawValue as FileInputItem[];
  if (typeof rawValue === "object" && "url" in (rawValue as object)) {
    return [rawValue as FileInputItem];
  }
  return [];
};

const FileThumbnail = ({ item }: { item: FileInputItem }) => {
  const ext = getFileExtension(item.name);
  const mime = item.type || "";

  const isImage =
    mime.startsWith("image/") ||
    [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"].includes(ext);

  const isVideo =
    mime.startsWith("video/") || [".mp4", ".webm", ".mov"].includes(ext);

  const isPdf = mime === "application/pdf" || ext === ".pdf";

  const isExcel =
    [".xls", ".xlsx", ".csv"].includes(ext) ||
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    mime === "text/csv";

  const isWord =
    [".doc", ".docx"].includes(ext) ||
    mime.includes("wordprocessingml") ||
    mime.includes("msword");

  const isPpt =
    [".ppt", ".pptx"].includes(ext) ||
    mime.includes("presentationml") ||
    mime.includes("powerpoint");

  if (isImage) {
    return (
      <div className="relative h-full w-full bg-slate-950/90 overflow-hidden">
        <Image
          src={item.url}
          alt={item.name}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="relative h-full w-full bg-slate-900 flex flex-col items-center justify-center text-slate-200">
        <video
          src={item.url}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          muted
          playsInline
          preload="metadata"
        />
        <Film className="relative z-10 size-5 text-white drop-shadow" />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="relative h-full w-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-800/40 flex flex-col items-center justify-center p-1 text-rose-600 dark:text-rose-400">
        <FileText className="size-6" />
        <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">
          PDF
        </span>
      </div>
    );
  }

  if (isExcel) {
    return (
      <div className="relative h-full w-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 flex flex-col items-center justify-center p-1 text-emerald-600 dark:text-emerald-400">
        <FileSpreadsheet className="size-6" />
        <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">
          {ext.replace(".", "") || "XLSX"}
        </span>
      </div>
    );
  }

  if (isWord) {
    return (
      <div className="relative h-full w-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40 flex flex-col items-center justify-center p-1 text-blue-600 dark:text-blue-400">
        <FileText className="size-6" />
        <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">
          {ext.replace(".", "") || "DOCX"}
        </span>
      </div>
    );
  }

  if (isPpt) {
    return (
      <div className="relative h-full w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 flex flex-col items-center justify-center p-1 text-amber-600 dark:text-amber-400">
        <Presentation className="size-6" />
        <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">
          {ext.replace(".", "") || "PPTX"}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-1 text-slate-600 dark:text-slate-300">
      <FileText className="size-6" />
      <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">
        {ext.replace(".", "") || "DOC"}
      </span>
    </div>
  );
};

interface FileInputFieldProps {
  inputId: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  many: boolean;
  normalizedExtensions: string[];
  acceptAttr?: string;
  maxFiles?: number;
  maxImageCount?: number;
  maxVideoCount?: number;
  maxSizeMB: number;
  maxImageSizeMB?: number;
  maxVideoSizeMB?: number;
  isUploading?: boolean;
  uploadProgress?: number;
  showCoverBadge?: boolean;
  rawValue: unknown;
  onEmitChange: (nextItems: FileInputItem[], previousRaw: unknown) => void;
  error?: { message?: string };
}

const FileInputField = ({
  inputId,
  label,
  description,
  placeholder,
  className,
  disabled = false,
  readOnly = false,
  required = false,
  many,
  normalizedExtensions,
  acceptAttr,
  maxFiles,
  maxImageCount,
  maxVideoCount,
  maxSizeMB,
  maxImageSizeMB,
  maxVideoSizeMB,
  isUploading = false,
  uploadProgress = 0,
  showCoverBadge = false,
  rawValue,
  onEmitChange,
  error,
}: FileInputFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewItem, setPreviewItem] = useState<FileInputItem | null>(null);

  const items = useMemo(() => toItemsArray(rawValue), [rawValue]);
  const effectiveMaxFiles = many ? maxFiles : 1;
  const isLocked = disabled || readOnly || isUploading;
  const canAddMore =
    !isLocked &&
    (!many || !effectiveMaxFiles || items.length < effectiveMaxFiles);

  const extensionsDisplay = useMemo(() => {
    if (normalizedExtensions.length === 0) return null;
    return normalizedExtensions
      .map((ext) => ext.replace(".", "").toUpperCase())
      .join(", ");
  }, [normalizedExtensions]);

  const handleSelectedFiles = (fileList: FileList | File[] | null) => {
    if (!fileList || isLocked) return;

    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    const candidates = many ? incoming : [incoming[0]];
    if (!many && incoming.length > 1) {
      toast.info("Un seul fichier peut être sélectionné à la fois.");
    }

    const baseItems = many ? [...items] : [];
    if (!many && items.length > 0) {
      items.forEach((oldItem) => {
        if (oldItem.url.startsWith("blob:")) {
          URL.revokeObjectURL(oldItem.url);
        }
      });
    }

    let currentImgCount = baseItems.filter((i) =>
      i.type.startsWith("image/"),
    ).length;
    let currentVidCount = baseItems.filter((i) =>
      i.type.startsWith("video/"),
    ).length;

    const acceptedItems: FileInputItem[] = [];

    for (const file of candidates) {
      if (
        effectiveMaxFiles &&
        baseItems.length + acceptedItems.length >= effectiveMaxFiles
      ) {
        toast.warning(
          `Limite atteinte : maximum ${effectiveMaxFiles} fichier${effectiveMaxFiles > 1 ? "s" : ""} autorisé${effectiveMaxFiles > 1 ? "s" : ""}.`,
        );
        break;
      }

      const ext = getFileExtension(file.name);
      if (
        normalizedExtensions.length > 0 &&
        (!ext || !normalizedExtensions.includes(ext))
      ) {
        toast.error(
          `Format non autorisé pour « ${file.name} ». Extensions acceptées : ${extensionsDisplay}.`,
        );
        continue;
      }

      const mimeType = inferMimeFromName(file);
      const isImage = mimeType.startsWith("image/");
      const isVideo = mimeType.startsWith("video/");

      const limitMB = isVideo
        ? (maxVideoSizeMB ?? maxSizeMB)
        : isImage
          ? (maxImageSizeMB ?? maxSizeMB)
          : maxSizeMB;

      if (file.size > limitMB * 1024 * 1024) {
        toast.error(
          `Le fichier « ${file.name} » (${formatFileSize(file.size)}) dépasse la taille maximale de ${limitMB} Mo.`,
        );
        continue;
      }

      if (isImage && maxImageCount && currentImgCount >= maxImageCount) {
        toast.warning(`Maximum ${maxImageCount} image(s) autorisée(s).`);
        continue;
      }

      if (isVideo && maxVideoCount && currentVidCount >= maxVideoCount) {
        toast.warning(`Maximum ${maxVideoCount} vidéo(s) autorisée(s).`);
        continue;
      }

      const duplicate = [...baseItems, ...acceptedItems].some(
        (existing) =>
          existing.name === file.name && existing.size === file.size,
      );
      if (duplicate) {
        continue;
      }

      if (isImage) currentImgCount += 1;
      if (isVideo) currentVidCount += 1;

      acceptedItems.push({
        url: URL.createObjectURL(file),
        key: "",
        name: file.name,
        size: file.size,
        type: mimeType,
        file,
      });
    }

    if (acceptedItems.length > 0) {
      onEmitChange([...baseItems, ...acceptedItems], rawValue);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    if (isLocked) return;
    const removed = items[indexToRemove];
    if (removed?.url.startsWith("blob:")) {
      URL.revokeObjectURL(removed.url);
    }
    const next = items.filter((_, idx) => idx !== indexToRemove);
    onEmitChange(next, rawValue);
  };

  const handleSetAsPrimary = (index: number) => {
    if (isLocked || index <= 0 || index >= items.length) return;
    const target = items[index];
    const rest = items.filter((_, idx) => idx !== index);
    onEmitChange([target, ...rest], rawValue);
  };

  const firstImageIndex = useMemo(
    () => items.findIndex((i) => i.type.startsWith("image/")),
    [items],
  );

  return (
    <Field
      data-invalid={!!error}
      className={cn("flex flex-col gap-1.5 w-full", className)}
    >
      {label && (
        <div className="flex items-center justify-between gap-2">
          <FieldLabel htmlFor={inputId}>
            {label}
            {required && <span className="text-red-500">*</span>}
          </FieldLabel>
          {many && items.length > 0 && (
            <span className="text-[11px] font-medium text-muted-foreground">
              {items.length}
              {effectiveMaxFiles ? ` / ${effectiveMaxFiles}` : ""} fichier
              {items.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Zone de sélection / Drag & Drop (masquée en mode lecture seule) */}
      {!readOnly && canAddMore && (
        <div
          role="button"
          tabIndex={disabled || isUploading ? -1 : 0}
          onClick={() => {
            if (!isLocked) fileInputRef.current?.click();
          }}
          onKeyDown={(e) => {
            if (!isLocked && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isLocked) setIsDragActive(true);
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
            if (!isLocked) {
              handleSelectedFiles(e.dataTransfer.files);
            }
          }}
          className={cn(
            "group relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-all",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border/80 bg-muted/20 hover:border-primary/60 hover:bg-muted/40",
            error && "border-destructive/60 bg-destructive/5",
            isLocked && "cursor-not-allowed opacity-60 pointer-events-none",
            !isLocked && "cursor-pointer",
          )}
        >
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            multiple={many}
            accept={acceptAttr}
            disabled={isLocked}
            className="sr-only"
            onChange={(e) => handleSelectedFiles(e.target.files)}
          />

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
            <CloudUpload className="h-5 w-5" />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">
              {placeholder ||
                (many
                  ? "Glissez-déposez vos fichiers ici ou cliquez pour parcourir"
                  : items.length > 0
                    ? "Cliquez ou déposez un fichier pour remplacer la sélection"
                    : "Glissez-déposez un fichier ici ou cliquez pour parcourir")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {extensionsDisplay
                ? `Extensions autorisées : ${extensionsDisplay}`
                : "Sélectionnez un fichier valide"}
              {maxImageSizeMB && maxVideoSizeMB
                ? ` • Images ≤ ${maxImageSizeMB} Mo, Vidéos ≤ ${maxVideoSizeMB} Mo`
                : ` • Taille max : ${maxSizeMB} Mo`}
            </p>
          </div>
        </div>
      )}

      {/* Barre de progression lors du transfert vers UploadThing */}
      {isUploading && (
        <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-primary">
            <span className="flex items-center gap-2">
              <Loader size="xs" theme="white" />
              Importation {many ? "des médias" : "du fichier"} vers le stockage
              sécurisé...
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

      {/* Liste d'aperçu des fichiers sélectionnés ou déjà hébergés */}
      {items.length > 0 ? (
        <div
          className={cn(
            "w-full",
            many
              ? "grid grid-cols-1 md:grid-cols-2 gap-3"
              : "flex flex-col gap-2.5",
          )}
        >
          {items.map((item, idx) => {
            const ext = getFileExtension(item.name);
            const isImage =
              item.type?.startsWith("image/") ||
              [
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
                ".gif",
                ".avif",
                ".svg",
              ].includes(ext);
            const isPendingLocal = Boolean(item.file);
            const isCover =
              showCoverBadge && idx === firstImageIndex && isImage;

            return (
              <div
                key={`${item.key || item.name}-${idx}`}
                className={cn(
                  "group relative flex items-center justify-between gap-2.5 p-2.5 rounded-xl border bg-card transition-all shadow-2xs hover:border-primary/40",
                  isCover
                    ? "border-primary/60 ring-1 ring-primary/25"
                    : "border-border/70",
                )}
              >
                {/* 1. GAUCHE : Miniature visuelle interactive */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setPreviewItem(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPreviewItem(item);
                    }
                  }}
                  className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-border/70 cursor-pointer shadow-xs transition-transform group-hover:scale-[1.02]"
                  title="Cliquer pour afficher en plein écran"
                >
                  <FileThumbnail item={item} />
                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Eye className="size-4 drop-shadow" />
                  </div>
                </div>

                {/* 2. CENTRE : Informations & Métadonnées (flex-start) */}
                <div className="flex-1 min-w-0 flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 max-w-full flex-wrap">
                    <span
                      role="button"
                      tabIndex={0}
                      className="font-semibold text-xs text-foreground truncate cursor-pointer hover:text-primary transition-colors text-left"
                      title={item.name}
                      onClick={() => setPreviewItem(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setPreviewItem(item);
                        }
                      }}
                    >
                      {item.name}
                    </span>
                    {isCover && (
                      <span className="inline-flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        <Star className="size-2.5 fill-current" />
                        Couverture
                      </span>
                    )}
                    {isPendingLocal && (
                      <span className="rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.2 text-[10px] font-medium">
                        Prêt à importer
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{formatFileSize(item.size)}</span>
                    <span>•</span>
                    <span className="uppercase font-mono text-[10px] bg-muted/60 px-1 rounded">
                      {ext.replace(".", "") || "FICHIER"}
                    </span>
                  </div>
                </div>

                {/* 3. DROITE : Boutons d'Action */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setPreviewItem(item)}
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Aperçu grand format"
                  >
                    <Eye className="size-4" />
                  </Button>

                  {!isPendingLocal && item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ouvrir dans un nouvel onglet"
                    >
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground pointer-events-none"
                      >
                        <ExternalLink className="size-4" />
                      </Button>
                    </a>
                  )}

                  {!readOnly &&
                    !isLocked &&
                    many &&
                    showCoverBadge &&
                    isImage &&
                    idx !== 0 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSetAsPrimary(idx)}
                        className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                        title="Définir comme photo de couverture"
                      >
                        <Star className="size-4" />
                      </Button>
                    )}

                  {!readOnly && !isLocked && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveItem(idx)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Retirer ce fichier"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        readOnly && (
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/70 bg-muted/20 py-7 text-muted-foreground">
            <ImageOff className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-xs italic">Aucun média associé.</p>
          </div>
        )
      )}

      {/* Sheet de prévisualisation grand format */}
      <FilePreviewSheet
        open={Boolean(previewItem)}
        onOpenChange={(open) => {
          if (!open) setPreviewItem(null);
        }}
        file={previewItem}
      />

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
};

export const FileInput = <T extends FieldValues>({
  control,
  name,
  inputId,
  label,
  description,
  placeholder,
  className,
  disabled,
  readOnly,
  required,
  many = false,
  allowedExtensions,
  accept,
  maxFiles,
  maxImageCount,
  maxVideoCount,
  maxSizeMB = 8,
  maxImageSizeMB,
  maxVideoSizeMB,
  isUploading,
  uploadProgress,
  showCoverBadge = false,
  value,
  onValueChange,
}: FileInputProps<T>) => {
  const generatedId = useId();
  const effectiveId = inputId ?? generatedId;

  const normalizedExtensions = useMemo(() => {
    const rawList = allowedExtensions ?? [];
    return Array.from(new Set(rawList.map(normalizeExtension).filter(Boolean)));
  }, [allowedExtensions]);

  const computedAccept = useMemo(() => {
    if (accept) return accept;
    if (normalizedExtensions.length > 0) {
      return normalizedExtensions.join(",");
    }
    return undefined;
  }, [accept, normalizedExtensions]);

  const formatOutput = (
    nextItems: FileInputItem[],
    previousRaw: unknown,
  ): FileInputValue => {
    if (many || Array.isArray(previousRaw)) {
      return nextItems;
    }
    return nextItems[0] ?? null;
  };

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState, formState }) => (
          <FileInputField
            inputId={effectiveId}
            label={label}
            description={description}
            placeholder={placeholder}
            className={className}
            disabled={formState.isSubmitting || disabled}
            readOnly={readOnly}
            required={required}
            many={many}
            normalizedExtensions={normalizedExtensions}
            acceptAttr={computedAccept}
            maxFiles={maxFiles}
            maxImageCount={maxImageCount}
            maxVideoCount={maxVideoCount}
            maxSizeMB={maxSizeMB}
            maxImageSizeMB={maxImageSizeMB}
            maxVideoSizeMB={maxVideoSizeMB}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            showCoverBadge={showCoverBadge}
            rawValue={field.value}
            onEmitChange={(nextItems, prevRaw) => {
              const formatted = formatOutput(nextItems, prevRaw);
              field.onChange(formatted);
              onValueChange?.(formatted);
            }}
            error={fieldState.error}
          />
        )}
      />
    );
  }

  return (
    <FileInputField
      inputId={effectiveId}
      label={label}
      description={description}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      many={many}
      normalizedExtensions={normalizedExtensions}
      acceptAttr={computedAccept}
      maxFiles={maxFiles}
      maxImageCount={maxImageCount}
      maxVideoCount={maxVideoCount}
      maxSizeMB={maxSizeMB}
      maxImageSizeMB={maxImageSizeMB}
      maxVideoSizeMB={maxVideoSizeMB}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      showCoverBadge={showCoverBadge}
      rawValue={value}
      onEmitChange={(nextItems, prevRaw) => {
        onValueChange?.(formatOutput(nextItems, prevRaw));
      }}
    />
  );
};

import { Download, FileIcon, Maximize2, AlertCircle } from "lucide-react";

interface PreviewableFile {
  url: string;
  name?: string;
  size?: number;
  type?: string;
}

interface FilePreviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: PreviewableFile | null;
}

export const FilePreviewSheet = ({
  open,
  onOpenChange,
  file,
}: FilePreviewSheetProps) => {
  const ext = useMemo(() => getFileExtension(file?.name), [file?.name]);

  const mime = file?.type || "";

  const isImage = useMemo(() => {
    return (
      mime.startsWith("image/") ||
      [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"].includes(ext)
    );
  }, [mime, ext]);

  const isVideo = useMemo(() => {
    return (
      mime.startsWith("video/") ||
      [".mp4", ".webm", ".mov", ".ogg"].includes(ext)
    );
  }, [mime, ext]);

  const isPdf = useMemo(() => {
    return mime === "application/pdf" || ext === ".pdf";
  }, [mime, ext]);

  const isExcel = useMemo(() => {
    return (
      [".xls", ".xlsx", ".csv"].includes(ext) ||
      mime.includes("spreadsheet") ||
      mime.includes("excel") ||
      mime === "text/csv"
    );
  }, [mime, ext]);

  const isWord = useMemo(() => {
    return (
      [".doc", ".docx"].includes(ext) ||
      mime.includes("wordprocessingml") ||
      mime.includes("msword")
    );
  }, [mime, ext]);

  const isPpt = useMemo(() => {
    return (
      [".ppt", ".pptx"].includes(ext) ||
      mime.includes("presentationml") ||
      mime.includes("powerpoint")
    );
  }, [mime, ext]);

  const isOfficeDoc = isExcel || isWord || isPpt;
  const isOnlineUrl = Boolean(file?.url && file.url.startsWith("http"));

  const officeViewerUrl = useMemo(() => {
    if (!isOfficeDoc || !file?.url || !isOnlineUrl) return null;
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`;
  }, [isOfficeDoc, file?.url, isOnlineUrl]);

  const iconInfo = useMemo(() => {
    if (isImage) {
      return {
        icon: Maximize2,
        color: "text-blue-500",
        label: "Image",
        badgeVariant: "info" as const,
      };
    }
    if (isPdf) {
      return {
        icon: FileText,
        color: "text-rose-500",
        label: "Document PDF",
        badgeVariant: "error" as const,
      };
    }
    if (isExcel) {
      return {
        icon: FileSpreadsheet,
        color: "text-emerald-500",
        label: "Feuille de calcul",
        badgeVariant: "success" as const,
      };
    }
    if (isWord) {
      return {
        icon: FileText,
        color: "text-blue-600",
        label: "Document texte",
        badgeVariant: "info" as const,
      };
    }
    if (isPpt) {
      return {
        icon: Presentation,
        color: "text-amber-500",
        label: "Présentation",
        badgeVariant: "warning" as const,
      };
    }
    if (isVideo) {
      return {
        icon: Film,
        color: "text-purple-500",
        label: "Vidéo",
        badgeVariant: "purple" as const,
      };
    }
    return {
      icon: FileIcon,
      color: "text-slate-500",
      label: "Fichier",
      badgeVariant: "neutral" as const,
    };
  }, [isImage, isPdf, isExcel, isWord, isPpt, isVideo]);

  const IconComponent = iconInfo.icon;

  if (!file) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <SheetContent
        side="right"
        // showCloseButton={false}
        className="w-full data-[side=right]:md:max-w-2xl! p-0 flex flex-col gap-0 border-l border-border/80 bg-background shadow-2xl"
      >
        {/* En-tête de la Sheet */}
        <SheetHeader className="p-4 border-b border-border/70 bg-muted/30">
          <div className="flex items-start justify-between gap-3 pr-9.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <IconComponent className={cn("size-5", iconInfo.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-sm font-semibold text-foreground truncate max-w-md">
                  {file.name || "Aperçu du fichier"}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <Badge variant={iconInfo.badgeVariant} size="sm">
                    {ext.replace(".", "").toUpperCase() || iconInfo.label}
                  </Badge>
                  <span>•</span>
                  <span>{formatFileSize(file.size)}</span>
                </SheetDescription>
              </div>
            </div>

            {/* Actions d'en-tête : Ouvrir nouvel onglet / Télécharger */}
            {file.url && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ouvrir dans un nouvel onglet"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="pointer-events-none"
                        >
                          <ExternalLink />
                        </Button>
                      </a>
                    }
                  />
                  <TooltipContent>
                    <p>Plein écran</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <a
                        href={file.url}
                        download={file.name || "document"}
                        title="Télécharger"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="pointer-events-none"
                        >
                          <Download />
                        </Button>
                      </a>
                    }
                  />
                  <TooltipContent>
                    <p>Télécharger</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* Corps de visualisation du document */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-muted/15 min-h-[60vh]">
          {/* 1. Rendu Image */}
          {isImage && (
            <div className="relative w-full h-full min-h-[65vh] flex items-center justify-center rounded-xl overflow-hidden bg-slate-950/95 border border-border/60 p-2">
              <div className="relative w-full h-[65vh]">
                <Image
                  src={file.url}
                  alt={file.name || "Aperçu"}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* 2. Rendu PDF natif multipages */}
          {isPdf && (
            <div className="w-full h-full min-h-[75vh] flex flex-col rounded-xl overflow-hidden border border-border/70 bg-card shadow-sm">
              <iframe
                src={`${file.url}#view=FitH`}
                title={file.name || "Document PDF"}
                className="w-full h-full min-h-[75vh] border-0"
              />
            </div>
          )}

          {/* 3. Rendu Vidéo */}
          {isVideo && (
            <div className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden bg-black p-2">
              <video
                src={file.url}
                controls
                autoPlay
                playsInline
                className="max-h-[70vh] w-full rounded-lg"
              />
            </div>
          )}

          {/* 4. Rendu Document Office (Excel, Word, PowerPoint) */}
          {isOfficeDoc && (
            <div className="w-full h-full min-h-[70vh] flex flex-col items-center justify-center">
              {officeViewerUrl ? (
                <div className="w-full h-full min-h-[75vh] rounded-xl overflow-hidden border border-border/70 bg-card shadow-sm">
                  <iframe
                    src={officeViewerUrl}
                    title={file.name || "Document Office"}
                    className="w-full h-full min-h-[75vh] border-0"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center text-center max-w-md p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
                  <div
                    className={cn(
                      "h-16 w-16 rounded-2xl flex items-center justify-center border",
                      isExcel &&
                        "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      isWord &&
                        "bg-blue-500/10 text-blue-600 border-blue-500/20",
                      isPpt &&
                        "bg-amber-500/10 text-amber-600 border-amber-500/20",
                    )}
                  >
                    <IconComponent className="size-8" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">
                      {file.name || "Document Office"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {iconInfo.label} • {formatFileSize(file.size)}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300 text-left">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>
                      Ce fichier est actuellement en mémoire locale sur votre
                      navigateur. La visualisation en ligne sera activée
                      automatiquement après téléversement.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="pointer-events-none"
                      >
                        <ExternalLink className="size-3.5 mr-1.5" />
                        Ouvrir directement
                      </Button>
                    </a>
                    <a href={file.url} download={file.name || "document"}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="pointer-events-none"
                      >
                        <Download className="size-3.5 mr-1.5" />
                        Télécharger
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Fallback autre type de fichier */}
          {!isImage && !isPdf && !isVideo && !isOfficeDoc && (
            <div className="flex flex-col items-center text-center max-w-md p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border">
                <FileIcon className="size-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  {file.name || "Fichier"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <a href={file.url} download={file.name || "document"}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="pointer-events-none"
                >
                  <Download className="size-3.5 mr-1.5" />
                  Télécharger le fichier
                </Button>
              </a>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
