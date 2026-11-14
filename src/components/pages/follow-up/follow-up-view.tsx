"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  HelpCircle,
  KeyRound,
  Lock,
  MessageSquarePlus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TextInput } from "@/components/inputs";
import { SubmitButton } from "@/components/buttons";
import { getByCode } from "@/lib/db/server/feedbacks";
import {
  TrackFeedbackSchema,
  type TrackFeedbackData,
} from "@/lib/db/queries/feedback/validator";
import type { Feedback } from "@/lib/types";

import { FollowUpTimeline } from "./follow-up-timeline";
import { FollowUpTicketCard } from "./follow-up-ticket-card";

interface FollowUpViewProps {
  initialCode?: string;
  initialFeedback?: Feedback | null;
}

export const FollowUpView: React.FC<FollowUpViewProps> = ({
  initialCode = "",
  initialFeedback = null,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchedCode, setSearchedCode] = useState<string>(
    initialCode.trim().toUpperCase(),
  );
  const [feedback, setFeedback] = useState<Feedback | null>(initialFeedback);

  const form = useForm<TrackFeedbackData>({
    resolver: zodResolver(TrackFeedbackSchema),
    defaultValues: {
      code: initialCode.trim().toUpperCase(),
    },
  });

  const onSubmit = (values: TrackFeedbackData) => {
    const cleaned = values.code.trim().toUpperCase();

    startTransition(async () => {
      const result = await getByCode(cleaned);
      setSearchedCode(cleaned);
      setFeedback(result);
      router.replace(`/follow-up?code=${encodeURIComponent(cleaned)}`, {
        scroll: false,
      });
    });
  };

  const handleReset = () => {
    form.reset({ code: "" });
    setSearchedCode("");
    setFeedback(null);
    router.replace("/follow-up", { scroll: false });
  };

  return (
    <div className="flex-1">
      {/* ================================================================
          1. HERO SECTION & BARRE DE RECHERCHE (REACT-HOOK-FORM + ZOD)
         ================================================================ */}
      <section className="relative overflow-hidden py-12 md:py-16 border-b border-border/40 bg-linear-to-b from-primary/10 via-background to-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#13a89e_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.14] dark:opacity-[0.08]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[38rem] max-w-full rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative container mx-auto max-w-4xl px-4 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-background/90 backdrop-blur-sm text-primary border border-primary/25 shadow-2xs animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles className="h-3.5 w-3.5" />
            <span>TRAÇABILITÉ &amp; SUIVI EN TEMPS RÉEL</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto leading-[1.15]">
            Suivez l&apos;instruction de{" "}
            <span className="bg-linear-to-r from-primary via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              votre dossier
            </span>
          </h1>

          <p className="text-muted-foreground text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Saisissez le code unique délivré à la validation de votre
            questionnaire pour consulter son statut et les actions menées par
            l&apos;établissement.
          </p>

          {/* Formulaire React Hook Form + Zod */}
          <div className="max-w-xl mx-auto pt-2 space-y-3">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5 w-full rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-2.5 shadow-sm transition-all duration-300 focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10"
            >
              <div className="flex-1 text-left">
                <TextInput
                  control={form.control}
                  name="code"
                  uppercase
                  icon={KeyRound}
                  placeholder="Ex : FB-2026-X83K"
                  disabled={isPending}
                  className="h-11 font-mono text-sm font-bold uppercase tracking-wider bg-muted/20 border-border/60"
                />
              </div>

              <SubmitButton
                isLoading={isPending}
                className="h-11 px-6 rounded-xl text-xs sm:text-sm gap-2 shrink-0 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <Search className="h-4 w-4" />
                <span>Rechercher</span>
              </SubmitButton>
            </form>

            {searchedCode && (
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Effacer la recherche actuelle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================
          2. ZONE DE RÉSULTATS (DOSSIER TROUVÉ / INTROUVABLE / GUIDE INITIAL)
         ================================================================ */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-4">
          {isPending ? (
            <div className="space-y-6">
              <Skeleton className="h-56 w-full rounded-2xl" />
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
          ) : feedback ? (
            <div className="space-y-6">
              <FollowUpTimeline feedback={feedback} />
              <FollowUpTicketCard feedback={feedback} />
            </div>
          ) : searchedCode ? (
            /* État : Code introuvable */
            <Card className="max-w-xl mx-auto border-rose-500/30 bg-card shadow-xs py-0 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CardContent className="p-6 sm:p-8 text-center space-y-5">
                <div className="h-13 w-13 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-6 w-6" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
                    Aucun dossier trouvé pour{" "}
                    <span className="font-mono text-rose-600 dark:text-rose-400">
                      {searchedCode}
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Vérifiez que le code saisi ne comporte pas d&apos;erreur de
                    frappe (format habituel :{" "}
                    <code className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                      FB-2026-XXXX
                    </code>
                    ).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Nouvelle recherche</span>
                  </Button>

                  <Button
                    nativeButton={false}
                    render={<Link href="/survey" />}
                    className="w-full sm:w-auto text-xs font-bold gap-1.5"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                    <span>Déposer un nouvel avis</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* État initial : Guide d'accompagnement en 3 cartes Bento */
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border/60 py-0 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-foreground">
                      Où trouver mon code ?
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Votre code de suivi vous est affiché immédiatement sur
                      l&apos;écran de confirmation après l&apos;envoi de votre
                      questionnaire.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 py-0 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-foreground">
                      Délais d&apos;instruction
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Chaque retour est examiné par la cellule qualité. Les
                      signalements prioritaires font l&apos;objet d&apos;une
                      prise en charge accélérée.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 py-0 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-foreground">
                      Suivi 100 % confidentiel
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Même pour un dépôt anonyme, ce code unique vous permet de
                      consulter la réponse officielle de l&apos;hôpital sans
                      dévoiler votre identité.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-extrabold text-foreground">
                      Vous n&apos;avez pas encore déposé d&apos;avis ?
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Partagez votre expérience en moins de 2 minutes pour
                      obtenir votre code de suivi.
                    </p>
                  </div>
                </div>

                <Button
                  nativeButton={false}
                  render={<Link href="/survey" />}
                  className="text-xs font-bold gap-1.5 shrink-0"
                >
                  <span>Donner mon avis</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export const FollowUpSkeleton: React.FC = () => {
  return (
    <div className="flex-1">
      <div className="py-14 border-b border-border/40">
        <div className="container mx-auto max-w-3xl px-4 flex flex-col items-center space-y-4">
          <Skeleton className="h-6 w-52 rounded-full" />
          <Skeleton className="h-11 w-96 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md" />
          <Skeleton className="h-16 w-full max-w-xl rounded-2xl mt-2" />
        </div>
      </div>

      <div className="py-12 container mx-auto max-w-5xl px-4 space-y-6">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
};

