"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, Eye, MessageSquareMore, Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { Modal } from "@/components/modal";
import { FeedbackDetailForm } from "@/components/back-office/feedbacks/feedback-detail-form";
import { usePermissions } from "@/hooks/use-permissions";
import { RESOURCE } from "@/lib/config/access.modules";
import type { Feedback, FormMode, User } from "@/lib/types";

interface DashboardRecentTableProps {
  recentFeedbacks: Feedback[];
  users?: User[];
  onRefresh?: () => Promise<void> | void;
}

export const DashboardRecentTable = ({
  recentFeedbacks,
  users = [],
  onRefresh,
}: DashboardRecentTableProps) => {
  const { canDo } = usePermissions();
  const canEditFeedback = canDo(RESOURCE.FEEDBACK, "update");

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<FormMode>("preview");

  const handleOpenDetail = (feedback: Feedback, mode: FormMode = "preview") => {
    setSelectedFeedback(feedback);
    setModalMode(mode);
  };

  return (
    <>
      <Card className="border-border/60 shadow-2xs py-0 gap-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
              <MessageSquareMore className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Derniers Avis Enregistrés
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Consultez et instruisez les derniers retours d&apos;expérience
                reçus.
              </CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 font-semibold self-start sm:self-auto"
            nativeButton={false}
            render={<Link href="/feedbacks" />}
          >
            <span>Voir tous les avis</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {recentFeedbacks.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Aucun avis reçu pour la période sélectionnée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/10 text-muted-foreground">
                    <th className="py-3 px-5 font-bold">Code</th>
                    <th className="py-3 px-4 font-bold">Acteur</th>
                    <th className="py-3 px-4 font-bold">Service</th>
                    <th className="py-3 px-4 font-bold">Note</th>
                    <th className="py-3 px-4 font-bold">Priorité</th>
                    <th className="py-3 px-4 font-bold">Statut</th>
                    <th className="py-3 px-4 font-bold">Date</th>
                    <th className="py-3 px-5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {recentFeedbacks.map((f) => (
                    <tr
                      key={f.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3 px-5 font-mono font-bold text-primary whitespace-nowrap">
                        {f.code}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge status={f.actorType} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground max-w-50 truncate">
                        {f.department?.name || "Service général"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-background px-2 py-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                          <span>{f.overallRating}/5</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge status={f.priority} size="sm" />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge status={f.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-[11px] font-mono whitespace-nowrap">
                        {format(new Date(f.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: fr,
                        })}
                      </td>
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(f, "preview")}
                          className="h-7 px-2.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Instruire
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={!!selectedFeedback}
        onOpenChange={(open) => {
          if (!open) setSelectedFeedback(null);
        }}
        icon={MessageSquareMore}
        title={
          selectedFeedback
            ? `Dossier ${selectedFeedback.code}`
            : "Instruction de l'avis"
        }
        description="Consultation du retour d'expérience et suivi des actions correctives."
        className="md:max-w-2xl"
      >
        {selectedFeedback && (
          <FeedbackDetailForm
            mode={modalMode}
            feedback={selectedFeedback}
            users={users}
            canUpdate={canEditFeedback}
            onSuccess={async () => {
              setSelectedFeedback(null);
              if (onRefresh) {
                await onRefresh();
              }
            }}
          />
        )}
      </Modal>
    </>
  );
};
