"use client";

import {
  ColumnDef as ColumnDefUI,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  columnFilteringFeature,
  columnVisibilityFeature,
  filterFns,
  flexRender,
  globalFilteringFeature,
  HeaderContext,
  OnChangeFn,
  RowData,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  RowSelectionState,
  rowSortingFeature,
  SortingState,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CirclePlus,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  SearchIcon,
  SlidersHorizontal,
  X,
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp10,
  ArrowUpZA,
  ChevronsUpDown,
  FileTypeCorner,
  CalendarArrowDown,
  CalendarArrowUp,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Configuration globale des fonctionnalités TanStack Table v9.
 * En v9, les fonctionnalités (tri, filtre, pagination, sélection, expansion)
 * et leurs modèles de lignes sont déclarés une seule fois dans `tableFeatures`
 * puis injectés dans `useTable({ features: dataTableFeatures, ... })`.
 */
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
  sortFns,
});

/**
 * Type des fonctionnalités à passer aux définitions de colonnes dans les vues :
 * Exemple : `const columnHelper = createColumnHelper<DTFeatures, MonType>();`
 *           `const columns = [...] as ColumnDef<DTFeatures, MonType>[];`
 */
export type DTFeatures = typeof dataTableFeatures;

type ColumnDef<TData extends RowData> = ColumnDefUI<DTFeatures, TData>;

const PAGE_SIZE_OPTIONS = [20, 40, 80, 100, 200] as const;
const DEFAULT_PAGE_SIZE = 40;

/**
 * Propriétés du composant générique DataTable.
 *
 * Architecture de gestion d'état (Pattern Hybride Contrôlé / Non-Contrôlé, sans `useEffect`) :
 * - Par défaut (mode non-contrôlé), `DataTable` gère lui-même `globalFilter` et `rowSelection`
 *   via ses états internes (`internalGlobalFilter`, `internalRowSelection`).
 * - Si une page parente a besoin de synchroniser des KPI en temps réel, de réinitialiser
 *   la recherche/sélection ou d'agir sur les lignes, elle peut passer les props contrôlées :
 *   1. Recherche globale : `globalFilter` + `onGlobalFilterChange` (et dériver les lignes avec `useMemo`).
 *   2. Sélection multiple : `rowSelection` + `onRowSelectionStateChange` (et/ou `onRowSelectionChange`).
 * - Aucun `useEffect` n'est utilisé pour synchroniser l'état vers le parent, ce qui évite
 *   tout double rendu et toute boucle infinie (`Maximum update depth exceeded`).
 */
interface DataTableProps<TData extends RowData> {
  /** Définition des colonnes TanStack Table v9 (`ColumnDef<DTFeatures, TData>[]`) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDefUI<DTFeatures, TData, any>[];
  /** Tableau de données à afficher */
  data: TData[];
  /** Affiche une colonne de cases à cocher pour la sélection multiple */
  showCheckBokColumn?: boolean;
  /** Affiche une colonne de boutons radio pour la sélection unique */
  showRadioButtonColumn?: boolean;
  /** Affiche le menu déroulant permettant de masquer/afficher des colonnes */
  showColumnsDisplayFilter?: boolean;
  /**
   * Visibilité initiale des colonnes (`Record<columnId, boolean>`).
   * Exemple : `{ author: false, overallRating: false }` pour masquer ces colonnes par défaut
   * tout en permettant à l'utilisateur de les afficher à la demande via le menu « Colonnes ».
   */
  initialColumnVisibility?: Record<string, boolean>;
  /** Indique un rechargement en cours (fait tourner l'icône du bouton Rafraîchir) */
  isFetching?: boolean;
  /** Contenu JSX du panneau de filtres avancés (affiché sous la barre d'outils) */
  filtersOptions?: React.ReactNode;
  /** Active le bouton permettant d'ouvrir/fermer le panneau `filtersOptions` */
  canFilter?: boolean;
  /** Fonction de rendu de la colonne « Actions » (reçoit la ligne `row.original`) */
  actionsButtons?: (row: TData) => React.ReactNode;

