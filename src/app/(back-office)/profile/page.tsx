import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserCircle2 } from "lucide-react";

import { Header } from "@/components/back-office/header";
import {
  ProfileSkeleton,
  ProfileView,
} from "@/components/back-office/profile/profile-view";

import { getSession } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { buildBreadcrumbs } from "@/lib/helper/breadcrumbs";

export const metadata: Metadata = {
  title: "Mon Profil",
  description: `Gérez vos informations personnelles, votre mot de passe, la double authentification (2FA) et vos sessions actives sur ${APP_NAME}.`,
};

export const instant = false;

async function ProfileData() {
  const { session, user } = await getSession();
  if (!user) redirect("/sign-in");

  return (
    <ProfileView initialUser={user} currentSessionToken={session?.token} />
  );
}

export default async function ProfilePage() {
  return (
    <div className="space-y-4">
      <Header
        title="Mon Profil & Sécurité du Compte"
        description="Gérez votre identité professionnelle, vos coordonnées, votre photo de profil et renforcez la sécurité de vos accès."
        icon={UserCircle2}
        breadcrumbs={buildBreadcrumbs("Mon profil")}
      />

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileData />
      </Suspense>
    </div>
  );
}
