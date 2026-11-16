"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { toast } from "sonner";

import { exportTableToExcel } from "@/lib/helper/excel-export";
import { UserRound, RotateCcw, Ban, ShieldAlert, Shield } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { RESOURCE } from "@/lib/config/access.modules";
import type { FormMode, User, AccessPolicy } from "@/lib/types";
import { getAll, remove, restore } from "@/lib/db/server/users";
import { getInitials } from "@/lib/helper/utility";

import { Modal } from "@/components/modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { UserForm } from "@/components/back-office/settings/user-form";
import { UserBanForm } from "@/components/back-office/settings/user-ban-form";
import { ActionsButton } from "@/components/buttons";
import { DataTable, DTFeatures, SortColumn } from "@/components/data-table";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { SelectInput } from "@/components/inputs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserFilterValues {
  role: string;
  status: string;
}

interface UserViewProps {
  initial: User[];
  policies?: AccessPolicy[];
  resource?: string;
}

export const UserView = ({
  initial,
  policies = [],
  resource = RESOURCE.USER,
}: UserViewProps) => {
  const { canDo, user: currentUser } = usePermissions();

  const canCreate = canDo(resource, "create");
  const canRead = canDo(resource, "read");
  const canUpdate = canDo(resource, "update");
  const canDelete = canDo(resource, "delete");

  const [users, setUsers] = useState<User[]>(initial);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Modal Formulaire Utilisateur (Création, Aperçu, Modification)
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: FormMode;
    data?: User;
  }>({ open: false, mode: "create" });

  // Modal Suspension / Bannissement
  const [banState, setBanState] = useState<{
    open: boolean;
    data?: User;
  }>({ open: false });

  // Modal Réactivation
  const [restoreState, setRestoreState] = useState<{
    open: boolean;
    data?: User;
  }>({ open: false });

  // Modal Confirmation de Suppression (Soft-delete)
  const [deleteState, setDeleteState] = useState<{
    open: boolean;
    data?: User;
  }>({ open: false });

  // Filtres multi-critères
  const [filters, setFilters] = useState<UserFilterValues>({
    role: "all",
    status: "all",
  });

  // Filtrage local en temps réel des utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Filtre rôle
      if (filters.role !== "all") {
        const matchesRoleId = policies.some(
          (policy) => policy.code === filters.role && policy.id === u.policyId,
        );
        if (!matchesRoleId) return false;
      }

      // Filtre statut
      if (filters.status === "active" && (u.banned || Boolean(u.deletedAt))) {
        return false;
      }
      if (filters.status === "banned" && (!u.banned || Boolean(u.deletedAt))) {
        return false;
      }

      return true;
    });
  }, [users, filters, policies]);

  // Rafraîchissement des utilisateurs depuis le serveur
  const onRefresh = async () => {
    try {
      setIsFetching(true);
      const res = await getAll();
      setUsers(res as User[]);
    } catch {
      toast.error("Échec de la récupération des utilisateurs.");
    } finally {
      setIsFetching(false);
    }
  };

  // Confirmation de la suppression (Soft-delete)
  const onConfirmDelete = async () => {
    if (!deleteState.data) return;
    const res = await remove({ id: deleteState.data.id });
    if (res?.serverError || res?.validationErrors) {
      throw new Error(
        res.serverError || "Une erreur est survenue lors de la suppression.",
      );
    }
    toast.success(res?.data?.message || "Utilisateur supprimé avec succès.");
    await onRefresh();
  };

  // Confirmation de la réactivation
  const onConfirmRestore = async () => {
    if (!restoreState.data) return;
    const res = await restore({ id: restoreState.data.id });
    if (res?.serverError || res?.validationErrors) {
      throw new Error(
        res.serverError || "Une erreur est survenue lors de la réactivation.",
      );
    }
    toast.success(res?.data?.message || "Compte réactivé avec succès.");
    await onRefresh();
  };

  // Exportation Excel
  const onExportToExcel = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      toast.info("Aucune donnée à exporter.");
      return;
    }

    const dataToExport = filteredUsers.map((u) => ({
      "Nom complet": u.name,
      Email: u.email,
      Fonction: u.job || "-",
      Rôle: u.policy?.code || "-",
      Statut: u.deletedAt ? "Supprimé" : u.banned ? "Suspendu" : "Actif",
      "Motif de suspension": u.banReason || "-",
      "Expiration suspension": u.banExpires
        ? format(new Date(u.banExpires), "dd/MM/yyyy", { locale: fr })
        : "-",
      "Date de création": u.createdAt
        ? format(new Date(u.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })
        : "-",
    }));

    exportTableToExcel({
      filename: `Collaborateurs_${format(new Date(), "yyyy-MM-dd")}`,
      sheetName: "Collaborateurs",
      data: dataToExport,
    });
    toast.success("Exportation Excel générée avec succès.");
  };

  return (
    <React.Fragment>
      <DataTable
        data={filteredUsers}
        columns={columns}
        isFetching={isFetching}
        onRefresh={() => onRefresh()}
        onCreate={
          canCreate
            ? () => setFormState({ open: true, mode: "create" })
            : undefined
        }
        canFilter={true}
        filtersOptions={
          <UserFilter
            policies={policies}
            filters={filters}
            onFilterChange={(newFilters) => setFilters(newFilters)}
            onReset={() => {
              setFilters({ role: "all", status: "all" });
            }}
          />
        }
        onExportToExcel={onExportToExcel}
        actionsButtons={(userItem) => {
          const isSelf = userItem.id === currentUser?.id;
          const isBanned = userItem.banned;

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
                    data: userItem,
                  })
                }
              />

              {/* Suspendre (si non banni) ou Réactiver (si banni) */}
              {!isBanned ? (
                <ActionsButton
                  icon="Ban"
                  color="amber"
                  tooltipLabel="Suspendre le compte"
                  hasAccess={canUpdate && !isSelf}
                  onClick={() =>
                    setBanState({
                      open: true,
                      data: userItem,
                    })
                  }
                />
              ) : (
                <ActionsButton
                  icon="RotateCcw"
                  color="emerald"
                  tooltipLabel="Réactiver le compte"
                  hasAccess={canUpdate}
                  onClick={() =>
                    setRestoreState({
                      open: true,
                      data: userItem,
                    })
                  }
                />
              )}

              {/* Supprimer (Soft-delete) */}
              <ActionsButton
                icon="Trash2"
                color="destructive"
                tooltipLabel="Supprimer le compte"
                hasAccess={canDelete && !isSelf}
                onClick={() =>
                  setDeleteState({
                    open: true,
                    data: userItem,
                  })
                }
              />
            </div>
          );
        }}
      />

      {/* Modal du Formulaire Utilisateur (Création, Aperçu, Modification) */}
      {formState.mode && (
        <Modal
          open={formState.open}
          onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
          title={
            formState.mode === "create"
              ? "Nouveau Collaborateur"
              : formState.mode === "preview"
                ? "Fiche Collaborateur"
                : "Modifier le Collaborateur"
          }
          description={
            formState.mode === "create"
              ? "Renseignez les coordonnées et attributions du collaborateur pour configurer ses accès."
              : formState.mode === "preview"
                ? "Consultez les informations administratives, coordonnées et rôles du compte."
                : "Modifiez les coordonnées, la fonction hospitalière ou le rôle du collaborateur."
          }
          className="md:max-w-3xl"
          contentScrollable
          icon={UserRound}
        >
          <UserForm
            key={`${formState.mode}-${formState.data?.id || "new"}`}
            mode={formState.mode}
            user={formState.data}
            policies={policies}
            onSuccess={async (mode) => {
              await onRefresh();
              setFormState({ open: mode !== "update", mode: "create" });
            }}
            canUpdate={canUpdate}
          />
        </Modal>
      )}

      {/* Modal de Suspension / Bannissement */}
      {banState.data && (
        <Modal
          open={banState.open}
          onOpenChange={(open) => setBanState((prev) => ({ ...prev, open }))}
          title="Suspendre le compte collaborateur"
          description="Indiquez le motif obligatoire et l'éventuelle date de fin de la suspension administrative."
          className="md:max-w-xl"
          contentScrollable
          icon={Ban}
        >
          <UserBanForm
            key={`ban-${banState.data.id}`}
            user={banState.data}
            onSuccess={async () => {
              await onRefresh();
              setBanState({ open: false });
            }}
          />
        </Modal>
      )}

      {/* Modal de Réactivation de Compte */}
      {restoreState.data && (
        <ConfirmModal
          open={restoreState.open}
          onClose={() => setRestoreState({ open: false })}
          onConfirm={onConfirmRestore}
          description={`Êtes-vous sûr de vouloir réactiver le compte de « ${restoreState.data.name} » ?`}
          notice="L'utilisateur sera débanni et pourra à nouveau se connecter à la plateforme avec ses identifiants habituels."
        />
      )}

      {/* Modal de Confirmation de Suppression (Soft-delete) */}
      {deleteState.data && (
        <ConfirmModal
          open={deleteState.open}
          onClose={() => setDeleteState({ open: false })}
          onConfirm={onConfirmDelete}
          description={`Êtes-vous sûr de vouloir supprimer le compte de « ${deleteState.data.name} » ?`}
          notice="Cette action effectue une suppression logique (soft-delete). Toutes les interventions et instructions d'avis rattachées à ce collaborateur seront intégralement préservées pour la conformité et la traçabilité réglementaire."
        />
      )}
    </React.Fragment>
  );
};

