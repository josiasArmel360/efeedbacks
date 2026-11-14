"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { toast } from "sonner";
import { RotateCcw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { ActionsButton } from "@/components/buttons";
import { DataTable, DTFeatures, SortColumn } from "@/components/data-table";
import { Badge } from "@/components/badge";
import { SelectInput } from "@/components/inputs";
import { AccessPolicyForm } from "./access-policy-form";
import { AccessControlForm } from "./access-control-form";

import { usePermissions } from "@/hooks/use-permissions";
import { RESOURCE } from "@/lib/config/access.modules";
import type { FormMode, AccessPolicy } from "@/lib/types";
import { exportTableToExcel } from "@/lib/helper/excel-export";
import { getPolicies, removePolicy } from "@/lib/db/server/access-control";
import { UCFirst } from "@/lib/helper/utility";

interface AccessPolicyFilterValues {
  status: string;
}

interface AccessPolicyViewProps {
  initial: AccessPolicy[];
  resource?: string;
}

export const AccessControlView = ({
  initial,
  resource = RESOURCE.ACC_RIGHT,
}: AccessPolicyViewProps) => {
  const { canDo } = usePermissions();

  const canCreate = canDo(resource, "create");
  const canRead = canDo(resource, "read");
  const canUpdate = canDo(resource, "update");
  const canDelete = canDo(resource, "delete");

  const [policies, setPolicies] = useState<AccessPolicy[]>(initial);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Modal Formulaire (Création, Aperçu, Modification)
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: FormMode;
    data?: AccessPolicy;
    form?: "manage" | "update-create";
  }>({ open: false, mode: "create", form: "update-create" });

  // Modal Confirmation de Suppression (Soft-delete)
  const [deleteState, setDeleteState] = useState<{
    open: boolean;
    data?: AccessPolicy;
  }>({ open: false });

  // Filtres
  const [filters, setFilters] = useState<AccessPolicyFilterValues>({
    status: "all",
  });

  // Filtrage local en temps réel
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const status = policy.isActive ? "actif" : "inactif";
      // Filtre Status
      if (filters.status !== "all" && status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [policies, filters]);

  // Rafraîchissement des données depuis le serveur
  const onRefresh = async () => {
    try {
      setIsFetching(true);
      const policies = await getPolicies();
      setPolicies(policies);
    } catch {
      toast.error("Échec de la récupération des utilisateurs");
    } finally {
      setIsFetching(false);
    }
  };

  // Confirmation du Soft-delete
  const onConfirmDelete = async () => {
    if (!deleteState.data) return;
    const res = await removePolicy({ id: deleteState.data.id });
    if (res?.serverError || res?.validationErrors) {
      throw new Error(
        res.serverError || "Une erreur est survenue lors de la suppression",
      );
    }
    toast.success(res?.data?.message || "Utilisateur supprimé avec succès");
    await onRefresh();
  };

  // Exportation Excel
  const onExportToExcel = () => {
    if (!filteredPolicies || filteredPolicies.length === 0) {
      toast.info("Aucune donnée à exporter");
      return;
    }

    const dataToExport = filteredPolicies.map((u) => ({
      Nom: u.name,
      Rôle: u.code,
      Statut: u.isActive ? "Actif" : "Inactif",
      description: u.description,
      "Droit d'accès": u.hasFullAccess
        ? "Tous les modules"
        : `${u.allowedModules.filter((m) => m.hasAccess === true).length} module(s)`,
      "Date de création": u.createdAt
        ? format(new Date(u.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })
        : "-",
    }));

    exportTableToExcel({
      filename: `Utilisateurs_${format(new Date(), "yyyy-MM-dd")}`,
      sheetName: "Utilisateurs",
      data: dataToExport,
    });
    toast.success("Exportation Excel générée avec succès");
  };

  return (
    <React.Fragment>
      <DataTable
        data={filteredPolicies}
        columns={columns}
        isFetching={isFetching}
        onRefresh={() => onRefresh()}

        onCreate={
          canCreate
            ? () =>
                setFormState({
                  open: true,
                  mode: "create",
                  form: "update-create",
                })
            : undefined
        }
        canFilter={true}
        filtersOptions={
          <AccessPolicyFilter
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
                    form: "update-create",
                  })
                }
              />

              <ActionsButton
                icon="FileSignature"
                color="indigo"
                tooltipLabel="Configurer les accès"
                hasAccess={canUpdate}
                onClick={() =>
                  setFormState({
                    open: true,
                    mode: "preview",
                    data,
                    form: "manage",
                  })
                }
              />

              {/* Supprimer (Soft-delete) */}
              <ActionsButton
                icon="Trash2"
                color="destructive"
                tooltipLabel="Supprimer le compte"
                hasAccess={canDelete}
                onClick={() => setDeleteState({ open: true, data })}
              />
            </div>
          );
        }}
      />

      {/* Modal Formulaire */}
      {formState.mode && formState.form === "update-create" && (
        <Modal
          open={formState.open}
          onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
          title={
            formState.mode === "create"
              ? "Nouvel profil"
              : formState.mode === "preview"
                ? "Information du profil"
                : "Modifier le profil"
          }
          description={
            formState.mode === "create"
              ? "Renseignez les informations administratives du nouveau collaborateur pour lui créer ses accès."
              : formState.mode === "preview"
                ? "Consultez les informations personnelles, professionnelles et permissions du collaborateur."
                : "Modifiez les coordonnées et attributions du collaborateur."
          }
          className="md:max-w-2xl"
          contentScrollable
          icon={ShieldCheck}
        >
          <AccessPolicyForm
            key={`${formState.mode}-${formState.data?.id || "new"}`}
            mode={formState.mode}
            accessPolicy={formState.data}
            onSuccess={async (mode) => {
              await onRefresh();
              setFormState({ open: mode !== "update", mode: "create" });
            }}
            canUpdate={canUpdate}
          />
        </Modal>
      )}

      {formState.mode && formState.data && formState.form == "manage" && (
        <Modal
          open={formState.open}
          onOpenChange={(open) => setFormState({ ...formState, open })}
          title={
            formState.mode === "create"
              ? "Nouvelle Règle d'Accès (ABAC)"
              : formState.mode === "preview"
                ? "Détails de la Règle ABAC"
                : "Modifier la Règle ABAC"
          }
          description={
            formState.mode === "create"
              ? "Remplissez les informations ci-dessous pour créer une nouvelle règle d'accès globale."
              : formState.mode === "preview"
                ? "Consultez les détails et autorisations de cette règle d'accès."
                : "Remplissez les informations ci-dessous pour modifier la règle d'accès."
          }
          className="md:max-w-3xl"
          contentScrollable
          icon={ShieldCheck}
        >
          <AccessControlForm
            key={formState.mode + (formState.data?.id || "")}
            mode={formState.mode}
            policy={formState.data}
            onSuccess={(mode) => {
              onRefresh();
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
          description={`Êtes-vous sûr de vouloir supprimer le profil « ${deleteState.data.name?.toUpperCase()} » ?`}
          notice="Cette action est reversible. Toutes les comptes rattachés à ce profil perdront leurs privilèges"
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
const columnHelper = createColumnHelper<DTFeatures, AccessPolicy>();
const columns = [
  columnHelper.accessor("name", {
    id: "name",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Profil" />
    ),
    cell: (info) => (
      <span className="font-medium text-xs">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("code", {
    id: "code",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Rôle" />
    ),
    cell: (info) => (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] font-medium"
      >
        {UCFirst(info.getValue())}
      </Badge>
    ),
  }),
  columnHelper.accessor(
    (row) =>
      `${row.hasFullAccess ? "Tous les modules" : row.allowedModules.filter((m) => m.hasAccess === true).length}`,
    {
      id: "hasFullAccess",
      header: (info) => (
        <SortColumn info={info} icon="string" columnName="Droits d'accès" />
      ),
      cell: (info) => {
        const { hasFullAccess, allowedModules } = info.row.original;
        const modules = allowedModules.filter((mod) => mod.hasAccess === true);

        return (
          <div className="flex flex-col gap-1 text-xs">
            Accès:{" "}
            {hasFullAccess
              ? "Tous les modules"
              : modules.length > 1
                ? "modules"
                : "module"}
          </div>
        );
      },
    },
  ),
  columnHelper.accessor((row) => `${row.isActive ? "actif" : "inactif"}`, {
    id: "isActive",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Statut" />
    ),
    cell: (info) => {
      const { isActive } = info.row.original;

      return renderStatusBadge(isActive);
    },
  }),
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Crée le" />
    ),
    cell: (info) => (
      <div className="text-xs text-muted-foreground">
        {format(new Date(info.getValue()), "dd MMM yyyy", { locale: fr })}
      </div>
    ),
  }),
] as ColumnDef<DTFeatures, AccessPolicy>[];

// Composant de filtres multi-critères
interface AccessPolicyFilterProps {
  filters: AccessPolicyFilterValues;
  onFilterChange: (filters: AccessPolicyFilterValues) => void;
  onReset: () => void;
}

const AccessPolicyFilter = ({
  filters,
  onFilterChange,
  onReset,
}: AccessPolicyFilterProps) => {
  const isFiltered = filters.status !== "all";

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tous les statuts" },
      { value: "actif", label: "Profils actifs" },
      { value: "inactif", label: "Profils inactifs" },
    ],
    [],
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Filtre par statut */}
      <div className="w-48">
        <SelectInput
          label="Statut du compte"
          options={statusOptions}
          value={filters.status}
          onValueChange={(val) => onFilterChange({ ...filters, status: val })}
        />
      </div>

      {/* Bouton de réinitialisation */}
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