  // --- Sélection des lignes (Mode non-contrôlé ou contrôlé) ---
  /**
   * État contrôlé de la sélection multiple (`Record<string, boolean>`).
   * Optionnel : s'il n'est pas fourni, `DataTable` utilise son état interne.
   * Utile pour pouvoir réinitialiser la sélection depuis le parent (`setRowSelection({})`).
   */
  rowSelection?: RowSelectionState;
  /**
   * Callback d'état brut TanStack Table appelé lors d'un changement de sélection.
   * À combiner avec la prop `rowSelection` pour un contrôle complet dans le parent.
   */
  onRowSelectionStateChange?: OnChangeFn<RowSelectionState>;
  /**
   * Callback simplifié qui renvoie directement le tableau d'objets sélectionnés (`TData[]`)
   * à chaque clic sur une case à cocher.
   */
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  /** Callback appelé lorsqu'une ligne est choisie via le bouton radio (`showRadioButtonColumn`) */
  onRowCheckStateChange?: (selectedRow: TData) => void;

  // --- Recherche globale (Mode non-contrôlé ou contrôlé) ---
  /**
   * Valeur contrôlée du champ de recherche globale.
   * Optionnel : permet au parent de filtrer ses KPI en temps réel via `useMemo` sans `useEffect`.
   */
  globalFilter?: string;
  /** Callback appelé à chaque modification du champ de recherche globale */
  onGlobalFilterChange?: OnChangeFn<string>;

  // --- Personnalisation & Actions de barre d'outils ---
  /** Classe CSS conditionnelle appliquée à chaque ligne `<TableRow>` */
  setRowColorClassName?: (row: TData) => string;
  /** Fonction permettant de définir l'identifiant unique de chaque ligne (par défaut l'index) */
  getRowId?: (row: TData, index: number) => string;
  /** Action du bouton « Rafraîchir » */
  onRefresh?: () => void;
  /** Action du bouton « Nouveau » (`+`) */
  onCreate?: () => void;
  /** Action d'exportation au format Excel (`.xlsx`) */
  onExportToExcel?: () => void;
  /** Action d'exportation au format Word */
  onExportWord?: () => void;
  /** Action d'exportation au format PDF */
  onExportPDF?: () => void;
  /** Composant de détail extensible sous une ligne */
  renderSubComponent?: (props: { row: TData }) => React.ReactNode;
  /** Affiche le pied de tableau (`<TableFooter>`) */
  showFooter?: boolean;
  /** Boutons ou composants additionnels injectés dans la barre d'outils à droite */
  extraActions?: React.ReactNode;
}

