"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import QRCode from "qrcode";
import { pdf } from "@react-pdf/renderer";
import { useReactToPrint } from "react-to-print";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { toast } from "sonner";
import { QrCode, ExternalLink, RotateCcw, MapPin } from "lucide-react";

import { exportTableToExcel } from "@/lib/helper/excel-export";
import { usePermissions } from "@/hooks/use-permissions";
import { RESOURCE } from "@/lib/config/access.modules";
import type { Department, Tenant } from "@/lib/types";

import { ActionsButton } from "@/components/buttons";
import { DataTable, DTFeatures, SortColumn } from "@/components/data-table";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { SelectInput } from "@/components/inputs";
import { QrCodePosterModal, QrCodePosterSheet } from "./qr-code-poster-modal";
import { QrCodePosterPDF } from "./qr-code-poster-pdf";

export interface QrCollectionItem {
  id: string;
  departmentId?: string;
  department?: Department | null;
  title: string;
  typeLabel: string;
  targetUrl: string;
  placementRecommendation: string;
  isActive: boolean;
}

interface QrCodesViewProps {
  tenant: Tenant | null;
  departments: Department[];
  resource?: string;
  baseUrl: string;
}

export const QrCodesView: React.FC<QrCodesViewProps> = ({
  tenant,
  departments,
  resource = RESOURCE.QR_CODES,
  baseUrl,
}) => {
  const { canDo } = usePermissions();
  const canRead = canDo(resource, "read");

  const [filterType, setFilterType] = useState<string>("all");
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  // État de la modale d'aperçu d'affiche A4
  const [posterState, setPosterState] = useState<{
    open: boolean;
    department?: Department | null;
  }>({ open: false });

  // État et références pour l'impression directe via react-to-print
  const directPrintRef = useRef<HTMLDivElement>(null);
  const pendingPrintItemRef = useRef<QrCollectionItem | null>(null);
  const printReadyResolveRef = useRef<(() => void) | null>(null);
  const [directPrintData, setDirectPrintData] = useState<{
    department: Department | null;
    targetUrl: string;
    qrDataUrl: string;
    documentTitle: string;
  } | null>(null);

  useEffect(() => {
    if (directPrintData && printReadyResolveRef.current) {
      const resolve = printReadyResolveRef.current;
      printReadyResolveRef.current = null;
      resolve();
    }
  }, [directPrintData]);

  const triggerDirectPrint = useReactToPrint({
    contentRef: directPrintRef,
    documentTitle: directPrintData?.documentTitle || "Affiche_QR_Code",
    onBeforePrint: async () => {
      const item = pendingPrintItemRef.current;
      if (!item) return;

      toast.info(`Préparation de l'impression A4 pour « ${item.title} »...`);
      const dataUrl = await QRCode.toDataURL(item.targetUrl, {
        width: 600,
        margin: 2,
        color: { dark: "#0b2545", light: "#ffffff" },
      });
      const cleanName = (item.department?.name || "etablissement_general")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");

      await new Promise<void>((resolve) => {
        printReadyResolveRef.current = resolve;
        setDirectPrintData({
          department: item.department || null,
          targetUrl: item.targetUrl,
          qrDataUrl: dataUrl,
          documentTitle: `Affiche_QR_${cleanName}`,
        });
      });
    },
  });

  const handleDirectPrint = (item: QrCollectionItem) => {
    pendingPrintItemRef.current = item;
    triggerDirectPrint();
  };

  // Génération du catalogue des points de collecte
  const qrItems = useMemo<QrCollectionItem[]>(() => {
    const list: QrCollectionItem[] = [
      {
        id: "general",
        department: null,
        title: "Établissement - Point Général",
        typeLabel: "GLOBAL",
        targetUrl: `${baseUrl}/survey`,
        placementRecommendation:
          "Hall principal, standard, caisses centrales & sorties",
        isActive: true,
      },
    ];

    (Array.isArray(departments) ? departments : []).forEach((d) => {
      list.push({
        id: d.id,
        departmentId: d.id,
        department: d,
        title: d.name,
        typeLabel: `Ordre #${d.orderIndex}`,
        targetUrl: `${baseUrl}/${encodeURIComponent(d.id)}/survey`,
        placementRecommendation:
          d.description || "Chambres d'hospitalisation & comptoirs de soins",
        isActive: d.isActive,
      });
    });

    return list;
  }, [baseUrl, departments]);

  // Filtrage local en temps réel
  const filteredItems = useMemo(() => {
    return qrItems.filter((item) => {
      if (filterType === "general" && item.id !== "general") return false;
      if (filterType === "departments" && item.id === "general") return false;
      return true;
    });
  }, [qrItems, filterType]);

  // Téléchargement PDF A4 fidèle via @react-pdf/renderer (identique à QrCodePosterModal)
  const handleDownloadPDF = async (item: QrCollectionItem) => {
    try {
      setGeneratingPdfId(item.id);
      toast.info(`Génération du PDF A4 pour « ${item.title} »...`);

      const qrDataUrl = await QRCode.toDataURL(item.targetUrl, {
        width: 600,
        margin: 2,
        color: { dark: "#0b2545", light: "#ffffff" },
      });

      const doc = (
        <QrCodePosterPDF
          tenant={tenant}
          department={item.department || null}
          targetUrl={item.targetUrl}
          qrDataUrl={qrDataUrl}
        />
      );
      const blob = await pdf(doc).toBlob();

      const cleanName = (item.department?.name || "etablissement_general")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Affiche_QR_${cleanName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Affiche PDF A4 de « ${item.title} » téléchargée !`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      toast.error("Erreur lors de la génération du PDF.");
    } finally {
      setGeneratingPdfId(null);
    }
  };

  // Exportation Excel de l'inventaire des QR Codes
  const onExportToExcel = () => {
    if (!filteredItems || filteredItems.length === 0) {
      toast.info("Aucune donnée à exporter.");
      return;
    }

    const dataToExport = filteredItems.map((item) => ({
      "Point de collecte": item.title,
      Type: item.typeLabel,
      "URL Cible": item.targetUrl,
      "Emplacement Recommandé": item.placementRecommendation,
      Statut: item.isActive ? "Actif" : "En sommeil",
    }));

    exportTableToExcel({
      filename: `Catalogue_QR_Codes_${format(new Date(), "yyyy-MM-dd")}`,
      sheetName: "QR_Codes",
      data: dataToExport,
    });
    toast.success("Catalogue des QR Codes exporté avec succès.");
  };

  return (
    <div className="space-y-4">
      <div className="print:hidden">
        <DataTable
          data={filteredItems}
          columns={columns}
          canFilter={true}
          filtersOptions={
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-56">
                <SelectInput
                  label="Type de point de collecte"
                  options={[
                    { value: "all", label: "Tous les points de collecte" },
                    { value: "general", label: "Point général établissement" },
                    {
                      value: "departments",
                      label: "Services hospitaliers dédiés",
                    },
                  ]}
                  value={filterType}
                  onValueChange={(val) => setFilterType(val)}
                />
              </div>

              {filterType !== "all" && (
                <div className="w-30">
                  <Button
                    variant="outline"
                    onClick={() => setFilterType("all")}
                    className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <RotateCcw className="size-3.5" />
                    Réinitialiser
                  </Button>
                </div>
              )}
            </div>
          }
          onExportToExcel={onExportToExcel}
          actionsButtons={(item) => (
            <div className="flex items-center gap-1.5">
              {/* Aperçu de l'Affiche A4 */}
              <ActionsButton
                icon="Eye"
                color="blue"
                tooltipLabel="Aperçu de l'affiche A4"
                hasAccess={canRead}
                onClick={() =>
                  setPosterState({
                    open: true,
                    department: item.department || null,
                  })
                }
              />

              {/* Télécharger l'affiche PDF A4 via @react-pdf/renderer */}
              <ActionsButton
                icon="Download"
                color="purple"
                tooltipLabel="Télécharger l'affiche"
                hasAccess={canRead}
                disabled={generatingPdfId === item.id}
                onClick={() => handleDownloadPDF(item)}
              />

              {/* Imprimer directement l'affiche A4 via react-to-print */}
              <ActionsButton
                icon="Printer"
                color="teal"
                tooltipLabel="Imprimer l'affiche"
                hasAccess={canRead}
                onClick={() => handleDirectPrint(item)}
              />
            </div>
          )}
        />
      </div>

      {/* Feuille A4 hors-écran dédiée à l'impression directe via react-to-print */}
      <div
        aria-hidden="true"
        className="fixed left-[-9999px] top-0 pointer-events-none"
      >
        <QrCodePosterSheet
          ref={directPrintRef}
          tenant={tenant}
          department={directPrintData?.department}
          targetUrl={directPrintData?.targetUrl || `${baseUrl}/survey`}
          qrDataUrl={directPrintData?.qrDataUrl || ""}
        />
      </div>

      {/* Modale d'aperçu de l'affiche officielle imprimable */}
      <QrCodePosterModal
        open={posterState.open}
        onOpenChange={(open) => setPosterState((prev) => ({ ...prev, open }))}
        tenant={tenant}
        department={posterState.department}
        baseUrl={baseUrl}
      />
    </div>
  );
};

// Définition des colonnes du tableau TanStack
const columnHelper = createColumnHelper<DTFeatures, QrCollectionItem>();
const columns = [
  columnHelper.accessor("title", {
    id: "title",
    header: (info) => (
      <SortColumn
        info={info}
        icon="string"
        columnName="Point de Collecte / Service"
      />
    ),
    cell: (info) => {
      const row = info.row.original;
      const isGeneral = row.id === "general";

      return (
        <div className="flex items-center gap-3 max-w-xs truncate">
          <div
            className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isGeneral
                ? "bg-teal-500/15 text-teal-700 border-teal-500/30 dark:text-teal-300"
                : "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            <QrCode className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-foreground leading-tight flex items-center gap-2">
              <span>{row.title}</span>
              {isGeneral && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300">
                  Global
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {row.typeLabel}
            </span>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("placementRecommendation", {
    id: "placement",
    header: (info) => (
      <SortColumn
        info={info}
        icon="string"
        columnName="Emplacement Recommandé"
      />
    ),
    cell: (info) => {
      const val = info.getValue();
      return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-xs truncate">
          <MapPin className="size-3.5 text-muted-foreground/60 shrink-0" />
          <span title={val} className="truncate">
            {val}
          </span>
        </div>
      );
    },
  }),
  columnHelper.accessor("targetUrl", {
    id: "targetUrl",
    header: (info) => (
      <SortColumn
        info={info}
        icon="string"
        columnName="Lien Direct d'Évaluation"
      />
    ),
    cell: (info) => {
      const val = info.getValue();
      return (
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground max-w-30 truncate">
          <span className="truncate" title={val}>
            {val}
          </span>
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 shrink-0"
            title="Ouvrir le questionnaire dans un nouvel onglet"
          >
            <ExternalLink className="size-3" />
          </a>
        </div>
      );
    },
  }),
  columnHelper.accessor(
    (row) => (row.isActive ? "Prêt à l'affichage" : "En sommeil"),
    {
      id: "status",
      header: (info) => (
        <SortColumn info={info} icon="string" columnName="Statut" />
      ),
      cell: (info) => {
        const { isActive } = info.row.original;
        return (
          <Badge
            variant="outline"
            className={
              isActive
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] py-0.5"
                : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 text-[11px] py-0.5"
            }
          >
            {isActive ? "Prêt à l'affichage" : "En sommeil"}
          </Badge>
        );
      },
    },
  ),
] as ColumnDef<DTFeatures, QrCollectionItem>[];
