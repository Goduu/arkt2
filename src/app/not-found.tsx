"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FullPageBackground } from "@/components/ui/full-page-background";
import { LogoWithGlow } from "@/components/ui/logo-with-glow";
import { ThemeAwareSkeleton } from "@/components/ui/theme-aware-skeleton";

export default function NotFound() {
  return (
    <ThemeAwareSkeleton>
      <FullPageBackground variant="error">
        {/* Logo container */}
        <div className="mb-8 sm:mb-12">
          <LogoWithGlow size="sm" />
        </div>

        {/* 404 Number with glitch effect */}
        <div className="relative mb-6 sm:mb-8">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-pulse">
            404
          </h1>
          {/* Glitch layers */}
          <h1 
            className="ml-0.5 absolute inset-0 text-7xl sm:text-8xl md:text-9xl font-bold text-destructive/20 animate-pulse [animation-delay:100ms]" 
            style={{ transform: 'translate(2px, 2px)' }}
          >
            404
          </h1>
        </div>

        {/* Message */}
        <div className="text-center mb-8 sm:mb-12 max-w-md">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 sm:mb-4 text-foreground">
            Page Not Found
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-4">
            Oops! The page you&apos;re looking for seems to have wandered off into the digital void. 
            Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto min-w-[160px] shadow-lg hover:shadow-xl transition-shadow">
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto min-w-[160px] shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => window.history.back()}
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </Button>
        </div>

        {/* Error code */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground/50 tracking-wider uppercase font-mono">
            Error Code: 404 • Page Not Found
          </p>
        </div>
      </FullPageBackground>
    </ThemeAwareSkeleton>
  );
}