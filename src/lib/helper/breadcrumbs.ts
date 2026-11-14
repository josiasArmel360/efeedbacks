export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function buildBreadcrumbs(
  pageLabel?: string,
  extra?: BreadcrumbItem[],
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    { label: "Tableau de bord", href: "/dashboard" },
  ];

  if (extra && extra.length > 0) {
    crumbs.push(...extra);
  }

  if (pageLabel) {
    crumbs.push({ label: pageLabel });
  }

  return crumbs;
}
