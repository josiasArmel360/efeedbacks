"use client";

import React from "react";
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/image";
import { APP_NAME } from "@/lib/constants";

export const PublicFooter = () => {
  return (
    <footer className="border-t border-border/60 bg-card/60 backdrop-blur-xs">
      <div className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Colonne Identité Établissement */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Logo className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base text-foreground block leading-tight">
                  {APP_NAME}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Dispositif Numérique d&apos;Écoute &amp; Qualité des Soins
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              "Plateforme officielle de recueil, d'analyse et de suivi des
              retours d'expérience des patients, proches accompagnants et
              professionnels de santé."
            </p>
          </div>

          {/* Colonne Navigation */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              Espace Usagers
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/survey"
                  className="hover:text-primary transition-colors font-medium"
                >
                  Déposer un avis ou signalement
                </Link>
              </li>
              <li>
                <Link
                  href="/follow-up"
                  className="hover:text-primary transition-colors font-medium"
                >
                  Suivre l&apos;avancement d&apos;un dossier
                </Link>
              </li>
              <li>
                <Link
                  href="/survey?actor=malade"
                  className="hover:text-primary transition-colors font-medium"
                >
                  Questionnaire Patient
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne Gouvernance & Sécurité */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              Gouvernance &amp; Accès
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Anonymat &amp; Confidentialité</span>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-1.5 hover:text-primary transition-colors font-semibold text-foreground"
                >
                  <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Portail Cellule Qualité (Pro)</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.
          </p>
          <p className="text-[11px]">
            Propulsé par <strong className="text-foreground">{APP_NAME}</strong>{" "}
            — Démarche Qualité Hospitalière
          </p>
        </div>
      </div>
    </footer>
  );
};

export const Footer = PublicFooter;
export default PublicFooter;
