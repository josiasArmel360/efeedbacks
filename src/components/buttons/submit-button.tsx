import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader } from "../image";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export const SubmitButton = ({
  isLoading = false,
  children,
  disabled,
  className,
  size = "lg",
  ...props
}: SubmitButtonProps) => {
  return (
    <Button
      disabled={isLoading || disabled}
      type="submit"
      {...props}
      className={cn(
        "text-base font-bold transition-all duration-300",
        size === "sm" && "h-7 text-sm",
        size === "md" && "h-8 text-base",
        size === "lg" && "h-9 text-base",
        className,
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader size="xs" theme="white" />
          <span>Patientez…</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
};
