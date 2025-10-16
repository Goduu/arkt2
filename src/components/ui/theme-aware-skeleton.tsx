"use client";

import { useEffect, useState } from "react";

type ThemeAwareSkeletonProps = {
  children: React.ReactNode;
};

/**
 * Wrapper to prevent flash of wrong theme on client-side pages
 * Shows skeleton while theme is being resolved
 */
export function ThemeAwareSkeleton({ children }: ThemeAwareSkeletonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="h-16 w-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
