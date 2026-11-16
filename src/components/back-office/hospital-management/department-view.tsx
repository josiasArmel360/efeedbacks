"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { toast } from "sonner";
import { Building2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { ActionsButton } from "@/components/buttons";
import { DataTable, DTFeatures, SortColumn } from "@/components/data-table";
import { Badge } from "@/components/badge";
import { SelectInput } from "@/components/inputs";
import { DepartmentForm } from "./department-form";

import { usePermissions } from "@/hooks/use-permissions";
import { RESOURCE } from "@/lib/config/access.modules";
import type { FormMode, Department } from "@/lib/types";
import { exportTableToExcel } from "@/lib/helper/excel-export";
import { getAll, remove } from "@/lib/db/server/departments";

interface DepartmentFilterValues {
  status: string;
}

interface DepartmentViewProps {
  initial: Department[];
  resource?: string;
}

export const DepartmentView = ({
  initial,
  resource = RESOURCE.DEPARTMENT,
}: DepartmentViewProps) => {
  const { canDo } = usePermissions();

  const canCreate = canDo(resource, "create");
  const canRead = canDo(resource, "read");
  const canUpdate = canDo(resource, "update");
  const canDelete = canDo(resource, "delete");

  const [departments, setDepartments] = useState<Department[]>(initial);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Modal Formulaire (Création, Aperçu, Modification)
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: FormMode;
    data?: Department;
  }>({ open: false, mode: "create" });

  // Modal Confirmation de Suppression
  const [deleteState, setDeleteState] = useState<{
    open: boolean;
    data?: Department;
  }>({ open: false });

  // Filtres
  const [filters, setFilters] = useState<DepartmentFilterValues>({
    status: "all",
  });

  // Filtrage local en temps réel
  const filteredDepartments = useMemo(() => {
    return departments.filter((dep) => {
      const status = dep.isActive ? "actif" : "inactif";
      if (filters.status !== "all" && status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [departments, filters]);

  // Rafraîchissement des données depuis le serveur
  const onRefresh = async () => {
    try {
      setIsFetching(true);
      const data = await getAll();
      setDepartments(data);
    } catch {
      toast.error("Échec de la récupération des services hospitaliers");
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
          "Une erreur est survenue lors de la suppression du service",
      );
    }
    toast.success(
      res?.data?.message || "Service hospitalier supprimé avec succès",
    );
    await onRefresh();
  };

  // Exportation Excel
  const onExportToExcel = () => {
    if (!filteredDepartments || filteredDepartments.length === 0) {
      toast.info("Aucune donnée à exporter");
      return;
    }

    const dataToExport = filteredDepartments.map((d) => ({
      "Ordre d'affichage": d.orderIndex,
      "Service Hospitalier": d.name,
      Statut: d.isActive ? "Actif" : "Inactif",
      Description: d.description || "-",
      "Date de création": d.createdAt
        ? format(new Date(d.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })
        : "-",
    }));

    exportTableToExcel({
      filename: `Services_Hospitaliers_${format(new Date(), "yyyy-MM-dd")}`,
      sheetName: "Services",
      data: dataToExport,
    });
    toast.success("Exportation Excel générée avec succès");
  };

  return (
    <React.Fragment>
      <DataTable
        data={filteredDepartments}
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
          <DepartmentFilter
            filters={filters}
            onFilterChange={(newFilters) => setFilters(newFilters)}
            onReset={() => {
              setFilters({ status: "all" });
            }}
          />
        }
        onExportToExcel={onExportToExcel}
        actionsButtons={(data) => {
          return (
            <div className="flex items-center gap-1.5">
              {/* Consulter / Modifier */}
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

              {/* Supprimer */}
              <ActionsButton
                icon="Trash2"
                color="destructive"
                tooltipLabel="Supprimer le service"
                hasAccess={canDelete}
                onClick={() => setDeleteState({ open: true, data })}
              />
            </div>
          );
        }}
      />

      {/* Modal Formulaire */}
      {formState.open && (
        <Modal
          open={formState.open}
          onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
          title={
            formState.mode === "create"
              ? "Nouveau service hospitalier"
              : formState.mode === "preview"
                ? "Détails du service"
                : "Modifier le service"
          }
          description={
            formState.mode === "create"
              ? "Ajoutez un nouveau service ou pôle de soins à la cartographie hospitalière."
              : formState.mode === "preview"
                ? "Consultez les informations et le statut de disponibilité du service."
                : "Mettez à jour les coordonnées, la description et l'ordre d'affichage du service."
          }
          className="md:max-w-2xl"
          contentScrollable
          icon={Building2}
        >
          <DepartmentForm
            key={`${formState.mode}-${formState.data?.id || "new"}`}
            mode={formState.mode}
            department={formState.data}
            onSuccess={async (mode) => {
              await onRefresh();
              setFormState({ open: mode !== "update", mode: "create" });
            }}
            canUpdate={canUpdate}
          />
        </Modal>
      )}

      {/* Modal de Confirmation de Suppression */}
      {deleteState.data && (
        <ConfirmModal
          open={deleteState.open}
          onClose={() => setDeleteState({ open: false })}
          onConfirm={onConfirmDelete}
          description={`Êtes-vous sûr de vouloir supprimer le service hospitalier « ${deleteState.data.name?.toUpperCase()} » ?`}
          notice="Cette action supprimera le service de la liste des services disponibles pour les évaluations publiques."
        />
      )}
    </React.Fragment>
  );
};

const renderStatusBadge = (status: boolean) => {
  const label = status === true ? "Actif" : "Inactif";
  switch (status) {
    case true:
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] font-medium"
        >
          {label}
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px] font-medium"
        >
          {label}
        </Badge>
      );
  }
};

