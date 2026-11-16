"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Lock,
  Menu,
  MessageSquarePlus,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SwitchThemeButton } from "@/components/theme-provider";
import { Logo } from "@/components/image";
import { useAuth } from "@/hooks/use-auth";
import { APP_NAME } from "@/lib/constants";
import type { Tenant } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface PublicNavbarProps {
  tenant?: Pick<Tenant, "name" | "logo"> | null;
}

export const PublicNavbar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayName = APP_NAME;
  const isHomePage = pathname === "/";
  const isSurveyPage = pathname === "/survey" || pathname.endsWith("/survey");
  const isFollowUpPage = pathname.startsWith("/follow-up");

  const navItems = [
    {
      href: "/",
      label: "Accueil",
      icon: Home,
      active: isHomePage,
    },
    {
      href: "/survey",
      label: "Donner mon avis",
      icon: MessageSquarePlus,
      active: isSurveyPage,
    },
    {
      href: "/follow-up",
      label: "Suivre un avis",
      icon: Search,
      active: isFollowUpPage,
    },
  ];

  const proHref = user ? "/dashboard" : "/sign-in";
  const proLabel = user ? "Tableau de bord" : "Espace Pro";
  const ProIcon = user ? LayoutDashboard : Lock;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-border/60 bg-background/92 backdrop-blur-xl shadow-xs"
          : "border-b border-border/30 bg-background/75 backdrop-blur-md",
      )}
    >
      <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        {/* Identité Établissement (Lien Accueil) */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none"
        >
          <div className="relative h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:border-primary/40 group-hover:bg-primary/15 shrink-0 overflow-hidden">
            <Logo className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-foreground block leading-tight truncate transition-colors group-hover:text-primary">
              {displayName}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Plateforme d'Écoute & Qualité des Soins
            </span>
          </div>
        </Link>

        {/* Navigation Centrale (Desktop) */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-1 rounded-xl border border-border/50 bg-muted/35 p-1"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:translate-x-0.5",
                  item.active
                    ? "bg-background text-primary shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200 hover:rotate-[-360deg]",
                    item.active && "text-primary scale-105",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions à droite */}
        <div className="flex items-center gap-2">
          <SwitchThemeButton />

          {/* Bouton Espace Pro / Tableau de bord (Desktop) */}
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={proHref} />}
            className="hidden md:inline-flex h-9 px-3.5 text-xs font-semibold gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
          >
            <ProIcon className="h-3.5 w-3.5" />
            <span>{proLabel}</span>
          </Button>

          {/* Bouton Menu Mobile */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden h-9 w-9"
            aria-label={
              mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu de navigation"
            }
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4 transition-transform duration-200 rotate-0" />
            ) : (
              <Menu className="h-4 w-4 transition-transform duration-200" />
            )}
          </Button>
        </div>
      </div>

      {/* Menu Mobile Animé */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/98 backdrop-blur-xl px-4 py-3 space-y-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors",
                  item.active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-foreground hover:bg-muted/60",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 mt-1 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={proHref} />}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full justify-center h-9 text-xs font-semibold gap-1.5"
            >
              <ProIcon className="h-3.5 w-3.5" />
              <span>{proLabel}</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export const Navbar = PublicNavbar;
export default PublicNavbar;
