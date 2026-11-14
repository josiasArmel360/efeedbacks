"use client";

import React, { useState } from "react";
import { KeyRound, Laptop, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/tabs";

import { ProfileCard } from "./profile-card";
import { ProfileInfoForm } from "./profile-info-form";
import { ChangePasswordForm } from "./change-password-form";
import { SessionsManagementForm } from "./sessions-management-form";
import type { User } from "@/lib/types";

interface ProfileViewProps {
  initialUser: User;
  currentSessionToken?: string;
}

export const ProfileView = ({
  initialUser,
  currentSessionToken,
}: ProfileViewProps) => {
  const [user, setUser] = useState<User>(initialUser);

  const tabs = [
    {
      value: "profile",
      label: "Informations personnelles",
      icon: UserRound,
      content: <ProfileInfoForm user={user} onUserUpdated={setUser} />,
    },
    {
      value: "security",
      label: "Sécurité & Mot de passe",
      icon: KeyRound,
      content: <ChangePasswordForm />,
    },
    {
      value: "sessions",
      label: "Sessions actives",
      icon: Laptop,
      content: (
        <SessionsManagementForm currentSessionToken={currentSessionToken} />
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ================================================================== */}
      {/* COLONNE GAUCHE : CARTE IDENTITÉ, AVATAR & 2FA                      */}
      {/* ================================================================== */}
      <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
        <ProfileCard user={user} onUserUpdated={setUser} />
      </div>

      {/* ================================================================== */}
      {/* COLONNE DROITE : ONGLETS (INFOS, MOT DE PASSE, SESSIONS)           */}
      {/* ================================================================== */}
      <div className="lg:col-span-8">
        <Tabs defaultValue="profile" tabs={tabs} />
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-4">
        <Card className="overflow-hidden border-border/60 py-0 gap-0">
          <Skeleton className="h-28 w-full rounded-none" />
          <CardContent className="px-5 pb-6 pt-0 space-y-4">
            <div className="-mt-12 flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full ring-4 ring-background" />
              <Skeleton className="mt-3 h-5 w-40" />
              <Skeleton className="mt-1.5 h-3.5 w-28" />
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
            <Separator />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Separator />
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8 space-y-4">
        <Skeleton className="h-10 w-96 rounded-lg" />
        <Card className="border-border/60 py-0 gap-0">
          <CardHeader className="border-b border-border/50 px-6 py-4">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-3.5 w-80 mt-1" />
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
