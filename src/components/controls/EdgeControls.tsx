"use client";

import { MarkerType, type EdgeMarker as XFlowEdgeMarker } from "@xyflow/react";
import { ColorSelector } from "./ColorSelector";
import { EdgeMarker as EdgeMarkerControl } from "./EdgeMarker";
import { FontSizeSelector } from "./FontSizeSelector";
import { colorToHex, TAILWIND_FILL_COLORS } from "../colors/utils";
import { ControlWrapper } from "./ControlWrapper";
import { EdgeTypeSelector } from "./EdgeTypeSelector";
import { StrokeWidth } from "./StrokeWidth";
import { useEdgeControls } from "../edges/ArktEdge/useEdgeControls";
import { Color } from "../colors/types";
import useEdgesStateSynced from "../yjs/useEdgesStateSynced";


export function EdgeControls() {
  const [edges,] = useEdgesStateSynced();
  const selectedEdges = edges.filter((edge) => edge.selected);
  const selectedEdge = selectedEdges[0];
  const { strokeColor, algorithm, strokeWidth, fontSize, labelFill, direction } = selectedEdge?.data || {};
  const { onEdgeUpdate,onEdgeMarkerChange } = useEdgeControls(selectedEdge?.id ?? "");

  if (!selectedEdges.length) return null;


  return (
    <ControlWrapper title="Edge options" testId="edge-options" selectedEdge={selectedEdges}>
      <div className="grid grid-cols-2 gap-4">
        <EdgeTypeSelector
          selectedStrokeType={algorithm}
          onChange={(algorithm) => onEdgeUpdate({ algorithm })}
        />
        <StrokeWidth onChange={(width) => onEdgeUpdate({ strokeWidth: width })} selectedWidth={strokeWidth ?? 2} />
        <EdgeMarkerControl
          value={direction ?? "none"}
          onChange={(dir) => {
            if (dir === null) return;
            onEdgeUpdate({ direction: dir })
            onEdgeMarkerChange(dir)
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

export const getDefaultMarker = (strokeColor: Color, theme?: string): XFlowEdgeMarker => {
  return {
    type: MarkerType.ArrowClosed,
    color: colorToHex(strokeColor, "#4b5563", theme),
    width: 15,
    height: 15,
  } satisfies XFlowEdgeMarker;
};
