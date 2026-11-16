"use client";

import React, { useMemo, useState } from "react";
import { endOfDay, format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
  Building2,
  Lock,
  MessageSquareText,
  RotateCcw,
  Star,
  User as UserIcon,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { ActionsButton } from "@/components/buttons";
import { DataTable, DTFeatures, SortColumn } from "@/components/data-table";
import { Badge } from "@/components/badge";
import { DateRangePickerInput, SelectInput } from "@/components/inputs";

import { usePermissions } from "@/hooks/use-permissions";
import { RESOURCE } from "@/lib/config/access.modules";
import type { Department, Feedback, FormMode, User } from "@/lib/types";
import { exportTableToExcel } from "@/lib/helper/excel-export";
import { getAll, remove } from "@/lib/db/server/feedbacks";

import { FeedbackKpis } from "./feedback-kpis";
import { FeedbackDetailForm } from "./feedback-detail-form";
import {
  ACTOR_LABEL_MAP,
  ACTOR_OPTIONS,
  computeFeedbackKpis,
  computeStatusCounts,
  FEEDBACK_PRIORITY_LABEL_MAP,
  FEEDBACK_PRIORITY_OPTIONS,
  FEEDBACK_STATUS_LABEL_MAP,
  FEEDBACK_STATUS_OPTIONS,
  RECOMMENDATION_LABEL_MAP,
} from "./feedback-helpers";

interface FeedbackFilterValues {
  status: string;
  actorType: string;
  departmentId: string;
  priority: string;
  period?: DateRange;
}

interface FeedbackViewProps {
  initial: Feedback[];
  departments: Department[];
  users: User[];
  resource?: string;
}

const INITIAL_FILTERS: FeedbackFilterValues = {
  status: "all",
  actorType: "all",
  departmentId: "all",
  priority: "all",
  period: undefined,
};

/**
 * Colonnes secondaires masquées par défaut pour garder le tableau épuré,
 * mais activables à la demande via le menu « Colonnes » du DataTable.
 */
const INITIAL_COLUMN_VISIBILITY: Record<string, boolean> = {
  author: false,
  overallRating: false,
  recommendation: false,
  assignedTo: false,
};

export const FeedbackView = ({
  initial,
  departments,
  users,
  resource = RESOURCE.FEEDBACK,
}: FeedbackViewProps) => {
  const { canDo } = usePermissions();

  const canRead = canDo(resource, "read");
  const canUpdate = canDo(resource, "update");
  const canDelete = canDo(resource, "delete");

  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initial);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [filters, setFilters] = useState<FeedbackFilterValues>(INITIAL_FILTERS);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Modal Consultation / Instruction
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: FormMode;
    data?: Feedback;
  }>({ open: false, mode: "preview" });

  // Modal Confirmation de Suppression
  const [deleteState, setDeleteState] = useState<{
    open: boolean;
    data?: Feedback;
  }>({ open: false });

  // 1. Filtrage de base (tous les filtres sauf le statut) pour les compteurs de statut cliquables
  const baseFiltered = useMemo(() => {
    const fromTime = filters.period?.from
      ? startOfDay(filters.period.from).getTime()
      : null;
    const toTime = filters.period?.to
      ? endOfDay(filters.period.to).getTime()
      : filters.period?.from
        ? endOfDay(filters.period.from).getTime()
        : null;

    return feedbacks.filter((f) => {
      if (filters.actorType !== "all" && f.actorType !== filters.actorType) {
        return false;
      }

      if (
        filters.departmentId !== "all" &&
        f.departmentId !== filters.departmentId
      ) {
        return false;
      }

      if (filters.priority !== "all") {
        if (filters.priority === "haute_urgente") {
          const isAlert =
            (f.priority === "haute" || f.priority === "urgente") &&
            f.status !== "traite";
          if (!isAlert) return false;
        } else if (f.priority !== filters.priority) {
          return false;
        }
      }

      if (fromTime !== null && toTime !== null) {
        const createdTime = new Date(f.createdAt).getTime();
        if (createdTime < fromTime || createdTime > toTime) {
          return false;
        }
      }

      return true;
    });
  }, [
    feedbacks,
    filters.actorType,
    filters.departmentId,
    filters.priority,
    filters.period,
  ]);

  // 2. Filtrage complet (incluant le statut) transmis au DataTable
  const filteredData = useMemo(() => {
    if (filters.status === "all") return baseFiltered;
    return baseFiltered.filter((f) => f.status === filters.status);
  }, [baseFiltered, filters.status]);

  // 3. Lignes effectivement visibles après recherche globale du DataTable (100% dérivé via useMemo)
  const effectiveVisibleRows = useMemo(() => {
    const query = globalFilter.trim().toLowerCase();
    if (!query) return filteredData;

    return filteredData.filter((f) => {
      const authorText = f.isAnonymous
        ? "Anonyme"
        : f.authorName || "Identifié";
      const searchable = [
        f.code,
        f.actorType,
        authorText,
        f.department?.name || "",
        String(f.overallRating),
        f.recommendation || "",
        f.priority,
        f.status,
        f.assignedTo?.name || "",
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [filteredData, globalFilter]);

  // 4. Compteurs de statut et KPI qualité en temps réel
  const statusCounts = useMemo(
    () => computeStatusCounts(baseFiltered),
    [baseFiltered],
  );

  const kpis = useMemo(
    () => computeFeedbackKpis(effectiveVisibleRows),
    [effectiveVisibleRows],
  );

  // Rafraîchissement des données depuis le serveur
  const onRefresh = async () => {
    try {
      setIsFetching(true);
      const data = await getAll();
      setFeedbacks(data);
    } catch {
      toast.error("Échec de la récupération des avis et réponses");
    } finally {
      setIsFetching(false);
    }
  };

  // Confirmation de suppression
  const onConfirmDelete = async () => {
    if (!deleteState.data) return;
    const res = await remove({ id: deleteState.data.id });
    if (res?.serverError || res?.validationErrors) {
      throw new Error(
        res.serverError ||
          "Une erreur est survenue lors de la suppression de l'avis",
      );
    }
    toast.success(res?.data?.message || "Avis supprimé avec succès");
    await onRefresh();
  };

  // Exportation Excel (basée sur les lignes réellement affichées)
  const onExportToExcel = () => {
    if (!effectiveVisibleRows || effectiveVisibleRows.length === 0) {
      toast.info("Aucun avis à exporter");
      return;
    }

    const dataToExport = effectiveVisibleRows.map((f) => ({
      Code: f.code,
      Profil: ACTOR_LABEL_MAP[f.actorType] || f.actorType,
      Confidentialité: f.isAnonymous ? "Anonyme" : "Identifié",
      "Nom Auteur": f.authorName || "-",
      Téléphone: f.authorPhone || "-",
      Email: f.authorEmail || "-",
      Service: f.department?.name || "Non spécifié",
      "Note Globale / 5": f.overallRating,
      Recommandation: f.recommendation
        ? RECOMMENDATION_LABEL_MAP[f.recommendation]
        : "-",
      Priorité: FEEDBACK_PRIORITY_LABEL_MAP[f.priority] || f.priority,
      Statut: FEEDBACK_STATUS_LABEL_MAP[f.status] || f.status,
      "Assigné à": f.assignedTo?.name || "-",
      "Points forts": f.positivePoints || "-",
      "Points faibles": f.negativePoints || "-",
      Suggestions: f.suggestions || "-",
      "Notes internes": f.internalNotes || "-",
      "Action corrective": f.correctiveAction || "-",
      "Date de dépôt": f.createdAt
        ? format(new Date(f.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })
        : "-",
      "Date de traitement": f.treatedAt
        ? format(new Date(f.treatedAt), "dd/MM/yyyy HH:mm", { locale: fr })
        : "-",
    }));

    exportTableToExcel({
      filename: `Avis_Retours_${format(new Date(), "yyyy-MM-dd")}`,
      sheetName: "Avis & Retours",
      data: dataToExport,
    });
    toast.success("Exportation Excel générée avec succès");
  };

  return (
    <div className="space-y-4">
      {/* Cartes KPI en temps réel liées aux filtres et à la recherche */}
      <FeedbackKpis
        statusCounts={statusCounts}
        kpis={kpis}
        activeStatus={filters.status}
        activePriority={filters.priority}
        onStatusSelect={(status) => setFilters((prev) => ({ ...prev, status }))}
        onUrgentToggle={() =>
          setFilters((prev) => ({
            ...prev,
            priority:
              prev.priority === "haute_urgente" ? "all" : "haute_urgente",
          }))
        }
      />

      {/* Tableau TanStack */}
      <DataTable
        data={filteredData}
        columns={columns}
        isFetching={isFetching}
        onRefresh={() => onRefresh()}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        canFilter={true}
        showColumnsDisplayFilter={true}
        initialColumnVisibility={INITIAL_COLUMN_VISIBILITY}
        filtersOptions={
          <FeedbackFilter
            filters={filters}
            departments={departments}
            onFilterChange={setFilters}
            onReset={() => {
              setFilters(INITIAL_FILTERS);
              setGlobalFilter("");
            }}
          />
        }
        onExportToExcel={onExportToExcel}
        actionsButtons={(data) => (
          <div className="flex items-center gap-1.5">
            <ActionsButton
              icon="Eye"
              color="blue"
              tooltipLabel="Examiner & Instruire l'avis"
              hasAccess={canRead}
              onClick={() =>
                setFormState({
                  open: true,
                  mode: "preview",
                  data,
                })
              }
            />

            <ActionsButton
              icon="Trash2"
              color="destructive"
              tooltipLabel="Supprimer l'avis"
              hasAccess={canDelete}
              onClick={() => setDeleteState({ open: true, data })}
            />
          </div>
        )}
      />

      {/* Modal Consultation & Instruction */}
      {formState.open && formState.data && (
        <Modal
          open={formState.open}
          onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
          title={
            formState.mode === "preview"
              ? `Détails de l'avis ${formState.data.code}`
              : `Instruction de l'avis ${formState.data.code}`
          }
          description={
            formState.mode === "preview"
              ? "Consultez le témoignage complet, les notes par critère et l'état d'avancement du dossier."
              : "Qualifiez la priorité, assignez un responsable et consignez les mesures correctives."
          }
          className="md:max-w-3xl"
          contentScrollable
          icon={MessageSquareText}
        >
          <FeedbackDetailForm
            key={`${formState.mode}-${formState.data.id}`}
            mode={formState.mode}
            feedback={formState.data}
            users={users}
            onSuccess={async () => {
              await onRefresh();
              setFormState({ open: false, mode: "preview" });
            }}
            canUpdate={canUpdate}
          />
        </Modal>
      )}

      {/* Modal Confirmation de Suppression */}
      {deleteState.data && (
        <ConfirmModal
          open={deleteState.open}
          onClose={() => setDeleteState({ open: false })}
          onConfirm={onConfirmDelete}
          description={`Êtes-vous sûr de vouloir supprimer définitivement l'avis « ${deleteState.data.code} » ?`}
          notice="Cette action supprimera également l'ensemble des réponses aux critères associées à ce dépôt."
        />
      )}
    </div>
  );
};

// Définition des colonnes du tableau TanStack au niveau module
const columnHelper = createColumnHelper<DTFeatures, Feedback>();

const columns = [
  columnHelper.accessor("code", {
    id: "code",
    meta: { label: "Code" },
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Code" />
    ),
    cell: (info) => (
      <span className="font-mono font-bold text-xs text-primary">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("actorType", {
    id: "actorType",
    meta: { label: "Profil" },
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Profil" />
    ),
    cell: (info) => <Badge status={info.getValue()} size="sm" />,
  }),
  columnHelper.accessor(
    (row) => (row.isAnonymous ? "Anonyme" : row.authorName || "Identifié"),
    {
      id: "author",
      meta: { label: "Confidentialité" },
      header: (info) => (
        <SortColumn info={info} icon="string" columnName="Confidentialité" />
      ),
      cell: ({ row }) => {
        const f = row.original;
        return f.isAnonymous ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Anonyme</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
            <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate max-w-36">
              {f.authorName || "Identifié"}
            </span>
          </span>
        );
      },
    },
  ),
  columnHelper.accessor((row) => row.department?.name || "", {
    id: "department",
    meta: { label: "Service hospitalier" },
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Service hospitalier" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="truncate max-w-40">
          {row.original.department?.name || "Non spécifié"}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("overallRating", {
    id: "overallRating",
    meta: { label: "Note" },
    header: (info) => (
      <SortColumn info={info} icon="number" columnName="Note" />
    ),
    cell: (info) => (
      <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 shrink-0" />
        <span>{info.getValue()}/5</span>
      </div>
    ),
  }),
  columnHelper.accessor((row) => row.recommendation || "", {
    id: "recommendation",
    meta: { label: "Recommandation" },
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Recommandation" />
    ),
    cell: ({ row }) =>
      row.original.recommendation ? (
        <Badge status={row.original.recommendation} size="sm" />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  }),
  columnHelper.accessor("priority", {
    id: "priority",
    meta: { label: "Priorité" },
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Priorité" />
    ),
    cell: ({ row }) => {
      const isUrgent =
        (row.original.priority === "urgente" ||
          row.original.priority === "haute") &&
        row.original.status !== "traite";
      return (
        <div className="flex items-center gap-1.5">
          <Badge status={row.original.priority} size="sm" />
          {isUrgent && (
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor("status", {
    id: "status",
    meta: { label: "Statut" },
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Statut" />
    ),
    cell: (info) => <Badge status={info.getValue()} size="sm" />,
  }),
  columnHelper.accessor((row) => row.assignedTo?.name || "", {
    id: "assignedTo",
    meta: { label: "Assigné à" },
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Assigné à" />
    ),
    cell: ({ row }) =>
      row.original.assignedTo ? (
        <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate max-w-32">
            {row.original.assignedTo.name}
          </span>
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  }),
  columnHelper.accessor((row) => new Date(row.createdAt).getTime(), {
    id: "createdAt",
    meta: { label: "Date de dépôt" },
    header: (info) => (
      <SortColumn info={info} icon="date" columnName="Date de dépôt" />
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm", {
          locale: fr,
        })}
      </span>
    ),
  }),
] as ColumnDef<DTFeatures, Feedback>[];

// Composant de filtres
interface FeedbackFilterProps {
  filters: FeedbackFilterValues;
  departments: Department[];
  onFilterChange: (filters: FeedbackFilterValues) => void;
  onReset: () => void;
}

const FeedbackFilter = ({
  filters,
  departments,
  onFilterChange,
  onReset,
}: FeedbackFilterProps) => {
  const isFiltered =
    filters.status !== "all" ||
    filters.actorType !== "all" ||
    filters.departmentId !== "all" ||
    filters.priority !== "all" ||
    !!filters.period?.from;

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tous les statuts" },
      ...FEEDBACK_STATUS_OPTIONS,
    ],
    [],
  );

  const actorOptions = useMemo(
    () => [{ value: "all", label: "Tous les profils" }, ...ACTOR_OPTIONS],
    [],
  );

  const departmentOptions = useMemo(
    () => [
      { value: "all", label: "Tous les services" },
      ...departments.map((d) => ({ value: d.id, label: d.name })),
    ],
    [departments],
  );

  const priorityOptions = useMemo(
    () => [
      { value: "all", label: "Toutes les priorités" },
      ...FEEDBACK_PRIORITY_OPTIONS,
      { value: "haute_urgente", label: "Alertes (Haute & Urgente)" },
    ],
    [],
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-44">
        <SelectInput
          label="Statut"
          options={statusOptions}
          value={filters.status}
          onValueChange={(val) => onFilterChange({ ...filters, status: val })}
        />
      </div>

      <div className="w-48">
        <SelectInput
          label="Profil d'acteur"
          options={actorOptions}
          value={filters.actorType}
          onValueChange={(val) =>
            onFilterChange({ ...filters, actorType: val })
          }
        />
      </div>

      <div className="w-52">
        <SelectInput
          label="Service hospitalier"
          options={departmentOptions}
          value={filters.departmentId}
          onValueChange={(val) =>
            onFilterChange({ ...filters, departmentId: val })
          }
        />
      </div>

      <div className="w-48">
        <SelectInput
          label="Priorité"
          options={priorityOptions}
          value={filters.priority}
          onValueChange={(val) => onFilterChange({ ...filters, priority: val })}
        />
      </div>

      <div className="w-60">
        <DateRangePickerInput
          label="Période de dépôt"
          placeholder="Toutes les dates"
          dateFormat="P"
          value={filters.period}
          onChange={(range) => onFilterChange({ ...filters, period: range })}
        />
      </div>

      {isFiltered && (
        <div>
          <Button
            variant="outline"
            onClick={onReset}
            className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Réinitialiser
          </Button>
        </div>
      )}
    </div>
  );
};
