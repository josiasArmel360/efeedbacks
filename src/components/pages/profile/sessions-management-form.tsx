"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UAParser } from "ua-parser-js";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  AlertTriangle,
  Globe,
  Laptop,
  Loader2,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/badge";
import { ConfirmModal } from "@/components/confirm-modal";

import { useAuth } from "@/hooks/use-auth";
import type { Session } from "@/lib/db/queries/auth/model";
import { cn } from "@/lib/utils";

interface SessionsManagementFormProps {
  currentSessionToken?: string;
}

export const SessionsManagementForm = ({
  currentSessionToken,
}: SessionsManagementFormProps) => {
  const { listSessions, revokeSession, revokeOtherSessions } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [confirmAllOpen, setConfirmAllOpen] = useState<boolean>(false);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await listSessions();
      setSessions(data);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les sessions actives.",
      );
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [listSessions]);

  const handleRefreshSessions = useCallback(async () => {
    setIsLoading(true);
    await fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    let active = true;
    listSessions()
      .then((data) => {
        if (active) setSessions(data);
      })
      .catch((err) => {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Impossible de récupérer les sessions actives.",
          );
          setSessions([]);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [listSessions, currentSessionToken]);

  const currentSession = useMemo(
    () => sessions.find((s) => s.token === currentSessionToken),
    [sessions, currentSessionToken],
  );

  const otherSessions = useMemo(
    () =>
      currentSessionToken
        ? sessions.filter((s) => s.token !== currentSessionToken)
        : sessions,
    [sessions, currentSessionToken],
  );

  const handleRevokeSingle = async (token: string) => {
    setRevokingToken(token);
    try {
      await revokeSession(token);
      toast.success("Appareil déconnecté avec succès.");
      await fetchSessions();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de la révocation de la session.",
      );
    } finally {
      setRevokingToken(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    await revokeOtherSessions();
    toast.success("Toutes les autres sessions ont été révoquées.");
    await fetchSessions();
  };

  return (
    <Card className="border-border/60 shadow-xs py-0 gap-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/50 bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Laptop className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Appareils & Sessions actives
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Contrôlez les terminaux actuellement connectés à votre compte et
              révoquez les accès suspects.
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefreshSessions}
            disabled={isLoading}
            className="h-8 text-xs gap-1.5 flex-1"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
            />
            Actualiser
          </Button>

          {otherSessions.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setConfirmAllOpen(true)}
              className="h-8 text-xs gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Déconnecter les autres ({otherSessions.length})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Session actuelle */}
            {currentSession && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Cet appareil
                </h4>
                <SessionItemCard session={currentSession} isCurrent />
              </div>
            )}

            {/* Autres sessions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Autres sessions actives ({otherSessions.length})
              </h4>

              {otherSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 py-8 px-4 text-center">
                  <ShieldCheck className="h-8 w-8 text-emerald-500/80 mb-2" />
                  <p className="text-sm font-semibold text-foreground">
                    Aucun autre appareil connecté
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Votre compte est uniquement ouvert sur votre session
                    actuelle.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {otherSessions.map((sess) => (
                    <SessionItemCard
                      key={sess.id}
                      session={sess}
                      isRevoking={revokingToken === sess.token}
                      onRevoke={() => handleRevokeSingle(sess.token)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      <ConfirmModal
        open={confirmAllOpen}
        onClose={() => setConfirmAllOpen(false)}
        onConfirm={handleRevokeAllOthers}
        tone="danger"
        description="Êtes-vous sûr de vouloir déconnecter l'ensemble de vos autres appareils actifs ? Vous resterez connecté sur cet appareil."
        notice="Tous les autres terminaux devront se reconnecter avec votre mot de passe."
      />
    </Card>
  );
};

const SessionItemCard = ({
  session,
  isCurrent = false,
  isRevoking = false,
  onRevoke,
}: {
  session: Session;
  isCurrent?: boolean;
  isRevoking?: boolean;
  onRevoke?: () => void;
}) => {
  const ua = session.userAgent ? UAParser(session.userAgent) : null;

  const getBrowserInfo = () => {
    if (ua === null) return "Terminal inconnu";
    if (ua.browser.name === null && ua.os.name === null)
      return "Terminal inconnu";

    if (ua.browser.name === null) return ua.os.name;
    if (ua.os.name === null) return ua.browser.name;

    return `${ua.browser.name} ${ua.os.name}`;
  };

  const DeviceIcon = ua?.device.type === "mobile" ? Smartphone : Monitor;

  const formatSessionDate = (dateValue: Date | string) => {
    try {
      return format(new Date(dateValue), "dd MMM yyyy 'à' HH:mm", {
        locale: fr,
      });
    } catch {
      return "Date inconnue";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-colors",
        isCurrent
          ? "border-primary/30 bg-primary/5"
          : "border-border/60 bg-card hover:bg-muted/20",
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
            isCurrent
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border/60 bg-muted/40 text-muted-foreground",
          )}
        >
          <DeviceIcon className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground">
              {getBrowserInfo()}
            </span>
            {isCurrent && (
              <Badge variant="success" size="sm">
                Session actuelle
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {session.ipAddress && (
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3" />
                IP : {session.ipAddress}
              </span>
            )}
            <span>Ouverte le {formatSessionDate(session.createdAt)}</span>
            <span>Expire le {formatSessionDate(session.expiresAt)}</span>
          </div>
        </div>
      </div>

      {!isCurrent && onRevoke && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isRevoking}
          onClick={onRevoke}
          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 shrink-0 self-end sm:self-center gap-1.5"
        >
          {isRevoking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          Révoquer
        </Button>
      )}
    </div>
  );
};
