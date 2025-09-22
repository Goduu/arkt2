import { Color, TailwindFamily, TailwindIndicative } from "./types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}


// Explicit list of supported Tailwind background color families for node fill selection
export const SUPPORTED_TAILWIND_FAMILIES = [
  "base",
  "white",
  "black",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

export const TAILWIND_STROKE_COLORS: TailwindFamily[] = [
  "black",
  "red",
  "green",
  "blue",
] as const;

export const TAILWIND_FILL_COLORS: TailwindFamily[] = [
  "white",
  "red",
  "green",
  "blue",
] as const;


// Legacy constants for backward compatibility (will be deprecated)
export const DEFAULT_STROKE_COLOR: Color = { family: "slate", indicative: "high" };
export const DEFAULT_FILL_COLOR: Color = { family: "base", indicative: "low" };
export const DEFAULT_HOVER_FILL_COLOR: Color = { family: "slate", indicative: "low" };


export const TAILWIND_TEXT_COLORS: TailwindFamily[] = [
  "white",
  "black",
  "slate",
  "amber",
  "cyan",
  "indigo",
  "zinc",
] as const;

export type TailwindShades = "300" | "500" | "700" | null;

function isDarkThemePreferred(theme?: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Prefer explicit theme parameter when provided
    if (theme === "dark") return true;
    if (theme === "light") return false;
    
    // Fallback to DOM detection
    if (typeof document !== "undefined" && document.documentElement) {
      if (document.documentElement.classList.contains("dark")) return true;
      if (document.documentElement.classList.contains("light")) return false;
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function shadeFromIndicative(indicative: TailwindIndicative | null | undefined, isDark: boolean): Exclude<TailwindShades, null> {
  if (!indicative) return "500";
  if (indicative === "middle") return "500";
  if (indicative === "high") return isDark ? "300" : "700";
  // low
  return isDark ? "700" : "300";
}

function resolveShade(color?: Color, theme?: string): TailwindShades {
  if (!color) return "500";
  const isDark = isDarkThemePreferred(theme);
  return shadeFromIndicative(color.indicative, isDark);
}

// Returns a concrete Tailwind class name. Using explicit literals ensures Tailwind can see and compile them.
export function getTailwindBgClass(color?: Color, theme?: string): string {
  if (!color) return "bg-white";
  const { family } = color;
  const shade = resolveShade(color, theme);
  if (family === "base") {
    const isDark = isDarkThemePreferred(theme);
    const indicative = color.indicative;
    // For base, pick white/black depending on indicative and theme
    // light: high -> black, low -> white, middle -> black
    // dark:  high -> white, low -> black, middle -> white
    if (!indicative || indicative === "middle") {
      return isDark ? "bg-neutral-500" : "bg-neutral-500";
    }
    if (indicative === "high") {
      return isDark ? "bg-neutral-800" : "bg-neutral-300";
    }
    // low
    return isDark ? "bg-neutral-300" : "bg-neutral-800";
  }
  if (family === "white") {
    return "bg-white";
  } else if (family === "black") {
    return "bg-black";
  }
  if (family === "slate") {
    if (shade === "300") return "bg-slate-300";
    if (shade === "500") return "bg-slate-500";
    return "bg-slate-700";
  } else if (family === "gray") {
    if (shade === "300") return "bg-gray-300";
    if (shade === "500") return "bg-gray-500";
    return "bg-gray-700";
  } else if (family === "zinc") {
    if (shade === "300") return "bg-zinc-300";
    if (shade === "500") return "bg-zinc-500";
    return "bg-zinc-700";
  } else if (family === "neutral") {
    if (shade === "300") return "bg-neutral-300";
    if (shade === "500") return "bg-neutral-500";
    return "bg-neutral-700";
  } else if (family === "stone") {
    if (shade === "300") return "bg-stone-300";
    if (shade === "500") return "bg-stone-500";
    return "bg-stone-700";
  } else if (family === "red") {
    if (shade === "300") return "bg-red-300";
    if (shade === "500") return "bg-red-500";
    return "bg-red-700";
  } else if (family === "orange") {
    if (shade === "300") return "bg-orange-300";
    if (shade === "500") return "bg-orange-500";
    return "bg-orange-700";
  } else if (family === "amber") {
    if (shade === "300") return "bg-amber-300";
    if (shade === "500") return "bg-amber-500";
    return "bg-amber-700";
  } else if (family === "yellow") {
    if (shade === "300") return "bg-yellow-300";
    if (shade === "500") return "bg-yellow-500";
    return "bg-yellow-700";
  } else if (family === "lime") {
    if (shade === "300") return "bg-lime-300";
    if (shade === "500") return "bg-lime-500";
    return "bg-lime-700";
  } else if (family === "green") {
      if (shade === "300") return "bg-green-300";
    if (shade === "500") return "bg-green-500";
    return "bg-green-700";
  } else if (family === "emerald") {
    if (shade === "300") return "bg-emerald-300";
    if (shade === "500") return "bg-emerald-500";
    return "bg-emerald-700";
  } else if (family === "teal") {
    if (shade === "300") return "bg-teal-300";
    if (shade === "500") return "bg-teal-500";
    return "bg-teal-700";
  } else if (family === "cyan") {
    if (shade === "300") return "bg-cyan-300";
    if (shade === "500") return "bg-cyan-500";
    return "bg-cyan-700";
  } else if (family === "sky") {
    if (shade === "300") return "bg-sky-300";
    if (shade === "500") return "bg-sky-500";
    return "bg-sky-700";
  } else if (family === "blue") {
    if (shade === "300") return "bg-blue-300";
    if (shade === "500") return "bg-blue-500";
    return "bg-blue-700";
  } else if (family === "indigo") {
    if (shade === "300") return "bg-indigo-300";
    if (shade === "500") return "bg-indigo-500";
    return "bg-indigo-700";
  } else if (family === "violet") {
    if (shade === "300") return "bg-violet-300";
    if (shade === "500") return "bg-violet-500";
    return "bg-violet-700";
  } else if (family === "purple") {
    if (shade === "300") return "bg-purple-300";
    if (shade === "500") return "bg-purple-500";
    return "bg-purple-700";
  } else if (family === "fuchsia") {
    if (shade === "300") return "bg-fuchsia-300";
    if (shade === "500") return "bg-fuchsia-500";
    return "bg-fuchsia-700";
  } else if (family === "pink") {
    if (shade === "300") return "bg-pink-300";
    if (shade === "500") return "bg-pink-500";
    return "bg-pink-700";
  } else if (family === "rose") {
    if (shade === "300") return "bg-rose-300";
    if (shade === "500") return "bg-rose-500";
    return "bg-rose-700";
  }
  // Default fallback
  if (shade === "300") return "bg-blue-300";
  if (shade === "500") return "bg-blue-500";
  return "bg-blue-700";
}

// Returns a concrete Tailwind text color class name using explicit literals.
export function getTailwindTextClass(color?: Color, theme?: string): string {
  if (!color) return "text-black";
  const { family } = color;
  const shade = resolveShade(color, theme);
  if (family === "base") {
    const isDark = isDarkThemePreferred(theme);
    const indicative = color.indicative;
    if (!indicative || indicative === "middle") {
      return isDark ? "text-white" : "text-black";
    }
    if (indicative === "high") {
      return isDark ? "text-white" : "text-black";
    }
    // low
    return isDark ? "text-black" : "text-white";
  }
  if (family === "white") {
    return "text-white";
  } else if (family === "black") {
    return "text-black";
  }
  if (family === "slate") {
    if (shade === "300") return "text-slate-300";
    if (shade === "500") return "text-slate-500";
    return "text-slate-700";
  } else if (family === "gray") {
    if (shade === "300") return "text-gray-300";
    if (shade === "500") return "text-gray-500";
    return "text-gray-700";
  } else if (family === "zinc") {
    if (shade === "300") return "text-zinc-300";
    if (shade === "500") return "text-zinc-500";
    return "text-zinc-700";
  } else if (family === "neutral") {
    if (shade === "300") return "text-neutral-300";
    if (shade === "500") return "text-neutral-500";
    return "text-neutral-700";
  } else if (family === "stone") {
    if (shade === "300") return "text-stone-300";
    if (shade === "500") return "text-stone-500";
    return "text-stone-700";
  } else if (family === "red") {
    if (shade === "300") return "text-red-300";
    if (shade === "500") return "text-red-500";
    return "text-red-700";
  } else if (family === "orange") {
    if (shade === "300") return "text-orange-300";
    if (shade === "500") return "text-orange-500";
    return "text-orange-700";
  } else if (family === "amber") {
    if (shade === "300") return "text-amber-300";
    if (shade === "500") return "text-amber-500";
    return "text-amber-700";
  } else if (family === "yellow") {
    if (shade === "300") return "text-yellow-300";
    if (shade === "500") return "text-yellow-500";
    return "text-yellow-700";
  } else if (family === "lime") {
    if (shade === "300") return "text-lime-300";
    if (shade === "500") return "text-lime-500";
    return "text-lime-700";
  } else if (family === "green") {
    if (shade === "300") return "text-green-300";
    if (shade === "500") return "text-green-500";
    return "text-green-700";
  } else if (family === "emerald") {
    if (shade === "300") return "text-emerald-300";
    if (shade === "500") return "text-emerald-500";
    return "text-emerald-700";
  } else if (family === "teal") {
      if (shade === "300") return "text-teal-300";
    if (shade === "500") return "text-teal-500";
    return "text-teal-700";
  } else if (family === "cyan") {
    if (shade === "300") return "text-cyan-300";
    if (shade === "500") return "text-cyan-500";
    return "text-cyan-700";
  } else if (family === "sky") {
    if (shade === "300") return "text-sky-300";
    if (shade === "500") return "text-sky-500";
    return "text-sky-700";
  } else if (family === "blue") {
    if (shade === "300") return "text-blue-300";
    if (shade === "500") return "text-blue-500";
    return "text-blue-700";
  } else if (family === "indigo") {
    if (shade === "300") return "text-indigo-300";
    if (shade === "500") return "text-indigo-500";
    return "text-indigo-700";
  } else if (family === "violet") {
    if (shade === "300") return "text-violet-300";
    if (shade === "500") return "text-violet-500";
    return "text-violet-700";
  } else if (family === "purple") {
    if (shade === "300") return "text-purple-300";
    if (shade === "500") return "text-purple-500";
    return "text-purple-700";
  } else if (family === "fuchsia") {
    if (shade === "300") return "text-fuchsia-300";
    if (shade === "500") return "text-fuchsia-500";
    return "text-fuchsia-700";
  } else if (family === "pink") {
    if (shade === "300") return "text-pink-300";
    if (shade === "500") return "text-pink-500";
    return "text-pink-700";
  } else if (family === "rose") {
    if (shade === "300") return "text-rose-300";
    if (shade === "500") return "text-rose-500";
    return "text-rose-700";
  }
  if (shade === "300") return "text-blue-300";
  if (shade === "500") return "text-blue-500";
  return "text-blue-700";
}

// Returns a concrete Tailwind border color class name using explicit literals.
export function getTailwindBorderClass(color?: Color, theme?: string): string {
  if (!color) return "border-black";
  const { family } = color;
  const shade = resolveShade(color, theme);
  if (family === "base") {
    const isDark = isDarkThemePreferred(theme);
    const indicative = color.indicative;
    if (!indicative || indicative === "middle") {
      return isDark ? "border-white" : "border-black";
    }
    if (indicative === "high") {
      return isDark ? "border-white" : "border-black";
    }
    // low
    return isDark ? "border-black" : "border-white";
  }
  if (family === "slate") {
      if (shade === "300") return "border-slate-300";
    if (shade === "500") return "border-slate-500";
    return "border-slate-700";
  } else if (family === "gray") {
    if (shade === "300") return "border-gray-300";
    if (shade === "500") return "border-gray-500";
    return "border-gray-700";
  } else if (family === "zinc") {
    if (shade === "300") return "border-zinc-300";
    if (shade === "500") return "border-zinc-500";
    return "border-zinc-700";
  } else if (family === "neutral") {
    if (shade === "300") return "border-neutral-300";
    if (shade === "500") return "border-neutral-500";
    return "border-neutral-700";
  } else if (family === "stone") {
    if (shade === "300") return "border-stone-300";
    if (shade === "500") return "border-stone-500";
    return "border-stone-700";
  } else if (family === "red") {
    if (shade === "300") return "border-red-300";
    if (shade === "500") return "border-red-500";
    return "border-red-700";
  } else if (family === "orange") {
    if (shade === "300") return "border-orange-300";
    if (shade === "500") return "border-orange-500";
    return "border-orange-700";
  } else if (family === "amber") {
    if (shade === "300") return "border-amber-300";
    if (shade === "500") return "border-amber-500";
    return "border-amber-700";
  } else if (family === "yellow") {
    if (shade === "300") return "border-yellow-300";
    if (shade === "500") return "border-yellow-500";
    return "border-yellow-700";
  } else if (family === "lime") {
    if (shade === "300") return "border-lime-300";
    if (shade === "500") return "border-lime-500";
    return "border-lime-700";
  } else if (family === "green") {
    if (shade === "300") return "border-green-300";
    if (shade === "500") return "border-green-500";
    return "border-green-700";
  } else if (family === "emerald") {
    if (shade === "300") return "border-emerald-300";
    if (shade === "500") return "border-emerald-500";
    return "border-emerald-700";
  } else if (family === "teal") {
      if (shade === "300") return "border-teal-300";
    if (shade === "500") return "border-teal-500";
    return "border-teal-700";
  } else if (family === "cyan") {
    if (shade === "300") return "border-cyan-300";
    if (shade === "500") return "border-cyan-500";
    return "border-cyan-700";
  } else if (family === "sky") {
    if (shade === "300") return "border-sky-300";
    if (shade === "500") return "border-sky-500";
    return "border-sky-700";
  } else if (family === "blue") {
    if (shade === "300") return "border-blue-300";
    if (shade === "500") return "border-blue-500";
    return "border-blue-700";
  } else if (family === "indigo") {
    if (shade === "300") return "border-indigo-300";
    if (shade === "500") return "border-indigo-500";
    return "border-indigo-700";
  } else if (family === "violet") {
    if (shade === "300") return "border-violet-300";
    if (shade === "500") return "border-violet-500";
    return "border-violet-700";
  } else if (family === "purple") {
    if (shade === "300") return "border-purple-300";
    if (shade === "500") return "border-purple-500";
    return "border-purple-700";
  } else if (family === "fuchsia") {
    if (shade === "300") return "border-fuchsia-300";
    if (shade === "500") return "border-fuchsia-500";
    return "border-fuchsia-700";
  } else if (family === "pink") {
    if (shade === "300") return "border-pink-300";
    if (shade === "500") return "border-pink-500";
    return "border-pink-700";
  } else if (family === "rose") {
    if (shade === "300") return "border-rose-300";
    if (shade === "500") return "border-rose-500";
    return "border-rose-700";
  }
  if (shade === "300") return "border-blue-300";
  if (shade === "500") return "border-blue-500";
  return "border-blue-700";
}


// Deterministic Tailwind color mapping for the families and shades we support.
// Avoids DOM style probing and works in any rendering context.
export const TAILWIND_HEX: Record<string, { 300: string; 500: string; 700: string }> = {
  base: { 300: "#ffffff", 500: "#111827", 700: "#000000" },
  slate: { 300: "#cbd5e1", 500: "#64748b", 700: "#334155" },
  gray: { 300: "#d1d5db", 500: "#6b7280", 700: "#374151" },
  zinc: { 300: "#d4d4d8", 500: "#71717a", 700: "#3f3f46" },
  neutral: { 300: "#d4d4d4", 500: "#737373", 700: "#404040" },
  stone: { 300: "#d6d3d1", 500: "#78716c", 700: "#44403c" },
  red: { 300: "#fca5a5", 500: "#ef4444", 700: "#b91c1c" },
  orange: { 300: "#fdba74", 500: "#f97316", 700: "#c2410c" },
  amber: { 300: "#fcd34d", 500: "#f59e0b", 700: "#b45309" },
  yellow: { 300: "#fde047", 500: "#eab308", 700: "#a16207" },
  lime: { 300: "#bef264", 500: "#84cc16", 700: "#4d7c0f" },
  green: { 300: "#86efac", 500: "#22c55e", 700: "#15803d" },
  emerald: { 300: "#6ee7b7", 500: "#10b981", 700: "#047857" },
  teal: { 300: "#5eead4", 500: "#14b8a6", 700: "#0f766e" },
  cyan: { 300: "#67e8f9", 500: "#06b6d4", 700: "#0e7490" },
  sky: { 300: "#7dd3fc", 500: "#0ea5e9", 700: "#0369a1" },
  blue: { 300: "#93c5fd", 500: "#3b82f6", 700: "#1d4ed8" },
  indigo: { 300: "#a5b4fc", 500: "#6366f1", 700: "#4338ca" },
  violet: { 300: "#c4b5fd", 500: "#8b5cf6", 700: "#6d28d9" },
  purple: { 300: "#d8b4fe", 500: "#a855f7", 700: "#7e22ce" },
  fuchsia: { 300: "#f0abfc", 500: "#d946ef", 700: "#a21caf" },
  pink: { 300: "#f9a8d4", 500: "#ec4899", 700: "#be185d" },
  rose: { 300: "#fda4af", 500: "#f43f5e", 700: "#be123c" },
};

export function colorToHex(c?: Color, fallback: string = "#ffffff", theme?: string): string {
  if (!c) return fallback;

  const family = (c.family || "").toLowerCase();
  if (family === "base") {
    const isDark = isDarkThemePreferred(theme);
    const indicative = c.indicative;
    if (!indicative || indicative === "middle") return isDark ? "#ffffff" : "#000000";
    if (indicative === "high") return isDark ? "#ffffff" : "#000000";
    // low
    return isDark ? "#000000" : "#ffffff";
  }
  if (family === "white") return "#ffffff";
  if (family === "black") return "#000000";

  const computedShade = resolveShade(c, theme) ?? "500";
  const palette = TAILWIND_HEX[family];

  if (!palette) return fallback;
  return palette[computedShade] || fallback;
}
