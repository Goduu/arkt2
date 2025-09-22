"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import SketchyShape from "@/components/sketchy/SketchyShape";
import { TemplateIcon } from "@/components/templates/TemplateIcon";
import { TemplateData } from "./types";
import { useTheme } from "next-themes";
import { getTailwindTextClass } from "../colors/utils";

type TemplatePreviewProps = Omit<TemplateData, "id" | "updatedAt">

export function TemplatePreview(props: TemplatePreviewProps): React.JSX.Element {

  const { theme } = useTheme();
  const textColorClass = getTailwindTextClass(props.strokeColor, theme);

  return (
    <div
      className={cn(
        "relative w-32 h-16",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 w-full z-20 h-full text-sm px-3 py-5 font-medium whitespace-pre-wrap break-words select-none truncate",
          textColorClass
        )}
      >
        {props.name}
      </div>
      {props.iconKey && (
        <div className={cn("absolute z-10 -top-2 left-1/2 -translate-x-1/2")}>
          <TemplateIcon
            className="size-6"
            iconKey={props.iconKey}
            strokeColor={props.strokeColor}
            fillColor={props.fillColor}
          />
        </div>
      )}

      <SketchyShape
        kind="rectangle"
        className={cn(
          "absolute inset-0 pointer-events-none z-0",
        )}
        width={180}
        height={90}
        fillColor={props.fillColor}
        strokeColor={props.strokeColor}
        strokeWidth={2}
        roughness={1.7}
        fillStyle="hachure"
        seed={props.name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)}
      />
    </div>
  );
}
