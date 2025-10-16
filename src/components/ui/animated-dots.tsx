/**
 * Animated decorative dots
 * Used in loading and error pages to add visual interest
 */
export function AnimatedDots() {
  return (
    <div className="flex gap-2">
      <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
      <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:200ms]" />
      <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:400ms]" />
    </div>
  );
}
