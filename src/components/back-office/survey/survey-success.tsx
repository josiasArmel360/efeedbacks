"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  CheckCircle2,
  Copy,
  Check,
  FileDown,
  ArrowRight,
  Home,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/image";
import { SurveyTicketPDF } from "./survey-ticket-pdf";
import type { Department, Tenant } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SurveySuccessProps {
  code: string;
  actorTypeLabel: string;
  isAnonymous: boolean;
  authorName?: string | null;
  department?: Department | null;
  visitDate?: string | null;
  overallRating: number;
  recommendation?: string | null;
  onNewSubmission: () => void;
  tenant?: Pick<
    Tenant,
    "name" | "logo" | "city" | "address" | "phoneNumber"
  > | null;
}

export const SurveySuccess = ({
  code,
  actorTypeLabel,
  isAnonymous,
  authorName,
  department,
  visitDate,
  overallRating,
  recommendation,
  onNewSubmission,
  tenant,
}: SurveySuccessProps) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const hasAutoDownloadedRef = useRef(false);

  // Téléchargement automatique du ticket PDF au montage dès que le composant est actif
  useEffect(() => {
    if (typeof window === "undefined" || !code || hasAutoDownloadedRef.current)
      return;
    hasAutoDownloadedRef.current = true;

    const url = `${window.location.origin}/follow-up?code=${code}`;

    const autoDownload = async () => {
      try {
        setIsGeneratingPdf(true);
        const qrUri = await QRCode.toDataURL(url, {
          width: 320,
          margin: 2,
          color: { dark: "#0369a1", light: "#ffffff" },
        });
        setQrDataUrl(qrUri);

        const doc = (
          <SurveyTicketPDF
            code={code}
            actorTypeLabel={actorTypeLabel}
            isAnonymous={isAnonymous}
            authorName={authorName}
            department={department}
            visitDate={visitDate}
            overallRating={overallRating}
            recommendation={recommendation}
            qrDataUrl={qrUri}
            followUpUrl={url}
            tenant={tenant}
          />
        );

        const blob = await pdf(doc).toBlob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `Ticket_Suivi_${code}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        toast.success(
          "Votre ticket de suivi PDF a été téléchargé automatiquement !",
        );
      } catch (err) {
        console.error("Erreur téléchargement automatique PDF:", err);
      } finally {
        setIsGeneratingPdf(false);
      }
    };

    autoDownload();
  }, [
    code,
    actorTypeLabel,
    isAnonymous,
    authorName,
    department,
    visitDate,
    overallRating,
    recommendation,
    tenant,
  ]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code de suivi copié dans le presse-papier !");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Impossible de copier automatiquement le code.");
    }
  };

  const handleManualDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      toast.info("Génération de votre ticket de suivi PDF en cours...");

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/follow-up?code=${code}`;

      let qr = qrDataUrl;
      if (!qr) {
        qr = await QRCode.toDataURL(url, {
          width: 320,
          margin: 2,
          color: { dark: "#0369a1", light: "#ffffff" },
        });
        setQrDataUrl(qr);
      }

      const doc = (
        <SurveyTicketPDF
          code={code}
          actorTypeLabel={actorTypeLabel}
          isAnonymous={isAnonymous}
          authorName={authorName}
          department={department}
          visitDate={visitDate}
          overallRating={overallRating}
          recommendation={recommendation}
          qrDataUrl={qr}
          followUpUrl={url}
          tenant={tenant}
        />
      );

      const blob = await pdf(doc).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `Ticket_Suivi_${code}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("Ticket PDF téléchargé avec succès !");
    } catch (err) {
      console.error("Erreur téléchargement manuel PDF:", err);
      toast.error("Erreur lors de la génération du ticket PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/60 shadow-xl overflow-hidden bg-card/95 backdrop-blur-md">
        <CardContent className="p-4 sm:p-6 space-y-8">
          {/* En-tête de confirmation */}
          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-in zoom-in-75 duration-500">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AVIS TRANSMIS À LA CELLULE QUALITÉ</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Merci pour votre contribution !
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                Votre retour d'expérience est précieux. Il a été transmis
                directement à la direction de l'établissement et aux équipes
                concernées pour action.
              </p>
            </div>
          </div>

          {/* Cartouche Bento du Code de suivi */}
          <div className="rounded-2xl border-2 border-primary/20 bg-linear-to-br from-primary/5 via-card to-background p-6 sm:p-8 text-center space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Votre code de suivi personnel
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-wider text-primary select-all">
                  {code}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  title="Copier le code"
                  className="rounded-xl shrink-0 h-10 w-10 border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Conservez ce numéro précieusement. Il vous permet de suivre à tout
              moment la prise en compte de vos observations et les éventuelles
              mesures correctives.
            </p>
          </div>

          {/* Résumé du dépôt */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Profil
              </span>
              <p className="text-sm font-semibold text-foreground truncate">
                {actorTypeLabel}
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/30 p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Confidentialité
              </span>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{isAnonymous ? "100% Anonyme" : "Avis Nominatif"}</span>
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/30 p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Service concerné
              </span>
              <p className="text-sm font-semibold text-foreground truncate">
                {department?.name || "Établissement général"}
              </p>
            </div>
          </div>

          {/* Actions : Téléchargement PDF & Redirection Suivi */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl h-12 font-medium border-primary/30 hover:bg-primary/5 hover:border-primary"
                onClick={handleManualDownloadPdf}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <div className="flex items-center gap-2">
                    <Loader size="xs" theme="white" />
                    Génération du ticket...
                  </div>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4 text-primary" />
                    Retélécharger le ticket PDF
                  </>
                )}
              </Button>

              <Link
                href={`/follow-up?code=${code}`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "flex-1 rounded-xl h-12 font-semibold shadow-md bg-linear-to-r from-primary to-primary/90 hover:opacity-95 text-primary-foreground",
                )}
              >
                <span>Suivre mon avis en direct</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl h-12 font-semibold border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/5 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-300"
              onClick={onNewSubmission}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Donner un autre avis
            </Button>

            <div className="flex justify-center pt-2">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-muted-foreground hover:text-foreground",
                )}
              >
                <Home className="mr-2 h-4 w-4" />
                Retourner à la page d'accueil
              </Link>
            </div>
          </div>

          {/* Bloc d'assurance et d'engagement */}
          <div className="border-t border-border/50 pt-6 flex items-start gap-3 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Les avis sont examinés de façon hebdomadaire lors des comités de
              vigilance et de qualité des soins. En cas de signalement critique,
              une instruction prioritaire est ouverte sous 48 heures ouvrées.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
