"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { toast } from "sonner";
import { FileSpreadsheet, HelpCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { ActionsButton } from "@/components/buttons";
import { DataTable, DTFeatures, SortColumn } from "@/components/data-table";
import { Badge } from "@/components/badge";
import { SelectInput, SelectWithSearchInput } from "@/components/inputs";

import { SurveyFieldForm, FIELD_TYPE_OPTIONS } from "./survey-field-form";
import {
  ACTOR_FILTER_OPTIONS,
  ACTOR_LABEL_MAP,
  FIELD_TYPE_LABEL_MAP,
  STATUS_FILTER_OPTIONS,
  renderActorsBadges,
  renderStatusBadge,
} from "./forms-builder-helpers";

import { usePermissions } from "@/hooks/use-permissions";
import { RESOURCE } from "@/lib/config/access.modules";
import type {
  ActorType,
  FormMode,
  SurveyField,
  SurveySection,
} from "@/lib/types";
import { exportTableToExcel } from "@/lib/helper/excel-export";
import {
  getAllFields,
  getAllSections,
  removeField,
} from "@/lib/db/server/forms-builder";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FieldFilterValues {
  sectionId: string;
  fieldType: string;
  actor: string;
  status: string;
}

interface FormFieldBuilderProps {
  initialFields: SurveyField[];
  sections: SurveySection[];
  resource?: string;
}

export const FormFieldBuilder = ({
  initialFields,
  sections,
  resource = RESOURCE.FORM_BUILDER,
}: FormFieldBuilderProps) => {
  const router = useRouter();
  const { canDo } = usePermissions();

  const canCreate = canDo(resource, "create");
  const canRead = canDo(resource, "read");
  const canUpdate = canDo(resource, "update");
  const canDelete = canDo(resource, "delete");

  const [fields, setFields] = useState<SurveyField[]>(initialFields);
  const [prevInitialFields, setPrevInitialFields] =
    useState<SurveyField[]>(initialFields);
  if (initialFields !== prevInitialFields) {
    setPrevInitialFields(initialFields);
    setFields(initialFields);
  }

  const [sectionsList, setSectionsList] = useState<SurveySection[]>(sections);
  const [prevSections, setPrevSections] = useState<SurveySection[]>(sections);
  if (sections !== prevSections) {
    setPrevSections(sections);
    setSectionsList(sections);
  }

  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Modal Formulaire Question / Critère
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: FormMode;
    data?: SurveyField;
  }>({ open: false, mode: "create" });

  // Modal Confirmation Suppression Question
  const [deleteState, setDeleteState] = useState<{
    open: boolean;
    data?: SurveyField;
  }>({ open: false });

  // Filtres Questions
  const [filters, setFilters] = useState<FieldFilterValues>({
    sectionId: "all",
    fieldType: "all",
    actor: "all",
    status: "all",
  });

  const sectionFilterOptions = useMemo(() => {
    const list = [{ value: "all", label: "Toutes les sections" }];
    sectionsList.forEach((sec) => {
      list.push({ value: sec.id, label: sec.title });
    });
    return list;
  }, [sectionsList]);

  const fieldTypeFilterOptions = useMemo(
    () => [{ value: "all", label: "Tous les types" }, ...FIELD_TYPE_OPTIONS],
    [],
  );

  // Filtrage temps réel des critères / questions
  const filteredFields = useMemo(() => {
    return fields.filter((f) => {
      if (filters.sectionId !== "all" && f.sectionId !== filters.sectionId) {
        return false;
      }
      if (filters.fieldType !== "all" && f.fieldType !== filters.fieldType) {
        return false;
      }
      if (
        filters.actor !== "all" &&
        !(f.targetActors || []).includes(filters.actor as ActorType)
      ) {
        return false;
      }
      const status = f.isActive ? "actif" : "inactif";
      if (filters.status !== "all" && status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [fields, filters]);

  // Rafraîchissement des données depuis le serveur
  const onRefresh = async () => {
    try {
      setIsFetching(true);
      const [updatedFields, updatedSections] = await Promise.all([
        getAllFields(),
        getAllSections(),
      ]);
      setFields(updatedFields);
      setSectionsList(updatedSections);
    } catch {
      toast.error("Échec de l'actualisation des critères d'évaluation");
    } finally {
      setIsFetching(false);
    }
  };

  // Confirmation suppression Question
  const onConfirmDelete = async () => {
    if (!deleteState.data) return;
    const res = await removeField({ id: deleteState.data.id });
    if (res?.serverError || res?.validationErrors) {
      throw new Error(
        res.serverError ||
          "Une erreur est survenue lors de la suppression du critère",
      );
    }
    toast.success(
      res?.data?.message || "Critère d'évaluation supprimé avec succès",
    );
    await onRefresh();
    router.refresh();
  };

  // Exportation Excel des Questions
  const onExportToExcel = () => {
    if (!filteredFields || filteredFields.length === 0) {
      toast.info("Aucun critère à exporter");
      return;
    }

    const dataToExport = filteredFields.map((f) => ({
      Ordre: f.orderIndex,
      Section: f.section?.title || "-",
      "Question / Critère": f.label,
      "Type de réponse": FIELD_TYPE_LABEL_MAP[f.fieldType] || f.fieldType,
      "Profils ciblés": (f.targetActors || [])
        .map((a) => ACTOR_LABEL_MAP[a] || a)
        .join(", "),
      Obligatoire: f.isRequired ? "Oui" : "Non",
      Statut: f.isActive ? "Actif" : "Inactif",
      "Date de création": f.createdAt
        ? format(new Date(f.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })
        : "-",
    }));

    exportTableToExcel({
      filename: `Criteres_Questionnaire_${format(new Date(), "yyyy-MM-dd")}`,
      sheetName: "Criteres",
      data: dataToExport,
    });
    toast.success("Exportation Excel des critères générée avec succès");
  };

  return (
    <React.Fragment>
      <DataTable
        data={filteredFields}
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
          <FieldFilterBar
            filters={filters}
            sectionOptions={sectionFilterOptions}
            fieldTypeOptions={fieldTypeFilterOptions}
            onFilterChange={setFilters}
            onReset={() =>
              setFilters({
                sectionId: "all",
                fieldType: "all",
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
              tooltipLabel="Supprimer le critère"
              hasAccess={canDelete}
              onClick={() => setDeleteState({ open: true, data })}
            />
          </div>
        )}
      />

      {/* Modal Formulaire Question / Critère */}
      {formState.open && (
        <Modal
          open={formState.open}
          onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
          title={
            formState.mode === "create"
              ? "Nouveau critère d'évaluation"
              : formState.mode === "preview"
                ? "Détails du critère"
                : "Modifier le critère"
          }
          description={
            formState.mode === "create"
              ? "Ajoutez une nouvelle question à l'une des sections du questionnaire."
              : formState.mode === "preview"
                ? "Consultez le paramétrage, le type de réponse et le ciblage de ce critère."
                : "Mettez à jour l'intitulé, le type de champ ou les profils ciblés."
          }
          className="md:max-w-2xl"
          contentScrollable
          icon={FileSpreadsheet}
        >
          <SurveyFieldForm
            key={`${formState.mode}-${formState.data?.id || "new"}`}
            mode={formState.mode}
            field={formState.data}
            sections={sectionsList}
            onSuccess={async (mode) => {
              await onRefresh();
              router.refresh();
              setFormState({ open: mode !== "update", mode: "create" });
            }}
            canUpdate={canUpdate}
          />
        </Modal>
      )}

      {/* Modal Confirmation Suppression Question */}
      {deleteState.data && (
        <ConfirmModal
          open={deleteState.open}
          onClose={() => setDeleteState({ open: false })}
          onConfirm={onConfirmDelete}
          description={`Êtes-vous sûr de vouloir supprimer le critère « ${deleteState.data.label} » ?`}
          notice="Cette action retirera définitivement cette question du formulaire d'évaluation public."
        />
      )}
    </React.Fragment>
  );
};

// Colonnes TanStack : Questions & Critères
const columnHelper = createColumnHelper<DTFeatures, SurveyField>();
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
  columnHelper.accessor("label", {
    id: "label",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Question / Critère" />
    ),
    cell: (info) => (
      <span className="font-medium text-xs text-foreground line-clamp-2 max-w-md truncate">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor(
    (row) => row.section?.title || `Section ${row.section?.orderIndex}` || "—",
    {
      id: "sectionTitle",
      header: (info) => (
        <SortColumn info={info} icon="string" columnName="Section" />
      ),
      cell: (info) => {
        const { section } = info.row.original;
        return (
          <div className="flex text-xs text-muted-foreground gap-1 items-center">
            <div>Section {section?.orderIndex}</div>
            <div>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <HelpCircle className="text-blue-500 h-4 w-4 shrink-0" />
                  }
                />
                <TooltipContent>
                  <p className="text-[10px] italic">{section?.title}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        );
      },
    },
  ),
  columnHelper.accessor("fieldType", {
    id: "fieldType",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Type" />
    ),
    cell: (info) => (
      <Badge variant="outline" className="text-[11px] font-normal">
        {FIELD_TYPE_LABEL_MAP[info.getValue()] || info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("targetActors", {
    id: "targetActors",
    header: () => <span className="text-xs font-semibold">Public cible</span>,
    cell: (info) => renderActorsBadges(info.getValue()),
  }),
  columnHelper.accessor((row) => (row.isRequired ? "Oui" : "Optionnel"), {
    id: "isRequired",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Requis" />
    ),
    cell: (info) => {
      const { isRequired } = info.row.original;
      return (
        <span className="text-xs text-muted-foreground">
          {isRequired ? "Oui" : "Optionnel"}
        </span>
      );
    },
  }),
  columnHelper.accessor("isActive", {
    id: "isActive",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Statut" />
    ),
    cell: (info) => renderStatusBadge(info.getValue()),
  }),
] as ColumnDef<DTFeatures, SurveyField>[];

// Barre de filtres multi-critères
interface FieldFilterBarProps {
  filters: FieldFilterValues;
  sectionOptions: { label: string; value: string }[];
  fieldTypeOptions: { label: string; value: string }[];
  onFilterChange: (filters: FieldFilterValues) => void;
  onReset: () => void;
}

const FieldFilterBar = ({
  filters,
  sectionOptions,
  fieldTypeOptions,
  onFilterChange,
  onReset,
}: FieldFilterBarProps) => {
  const isFiltered =
    filters.sectionId !== "all" ||
    filters.fieldType !== "all" ||
    filters.actor !== "all" ||
    filters.status !== "all";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-60">
        <SelectWithSearchInput
          label="Section thématique"
          options={sectionOptions}
          value={filters.sectionId}
          onValueChange={(val) =>
            onFilterChange({ ...filters, sectionId: val })
          }
        />
      </div>

      <div className="w-52">
        <SelectInput
          label="Type de réponse"
          options={fieldTypeOptions}
          value={filters.fieldType}
          onValueChange={(val) =>
            onFilterChange({ ...filters, fieldType: val })
          }
        />
      </div>

      <div className="w-56">
        <SelectInput
          label="Profil cible"
          options={ACTOR_FILTER_OPTIONS}
          value={filters.actor}
          onValueChange={(val) => onFilterChange({ ...filters, actor: val })}
        />
      </div>

      <div className="w-44">
        <SelectInput
          label="Statut"
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
