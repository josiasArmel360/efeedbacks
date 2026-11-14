import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Logo } from "@/components/image";

export type LoaderSize = "sm" | "md" | "lg" | "xl";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: LoaderSize;
  text?: React.ReactNode;
  fullScreen?: boolean;
  showTrack?: boolean;
  className?: string;
  spinnerClassName?: string;
  logoClassName?: string;
}

const defaultSizeMap: Record<LoaderSize, string> = {
  sm: "size-16",
  md: "size-20",
  lg: "size-28",
  xl: "size-36",
};

export function Loader({
  size = "xl",
  text,
  fullScreen = false,
  showTrack = true,
  className,
  spinnerClassName,
  logoClassName,
  ...props
}: LoaderProps) {
  const circleSize = defaultSizeMap[size] ?? defaultSizeMap.lg;

  const loaderCircle = (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0",
        circleSize,
        className,
      )}
      {...props}
    >
      {/* Piste circulaire d'arrière-plan alignée avec le tracé SVG de Loader2Icon */}
      {showTrack && (
        <svg
          className="absolute inset-0 size-full text-primary/15 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
        </svg>
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="flex items-center justify-center w-[48%] h-[48%]">
          <Logo
            className={cn(
              "w-full h-auto max-h-full max-w-full object-contain",
              logoClassName,
            )}
            priority
          />
        </div>
      </div>
      <Spinner className={cn("size-full text-primary", spinnerClassName)} />
    </div>
  );

  if (!text && !fullScreen) {
    return loaderCircle;
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      {loaderCircle}
      {text && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}
