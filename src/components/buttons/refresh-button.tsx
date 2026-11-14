"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onClick: () => Promise<void>;
}

export const RefreshButton = ({ onClick }: RefreshButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      className={cn("bg-emerald-200/70 hover:bg-emerald-400/50")}
    >
      <RefreshCw
        className={cn("h-3.5 w-3.5 mr-1", isLoading && "animate-spin")}
      />

      {isLoading ? "Rafraichissement..." : "Rafraichir les données"}
    </Button>
  );
};
