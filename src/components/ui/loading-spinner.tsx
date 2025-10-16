/**
 * Loading spinner with pulsing center dot
 * Used in loading pages and loading states
 */
export function LoadingSpinner() {
  return (
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
  );
}
