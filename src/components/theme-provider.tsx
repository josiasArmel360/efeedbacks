"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ThemeProvider = ({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};

export const SwitchThemeButton = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  const isDarkTheme = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={!mounted}
      onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
      aria-label={
        !mounted
          ? "Chargement du thème"
          : isDarkTheme
            ? "Activer le mode clair"
            : "Activer le mode sombre"
      }
    >
      <Sun
        className={cn(
          "absolute h-5 w-5 transition-all duration-500",
          isDarkTheme
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100",
        )}
      />

      <Moon
        className={cn(
          "h-5 w-5 transition-all duration-500",
          isDarkTheme
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0",
        )}
      />
    </Button>
  );
};
