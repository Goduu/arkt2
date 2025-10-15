"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoadingPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="h-16 w-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-background via-muted/10 to-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      {/* Animated floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        
        {/* Logo container with scale animation */}
        <div className="mb-8 sm:mb-12 animate-pulse">
          <div className="relative group">
            {/* Glow effect - using multiple pulse for breathing effect */}
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000 animate-pulse" />
            
            {/* Logo with scale animation on hover */}
            <div className="relative transform transition-transform duration-700 hover:scale-105">
              <Image
                src={`/logo-h-${resolvedTheme}.svg`}
                alt="ArkT"
                width={400}
                height={150}
                className="w-48 sm:w-64 md:w-80 lg:w-96 h-auto drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Loading indicators */}
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          
          {/* Spinner - using Tailwind's animate-spin */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16">
            {/* Outer static ring */}
            <div className="absolute inset-0 rounded-full border-4 border-muted/40" />
            
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" />
            
            {/* Center pulsing dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
              <div className="absolute w-2 h-2 bg-primary rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground/70 tracking-wider uppercase">
            Preparing your workspace
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:200ms]" />
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:400ms]" />
        </div>
      </div>

    </div>
  );
}