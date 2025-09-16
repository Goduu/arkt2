import * as React from "react";

import { cn } from "@/lib/utils";
import { SketchyPanel, SketchyPanelProps } from "../sketchy/SketchyPanel";
import { useElementSize } from "../sketchy/hooks/useElementSize";

type InputProps = React.ComponentProps<"input"> & SketchyPanelProps & {
  hideStroke?: boolean;
}
function Input({
  hideStroke = false,
  strokeColor,
  fillColor,
  strokeLineDash,
  strokeLineDashOffset,
  fillWeight,
  fillStyle,
  seed,
  ...props
}: InputProps) {

  if (hideStroke) {
    return <InputBase {...props} />
  }

  return (
    <SketchyPanel
      hoverEffect
      strokeColor={strokeColor}
      fillColor={fillColor}
      strokeLineDash={strokeLineDash}
      strokeLineDashOffset={strokeLineDashOffset}
      fillWeight={fillWeight}
      fillStyle={fillStyle}
      seed={seed}
      {...props}
      className={cn(
        "scrollbar-hide",
        props.className ? `p-0 ${props.className}` : "p-0"
      )}
    >
      <InputBase {...props} />
    </SketchyPanel>
  )
}

const InputBase = (props: React.ComponentProps<"input">) => {
  const { ref } = useElementSize<HTMLInputElement>()
  return (
    <input
      ref={ref}
      type={props.type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/0 flex h-6 w-full min-w-0 bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:outline-none focus-visible:border-transparent focus-visible:ring-ring/0 focus-visible:ring-0 z-0",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "border-none outline-none box-shadow-none scrollbar-hide",
        props.className
      )}
      style={{
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        paddingLeft: 2,
        paddingRight: 2,
        paddingTop: 1,
        paddingBottom: 1,
        ...props.style
      }}
      {...props}
    />
  )
}

export { Input }
