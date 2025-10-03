"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Color, DEFAULT_BUTTON_FILL_COLOR } from "../colors/types";
import { useElementSize } from "../sketchy/hooks/useElementSize";
import SketchyShape from "../sketchy/SketchyShape";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-transparent text-foreground",
        outline:
          "bg-transparent text-foreground",
        ghost: "bg-transparent text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        destructive: "text-white text-bold dark:text-white",
        gradient:
          "text-black shadow",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  fillColor?: Color;
  fillStyle?: "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots" | "dashed" | "zigzag-line";
  strokeColor?: Color;
  fillWeight?: number;
}

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size, fillWeight, fillColor = DEFAULT_BUTTON_FILL_COLOR, fillStyle = "dots", strokeColor, ...props }, ref) => {
    const { ref: sizeRef, size: elementSize } = useElementSize<HTMLButtonElement>();
    const [hovered, setHovered] = React.useState(false);

    return (
      <button
        className={cn(
          "relative overflow-visible z-10",
          buttonVariants({ variant, size }),
          className
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        ref={(node) => {
          if (typeof ref === "function") ref(node as HTMLButtonElement);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          (sizeRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        {...props}
      >
        {props.children}

        {elementSize.width > 0 && elementSize.height > 0 && (
          <div className="pointer-events-none absolute inset-0 -z-10">
            {variant === "default" && (
              <SketchyShape
                kind="rectangle"
                width={elementSize.width}
                height={elementSize.height}
                strokeColor={strokeColor}
                strokeWidth={2}
                fillStyle={fillStyle}
                fillColor={fillColor}
                fillWeight={fillWeight}
                borderInset={0}
                seed={hovered ? 2 : 1}
              />
            )}
            {variant === "outline" && (
              <SketchyShape
                kind="rectangle"
                width={elementSize.width}
                height={elementSize.height}
                strokeColor={strokeColor}
                strokeWidth={2}
                fillWeight={fillWeight}
                borderInset={0}
                seed={hovered ? 2 : 1}
              />
            )}
            {variant === "ghost" && hovered && (
              <SketchyShape
                kind="rectangle"
                width={elementSize.width}
                height={elementSize.height}
                strokeColor={strokeColor}
                fillStyle={fillStyle}
                fillColor={hovered ? fillColor : undefined}
                strokeWidth={0}
                fillWeight={fillWeight ?? 0.1}
                borderInset={0}
                seed={hovered ? 2 : 1}
              />
            )}
            {variant === "gradient" && (
              <SketchyShape
                kind="rectangle"
                width={elementSize.width}
                height={elementSize.height}
                strokeColor={strokeColor}
                strokeWidth={2}
                fillStyle={fillStyle}
                fillColor={fillColor}
                fillWeight={fillWeight}
                borderInset={0}
                seed={hovered ? 2 : 1}
              />
            )}
            {variant === "destructive" && (
              <SketchyShape
                kind="rectangle"
                width={elementSize.width}
                height={elementSize.height}
                strokeColor={{ family: "red", indicative: "high" }}
                strokeWidth={2}
                fillStyle="dots"
                fillWeight={fillWeight ?? 2.5}
                fillColor={{ family: "red", indicative: "low" }}
                borderInset={0}
                seed={hovered ? 2 : 1}
              />
            )}
          </div>
        )}

      </button>
    );
  }
);
ButtonComponent.displayName = "Button";

export const Button = React.memo(ButtonComponent);


