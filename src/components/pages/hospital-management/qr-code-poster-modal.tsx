"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";
import { pdf } from "@react-pdf/renderer";
import {
  Printer,
  Download,
  FileDown,
  ShieldCheck,
  Sparkles,
  Building2,
  Copy,
  Check,
  QrCode as QrCodeIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import type { Department, Tenant } from "@/lib/types";
import { QrCodePosterPDF } from "./qr-code-poster-pdf";

export interface QrCodePosterSheetProps {
  tenant: Tenant | null;
  department?: Department | null;
  targetUrl: string;
  qrDataUrl: string;
}

/**
 * Feuille d'affiche A4 réutilisable (Aperçu dans la modale & impression directe via react-to-print)
 */
export const QrCodePosterSheet = forwardRef<
  HTMLDivElement,
  QrCodePosterSheetProps
>(({ tenant, department, targetUrl, qrDataUrl }, ref) => {
  const establishmentName = tenant?.name || APP_NAME;

  return (
    <div
      ref={ref}
      id="printable-poster"
      className="w-full max-w-[210mm] mx-auto bg-white text-slate-900 text-center space-y-5 p-6 sm:p-10 shadow-md rounded-sm border border-slate-200/80 print:m-0 print:p-10 print:shadow-none print:border-none"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 0;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background-color: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #printable-poster {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background-color: #ffffff !important;
                width: 210mm !important;
                min-height: 297mm !important;
                padding: 18mm 20mm !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                box-shadow: none !important;
                border: none !important;
              }
              .print-grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
            }
          `,
        }}
      />

      {/* 1. En-tête de l'établissement */}
      <div className="space-y-1.5 border-b border-slate-200 pb-4">
        {tenant?.logo && (
          <div className="flex justify-center pb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tenant.logo}
              alt={establishmentName}
              className="h-12 w-auto object-contain mx-auto"
            />
          </div>
        )}
        <span className="inline-block text-[10px] font-black uppercase tracking-widest text-teal-800 bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200">
          Gouvernance Sanitaire & Qualité des Soins
        </span>
        <h2 className="text-lg sm:text-xl font-extrabold text-brand-bleu leading-tight">
          {establishmentName}
        </h2>
        {department && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-teal-500/10 text-teal-800 text-xs font-bold border border-teal-200">
            <Building2 className="size-3.5" />
            <span>Unité : {department.name}</span>
          </div>
        )}
      </div>

      {/* 2. Titre d'accroche */}
      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-brand-bleu">
          Votre avis compte pour nous
        </h3>
        <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
          Flashez ce QR Code avec l&apos;appareil photo de votre smartphone pour
          évaluer votre prise en charge et formuler une suggestion.
        </p>
      </div>

      {/* 3. Cadre QR Code */}
      <div className="flex justify-center py-1">
        <div className="p-4 bg-white rounded-2xl border-4 border-brand-bleu shadow-md inline-block">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt="QR Code avis usager"
              className="w-52 h-52 object-contain mx-auto"
              width={1000}
              height={1000}
              unoptimized
            />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
              Génération du QR Code...
            </div>
          )}
        </div>
      </div>

      {/* 4. Avantages & Réassurance */}
      <div className="grid grid-cols-2 gap-2.5 text-left pt-1 print-grid-cols-2">
        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <strong className="block text-slate-900 font-bold">
              100% Confidentiel
            </strong>
            <span className="text-slate-500 text-[10px]">
              Avis anonyme ou identifié
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <Sparkles className="size-4 text-teal-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <strong className="block text-slate-900 font-bold">
              Ticket de Suivi
            </strong>
            <span className="text-slate-500 text-[10px]">
              Traitement par la direction
            </span>
          </div>
        </div>
      </div>

      {/* 5. URL de secours */}
      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-mono break-all">
        Ou rendez-vous directement sur : <br />
        <strong className="text-brand-bleu font-semibold">{targetUrl}</strong>
      </div>
    </div>
  );
});

QrCodePosterSheet.displayName = "QrCodePosterSheet";

interface QrCodePosterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  department?: Department | null;
  baseUrl: string;
}

export const QrCodePosterModal: React.FC<QrCodePosterModalProps> = ({
  open,
  onOpenChange,
  tenant,
  department,
  baseUrl,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  const targetUrl = department
    ? `${baseUrl}/${encodeURIComponent(department.id)}/survey`
    : `${baseUrl}/survey`;

  const sanitizedName = (department?.name || "etablissement_general")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");

  useEffect(() => {
    if (!open) return;

    QRCode.toDataURL(targetUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: "#0b2545", // Bleu nuit Feed-Backs
        light: "#ffffff",
      },
    })
      .then((data) => setQrDataUrl(data))
      .catch((err) => console.error("Erreur génération QR Code HD:", err));
  }, [open, targetUrl]);

  // --- IMPRESSION FIDÈLE AU FORMAT A4 (via react-to-print, sans window.print brut) ---
  const handlePrint = useReactToPrint({
    contentRef: posterRef,
    documentTitle: `Affiche_QR_${sanitizedName}`,
    onBeforePrint: async () => {
      toast.info("Préparation de l'impression au format A4...");
    },
  });

  // --- GÉNÉRATION PDF NATIVE A4 (via @react-pdf/renderer) ---
  const handleDownloadPDF = async () => {
    if (!qrDataUrl) return;
    try {
      setIsGeneratingPdf(true);
      toast.info("Génération de l'affiche au format PDF A4...");

      const doc = (
        <QrCodePosterPDF
          tenant={tenant}
          department={department}
          targetUrl={targetUrl}
          qrDataUrl={qrDataUrl}
        />
      );
      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Affiche_QR_${sanitizedName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Affiche PDF A4 téléchargée avec succès !");
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      toast.error("Erreur lors de la génération du PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `qrcode_${sanitizedName}.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success("Image du QR Code téléchargée en haute définition.");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    toast.success("Lien direct copié dans le presse-papier.");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Aperçu de l'Affiche QR Code (Format A4)"
      description="Aperçu fidèle avant impression sur papier A4 pour affichage dans les unités de soins, chambres et halls d'accueil."
      className="md:max-w-4xl"
      contentScrollable
      icon={QrCodeIcon}
    >
      <div className="space-y-4">
        {/* BARRE D'OUTILS D'IMPRESSION ET D'EXPORT (masquée à l'impression) */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 text-xs"
            >
              {isCopied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>{isCopied ? "Lien copié" : "Copier le lien"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className="gap-1.5 text-xs"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">PNG QR seul</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf || !qrDataUrl}
              className="gap-1.5 border-primary/25 hover:bg-primary/5 text-primary"
            >
              {isGeneratingPdf ? (
                <div className="size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <FileDown className="size-4" />
              )}
              <span>
                {isGeneratingPdf ? "Génération..." : "Télécharger PDF A4"}
              </span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              disabled={!qrDataUrl}
              className="gap-1.5 bg-brand-bleu hover:bg-brand-bleu/90 text-white shadow-sm"
            >
              <Printer className="size-4" />
              <span>Imprimer (Format A4)</span>
            </Button>
          </div>
        </div>

        {/* ZONE D'APERÇU FEUILLE A4 */}
        <div className="bg-slate-100/80 dark:bg-slate-900/60 p-3 sm:p-6 rounded-xl border border-slate-200/70 dark:border-slate-800 overflow-x-auto">
          <QrCodePosterSheet
            ref={posterRef}
            tenant={tenant}
            department={department}
            targetUrl={targetUrl}
            qrDataUrl={qrDataUrl}
          />
        </div>
      </div>
    </Modal>
  );
};
