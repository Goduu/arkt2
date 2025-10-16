import { Fragment, useRef, useState } from 'react';
import {
  BaseEdge, useStore,
  useInternalNode, type EdgeProps
} from '@xyflow/react';

import { ControlPoint } from './ControlPoint';
import { getPath, getControlPoints } from './path';
import { ArktEdge, ControlPointData } from './type';
import { getEdgeParams, getEdgePath } from './path/utils';
import { EdgeLabel } from './EdgeLabel';
import { useEdgeControls } from './useEdgeControls';
import { colorToHex, DEFAULT_STROKE_COLOR } from '@/components/colors/utils';

const useIdsForInactiveControlPoints = (points: ControlPointData[]) => {
  const ids = useRef<string[]>([]);

  if (ids.current.length === points.length) {
    return points.map((point, i) =>
      point.id ? point : { ...point, id: ids.current[i] }
    );
  } else {
    ids.current = [];

    return points.map((point, i) => {
      if (!point.id) {
        const id = window.crypto.randomUUID();
        ids.current[i] = id;
        return { ...point, id: id };
      } else {
        ids.current[i] = point.id;
        return point;
      }
    });
  }
};

export function EditableEdgeComponent(props: EdgeProps<ArktEdge>) {
  const {
    id,
    selected,
    source,
    target,
    style,
    markerStart,
    markerEnd,
    data,
    sourceHandleId,
    targetHandleId
  } = props;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { onControlPointsChange } = useEdgeControls(id);
  const sourceId = sourceHandleId?.split("-")[0]
  const targetId = targetHandleId?.split("-")[0]

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode,
  );

  const sourceOrigin = { x: sx, y: sy };
  const targetOrigin = { x: tx, y: ty };
  const color = "#68D391" // TODO: get color from color type

  const shouldShowPoints = useStore((store) => {
    const sourceNode = store.nodeLookup.get(source)!;
    const targetNode = store.nodeLookup.get(target)!;

    return selected || sourceNode.selected || targetNode.selected;
  });

  const pathPoints = [sourceOrigin, ...(data?.points ?? []), targetOrigin];
  const controlPoints = getControlPoints(pathPoints, data?.algorithm, {
    fromSide: sourcePos,
    toSide: targetPos,
  });

  const path = getPath(pathPoints, data?.algorithm, {
    fromSide: sourcePos,
    toSide: targetPos,
  });

  const controlPointsWithIds = useIdsForInactiveControlPoints(controlPoints);

  const [, labelX, labelY] = getEdgePath("bezier", sourceOrigin.x, sourceOrigin.y, targetOrigin.x, targetOrigin.y, sourcePos, targetPos);

  // Prefer anchoring the label to the central user-placed control point (if any)
  const placedPoints = data?.points ?? [];
  const centralPlacedPoint = placedPoints.length > 0
    ? placedPoints[Math.floor(placedPoints.length / 2)]
    : undefined;
  const labelCoordX = centralPlacedPoint?.x ?? labelX;
  const labelCoordY = centralPlacedPoint?.y ?? labelY;

  const strokeColor = colorToHex(data?.strokeColor ?? DEFAULT_STROKE_COLOR);
  console.log("props", props);

  return (
    <>
      <BaseEdge
        id={id}
        data-testid={`edge-${sourceId}-${targetId}`}
        path={path}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: data?.strokeWidth || 2,
          stroke: strokeColor,
        }}
      />
      <EdgeLabel
        id={id}
        data-testid={`edge-label-${id}`}
        fontSize={data?.fontSize ?? 12}
        labelText={data?.label || ""}
        isEditing={isEditing}
        labelX={labelCoordX}
        labelY={labelCoordY}
        selected={selected}
        fillColor={data?.labelFill}
        strokeColor={data?.strokeColor}
        onBlur={() => setIsEditing(false)}
        onClick={() => setIsEditing(true)}
      />
      {shouldShowPoints &&
        controlPointsWithIds.map((point, index) => {
          return (
            <Fragment key={point.id}>
              <ControlPoint
                key={point.id}
                index={index}
                setControlPoints={onControlPointsChange}
                color={color}
                {...point}
              />
            </Fragment>
          )
        })}
    </>
  );
}
