"use client";

import { MarkerType } from "@xyflow/react";
import { ColorSelector } from "./ColorSelector";
import { EdgeMarker } from "./EdgeMarker";
import { FontSizeSelector } from "./FontSizeSelector";
import { colorToHex, DEFAULT_STROKE_COLOR, TAILWIND_FILL_COLORS } from "../colors/utils";
import { ControlWrapper } from "./ControlWrapper";
import { EdgeTypeSelector } from "./EdgeTypeSelector";
import { StrokeWidth } from "./StrokeWidth";
import { ArktEdge } from "../edges/ArktEdge/type";
import { useEdgeControls } from "../edges/ArktEdge/useEdgeControls";
import { Color } from "../colors/types";

type Props = {
  selectedEdges: ArktEdge[];
  onChange: (edge: ArktEdge) => void;
};

export function EdgeControls({ selectedEdges, onChange }: Props) {
  const { strokeColor, algorithm, strokeWidth, fontSize, labelFill } = selectedEdges[0]?.data || {};
  const { markerStart, markerEnd } = selectedEdges[0] ?? {};
  const { onEdgeUpdate } = useEdgeControls(selectedEdges[0]?.id ?? "");

  const commitMarkers = (direction: "start" | "end" | "both" | "") => {
    if (!selectedEdges) return;

    const next: ArktEdge = {
      ...selectedEdges[0],
      markerStart: (direction === "start" || direction === "both") ?
        getDefaultMarker(strokeColor ?? DEFAULT_STROKE_COLOR) : undefined,
      markerEnd: (direction === "end" || direction === "both") ?
        getDefaultMarker(strokeColor ?? DEFAULT_STROKE_COLOR) : undefined,
    };
    onChange(next);
  };

  if (!selectedEdges.length) return null;


  return (
    <ControlWrapper title="Edge options" testId="edge-options">
      <div className="grid grid-cols-2 gap-4">
        <EdgeTypeSelector
          selectedStrokeType={algorithm}
          onChange={() => { }}
        />
        <StrokeWidth onChange={(width) => onEdgeUpdate({ strokeWidth: width })} selectedWidth={strokeWidth ?? 2} />
        <EdgeMarker
          value={markerStart && markerEnd ? "both" : markerStart ? "start" : markerEnd ? "end" : ""}
          onChange={(dir) => {
            if (dir === null) return;
            commitMarkers(dir);
          }}
        />
        {/* TODO: separate animated to another component
        <StrokeType value={[form ? "dashed" : null, animated ? "animated" : null].filter((v): v is string => typeof v === "string")}
          onChange={(values: string[]) => {
            commit({ form: values.includes("dashed") ? "dashed" : "solid", animated: values.includes("animated") })
          }}
        /> */}

      </div>
      <div className="flex flex-col gap-3">
        <div data-testid="edge-colors-group">
          <ColorSelector
            label="Stroke color"
            value={strokeColor}
            indicative={"high"}
            onChange={(color) => { onEdgeUpdate({ strokeColor: color }) }}
          />

        </div>
      </div>
      <div data-testid="edge-label-bg-group">
        <ColorSelector
          label="Label Fill"
          value={labelFill}
          indicative={"low"}
          defaultOptions={TAILWIND_FILL_COLORS}
          onChange={(color) => { onEdgeUpdate({ labelFill: color }); }}
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <div>
          <FontSizeSelector selectedFontSize={fontSize ?? 15}
            onChange={(v) => onEdgeUpdate({ fontSize: v })} />
        </div>
      </div>
    </ControlWrapper>

  );
}

export const getDefaultMarker = (strokeColor: Color) => {
  return {
    type: MarkerType.ArrowClosed,
    color: colorToHex(strokeColor, "#4b5563"),
    width: 15,
    height: 15,
  };
};
