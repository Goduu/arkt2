import * as React from "react";

import { cn } from "@/lib/utils";
import { SketchyPanel, SketchyPanelProps } from "../sketchy/SketchyPanel";
import { useElementSize } from "../sketchy/hooks/useElementSize";

type InputProps = React.ComponentProps<"input"> & SketchyPanelProps & {
  hideStroke?: boolean;
  'data-testid'?: string;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({
  hideStroke = false,
  strokeColor,
  fillColor,
  strokeLineDash,
  strokeLineDashOffset,
  fillWeight,
  fillStyle,
  seed,
  'data-testid': dataTestId,
  ...props
}: InputProps, forwardedRef) {

  if (hideStroke) {
    return <InputBase {...props} ref={forwardedRef} data-testid={dataTestId} />
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
        props.className,
        "py-2",
      )}
    >
      <InputBase {...props} ref={forwardedRef} data-testid={dataTestId} />
    </SketchyPanel>
  )
})

const InputBase = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function InputBase(props, forwardedRef) {
  const { ref } = useElementSize<HTMLInputElement>()
  const setRefs = React.useCallback((node: HTMLInputElement | null) => {
    // assign to internal measurement ref
    // then to forwarded ref
    // ensure both refs receive node
    ;(ref as React.MutableRefObject<HTMLInputElement | null>).current = node
    if (typeof forwardedRef === "function") {
      forwardedRef(node)
    } else if (forwardedRef) {
      ;(forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node
    }
  }, [ref, forwardedRef])
  return (
    <input
      ref={setRefs}
      type={props.type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/0 flex h-6 w-full min-w-0 bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:outline-none focus-visible:border-transparent focus-visible:ring-ring/0 focus-visible:ring-0 z-0",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "border-none outline-none box-shadow-none",
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
})

export { Input }
