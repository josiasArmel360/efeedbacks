"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  PanelLeftClose,
  Globe,
  Shield,
  UserRound,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { SwitchThemeButton } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials, UCFirst } from "@/lib/helper/utility";
import { APP_NAME } from "@/lib/constants";
import { User } from "@/lib/types";
import { logOut } from "@/lib/db/queries/auth/service";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  user: {
    policy?: User["policy"];
    name: string;
    image?: string | null;
  };
}

export const Navbar = ({ user }: Props) => {
  const { toggleSidebar, open } = useSidebar();
  const [hasShadow, setHasShadow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasShadow(window.scrollY >= 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "px-4 py-2 flex flex-row gap-3 items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-20 border-b border-border/40 transition-shadow",
        hasShadow && "shadow-xs",
      )}
    >
      {/* GAUCHE : Bouton Toggle Sidebar */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 shrink-0"
          title={open ? "Réduire le volet" : "Développer le volet"}
        >
          <PanelLeftClose
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              !open && "-rotate-180",
            )}
          />
        </Button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-foreground">
            {APP_NAME}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
            Administration
          </span>
        </div>
      </div>

      {/* DROITE : Thème, Lien Public & Profil */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/" target="_blank">
          <Button
            variant="outline"

            className="hidden md:flex text-xs text-muted-foreground gap-1.5"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Site public</span>
          </Button>
        </Link>

        <SwitchThemeButton />

        <UserMenu user={user} />
      </div>
    </nav>
  );
};

export const UserMenu = ({
  user,
}: {
  user: {
    image?: string | null;
    name: string;
    policy?: User["policy"];
  };
}) => {
  const router = useRouter();
  const { user: storeUser } = useAuth();
  const activeUser = storeUser ?? user;

  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success("Déconnexion réussie");
      router.replace("/sign-in");
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue lors de la déconnexion");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="px-2.5 h-9 gap-2">
            <Avatar className="h-6 w-6">
              {activeUser.image && <AvatarImage src={activeUser.image} />}
              <AvatarFallback className="uppercase text-[10px] font-bold">
                {getInitials(activeUser.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:inline-block max-w-28 truncate text-xs font-semibold">
              {UCFirst(activeUser.name)}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 border-b border-border/40 mb-1">
          <p className="text-xs font-bold text-foreground truncate">
            {UCFirst(activeUser.name)}
          </p>
          <p className="text-[11px] text-muted-foreground capitalize flex items-center gap-1 mt-0.5">
            <Shield className="h-3 w-3 text-primary" />
            <span>
              {activeUser.policy?.name || user.policy?.name || "Utilisateur"}
            </span>
          </p>
        </div>

        <DropdownMenuItem
          className="cursor-pointer text-xs flex items-center gap-2"
          render={<Link href="/profile" />}
        >
          <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Mon profil</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer text-xs flex items-center gap-2"
          render={<Link href="/settings/my-establishment" />}
        >
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Paramètres généraux</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer text-xs flex items-center gap-2"
          render={<Link href="/" target="_blank" />}
        >
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Aller à la page d'accueil</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          variant="destructive"
          className="cursor-pointer text-xs flex items-center gap-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
