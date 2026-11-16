import * as React from "react";
import Image, { type ImageProps, type StaticImageData } from "next/image";

import { Spinner } from "@/components/ui/spinner";

import logoLight from "../../public/images/logo-light.png";
import logoDark from "../../public/images/logo-dark.png";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export interface ThemedImageProps extends Omit<ImageProps, "src"> {
  srcLight?: string | StaticImageData;
  srcDark?: string | StaticImageData;
  src?: string | StaticImageData;
}

export const ThemedImage = ({
  srcLight = logoLight,
  srcDark = logoDark,
  alt = APP_NAME,
  className,
  width,
  height,
  priority,
  style,
  ...props
}: ThemedImageProps) => {
  const isLightString = typeof srcLight === "string";
  const isDarkString = typeof srcDark === "string";

  return (
    <React.Fragment>
      <Image
        src={srcLight}
        alt={alt}
        {...(isLightString
          ? { width: width ?? 250, height: height ?? 100 }
          : {})}
        priority={priority}
        className={cn("block dark:hidden", className)}
        style={{ width: "auto", ...style }}
        {...props}
      />
      <Image
        src={srcDark}
        alt={alt}
        {...(isDarkString
          ? { width: width ?? 250, height: height ?? 100 }
          : {})}
        priority={priority}
        className={cn("hidden dark:block", className)}
        style={{ width: "auto", ...style }}
        {...props}
      />
    </React.Fragment>
  );
};

/**
 * Logo officiel de CareSys basculant automatiquement entre mode clair et mode sombre.
 */
export const Logo = ({
  className = "h-16 w-auto object-contain",
  alt = APP_NAME,
  priority = true,
  style,
  ...props
}: Partial<ThemedImageProps>) => {
  return (
    <ThemedImage
      srcLight={logoLight}
      srcDark={logoDark}
      alt={alt}
      className={className}
      priority={priority}
      style={{ width: "auto", ...style }}
      {...props}
    />
  );
};

export type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: LoaderSize;
  text?: React.ReactNode;
  fullScreen?: boolean;
  showTrack?: boolean;
  className?: string;
  spinnerClassName?: string;
  logoClassName?: string;
  theme?: "white" | "default";
}

const defaultSizeMap: Record<LoaderSize, string> = {
  xs: "size-7",
  sm: "size-14",
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
  theme = "default",
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
        <div className="flex items-center justify-center w-[44%] h-[44%]">
          <Logo
            className={cn(
              "w-full h-auto max-h-full max-w-full object-contain",
              logoClassName,
            )}
            priority
          />
        </div>
      </div>
      <Spinner
        className={cn(
          "size-full",
          theme === "default" ? "text-primary" : "text-white",
          spinnerClassName,
        )}
      />
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
