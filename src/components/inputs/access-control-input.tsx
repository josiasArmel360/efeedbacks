"use client";

import { ReactNode, useId, useMemo } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AllowedModule, CrudAction } from "@/lib/types";
import { ACCES_MODULE_ITEMS, ModuleItem } from "@/lib/config/access.modules";
import { CRUD_ACTIONS } from "@/lib/constants";

interface AccessControlInputProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  modulesName: Path<T>;
  hasFullAccessName: Path<T>;
  inputId?: string;
  label?: string;
  disabled?: boolean;
  description?: string;
  required?: boolean;
}

type PermissionState = { hasAccess: boolean; actions: CrudAction[] };
type PermissionMap = Map<string, PermissionState>;

const ACTION_LABELS: Record<CrudAction, string> = {
  read: "Lire",
  create: "Créer",
  update: "Modifier",
  delete: "Supprimer",
};

const CHECKBOX_CLASS =
  "border-slate-200 dark:border-slate-400 group-has-disabled/field:opacity-100 disabled:opacity-50";

const flatten = (items: ModuleItem[]): ModuleItem[] =>
  items.flatMap((item) => [item, ...flatten(item.children ?? [])]);

const ALL_ITEMS = flatten(ACCES_MODULE_ITEMS);

const requiredActions = (item: ModuleItem): CrudAction[] =>
  item.supportsCrud ? [...CRUD_ACTIONS] : ["read"];

const buildFullMap = (): PermissionMap =>
  new Map(
    ALL_ITEMS.map((item) => [
      item.resource,
      { hasAccess: true, actions: requiredActions(item) },
    ]),
  );

const buildEmptyMap = (): PermissionMap =>
  new Map(
    ALL_ITEMS.map((item) => [
      item.resource,
      { hasAccess: false, actions: [] as CrudAction[] },
    ]),
  );

const toArray = (map: PermissionMap): AllowedModule[] =>
  Array.from(map, ([resource, value]) => ({ resource, ...value }));

const isFull = (map: PermissionMap): boolean =>
  ALL_ITEMS.every((item) => {
    const state = map.get(item.resource);
    if (!state?.hasAccess) return false;
    return requiredActions(item).every((a) => state.actions.includes(a));
  });

