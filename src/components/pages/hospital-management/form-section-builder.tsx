"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { toast } from "sonner";
import { Layers, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { ActionsButton } from "@/components/buttons";
import { DataTable, DTFeatures, SortColumn } from "@/components/data-table";
import { Badge } from "@/components/badge";
import { SelectInput } from "@/components/inputs";

import { SurveySectionForm } from "./survey-section-form";
import {
  ACTOR_FILTER_OPTIONS,
  ACTOR_LABEL_MAP,
  STATUS_FILTER_OPTIONS,
  renderActorsBadges,
  renderStatusBadge,
} from "./forms-builder-helpers";

import { usePermissions } from "@/hooks/use-permissions";
import { RESOURCE } from "@/lib/config/access.modules";
import type { ActorType, FormMode, SurveySection } from "@/lib/types";
import { exportTableToExcel } from "@/lib/helper/excel-export";
import { getAllSections, removeSection } from "@/lib/db/server/forms-builder";

interface SectionFilterValues {
  actor: string;
  status: string;
}

interface FormSectionBuilderProps {
  initialSections: SurveySection[];
  resource?: string;
}

export const FormSectionBuilder = ({
  initialSections,
  resource = RESOURCE.FORM_BUILDER,
}: FormSectionBuilderProps) => {
  const router = useRouter();
  const { canDo } = usePermissions();

  const canCreate = canDo(resource, "create");
  const canRead = canDo(resource, "read");
  const canUpdate = canDo(resource, "update");
  const canDelete = canDo(resource, "delete");

  const [sections, setSections] = useState<SurveySection[]>(initialSections);
  const [prevInitialSections, setPrevInitialSections] =
    useState<SurveySection[]>(initialSections);
  if (initialSections !== prevInitialSections) {
    setPrevInitialSections(initialSections);
    setSections(initialSections);
  }

  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Modal Formulaire Section Thématique
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: FormMode;
    data?: SurveySection;
  }>({ open: false, mode: "create" });

  // Modal Confirmation Suppression Section
  const [deleteState, setDeleteState] = useState<{
    open: boolean;
    data?: SurveySection;
  }>({ open: false });

  // Filtres Sections
  const [filters, setFilters] = useState<SectionFilterValues>({
    actor: "all",
    status: "all",
  });

  // Filtrage temps réel des sections
  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      if (
        filters.actor !== "all" &&
        !(s.targetActors || []).includes(filters.actor as ActorType)
      ) {
        return false;
      }
      const status = s.isActive ? "actif" : "inactif";
      if (filters.status !== "all" && status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [sections, filters]);

  // Rafraîchissement des sections depuis le serveur
  const onRefresh = async () => {
    try {
      setIsFetching(true);
      const updatedSections = await getAllSections();
      setSections(updatedSections);
    } catch {
      toast.error("Échec de l'actualisation des sections thématiques");
    } finally {
      setIsFetching(false);
    }
  };

  // Confirmation suppression Section
  const onConfirmDelete = async () => {
    if (!deleteState.data) return;
    const res = await removeSection({ id: deleteState.data.id });
    if (res?.serverError || res?.validationErrors) {
      throw new Error(
        res.serverError ||
          "Une erreur est survenue lors de la suppression de la section",
      );
    }
    toast.success(
      res?.data?.message || "Section thématique supprimée avec succès",
    );
    await onRefresh();
    router.refresh();
  };

  // Exportation Excel des Sections
  const onExportToExcel = () => {
    if (!filteredSections || filteredSections.length === 0) {
      toast.info("Aucune section à exporter");
      return;
    }

    const dataToExport = filteredSections.map((s) => ({
      Ordre: s.orderIndex,
      "Titre de la section": s.title,
      Description: s.description || "-",
      "Profils ciblés": (s.targetActors || [])
        .map((a) => ACTOR_LABEL_MAP[a] || a)
        .join(", "),
      "Nombre de critères": s.fields?.length ?? 0,
      Statut: s.isActive ? "Actif" : "Inactif",
      "Date de création": s.createdAt
        ? format(new Date(s.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })
        : "-",
    }));

    exportTableToExcel({
      filename: `Sections_Questionnaire_${format(new Date(), "yyyy-MM-dd")}`,
      sheetName: "Sections",
      data: dataToExport,
    });
    toast.success("Exportation Excel des sections générée avec succès");
  };

  return (
    <React.Fragment>
      <DataTable
        data={filteredSections}
        columns={columns}
        isFetching={isFetching}
        onRefresh={() => onRefresh()}
        onCreate={
          canCreate
            ? () =>
                setFormState({
                  open: true,
                  mode: "create",
                })
            : undefined
        }
        canFilter={true}
        filtersOptions={
          <SectionFilterBar
            filters={filters}
            onFilterChange={setFilters}
            onReset={() =>
              setFilters({
                actor: "all",
                status: "all",
              })
            }
          />
        }
        onExportToExcel={onExportToExcel}
        actionsButtons={(data) => (
          <div className="flex items-center gap-1.5">
            <ActionsButton
              icon="Eye"
              color="blue"
              tooltipLabel="Consulter / Modifier"
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
              tooltipLabel="Supprimer la section"
              hasAccess={canDelete}
              onClick={() => setDeleteState({ open: true, data })}
            />
          </div>
        )}
      />

      {/* Modal Formulaire Section Thématique */}
      {formState.open && (
        <Modal
          open={formState.open}
          onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
          title={
            formState.mode === "create"
              ? "Nouvelle section thématique"
              : formState.mode === "preview"
                ? "Détails de la section"
                : "Modifier la section"
          }
          description={
            formState.mode === "create"
              ? "Créez une nouvelle thématique pour regrouper vos questions d'évaluation."
              : formState.mode === "preview"
                ? "Consultez l'intitulé, l'ordre d'apparition et les acteurs ciblés de cette section."
                : "Mettez à jour les informations et la visibilité de cette section thématique."
          }
          className="md:max-w-2xl"
          contentScrollable
          icon={Layers}
        >
          <SurveySectionForm
            key={`${formState.mode}-${formState.data?.id || "new"}`}
            mode={formState.mode}
            section={formState.data}
            onSuccess={async (mode) => {
              await onRefresh();
              router.refresh();
              setFormState({ open: mode !== "update", mode: "create" });
            }}
            canUpdate={canUpdate}
          />
        </Modal>
      )}

      {/* Modal Confirmation Suppression Section */}
      {deleteState.data && (
        <ConfirmModal
          open={deleteState.open}
          onClose={() => setDeleteState({ open: false })}
          onConfirm={onConfirmDelete}
          description={`Êtes-vous sûr de vouloir supprimer la section « ${deleteState.data.title.toUpperCase()} » ?`}
          notice="Attention : la suppression de cette section entraînera également la suppression en cascade de tous les critères qui lui sont rattachés."
        />
      )}
    </React.Fragment>
  );
};

