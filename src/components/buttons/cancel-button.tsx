"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CancelButtonPropos {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "default" | "secondary" | "destructive" | "link";
}

export const CancelButton = ({
  onClick,
  disabled,
  label = "Annuler",
  className,
  size = "lg",
  variant = "outline",
}: CancelButtonPropos) => {
  const sizeClx = {
    sm: "h-7 text-sm",
    md: "h-8",
    lg: "h-9",
  };
  return (
    <Button
      variant={variant}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(sizeClx[size], className)}
    >
      {label}
    </Button>
  );
};
