"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FullPageBackground } from "@/components/ui/full-page-background";
import { LogoWithGlow } from "@/components/ui/logo-with-glow";
import { ThemeAwareSkeleton } from "@/components/ui/theme-aware-skeleton";
import { AnimatedDots } from "@/components/ui/animated-dots";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <ThemeAwareSkeleton>
      <FullPageBackground variant="error">
        {/* Logo container */}
        <div className="mb-8 sm:mb-12">
          <LogoWithGlow size="sm" />
        </div>

        {/* Error icon with animation */}
        <div className="mb-6 sm:mb-8">
          <div className="relative">
            {/* Pulsing background */}
            <div className="absolute inset-0 -m-4 bg-destructive/10 rounded-full blur-xl animate-pulse" />
            
            {/* Error icon */}
            <div className="relative">
              <svg
                className="w-20 h-20 sm:w-24 sm:h-24 text-destructive/80 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-8 sm:mb-12 max-w-lg px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-destructive via-destructive/80 to-destructive/60 bg-clip-text text-transparent">
            Oops!
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
            We encountered an unexpected error. Don&apos;t worry, our team has been notified and we&apos;re working on it.
          </p>

          {/* Error details for development */}
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mt-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="text-xs font-mono text-destructive/80 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
          <Button
            size="lg"
            onClick={reset}
            className="w-full sm:w-auto min-w-[160px] shadow-lg hover:shadow-xl transition-shadow"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </Button>
          <Link href="/">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto min-w-[160px] shadow-lg hover:shadow-xl transition-shadow"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </Button>
          </Link>
        </div>

        {/* Decorative dots */}
        <div className="mt-6">
          <AnimatedDots />
        </div>

        {/* Error code */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground/50 tracking-wider uppercase font-mono">
            Error • Something Went Wrong
          </p>
        </div>
      </FullPageBackground>
    </ThemeAwareSkeleton>
  );
}
