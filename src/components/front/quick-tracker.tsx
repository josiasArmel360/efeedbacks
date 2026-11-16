"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, KeyRound, Search, Sparkles } from "lucide-react";

import { TextInput } from "@/components/inputs";
import { SubmitButton } from "@/components/buttons";
import {
  TrackFeedbackSchema,
  type TrackFeedbackData,
} from "@/lib/db/queries/feedback/validator";

export const QuickTracker: React.FC = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<TrackFeedbackData>({
    resolver: zodResolver(TrackFeedbackSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = (values: TrackFeedbackData) => {
    const cleaned = values.code.trim().toUpperCase();
    startTransition(() => {
      router.push(`/follow-up?code=${encodeURIComponent(cleaned)}`);
    });
  };

  return (
    <div className="space-y-3">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5 w-full rounded-2xl border border-border/80 bg-background/95 p-2.5 shadow-sm transition-all duration-300 focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10"
      >
        <div className="flex-1 text-left">
          <TextInput
            control={form.control}
            name="code"
            uppercase
            icon={KeyRound}
            placeholder="Saisissez votre code (ex : FB-2026-X83K)"
            disabled={isPending}
            className="h-11 font-mono text-sm font-bold uppercase tracking-wider bg-muted/20 border-border/60"
          />
        </div>

        <SubmitButton
          isLoading={isPending}
          className="h-11 px-6 rounded-xl text-xs sm:text-sm gap-2 shrink-0 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <Search className="h-4 w-4" />
          <span>Vérifier mon dossier</span>
          <ArrowRight className="h-4 w-4" />
        </SubmitButton>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          Exemple de format :
        </span>
        <button
          type="button"
          onClick={() =>
            form.setValue("code", "FB-2026-X83K", { shouldValidate: true })
          }
          className="font-mono font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
          title="Cliquer pour pré-remplir avec cet exemple"
        >
          FB-2026-X83K
        </button>
      </div>
    </div>
  );
};

export default QuickTracker;
