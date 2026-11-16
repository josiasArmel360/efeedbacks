import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardEdit,
  Clock,
  HeartHandshake,
  KeyRound,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNavbar } from "@/components/front/navbar";
import { PublicFooter } from "@/components/front/footer";
import { QuickTracker } from "@/components/front/quick-tracker";
import { getActive as getActiveDepartments } from "@/lib/db/server/departments";
import type { Department } from "@/lib/types";

export const instant = false;

const ACTOR_CARDS = [
  {
    key: "malade",
    title: "Malades / Patients",
    badge: "Usager pris en charge",
    description:
      "Évaluez l'accueil, les délais de prise en charge, l'écoute soignante, le soulagement de la douleur et l'hygiène des locaux.",
    tags: ["Accueil & Écoute", "Douleur", "Hygiène", "Confort"],
    icon: HeartHandshake,
    topBarClass: "from-blue-500 via-sky-500 to-cyan-400",
    iconBoxClass:
      "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white",
    badgeClass:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    delay: "0ms",
  },
  {
    key: "parent_malade",
    title: "Parents & Proches",
    badge: "Famille & Accompagnant",
    description:
      "Partagez votre regard d'accompagnant sur la clarté des informations transmises, l'orientation et la considération humaine.",
    tags: ["Information médicale", "Orientation", "Horaires", "Soutien"],
    icon: Users,
    topBarClass: "from-purple-500 via-violet-500 to-fuchsia-400",
    iconBoxClass:
      "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white",
    badgeClass:
      "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    delay: "100ms",
  },
  {
    key: "personnel_soignant",
    title: "Personnel Soignant",
    badge: "Équipe médicale & interne",
    description:
      "Remontez vos retours sur la disponibilité du matériel, la coordination inter-services et la sécurité de vos postes de soins.",
    tags: ["Équipements", "Coordination", "Sécurité", "Conditions"],
    icon: Stethoscope,
    topBarClass: "from-emerald-500 via-teal-500 to-cyan-500",
    iconBoxClass:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white",
    badgeClass:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    delay: "200ms",
  },
] as const;

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Exprimez-vous librement",
    description:
      "Sélectionnez votre profil et répondez au questionnaire adapté en moins de 2 minutes, en mode 100 % anonyme ou identifié.",
    icon: ClipboardEdit,
  },
  {
    step: "02",
    title: "Recevez votre code unique",
    description:
      "Un récépissé confidentiel (ex. FB-2026-X83K) vous est délivré instantanément pour suivre l'instruction de votre avis.",
    icon: KeyRound,
  },
  {
    step: "03",
    title: "Consultez les actions menées",
    description:
      "Visualisez en temps réel la prise en charge de votre retour par la cellule qualité et les mesures correctives engagées.",
    icon: CheckCircle2,
  },
] as const;

const COMMITMENTS = [
  {
    title: "Anonymat Garanti",
    subtitle: "Protection absolue de l'usager",
    description:
      "Liberté totale d'expression sans crainte de préjugé ni impact sur votre parcours de soins au sein de l'établissement.",
    icon: ShieldCheck,
  },
  {
    title: "Examen Rigoureux",
    subtitle: "Cellule Qualité dédiée",
    description:
      "Chaque avis ou signalement est instruit avec réactivité et impartialité par les référents qualité et chefs de service.",
    icon: Clock,
  },
  {
    title: "Actions Concrètes",
    subtitle: "Amélioration continue",
    description:
      "Vos retours alimentent directement les plans d'action sanitaires, le confort hôtelier et la gouvernance hospitalière.",
    icon: HeartHandshake,
  },
] as const;

