import * as React from "react";
import Image, { type ImageProps, type StaticImageData } from "next/image";
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
