"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import {
  ExternalLink,
  Download,
  FileSpreadsheet,
  FileText,
  Film,
  Presentation,
  FileIcon,
  Maximize2,
  AlertCircle,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface PreviewableFile {
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

const getFileExtension = (fileName?: string): string => {
  if (!fileName) return "";
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return "--";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} Ko`;
  return `${(kb / 1024).toFixed(1)} Mo`;
};

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