const renderRoleBadge = (roleNameOrCode: string) => {
  const normalized = (roleNameOrCode || "").toLowerCase();

  if (normalized.includes("admin")) {
    return (
      <Badge
        variant="outline"
        className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[11px] font-medium"
      >
        <Shield className="size-3 mr-1" />
        {roleNameOrCode || "Administrateur"}
      </Badge>
    );
  }

  if (normalized.includes("audit") || normalized.includes("qualite")) {
    return (
      <Badge
        variant="outline"
        className="bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 text-[11px] font-medium"
      >
        <Shield className="size-3 mr-1" />
        {roleNameOrCode || "Auditeur Qualité"}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[11px] font-normal"
    >
      {roleNameOrCode || "Collaborateur"}
    </Badge>
  );
};

// Définition des colonnes du tableau TanStack
const columnHelper = createColumnHelper<DTFeatures, User>();
const columns = [
  columnHelper.accessor((row) => `${row.name || ""} ${row.policy?.name}`, {
    id: "name",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Collaborateur" />
    ),
    cell: (info) => {
      const row = info.row.original;
      const initials = getInitials(row.name);

      return (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {initials || "U"}
          </div>
          <div>
            <div className="font-semibold text-foreground text-xs">
              {row.name}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {row.job || "Collaborateur"}
            </div>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("policy.name", {
    id: "jobAndRole",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Fonction & Rôle" />
    ),
    cell: (info) => renderRoleBadge(info.getValue() || "Utilisateur"),
  }),
  columnHelper.accessor("email", {
    id: "email",
    header: (info) => (
      <SortColumn info={info} icon="string" columnName="Adresse email" />
    ),
    cell: (info) => (
      <div className="text-xs font-bold text-muted-foreground">
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor(
    (row) =>
      `${row.banned ? "Suspendu" : Boolean(row.deletedAt) ? "Supprimé" : "Actif"}`,
    {
      id: "status",
      header: (info) => (
        <SortColumn info={info} icon="string" columnName="Statut" />
      ),
      cell: (info) => {
        const row = info.row.original;
        const isDeleted = Boolean(row.deletedAt);
        const isBanned = row.banned;

        if (isDeleted) {
          return (
            <Badge
              variant="outline"
              className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 text-[11px] py-0.5"
            >
              Supprimé
            </Badge>
          );
        }

        if (isBanned) {
          return (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Badge
                    variant="outline"
                    className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 text-[11px] py-0.5 gap-1 cursor-help"
                  >
                    <ShieldAlert className="size-3 shrink-0" />
                    Suspendu
                  </Badge>
                }
              />
              <TooltipContent
                side="top"
                className="max-w-xs text-[10px] italic"
              >
                <p className="font-semibold text-rose-400">Compte suspendu</p>
                <p className="mt-0.5">
                  {row.banReason || "Aucun motif spécifié"}
                </p>
                {row.banExpires && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Jusqu'au{" "}
                    {format(new Date(row.banExpires), "dd/MM/yyyy", {
                      locale: fr,
                    })}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] py-0.5"
          >
            Actif
          </Badge>
        );
      },
    },
  ),
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: (info) => (
      <SortColumn info={info} icon="date" columnName="Créé le" />
    ),
    cell: (info) => {
      const val = info.getValue();
      return (
        <div className="text-xs text-muted-foreground">
          {val ? format(new Date(val), "dd MMM yyyy", { locale: fr }) : "--"}
        </div>
      );
    },
  }),
] as ColumnDef<DTFeatures, User>[];

// Composant de filtres multi-critères
interface UserFilterProps {
  policies: AccessPolicy[];
  filters: UserFilterValues;
  onFilterChange: (filters: UserFilterValues) => void;
  onReset: () => void;
}

const UserFilter = ({
  policies,
  filters,
  onFilterChange,
  onReset,
}: UserFilterProps) => {
  const isFiltered = filters.role !== "all" || filters.status !== "all";

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tous les statuts" },
      { value: "active", label: "Comptes actifs" },
      { value: "banned", label: "Comptes suspendus" },
    ],
    [],
  );

  const roleOptions = useMemo(() => {
    const list = [{ value: "all", label: "Tous les rôles" }];
    if (policies && policies.length > 0) {
      policies.forEach((policy) => {
        list.push({ value: policy.code, label: policy.name });
      });
    } else {
      list.push({ value: "administrateur", label: "Administrateur" });
    }
    return list;
  }, [policies]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Filtre par rôle */}
      <div className="w-52">
        <SelectInput
          label="Rôle système"
          options={roleOptions}
          value={filters.role}
          onValueChange={(val) => onFilterChange({ ...filters, role: val })}
        />
      </div>

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