// Colonnes TanStack : Sections Thématiques
const columnHelper = createColumnHelper<DTFeatures, SurveySection>();
const columns = [
  columnHelper.accessor("orderIndex", {
    id: "orderIndex",
    header: (info) => (
      <SortColumn info={info} icon="number" columnName="Ordre" />
    ),
    cell: (info) => (
      <div className="font-mono text-xs text-muted-foreground w-10 text-center">
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor("title", {
    id: "title",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Section thématique" />
    ),
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary shrink-0" />
        <div className="flex flex-col">
          <span className="font-medium text-xs text-foreground">
            {info.getValue()}
          </span>
          {info.row.original.description && (
            <span className="text-[11px] text-muted-foreground max-w-sm truncate">
              {info.row.original.description}
            </span>
          )}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("targetActors", {
    id: "targetActors",
    header: () => <span className="text-xs font-semibold">Public cible</span>,
    cell: (info) => renderActorsBadges(info.getValue()),
  }),
  columnHelper.accessor((row) => row.fields?.length ?? 0, {
    id: "fieldsCount",
    header: (info) => (
      <SortColumn info={info} icon="number" columnName="Critères" />
    ),
    cell: (info) => (
      <Badge variant="secondary" className="text-[11px] font-medium">
        {info.getValue()} question(s)
      </Badge>
    ),
  }),
  columnHelper.accessor("isActive", {
    id: "isActive",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Statut" />
    ),
    cell: (info) => renderStatusBadge(info.getValue()),
  }),
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Créée le" />
    ),
    cell: (info) => (
      <div className="text-xs text-muted-foreground">
        {format(new Date(info.getValue()), "dd MMM yyyy", { locale: fr })}
      </div>
    ),
  }),
] as ColumnDef<DTFeatures, SurveySection>[];

// Barre de filtres multi-critères
interface SectionFilterBarProps {
  filters: SectionFilterValues;
  onFilterChange: (filters: SectionFilterValues) => void;
  onReset: () => void;
}

const SectionFilterBar = ({
  filters,
  onFilterChange,
  onReset,
}: SectionFilterBarProps) => {
  const isFiltered = filters.actor !== "all" || filters.status !== "all";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-52">
        <SelectInput
          label="Profil cible"
          options={ACTOR_FILTER_OPTIONS}
          value={filters.actor}
          onValueChange={(val) => onFilterChange({ ...filters, actor: val })}
        />
      </div>

      <div className="w-48">
        <SelectInput
          label="Statut de la section"
          options={STATUS_FILTER_OPTIONS}
          value={filters.status}
          onValueChange={(val) => onFilterChange({ ...filters, status: val })}
        />
      </div>

      {isFiltered && (
        <Button
          variant="outline"
          onClick={onReset}
          className="h-10 text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <RotateCcw className="size-3.5" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
};