// Définition des colonnes du tableau TanStack
const columnHelper = createColumnHelper<DTFeatures, Department>();
const columns = [
  columnHelper.accessor("orderIndex", {
    id: "orderIndex",
    header: (info) => (
      <SortColumn info={info} icon="number" columnName="Ordre" />
    ),
    cell: (info) => (
      <div className="font-mono text-xs text-muted-foreground w-12 text-center">
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor("name", {
    id: "name",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Service hospitalier" />
    ),
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary shrink-0" />
        <span className="font-medium text-xs text-foreground">
          {info.getValue()}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("description", {
    id: "description",
    header: (info) => (
      <SortColumn
        info={info}
        icon="string"
        columnName="Description / Localisation"
      />
    ),
    cell: (info) => (
      <span className="text-xs text-muted-foreground max-w-xs truncate block">
        {info.getValue() || "—"}
      </span>
    ),
  }),
  columnHelper.accessor("isActive", {
    id: "isActive",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Disponibilité" />
    ),
    cell: (info) => renderStatusBadge(info.getValue()),
  }),
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Créé le" />
    ),
    cell: (info) => (
      <div className="text-xs text-muted-foreground">
        {format(new Date(info.getValue()), "dd MMM yyyy", { locale: fr })}
      </div>
    ),
  }),
] as ColumnDef<DTFeatures, Department>[];

// Composant de filtres
interface DepartmentFilterProps {
  filters: DepartmentFilterValues;
  onFilterChange: (filters: DepartmentFilterValues) => void;
  onReset: () => void;
}

const DepartmentFilter = ({
  filters,
  onFilterChange,
  onReset,
}: DepartmentFilterProps) => {
  const isFiltered = filters.status !== "all";

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tous les statuts" },
      { value: "actif", label: "Services actifs" },
      { value: "inactif", label: "Services inactifs" },
    ],
    [],
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-48">
        <SelectInput
          label="Statut du service"
          options={statusOptions}
          value={filters.status}
          onValueChange={(val) => onFilterChange({ ...filters, status: val })}
        />
      </div>

      {isFiltered && (
        <div className="w-30">
          <Button
            variant="outline"
            onClick={onReset}
            className="h-10 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Réinitialiser
          </Button>
        </div>
      )}
    </div>
  );
};
