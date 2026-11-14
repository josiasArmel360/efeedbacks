import React, { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";

import { AuthGuard } from "@/components/auth-guard";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Loader } from "@/components/loader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth";
import { resolveUserAccess } from "@/lib/db/queries/access-control/service";
import type { User } from "@/lib/types";
import { redirect } from "next/navigation";

export const instant = false;

function LayoutSkeleton() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader text="Chargement..." fullScreen />
    </div>
  );
}

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <PrivateShell>{children}</PrivateShell>
    </Suspense>
  );
}

async function PrivateShell({ children }: { children: ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/sign-in");

  const permissions = await resolveUserAccess({
    id: user.id,
    policyId: user.policyId,
    banned: user.banned,
  });

  const resolvedUser: User = {
    ...user,
    permissions,
  };

  const cookieStore = await cookies();
  const isOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <AuthGuard initialUser={resolvedUser}>
      <SidebarProvider defaultOpen={isOpen}>
        <Sidebar user={resolvedUser} />
        <SidebarInset className="flex flex-col min-h-screen bg-background">
          <Navbar user={resolvedUser} />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