export const AccessControlInput = <T extends FieldValues>(
  props: AccessControlInputProps<T>,
) => {
  const { inputId, label, disabled, description, required } = props;
  const generatedId = useId();
  const effectiveId = inputId ?? generatedId;

  return (
    <Controller
      control={props.control}
      name={props.hasFullAccessName}
      render={({ field: hasFullAccessField }) => (
        <Controller
          control={props.control}
          name={props.modulesName}
          render={({ field: modulesField, fieldState }) => (
            <div
              data-invalid={!!fieldState.error}
              className="flex flex-col gap-2"
            >
              {label && (
                <label
                  htmlFor={effectiveId}
                  className="text-sm font-semibold text-foreground"
                >
                  {label}
                  {required && <span className="text-destructive ml-1">*</span>}
                </label>
              )}
              <AccessControlField
                inputId={effectiveId}
                modules={modulesField.value ?? []}
                onChange={modulesField.onChange}
                hasFullAccess={!!hasFullAccessField.value}
                onHasFullAccessChange={hasFullAccessField.onChange}
                disabled={disabled}
                description={description}
              />
              {fieldState.error && (
                <p className="text-xs font-medium text-destructive mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      )}
    />
  );
};

interface AccessControlFieldProps {
  inputId?: string;
  modules: AllowedModule[];
  onChange: (modules: AllowedModule[]) => void;
  hasFullAccess: boolean;
  onHasFullAccessChange: (value: boolean) => void;
  disabled?: boolean;
  description?: string;
}

const AccessControlField = ({
  inputId,
  modules,
  onChange,
  hasFullAccess,
  onHasFullAccessChange,
  disabled = false,
  description,
}: AccessControlFieldProps) => {
  const permissionsByResource = useMemo<PermissionMap>(
    () =>
      new Map(
        modules.map((m) => [
          m.resource,
          { hasAccess: m.hasAccess, actions: m.actions ?? [] },
        ]),
      ),
    [modules],
  );

  const isModuleChecked = (id: string) =>
    hasFullAccess || !!permissionsByResource.get(id)?.hasAccess;

  const getModuleActions = (id: string): CrudAction[] =>
    hasFullAccess
      ? [...CRUD_ACTIONS]
      : (permissionsByResource.get(id)?.actions ?? []);

  const getBaseMap = (): PermissionMap =>
    hasFullAccess ? buildFullMap() : new Map(permissionsByResource);

  const commit = (map: PermissionMap) => {
    const nextFull = isFull(map);
    if (nextFull !== hasFullAccess) onHasFullAccessChange(nextFull);
    onChange(toArray(map));
  };

  const setAccess = (
    id: string,
    hasAccess: boolean,
    childrenIds: string[] = [],
  ) => {
    if (disabled) return;
    const map = getBaseMap();

    [id, ...childrenIds].forEach((resource) => {
      const current = map.get(resource) ?? { hasAccess: false, actions: [] };
      let actions = current.actions;
      if (hasAccess && actions.length === 0) actions = ["read"];
      if (!hasAccess) actions = [];
      map.set(resource, { hasAccess, actions });
    });

    commit(map);
  };

  const toggleAction = (id: string, action: CrudAction) => {
    if (disabled) return;
    const map = getBaseMap();

    const current = map.get(id) ?? { hasAccess: false, actions: [] };
    const actions = current.actions.includes(action)
      ? current.actions.filter((a) => a !== action)
      : [...current.actions, action];

    map.set(id, {
      hasAccess: actions.length > 0 ? true : current.hasAccess,
      actions,
    });

    commit(map);
  };

  const handleSelectAll = () => {
    if (!disabled) commit(buildFullMap());
  };

  const handleDeselectAll = () => {
    if (!disabled) commit(buildEmptyMap());
  };

  const hasAnyAccess = modules.some((m) => m.hasAccess);
  const switchId = inputId ? `${inputId}-full-switch` : "access-full-switch";

  return (
    <div className="space-y-4">
      {/* Switch Accès Total */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="space-y-0.5">
          <label
            htmlFor={switchId}
            className="text-sm font-semibold text-emerald-900 dark:text-emerald-300"
          >
            Accès total à tous les modules (Super Admin)
          </label>
          <p className="text-xs text-muted-foreground">
            {description ||
              "Activer cette option confère les pleins pouvoirs et contourne toutes les restrictions de modules."}
          </p>
        </div>
        <Switch
          id={switchId}
          checked={hasFullAccess}
          onCheckedChange={(checked) =>
            checked ? handleSelectAll() : handleDeselectAll()
          }
          disabled={disabled}
        />
      </div>

      {/* Barre d'action */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Matrice des modules & privilèges
        </h4>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled || hasFullAccess}
            className="text-xs h-7"
          >
            Tout cocher
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={disabled || (!hasFullAccess && !hasAnyAccess)}
            className="text-xs h-7"
          >
            Tout décocher
          </Button>
        </div>
      </div>

      {/* Liste des modules */}
      <div className="space-y-3">
        {ACCES_MODULE_ITEMS.map((mod) => {
          const children = mod.children ?? [];
          const childrenIds = children.map((c) => c.resource);
          const parentChecked = isModuleChecked(mod.resource);

          return (
            <ModuleRow
              key={mod.resource}
              variant="parent"
              item={mod}
              checked={parentChecked}
              actions={getModuleActions(mod.resource)}
              disabledCheckbox={disabled || hasFullAccess}
              disabledActions={disabled || !parentChecked}
              onToggle={(checked) =>
                setAccess(mod.resource, checked, childrenIds)
              }
              onToggleAction={(action) => toggleAction(mod.resource, action)}
            >
              {children.length > 0 && (
                <div className="mt-3 ml-7 grid grid-cols-1 gap-2.5 xl:grid-cols-2">
                  {children.map((child) => {
                    const childChecked = isModuleChecked(child.resource);

                    return (
                      <ModuleRow
                        key={child.resource}
                        variant="child"
                        item={child}
                        checked={childChecked}
                        actions={getModuleActions(child.resource)}
                        disabledCheckbox={disabled || !parentChecked}
                        disabledActions={
                          disabled || !parentChecked || !childChecked
                        }
                        onToggle={(checked) =>
                          setAccess(child.resource, checked)
                        }
                        onToggleAction={(action) =>
                          toggleAction(child.resource, action)
                        }
                      />
                    );
                  })}
                </div>
              )}
            </ModuleRow>
          );
        })}
      </div>
    </div>
  );
};

interface ModuleRowProps {
  variant: "parent" | "child";
  item: ModuleItem;
  checked: boolean;
  actions: CrudAction[];
  disabledCheckbox: boolean;
  disabledActions: boolean;
  onToggle: (checked: boolean) => void;
  onToggleAction: (action: CrudAction) => void;
  children?: ReactNode;
}

const ROW_STYLES = {
  parent: {
    wrapper: "rounded-xl border border-border/60 bg-card p-3.5 shadow-2xs",
    header: "flex items-center gap-3",
    label: "text-sm font-semibold text-foreground",
    actions:
      "mt-2.5 ml-7 flex flex-wrap items-center gap-3 pt-2.5 border-t border-border/40",
  },
  child: {
    wrapper:
      "flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/20 p-3",
    header: "flex items-center gap-2.5",
    label: "text-xs font-semibold text-foreground",
    actions: "flex flex-wrap items-center gap-3 pt-2 border-t border-border/30",
  },
} as const;

const ModuleRow = ({
  variant,
  item,
  checked,
  actions,
  disabledCheckbox,
  disabledActions,
  onToggle,
  onToggleAction,
  children,
}: ModuleRowProps) => {
  const styles = ROW_STYLES[variant];
  const id = `mod-${item.resource}`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Checkbox
          id={id}
          checked={checked}
          disabled={disabledCheckbox}
          onCheckedChange={(value) => onToggle(value === true)}
          className={CHECKBOX_CLASS}
        />
        <label htmlFor={id} className={`cursor-pointer ${styles.label}`}>
          {item.label}
        </label>
      </div>

      {item.supportsCrud && (
        <div className={styles.actions}>
          {CRUD_ACTIONS.map((action) => (
            <div key={action} className="flex items-center gap-1.5">
              <Checkbox
                id={`${id}-${action}`}
                checked={actions.includes(action)}
                disabled={disabledActions}
                onCheckedChange={() => onToggleAction(action)}
                className={CHECKBOX_CLASS}
              />
              <label
                htmlFor={`${id}-${action}`}
                className="cursor-pointer text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                {ACTION_LABELS[action]}
              </label>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
};
