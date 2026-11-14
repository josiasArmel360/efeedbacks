"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { getInitials, canAccess, UCFirst } from "@/lib/helper/utility";
import { MenuItem, SIDEBAR_MODULES } from "@/lib/config/sidebar.modules";
import { Logo } from "@/components/image";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  user: User;
}

export const Sidebar = ({ user }: SidebarProps) => {
  const { user: storeUser } = useAuth();
  const activeUser = storeUser ?? user;
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const pathname = usePathname();
  const { open: isOpen } = useSidebar();

  const filterItems = (items: MenuItem[]): MenuItem[] => {
    const allowedMod = user?.permissions?.allowedModules || [];
    const hasFullAccess = user?.permissions?.hasFullAccess || false;

    return items
      .map((item) => {
        const isParent = !!item.children && item.children.length > 0;
        const filteredChildren =
          isParent && item.children ? filterItems(item.children) : undefined;
        return {
          item: { ...item, children: filteredChildren },
          isParent,
        };
      })
      .filter(({ item, isParent }) => {
        if (isParent) {
          return !!(item.children && item.children.length > 0);
        }

        if (item.resources && item.resources.length > 0) {
          return item.resources.some((resource) =>
            canAccess(allowedMod, resource, hasFullAccess),
          );
        }

        return true;
      })
      .map(({ item }) => item);
  };

  const items = filterItems(SIDEBAR_MODULES);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of items) {
      if (
        item.children &&
        item.children.length > 0 &&
        pathname.startsWith(item.href)
      ) {
        initial.add(item.href);
      }
    }
    return initial;
  });

  const [savedOpenGroups, setSavedOpenGroups] = useState<Set<string>>(
    new Set(),
  );
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setSavedOpenGroups(new Set(openGroups));
      setOpenGroups(new Set());
    } else {
      setOpenGroups(new Set(savedOpenGroups));
    }
  }

  const toggleGroup = (href: string, isGroupOpen: boolean) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (isGroupOpen) {
        next.add(href);
      } else {
        next.delete(href);
      }
      return next;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isItemActive = (href: string, currentPath: string) => {
    if (href === "/") return currentPath === "/";
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  return (
    <UISidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-border/40 z-20"
    >
      {/* Header : Logo & Retour Menu */}
      <SidebarHeader className="border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2 px-1">
              <Link
                href="/"
                className="group/logo flex items-center gap-2 overflow-hidden"
              >
                <Logo
                  className={cn("h-8 w-auto object-contain", !isOpen && "h-9!")}
                />
                <div
                  className={cn(
                    "flex flex-col overflow-hidden transition-all duration-200",
                    !isOpen && "hidden",
                    "group-data-[collapsible=icon]:hidden",
                  )}
                >
                  <span className="font-extrabold text-sm tracking-tight text-foreground truncate">
                    {APP_NAME}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Gouvernance Qualité Sanitaire
                  </span>
                </div>
              </Link>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content : Navigation Dynamique propre au module */}
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, idx) =>
                item.children && item.children.length > 0 ? (
                  <NavGroup
                    key={idx}
                    item={item}
                    pathname={pathname}
                    isOpen={openGroups.has(item.href)}
                    onToggle={toggleGroup}
                  />
                ) : (
                  <NavItem
                    key={idx}
                    item={item}
                    isActive={isItemActive(item.href, pathname)}
                  />
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer : Profil utilisateur & Horloge */}
      <SidebarFooter className="border-t border-border/40">
        <div className="flex flex-col gap-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 overflow-hidden rounded-lg p-1 -m-1 hover:bg-muted/60 transition-colors"
            title="Accéder à mon profil"
          >
            <Avatar className="h-9 w-9 shrink-0 border border-border/60">
              {activeUser?.image ? (
                <AvatarImage src={activeUser.image} alt={activeUser.name} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {getInitials(activeUser?.name || "Care Sys")}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="truncate text-xs font-semibold text-foreground">
                {UCFirst(activeUser?.name || "Utilisateur")}
              </span>
              <span className="text-[11px] text-muted-foreground capitalize truncate">
                {activeUser?.policy?.name || user?.policy?.name || "Aucun rôle"}
              </span>
            </div>
          </Link>

          {currentTime && (
            <div className="rounded-lg bg-muted/40 p-2 text-center text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden border border-border/30 shadow-2xs">
              <div className="font-medium capitalize">
                {currentTime.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </div>
              <div className="font-mono text-xs font-semibold text-foreground/80 mt-0.5">
                {currentTime.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </UISidebar>
  );
};

const NavItem = ({ item, isActive }: { item: MenuItem; isActive: boolean }) => (
  <SidebarMenuItem>
    <SidebarMenuButton
      isActive={isActive}
      className="w-full justify-start gap-2"
      render={
        <Link href={item.href} className="flex items-center gap-2 w-full">
          {item?.icon && <item.icon className="h-4 w-4 shrink-0" />}
          <span className="truncate flex-1 text-left">{item.title}</span>
          {item.badge && (
            <Badge
              variant="secondary"
              className="ml-auto text-[10px] px-1.5 py-0 font-normal shrink-0 group-data-[collapsible=icon]:hidden"
            >
              {item.badge}
            </Badge>
          )}
        </Link>
      }
    />
  </SidebarMenuItem>
);

const NavGroup = ({
  item,
  pathname,
  isOpen,
  onToggle,
}: {
  item: MenuItem;
  pathname: string;
  isOpen: boolean;
  onToggle: (href: string, isOpen: boolean) => void;
}) => {
  const isActive = pathname.startsWith(item.href);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => onToggle(item.href, open)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger
          className="w-full"
          render={
            <SidebarMenuButton
              isActive={isActive}
              className="w-full justify-between gap-2"
            >
              <div className="flex items-center gap-2 truncate">
                {item?.icon && <item.icon className="h-4 w-4 shrink-0" />}
                <span className="truncate">{item.title}</span>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          }
        />
      </SidebarMenuItem>
      <CollapsibleContent className="pl-4">
        <SidebarMenu className="pl-2 mt-1 border-l border-border/40">
          {item.children?.map((child, idx) => (
            <NavItem
              key={idx}
              item={child}
              isActive={pathname === child.href}
            />
          ))}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  );
};
