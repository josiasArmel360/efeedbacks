"use client";

import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  Fragment,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Lock, LogOut, ShieldAlert, ShieldX } from "lucide-react";

import { useAuthStore } from "@/lib/db/queries/auth/store";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { getClientSession } from "@/lib/db/queries/auth/model";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { canAccess } from "@/lib/helper/utility";
import { APP_NAME } from "@/lib/constants";
import { MenuItem, SIDEBAR_MODULES } from "@/lib/config/sidebar.modules";
import { RESOURCE } from "@/lib/config/access.modules";
import type { User } from "@/lib/types";

const UNRESTRICTED_PAGES = new Set(["profile", "settings"]);

interface AuthGuardProps {
  initialUser: User;
  children: ReactNode;
}

const subscribe = () => () => {};
const store = () => useAuthStore.getState();

const matchNavigationItem = (
  items: MenuItem[],
  pathname: string,
): { item: MenuItem | null; childResources: string[] } => {
  let matchedItem: MenuItem | null = null;
  let longestMatch = -1;
  let childResources: string[] = [];

  const traverse = (list: MenuItem[]) => {
    for (const item of list) {
      if (item.href) {
        const isExact = pathname === item.href;
        const isPrefix = pathname.startsWith(`${item.href}/`);

        if ((isExact || isPrefix) && item.href.length > longestMatch) {
          longestMatch = item.href.length;
          matchedItem = item;

          childResources = [];
          if (item.children) {
            const collect = (children: MenuItem[]) => {
              for (const child of children) {
                if (child.resources) childResources.push(...child.resources);
                if (child.children) collect(child.children);
              }
            };
            collect(item.children);
          }
        }
      }

      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  };

  traverse(items);
  return { item: matchedItem, childResources };
};

export function AuthGuard({ initialUser, children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  useState(() => store().setUser(initialUser));

  useEffect(() => {
    if (initialUser) store().setUser(initialUser);
  }, [initialUser]);

  const { user: storeUser, status, logOut } = useAuth();
  const user = storeUser ?? initialUser;
  const { hasFullAccess } = usePermissions();

  const isChecking = !isMounted || status === "loading" || !user;

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await getClientSession();
        if (!currentUser) {
          store().reset();
          router.replace("/sign-in");
        }
      } catch {
        store().reset();
        router.replace("/sign-in");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${APP_NAME.toLowerCase()}_auth_logout`) {
        store().reset();
        router.replace("/sign-in");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated" || (!isChecking && !user)) {
      router.replace("/sign-in");
    }
  }, [status, user, isChecking, router]);

  const { matchedItem, childResources, displayResource, isUnrestricted } =
    useMemo(() => {
      if (!pathname) {
        return {
          matchedItem: null,
          childResources: [],
          displayResource: "",
          isUnrestricted: true,
        };
      }

      if (pathname === "/dashboard") {
        return {
          matchedItem: null,
          childResources: [],
          displayResource: "Tableau de bord",
          isUnrestricted: true,
        };
      }

      const segments = pathname.split("/").filter(Boolean);
      if (segments.length === 0) {
        return {
          matchedItem: null,
          childResources: [],
          displayResource: "",
          isUnrestricted: true,
        };
      }

      const firstSegment = segments[0];
      if (UNRESTRICTED_PAGES.has(firstSegment) && segments.length === 1) {
        return {
          matchedItem: null,
          childResources: [],
          displayResource: firstSegment,
          isUnrestricted: true,
        };
      }

      const { item, childResources: subResources } = matchNavigationItem(
        SIDEBAR_MODULES,
        pathname,
      );

      return {
        matchedItem: item,
        childResources: subResources,
        displayResource: item?.title || firstSegment,
        isUnrestricted: false,
      };
    }, [pathname]);

  const isPageAllowed = useMemo(() => {
    if (!user) return false;
    if (isUnrestricted) return true;

    const userHasFullAccess = user.permissions?.hasFullAccess ?? hasFullAccess;
    if (userHasFullAccess) return true;

    const allowedModules = user.permissions?.allowedModules || [];

    if (!matchedItem) {
      const firstSegment = pathname.split("/").filter(Boolean)[0];
      const matchedResource = Object.values(RESOURCE).find(
        (r) => r === firstSegment,
      );
      if (matchedResource) {
        return canAccess(allowedModules, matchedResource, userHasFullAccess);
      }
      return true;
    }

    if (matchedItem.resources && matchedItem.resources.length > 0) {
      const hasDirectAccess = matchedItem.resources.some((resource) =>
        canAccess(allowedModules, resource, userHasFullAccess),
      );
      if (hasDirectAccess) return true;

      if (childResources.length > 0) {
        return childResources.some((resource) =>
          canAccess(allowedModules, resource, userHasFullAccess),
        );
      }

      return false;
    }

    if (childResources.length > 0) {
      return childResources.some((resource) =>
        canAccess(allowedModules, resource, userHasFullAccess),
      );
    }

    return true;
  }, [
    user,
    hasFullAccess,
    isUnrestricted,
    matchedItem,
    childResources,
    pathname,
  ]);

  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader text="Initialisation de votre session..." fullScreen />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader text="Redirection vers la page de connexion..." fullScreen />
      </div>
    );
  }

  if (user.banned) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-card p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Compte Suspendu
            </h1>
            <p className="text-sm text-muted-foreground">
              L'accès à votre espace a été temporairement bloqué par la
              direction de l'établissement.
            </p>
          </div>

          {user.banReason && (
            <div className="rounded-lg border border-destructive/15 bg-destructive/5 p-4 text-left">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">
                Motif de la suspension
              </p>
              <p className="text-sm text-foreground/90">{user.banReason}</p>
            </div>
          )}

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full gap-2 border-border/80"
              onClick={() => logOut()}
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isPageAllowed) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/20 p-4">
        <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 shadow-lg text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/5">
            <ShieldX className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Accès Non Autorisé
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Votre rôle ou vos droits d'accès actuels ne vous permettent pas
              d'accéder à la ressource{" "}
              <span className="font-semibold text-foreground">
                {displayResource || pathname}
              </span>
              .
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-xs text-muted-foreground text-left space-y-1.5">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>Contrôle de sécurité {APP_NAME}</span>
            </div>
            <p>
              Pour solliciter l'ouverture de ce module, contactez
              l'administrateur de votre établissement.
            </p>
          </div>

          <div className="pt-2">
            <Button
              className="w-full gap-2"
              onClick={() => {
                router.push("/dashboard");
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Retourner au tableau de bord
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Fragment>{children}</Fragment>;
}
