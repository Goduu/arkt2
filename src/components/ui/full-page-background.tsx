import { ReactNode } from "react";

type FullPageBackgroundProps = {
  children: ReactNode;
  variant?: "default" | "error";
};

/**
 * Reusable full-page background with gradient, floating orbs, and grid pattern
 * Used in loading and error pages
 */
export function FullPageBackground({ children, variant = "default" }: FullPageBackgroundProps) {
  const secondOrbColor = variant === "error" ? "bg-destructive/10" : "bg-accent/10";

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-background via-muted/10 to-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      {/* Animated floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className={`absolute bottom-1/3 right-1/3 w-80 h-80 ${secondOrbColor} rounded-full blur-3xl animate-pulse delay-1000`} />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
