"use client";

import { useEffect, useState } from "react";

/**
 * Returns the appropriate meta key label based on the user's OS.
 * - macOS: "cmd"
 * - others: "ctr"
 */
export function useMetaKeyLabel(): "cmd" | "ctr" {
  const [label, setLabel] = useState<"cmd" | "ctr">("ctr");

  useEffect(() => {
    try {
      const platform = (navigator.platform || navigator.userAgent || "").toLowerCase();
      const isMac = platform.includes("mac");
      setLabel(isMac ? "cmd" : "ctr");
    } catch {
      setLabel("ctr");
    }
  }, []);

  return label;
}

export function useAltKeyLabel(): "alt" | "opt" {
  const [label, setLabel] = useState<"alt" | "opt">("opt");

  useEffect(() => {
    try {
      const platform = (navigator.platform || navigator.userAgent || "").toLowerCase();
      const isMac = platform.includes("mac");
      setLabel(isMac ? "opt" : "alt");
    } catch {
      setLabel("alt");
    }
  }, []);

  return label;
}


