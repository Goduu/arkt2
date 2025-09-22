import * as React from "react"

import { cn } from "@/lib/utils"
import { SketchyPanel, SketchyPanelProps } from "../sketchy/SketchyPanel";

type TextareaProps = React.ComponentProps<"textarea"> & SketchyPanelProps & {
  hideStroke?: boolean;
}
function Textarea({ className, hideStroke = false, ...props }: TextareaProps) {
  const { fillColor, strokeColor, strokeLineDash, strokeLineDashOffset, fillWeight, fillStyle, seed } = props

  if (hideStroke) {
    return (
      <div className="relative">
        <textarea
          data-slot="textarea"
          className={cn(
            "placeholder:text-muted-foreground focus-visible:ring-ring/0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/0 flex field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[0px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          {...props}
        />
      </div>
    )
  }

  return (
    <SketchyPanel
      strokeColor={strokeColor}
      fillColor={fillColor}
      strokeLineDash={strokeLineDash}
      strokeLineDashOffset={strokeLineDashOffset}
      fillWeight={fillWeight}
      fillStyle={fillStyle}
      seed={seed}
      className="p-0"
    >
      <div className="relative">
        <textarea
          data-slot="textarea"
          className={cn(
            "placeholder:text-muted-foreground focus-visible:ring-ring/0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/0 flex field-sizing-content min-h-16 w-full rounded-md bg-transparent text-base transition-[color,box-shadow] outline-none focus-visible:ring-[0px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          {...props}
        />
      </div>
    </SketchyPanel>
  )
}

export { Textarea }
