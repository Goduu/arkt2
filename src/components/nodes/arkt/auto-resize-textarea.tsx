"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import useNodesStateSynced from "@/components/yjs/useNodesStateSynced";
import { NODE_MIN_HEIGHT, NODE_MIN_WIDTH } from "./utils";

type AutoResizeTextareaProps = {
  nodeId: string;
  className?: string;
  value: string;
  disabled?: boolean;
  onChange: (next: string) => void;
  onBlur?: () => void;
  readOnly?: boolean;
  tabIndex?: number;
  /** Called with the required content box size (including provided padding classes) */
  onSizeChange?: (size: { width: number; height: number }) => void;
  /** Tailwind padding classes to be applied around the textarea and included in measurement (e.g., "px-3 py-2"). */
  paddingClassName?: string;
  /** Minimum content box size (including padding) */
  minWidth?: number;
  minHeight?: number;
  /** Inline style applied to the inner textarea (e.g., to control font size). */
  style?: React.CSSProperties;
};

/**
 * Multiline textarea that auto-measures its content off-screen and reports the
 * required width/height via onSizeChange. Measurement uses a mirrored element
 * with white-space: pre to respect explicit line breaks without wrapping.
 */
export function AutoResizeTextarea(props: AutoResizeTextareaProps): React.JSX.Element {
  const { nodeId, className, disabled, value, onChange, onBlur, readOnly, tabIndex, paddingClassName, minWidth = 20, minHeight = 20, style } = props;
  const [nodes, setNodes,] = useNodesStateSynced();

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const lastSizeRef = React.useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  // Auto-size the textarea itself and report required size to parent
  React.useLayoutEffect(() => {
    const ta = textareaRef.current;
    const wrap = wrapperRef.current;
    if (!ta || !wrap) return;

    // Prevent internal scrolling and expand height to fit content
    ta.style.height = "auto";
    ta.style.overflowY = "hidden";
    ta.style.height = `${ta.scrollHeight}px`;

    const styles = window.getComputedStyle(wrap);
    const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

    const requiredWidth = Math.ceil(ta.scrollWidth + paddingX);
    const requiredHeight = Math.ceil(ta.scrollHeight + paddingY);

    const width = Math.max(minWidth, requiredWidth);
    const height = Math.max(minHeight, requiredHeight);
    const last = lastSizeRef.current;
    if (width !== last.width || height !== last.height) {
      lastSizeRef.current = { width: width, height: height };
      const currentNode = nodes.find(node => node.id === nodeId);
      const currentWidth = currentNode?.style?.width as number | undefined;
      const currentHeight = currentNode?.style?.height as number | undefined;
      const nextWidth = Math.max(NODE_MIN_WIDTH, width);
      const nextHeight = Math.max(NODE_MIN_HEIGHT, height);
      const shouldUpdate = (typeof currentWidth !== 'number' || nextWidth > currentWidth) || (typeof currentHeight !== 'number' || nextHeight > currentHeight);
      if (!shouldUpdate) return;
      setNodes((nodes) => nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            width: nextWidth,
            height: nextHeight,
            style: { ...node.style, width: nextWidth, height: nextHeight }
          };
        }
        return node;
      }));

    }
  }, [value, minWidth, minHeight, nodes]);

  return (
    <>
      {/* Visible editor */}
      <div ref={wrapperRef} className={cn("relative", paddingClassName)}>
        <Textarea
          name="auto-resize-textarea"
          data-testid="auto-resize-textarea"
          hideStroke
          className={cn(
            "w-full bg-transparent outline-none text-sm font-medium resize-none",
            className,
          )}
          style={style}
          disabled={disabled}
          ref={textareaRef}
          value={value}
          readOnly={readOnly}
          tabIndex={tabIndex}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          spellCheck={false}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          rows={1}
        />
      </div>
    </>
  );
}

export default AutoResizeTextarea;


