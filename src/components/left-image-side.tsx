import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LeftImageSideItem {
  step?: number | string;
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export interface LeftImageSideBanner {
  icon?: LucideIcon;
  title: string;
  description: string;
}

export interface LeftImageSideStat {
  value: string;
  label: string;
}

export interface LeftImageSideProps {
  title: string;
  subTitle?: string;
  badge?: string;
  items?: LeftImageSideItem[];
  banner?: LeftImageSideBanner;
  stats?: LeftImageSideStat[];
  className?: string;
}

export const LeftImageSide = ({
  title,
  subTitle,
  badge,
  items,
  banner,
  stats,
  className,
}: LeftImageSideProps) => {
  const hasMiddleContent = items && items.length > 0;
  const hasBottomContent = Boolean(banner || (stats && stats.length > 0));

  return (
    <div
      className={cn(
        "hidden md:flex md:w-2/3 relative overflow-hidden select-none",
        className,
      )}
    >
      {/* Couches d'arrière-plan préservées */}
      <div className="absolute inset-0 bg-[url('/images/bg-cover.png')] bg-cover bg-center transition-transform duration-700 hover:scale-105" />
      <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply" />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/20" />

      {/* Conteneur principal textuel */}
      <div
        className={cn(
          "relative z-10 flex flex-col w-full h-full p-4 lg:p-6 xl:p-7 text-white justify-between overflow-y-auto",
        )}
      >
        <div className="space-y-4 max-w-2xl">
          {/* 1. En-tête : Badge + Titre + Sous-titre */}
          <div className="space-y-4">
            {badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-xs">
                {badge}
              </span>
            )}
            <h2 className="text-3xl lg:text-4xl xl:text-[2.65rem] font-extrabold tracking-tight leading-[1.18] text-white drop-shadow-xs whitespace-pre-line">
              {title}
            </h2>
            {subTitle && (
              <p className="text-sm lg:text-base text-white/85 leading-relaxed font-normal">
                {subTitle}
              </p>
            )}
          </div>

          {/* 2. Liste centrale : Étapes ou Fonctionnalités */}
          {hasMiddleContent && (
            <div className="space-y-3.5">
              {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-4 group">
                    {/* Pastille Étape (cercle blanc) ou Icône (carré arrondi translucide) */}
                    {item.step !== undefined ? (
                      <div className="size-10 rounded-full bg-white text-zinc-900 font-extrabold flex items-center justify-center text-sm lg:text-base shrink-0 shadow-sm">
                        {item.step}
                      </div>
                    ) : Icon ? (
                      <div className="size-10 rounded-xl bg-white/15 border border-white/25 text-white flex items-center justify-center shrink-0 backdrop-blur-xs shadow-xs">
                        <Icon className="size-5" />
                      </div>
                    ) : (
                      <div className="size-2 rounded-full bg-white/70 mt-2.5 shrink-0" />
                    )}

                    {/* Contenu textuel de l'élément */}
                    <div className="min-w-0 space-y-0.5 pt-0.5">
                      <p className="text-sm lg:text-base font-bold text-white tracking-tight">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs lg:text-sm text-white/80 leading-relaxed font-normal">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Pied : Encart réassurance / sécurité ET/OU Statistiques clés */}
        {hasBottomContent && (
          <div className="pt-4 mt-auto space-y-4 max-w-2xl">
            {banner && (
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 flex items-start gap-3.5 shadow-lg">
                {banner.icon && (
                  <div className="size-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-white mt-0.5">
                    <banner.icon className="size-4.5" />
                  </div>
                )}
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-bold text-white">{banner.title}</p>
                  <p className="text-xs lg:text-sm text-white/80 leading-relaxed font-normal">
                    {banner.description}
                  </p>
                </div>
              </div>
            )}

            {stats && stats.length > 0 && (
              <div className="flex items-center gap-8 pt-5 border-t border-white/20">
                {stats.map((stat, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <div className="h-10 w-px bg-white/25" />}
                    <div className="min-w-0">
                      <p className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-xs lg:text-sm text-white/80 mt-0.5 font-normal">
                        {stat.label}
                      </p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
