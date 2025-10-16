"use client";

import { FullPageBackground } from "@/components/ui/full-page-background";
import { LogoWithGlow } from "@/components/ui/logo-with-glow";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AnimatedDots } from "@/components/ui/animated-dots";
import { ThemeAwareSkeleton } from "@/components/ui/theme-aware-skeleton";

export default function LoadingPage() {
  return (
    <ThemeAwareSkeleton>
      <FullPageBackground>
        {/* Logo container with scale animation */}
        <div className="mb-8 sm:mb-12">
          <LogoWithGlow size="lg" animated />
        </div>

        {/* Loading indicators */}
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <LoadingSpinner />
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground/70 tracking-wider uppercase">
            Preparing your workspace
          </p>
        </div>

        <div className="mt-6">
          <AnimatedDots />
        </div>
      </FullPageBackground>
    </ThemeAwareSkeleton>
  );
}