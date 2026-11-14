import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface AsyncButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: ReactNode;
}

export const AsyncButton = ({
  isLoading = false,
  children,
  disabled,
  className,
  size = "lg",
  ...props
}: AsyncButtonProps) => {
  return (
    <Button
      disabled={isLoading || disabled}
      {...props}
      className={cn(
        "text-base font-bold transition-all active:scale-[0.98] shadow-lg shadow-primary/20",
        size === "sm" && "h-8 text-sm",
        size === "md" && "h-9 text-base",
        size === "lg" && "h-10 text-base",
        className,
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner />
          <span>Patientez…</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
};