export const DataTable = <TData extends RowData>({
  columns,
  data,
  showCheckBokColumn,
  showRadioButtonColumn,
  showColumnsDisplayFilter,
  initialColumnVisibility,
  isFetching,
  canFilter = false,
  filtersOptions,
  actionsButtons,
  rowSelection: controlledRowSelection,
  onRowSelectionStateChange: controlledOnRowSelectionStateChange,
  onRowSelectionChange,
  onRowCheckStateChange,
  getRowId,
  onRefresh,
  onCreate,
  onExportToExcel,
  onExportWord,
  onExportPDF,
  renderSubComponent,
  setRowColorClassName,
  showFooter,
  extraActions,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange: controlledOnGlobalFilterChange,
}: DataTableProps<TData>) => {
  // États internes du tableau
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(initialColumnVisibility ?? {});
  const [radioSelection, setRadioSelection] = useState<string | null>(null);
  const [displayFilter, setDisplayFilter] = useState(false);

  // 1. Pattern Hybride (Contrôlé / Non-contrôlé) pour la recherche globale (`globalFilter`)
  // Si le parent fournit `globalFilter`, on l'utilise ; sinon on utilise `internalGlobalFilter`.
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter;

  const handleGlobalFilterChange: OnChangeFn<string> = (updater) => {
    const next =
      typeof updater === "function" ? updater(globalFilter) : updater;
    setInternalGlobalFilter(next);
    controlledOnGlobalFilterChange?.(next);
  };

  // 2. Pattern Hybride (Contrôlé / Non-contrôlé) pour la sélection de lignes (`rowSelection`)
  // Permet soit un usage simple via `onRowSelectionChange(selectedRows)`,
  // soit un contrôle complet de l'état via `rowSelection` + `onRowSelectionStateChange`.
  const rowSelection = controlledRowSelection ?? internalRowSelection;

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    const next =
      typeof updater === "function" ? updater(rowSelection) : updater;
    setInternalRowSelection(next);
    controlledOnRowSelectionStateChange?.(next);

    if (!onRowSelectionChange) return;

    const selectedRows = Object.keys(next)
      .filter((rowId) => next[rowId])
      .map((rowId) => table.getRow(rowId)?.original)
      .filter((row): row is TData => !!row);

    onRowSelectionChange(selectedRows);
  };

  // Colonnes dynamiques (checkbox, radio, colonnes métier, actions)
  const dataTableColumns = useMemo(() => {
    const baseColumns: ColumnDef<TData>[] = [];

    if (showCheckBokColumn) {
      baseColumns.push({
        id: "check",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Sélectionnez tout"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Sélectionnez"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<TData>);
    }

    if (showRadioButtonColumn) {
      baseColumns.push({
        id: "radio",
        header: () => null,
        cell: ({ row }) => (
          <input
            type="radio"
            name="data-table-radio"
            checked={radioSelection === row.id}
            onChange={(e) => {
              if (e.target.checked) {
                setRadioSelection(row.id);
                onRowCheckStateChange?.(row.original);
              }
            }}
            className="h-4 w-4 text-primary focus:ring-primary"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<TData>);
    }

    baseColumns.push(...columns);

    if (actionsButtons) {
      baseColumns.push({
        id: "action",
        header: () => "Actions",
        cell: ({ row }) => actionsButtons(row.original),
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<TData>);
    }

    return baseColumns;
  }, [
    showCheckBokColumn,
    showRadioButtonColumn,
    columns,
    actionsButtons,
    radioSelection,
    onRowCheckStateChange,
  ]);

  const table = useTable({
    features: dataTableFeatures, // v9 : obligatoire
    data,
    columns: dataTableColumns,
    getRowId,

    state: {
      sorting,
      rowSelection,
      globalFilter,
      columnVisibility,
    },

    initialState: {
      pagination: {
        pageSize: DEFAULT_PAGE_SIZE,
        pageIndex: 0,
      },
    },

    enableRowSelection: true,
    enableMultiRowSelection: true,

    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnVisibilityChange: setColumnVisibility,

    getRowCanExpand: () => !!renderSubComponent,
    // v9 : plus de getCoreRowModel / getSortedRowModel / getFilteredRowModel /
    // getPaginationRowModel, ils sont déclarés dans `features`
  });

  // v9 : table.getState() est remplacé par table.state
  const { pageIndex, pageSize } = table.state.pagination;

  const filteredCount = table.getFilteredRowModel().rows.length;
  const selectedCount = table.getSelectedRowModel().rows.length;
  const hasSelectionColumn = !!(showCheckBokColumn || showRadioButtonColumn);

  return (
    <div className="w-full space-y-4">
      {/* Filtre + Actions + Recherche + Filtre Colonnes */}
      <Card className="p-0! top-13 sticky z-10">
        <CardContent className="p-2.5">
          <div className="flex flex-wrap items-center gap-4 md:gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* === Section 1: Recherche + Filtre Colonnes === */}
            <div className="flex  items-center gap-3 w-full lg:w-auto">
              {showColumnsDisplayFilter && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center h-9 px-4 rounded-lg border gap-2 text-sm hover:bg-accent transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden lg:block">Colonnes</span>
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-50">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>
                        Afficher les colonnes
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {table
                        .getAllColumns()
                        .filter(
                          (column) =>
                            typeof column.accessorFn !== "undefined" &&
                            column.getCanHide(),
                        )
                        .map((column) => {
                          const label =
                            (
                              column.columnDef.meta as
                                { label?: string } | undefined
                            )?.label ?? column.id;
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) =>
                                column.toggleVisibility(!!value)
                              }
                            >
                              {label}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Champ de recherche */}
              <div className="relative h-9 w-full md:w-70">
                <SearchIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={globalFilter ?? ""}
                  onChange={(e) => handleGlobalFilterChange(e.target.value)}
                  className={cn(
                    "h-9 pl-9 text-sm w-full",
                    globalFilter.length > 0 && "pr-6",
                  )}
                />
                {globalFilter.length > 0 && (
                  <X
                    onClick={() => handleGlobalFilterChange("")}
                    className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  />
                )}
              </div>
            </div>

            {/* === Section 2: Boutons d'accès rapide + Pagination === */}
            <div className="flex flex-wrap items-center gap-2.5 justify-center lg:justify-end w-full lg:w-auto">
              <div className="flex flex-wrap items-center gap-2.5">
                {extraActions}

                {onCreate && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          onClick={onCreate}
                          size="sm"
                          variant="outline"
                          className="h-9 gap-2"
                        >
                          <CirclePlus className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <TooltipContent className="text-[10px] italic">
                      Enregistrer
                    </TooltipContent>
                  </Tooltip>
                )}

                {canFilter && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          onClick={() => setDisplayFilter((prev) => !prev)}
                          size="sm"
                          variant="outline"
                          className="h-9 gap-2"
                        >
                          <Filter className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <TooltipContent className="text-[10px] italic">
                      Filtrer
                    </TooltipContent>
                  </Tooltip>
                )}

                {onRefresh && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          onClick={onRefresh}
                          size="sm"
                          variant="outline"
                          className="h-9 gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <TooltipContent className="text-[10px] italic">
                      Rafraîchir
                    </TooltipContent>
                  </Tooltip>
                )}

                {(onExportToExcel || onExportWord || onExportPDF) && (
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <DropdownMenuTrigger
                            render={
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9"
                              >
                                <FileDown className="h-4 w-4" />
                              </Button>
                            }
                          />
                        }
                      />
                      <TooltipContent className="text-[10px] italic">
                        Exporter
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="w-44">
                      {onExportToExcel && (
                        <DropdownMenuItem onClick={onExportToExcel}>
                          <FileSpreadsheet className="h-4 w-4" />
                          Exporter en Excel
                        </DropdownMenuItem>
                      )}
                      {onExportWord && (
                        <DropdownMenuItem onClick={onExportWord}>
                          <FileText className="h-4 w-4" />
                          Exporter en Word
                        </DropdownMenuItem>
                      )}
                      {onExportPDF && (
                        <DropdownMenuItem onClick={onExportPDF}>
                          <FileTypeCorner className="h-4 w-4" />
                          Exporter en PDF
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Taille de page */}
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-16 data-[size=sm]:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="bottom" align="end">
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtres passés en props */}
          {displayFilter && filtersOptions && (
            <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
              {filtersOptions}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card className="p-0!">
        <CardContent className="p-2.5 space-y-3">
          <div className="relative overflow-hidden flex flex-col border-b">
            <Table>
              <TableHeader className="sticky top-0 z-5 bg-background h-13 shadow-md">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {renderSubComponent && (
                      <TableHead className="w-10"></TableHead>
                    )}
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-bold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(setRowColorClassName?.(row.original))}
                      >
                        {renderSubComponent && (
                          <TableCell className="w-10">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                row.toggleExpanded();
                              }}
                              className="cursor-pointer"
                              aria-label="Afficher le détail"
                            >
                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  row.getIsExpanded() && "rotate-90",
                                )}
                              />
                            </Button>
                          </TableCell>
                        )}
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>

                      {row.getIsExpanded() && renderSubComponent && (
                        <TableRow>
                          <TableCell colSpan={row.getVisibleCells().length + 1}>
                            {renderSubComponent({ row: row.original })}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={
                        dataTableColumns.length + (renderSubComponent ? 1 : 0)
                      }
                      className="h-9 text-center text-destructive"
                    >
                      Aucun résultat disponible pour le moment
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

              {showFooter && (
                <TableFooter>
                  {table.getFooterGroups().map((footerGroup) => (
                    <TableRow key={footerGroup.id}>
                      {renderSubComponent && (
                        <TableCell className="w-10"></TableCell>
                      )}
                      {footerGroup.headers.map((header) => (
                        <TableCell key={header.id} className="font-bold">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.footer,
                                header.getContext(),
                              )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableFooter>
              )}
            </Table>

            {isFetching && (
              <div className="absolute inset-0 bg-black/6 flex items-center justify-center z-10 rounded-md">
                <div className="animate-spin h-10 w-10 border-muted-foreground border-b-2 border-r rounded-full" />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex text-sm text-muted-foreground">
              {hasSelectionColumn
                ? `${selectedCount} enregistrement(s) sélectionné(s) sur ${filteredCount} enregistrement(s) trouvé(s)`
                : `${filteredCount} enregistrement(s) trouvé(s)`}
            </div>

            <div className="flex items-center justify-end space-x-2">
              <div className="flex max-w-40 items-center justify-center text-sm font-medium">
                Page {pageIndex + 1} sur{" "}
                {table.getPageCount() === 0 ? 1 : table.getPageCount()}
              </div>

              <Button
                variant="outline"
                className="hidden md:block"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Première page</span>
                <ChevronsLeft />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Précédente</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Suivante</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="hidden md:block"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Dernière page</span>
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface SortColumnProps<TData extends RowData, TValue> {
  info: HeaderContext<DTFeatures, TData, TValue>;
  icon: "number" | "string" | "date";
  columnName: React.ReactNode;
}

const SORT_ICONS = {
  asc: {
    string: ArrowDownAZ,
    number: ArrowDown01,
    date: CalendarArrowDown,
  },
  desc: {
    string: ArrowUpZA,
    number: ArrowUp10,
    date: CalendarArrowUp,
  },
} as const;

export const SortColumn = <TData extends RowData, TValue>({
  info,
  icon,
  columnName,
}: SortColumnProps<TData, TValue>) => {
  const sorted = info.column.getIsSorted();
  const SortIcon = sorted ? SORT_ICONS[sorted][icon] : ChevronsUpDown;

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        info.column.toggleSorting(sorted === "asc");
      }}
      className="flex w-full h-full items-center justify-between cursor-pointer"
    >
      {columnName}
      <SortIcon size="15" />
    </div>
  );
};

export interface TableSkeletonProps {
  columnsCount?: number;
  rowsCount?: number;
  showPageHeader?: boolean;
  showToolbar?: boolean;
  showTabs?: boolean;
  tabsItems?: number;
}

export const TableSkeleton = ({
  columnsCount = 4,
  rowsCount = 5,
  showPageHeader = false,
  showToolbar = true,
  showTabs = false,
  tabsItems = 2,
}: TableSkeletonProps) => {
  return (
    <div className="space-y-4">
      {/* Entête de page optionnel */}
      {showPageHeader && (
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          {/* Ligne d'accent décorative en haut */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary/80 via-primary to-primary/40" />

          <div className="px-5 pt-4 pb-4 space-y-3">
            {/* Barre supérieure : Fil d'Ariane + Bouton Retour */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-hidden">
                <Skeleton className="h-3.5 w-20 shrink-0" />
                <span className="text-muted-foreground/30 text-xs shrink-0">
                  /
                </span>
                <Skeleton className="h-3.5 w-36 shrink-0" />
                <span className="text-muted-foreground/30 text-xs shrink-0">
                  /
                </span>
                <Skeleton className="h-3.5 w-28 shrink-0" />
                <span className="text-muted-foreground/30 text-xs shrink-0">
                  /
                </span>
                <Skeleton className="h-3.5 w-32 shrink-0" />
              </div>

              <Skeleton className="h-8 w-20 rounded-md shrink-0" />
            </div>

            <Separator className="bg-border/40" />

            {/* Section principale : Icône + Titre + Description & Badge Date */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3.5">
                <Skeleton className="h-11 w-11 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-48 sm:w-64" />
                  <Skeleton className="h-4 w-64 sm:w-80 md:w-96" />
                </div>
              </div>

              {/* Badge Date */}
              <Skeleton className="h-7 w-32 rounded-full self-start md:self-center shrink-0" />
            </div>
          </div>
        </div>
      )}

      {showTabs && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {Array.from({ length: tabsItems }).map((_, i) => (
            <Skeleton className="h-10 w-40" key={i} />
          ))}
        </div>
      )}

      {/* Barre d'outils */}
      {showToolbar && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full sm:w-62.5" />
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-17.5" />
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnsCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-25" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowsCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnsCount }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    {colIndex === columnsCount - 1 ? (
                      // Colonne d'actions (icônes)
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    ) : colIndex === columnsCount - 2 ? (
                      // Colonne de statut (badge)
                      <Skeleton className="h-6 w-20 rounded-full" />
                    ) : (
                      // Texte normal
                      <Skeleton className="h-4 w-[80%]" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pied de page (Pagination) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Skeleton className="h-4 w-50" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20 mr-2" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};
