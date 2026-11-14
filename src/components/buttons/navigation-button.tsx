"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const NavigationButton = () => {
  const router = useRouter();
  const pathname = usePathname();

  // On cache le bouton retour si on est sur le menu principal
  const hideBackButton =
    pathname === "/admin/dashboard" ||
    pathname === "/dashboard" ||
    pathname === "/owner/dashboard" ||
    pathname === "/client/dashboard";

  if (hideBackButton) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs"
      onClick={() => router.back()}
    >
      <ChevronLeft className="h-3.5 w-3.5" />
      Retour
    </Button>
  );
};