function HomeContent({
  activeDepartments = [],
}: {
  activeDepartments?: Department[];
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
      {/* Barre de navigation publique */}
      <PublicNavbar />

      <main className="flex-1">
        {/* ================================================================
            1. HERO SECTION — DESIGN ÉDITORIAL & CARTES BENTO FLOTTANTES
           ================================================================ */}
        <section className="relative overflow-hidden pt-14 pb-20 md:pt-22 md:pb-28 border-b border-border/40 bg-linear-to-b from-primary/10 via-background to-background">
          {/* Motif architectural subtil en arrière-plan */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(#13a89e_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.14] dark:opacity-[0.08]"
          />

          {/* Halos lumineux ambiants */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-96 w-3xl max-w-full rounded-full bg-primary/15 blur-3xl"
          />

          <div className="relative container mx-auto max-w-6xl px-4 text-center space-y-8">
            {/* Pillule d'en-tête */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-background/90 backdrop-blur-sm text-primary border border-primary/25 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>DÉMARCHE QUALITÉ &amp; BIENTRAITANCE HOSPITALIÈRE</span>
            </div>

            {/* Titre Principal */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-3 duration-500">
              Votre expérience améliore directement la{" "}
              <span className="bg-linear-to-r from-primary via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                qualité de nos soins
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
              Patients, familles accompagnantes ou personnel soignant : chaque
              avis compte. Partagez votre retour d&apos;expérience en toute
              liberté, de façon{" "}
              <strong className="text-foreground font-semibold">
                100 % anonyme
              </strong>{" "}
              ou nominative.
            </p>

            {/* Boutons d'action principaux */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/survey" />}
                className="w-full sm:w-auto h-12 px-8 rounded-xl text-sm sm:text-base font-bold shadow-md gap-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span>Donner mon avis maintenant</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/follow-up" />}
                className="w-full sm:w-auto h-12 px-6 rounded-xl bg-background/80 backdrop-blur-xs text-sm sm:text-base font-semibold gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
              >
                <Search className="h-4 w-4 text-primary" />
                <span>Vérifier l&apos;état de mon dossier</span>
              </Button>
            </div>

            {/* Bento Strip de réassurance visuelle */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto text-left animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-md p-4 shadow-2xs transition-all hover:border-primary/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-foreground">
                    100 % Anonyme ou Nominatif
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Choix libre à la soumission
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-md p-4 shadow-2xs transition-all hover:border-amber-500/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Star className="h-5 w-5 fill-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-foreground">
                    Baromètre Rapide (&lt; 2 min)
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Questions ciblées par service
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-md p-4 shadow-2xs transition-all hover:border-emerald-500/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-foreground">
                    Traçabilité Temps Réel
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Code de suivi unique délivré
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            2. SECTION 3 ACTEURS CIBLES — CARTES BENTO INTERACTIVES
           ================================================================ */}
        <section className="py-16 md:py-22 bg-muted/20 border-b border-border/30">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
                Questionnaires sur-mesure
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Une écoute adaptée à chaque acteur
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Les critères d&apos;évaluation s&apos;ajustent automatiquement
                selon votre rôle au sein de l&apos;établissement sanitaire.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ACTOR_CARDS.map((actor) => {
                const Icon = actor.icon;
                return (
                  <Card
                    key={actor.key}
                    style={{ animationDelay: actor.delay }}
                    className="group relative overflow-hidden border-border/60 py-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/40 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                  >
                    {/* Liseré supérieur dégradé */}
                    <div
                      className={`h-1.5 w-full bg-linear-to-r ${actor.topBarClass}`}
                    />

                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-2xs ${actor.iconBoxClass}`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${actor.badgeClass}`}
                          >
                            {actor.badge}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
                            {actor.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {actor.description}
                          </p>
                        </div>

                        {/* Thématiques évaluées */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {actor.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-muted/70 border border-border/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <Link
                          href={`/survey?actor=${actor.key}`}
                          className="flex items-center justify-between w-full rounded-xl bg-muted/40 group-hover:bg-primary group-hover:text-primary-foreground px-4 py-2.5 text-xs font-bold text-foreground transition-all duration-200"
                        >
                          <span>Démarrer ce questionnaire</span>
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Accès rapide par service hospitalier (si configurés) */}
            {activeDepartments.length > 0 && (
              <div className="mt-12 pt-10 border-t border-border/40 text-center space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Accès direct par unité ou service de soins</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {activeDepartments.slice(0, 10).map((dept) => (
                    <Link
                      key={dept.id}
                      href={`/${dept.id}/survey`}
                      className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{dept.name}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================
            3. PARCOURS EN 3 ÉTAPES — TIMELINE VISUELLE CONNECTÉE
           ================================================================ */}
        <section className="py-16 md:py-20 border-b border-border/30 bg-background">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
                Simplicité & Transparence
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Comment fonctionne la plateforme ?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Trois étapes suffisent pour déposer votre avis et suivre son
                instruction.
              </p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROCESS_STEPS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="group relative rounded-2xl border border-border/60 bg-card/70 p-6 space-y-4 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-3xl font-black text-primary/20 group-hover:text-primary/35 transition-colors select-none">
                        {item.step}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-base text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================
            4. SECTION SUIVI RAPIDE (#suivi) — SPOTLIGHT INTERACTIF
           ================================================================ */}
        <section id="suivi" className="py-16 md:py-22">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-linear-to-br from-card via-card to-primary/5 p-6 sm:p-10 shadow-md text-center space-y-6">
              {/* Halo décoratif interne */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
              />

              <div className="relative space-y-2">
                <div className="h-13 w-13 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mx-auto shadow-2xs mb-3">
                  <Search className="h-6 w-6" />
                </div>

                <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Suivre le traitement de votre avis
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  Munissez-vous du code de suivi qui vous a été remis après la
                  validation de votre questionnaire pour consulter l&apos;état
                  d&apos;avancement de votre dossier.
                </p>
              </div>

              <div className="relative max-w-xl mx-auto">
                <QuickTracker />
              </div>

              {/* Aperçu du cycle de vie d'un dossier */}
              <div className="relative pt-4 border-t border-border/50 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  1. Nouveau dossier
                </span>
                <span className="text-border">→</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  2. En cours d&apos;instruction
                </span>
                <span className="text-border">→</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  3. Traité &amp; Action menée
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            5. SECTION ENGAGEMENTS QUALITÉ
           ================================================================ */}
        <section className="py-14 md:py-18 border-t border-border/40 bg-muted/20">
          <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {COMMITMENTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-col items-center text-center rounded-2xl border border-border/50 bg-card p-6 space-y-3 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-sm sm:text-base text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-primary">
                      {item.subtitle}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Pied de page public */}
      <PublicFooter />
    </div>
  );
}

async function HomeData() {
  await connection();
  const activeDepartments = await getActiveDepartments();

  return <HomeContent activeDepartments={activeDepartments} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeContent />}>
      <HomeData />
    </Suspense>
  );
}
