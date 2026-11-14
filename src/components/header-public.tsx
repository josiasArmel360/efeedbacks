import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SwitchThemeButton } from "@/components/theme-provider";
import { Logo } from "@/components/image";
import { cn } from "@/lib/utils";

export interface HeaderPublicProps {
  appName?: string;
  subtitle?: string;
  showTrackLink?: boolean;
  showProLink?: boolean;
  showBackLink?: boolean;
  maxWidth?: "max-w-5xl" | "max-w-6xl" | "max-w-7xl" | string;
  className?: string;
  extraActions?: React.ReactNode;
}

export const HeaderPublic: React.FC<HeaderPublicProps> = ({
  appName,
  subtitle,
  showTrackLink = false,
  showProLink = true,
  showBackLink = false,
  maxWidth = "max-w-5xl",
  className,
  extraActions,
}) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/50 bg-background/90 backdrop-blur-md transition-colors",
        className,
      )}
    >
      <div
        className={cn(
          "container mx-auto px-4 h-16 flex items-center justify-between",
          maxWidth,
        )}
      >
        {/* Identité Établissement (Lien Accueil) */}
        <Link
          href="/"
          className="flex items-center gap-3 group transition-opacity hover:opacity-90"
        >
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs transition-colors group-hover:border-primary/40">
            <Logo className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm sm:text-base tracking-tight text-foreground block leading-tight">
              {appName}
            </span>
            {subtitle && (
              <span className="text-[10px] sm:text-[11px] text-muted-foreground hidden sm:block">
                {subtitle}
              </span>
            )}
          </div>
        </Link>

        {/* Actions à droite */}
        <div className="flex items-center gap-2 sm:gap-3">
          {extraActions}

          <SwitchThemeButton />

          {/* Bouton Suivi d'avis */}
          {showBackLink && (
            <Link href="/">
              <Button variant="outline" className="text-xs hidden md:flex">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Retour à l'accueil
              </Button>
            </Link>
          )}

          {showTrackLink && (
            <Link href="/suivi">
              <Button variant="outline" className="text-xs hidden md:flex">
                <Search className="h-3.5 w-3.5 mr-1" />
                Suivre un avis
              </Button>
            </Link>
          )}

          {/* Bouton Espace Pro */}
          {showProLink && (
            <Link href="/sign-in">
              <Button variant="outline" className="text-xs hidden md:flex">
                <Lock className="h-3.5 w-3.5 mr-1" />
                Espace Pro
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
