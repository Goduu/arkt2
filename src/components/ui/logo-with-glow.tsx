"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

type LogoWithGlowProps = {
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
};

const sizeClasses = {
  sm: "w-36 sm:w-48 md:w-64",
  md: "w-48 sm:w-64 md:w-80",
  lg: "w-48 sm:w-64 md:w-80 lg:w-96",
  xl: "w-64 sm:w-80 md:w-96 lg:w-[28rem]",
};

const sizeConfig = {
  sm: { width: 300, height: 112 },
  md: { width: 350, height: 131 },
  lg: { width: 400, height: 150 },
  xl: { width: 500, height: 187 },
};

/**
 * Reusable logo component with glow effect and hover animation
 * Used across loading, error, and other full-page layouts
 */
export function LogoWithGlow({ size = "md", animated = false }: LogoWithGlowProps) {
  const { resolvedTheme } = useTheme();
  const { width, height } = sizeConfig[size];
  const sizeClass = sizeClasses[size];

  return (
    <div className={animated ? "animate-pulse" : ""}>
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000 animate-pulse" />
        
        {/* Logo */}
        <div className="relative transform transition-transform duration-700 hover:scale-105">
          <Image
            src={`/logo-h-${resolvedTheme}.svg`}
            alt="ArkT"
            width={width}
            height={height}
            className={`${sizeClass} h-auto drop-shadow-2xl`}
            priority
          />
        </div>
      </div>
    </div>
  );
}
