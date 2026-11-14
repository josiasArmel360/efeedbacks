import React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { LucideIcon } from "lucide-react";
import { NavigationButton } from "@/components/buttons";
import { RefreshButton } from "./buttons/refresh-button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  description?: React.ReactNode;
  breadcrumbs: BreadcrumbItemType[];
  icon?: LucideIcon;
  onRefresh?: () => Promise<void>;
  actionButton?: React.ReactNode;
}

export const Header = ({
  title,
  description,
  breadcrumbs,
  icon: Icon,
  onRefresh,
  actionButton,
}: HeaderProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Decorative gradient accent at the top */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary/80 via-primary to-primary/40" />

      <div className="px-5 pt-4 pb-4 space-y-3">
        {/* Top bar: Breadcrumbs + Actions */}
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink
                        className="text-xs font-medium text-muted-foreground/70 hover:text-primary transition-colors"
                        render={<Link href={item.href}>{item.label}</Link>}
                      />
                    ) : (
                      <BreadcrumbPage className="text-xs font-semibold text-foreground/80">
                        {item.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2">
            {onRefresh && <RefreshButton onClick={onRefresh} />}
            <NavigationButton />
            {actionButton && actionButton}
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Main section: Title, Icon and Date */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3.5">
            {Icon && (
              <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground leading-tight">
                {title}
              </h2>
              {description && (
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
