import type { InternalNode, Node, XYPosition } from '@xyflow/react';
import { ControlPointData } from '../type';

import { getBezierPath, getSmoothStepPath, getStraightPath, Position } from '@xyflow/react';

// returns the position (top,right,bottom or right) passed node compared to
function getParams(nodeA: InternalNode<Node>, nodeB: InternalNode<Node>) {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  const horizontalDiff = Math.abs(centerA.x - centerB.x);
  const verticalDiff = Math.abs(centerA.y - centerB.y);

  let position;

  // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
  if (horizontalDiff > verticalDiff) {
    position = centerA.x > centerB.x ? Position.Left : Position.Right;
  } else {
    // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
    position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
  }

  const [x, y] = getHandleCoordsByPosition(nodeA, position);
  return [x, y, position];
}

function getHandleCoordsByPosition(node: InternalNode<Node>, handlePosition: Position) {
  // all handles are from type source, that's why we use handleBounds.source here
  const handle = node.internals.handleBounds?.source?.find(
    (h) => h.position === handlePosition,
  );

  let offsetX = (handle?.width || 0) / 2;
  let offsetY = (handle?.height || 0) / 2;

  // this is a tiny detail to make the markerEnd of an edge visible.
  // The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
  // when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
  switch (handlePosition) {
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle?.width || 0;
      break;
    case Position.Top:
      offsetY = 0;
      break;
    case Position.Bottom:
      offsetY = handle?.height || 0;
      break;
  }

  const x = node.internals.positionAbsolute.x + (handle?.x || 0) + offsetX;
  const y = node.internals.positionAbsolute.y + (handle?.y || 0) + offsetY;

  return [x, y];
}

function getNodeCenter(node: InternalNode<Node>) {
  return {
    x: node.internals.positionAbsolute.x + (node.measured?.width || 0) / 2,
    y: node.internals.positionAbsolute.y + (node.measured?.height || 0) / 2,
  };
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: InternalNode<Node> | undefined, target: InternalNode<Node> | undefined) {
  if (!source || !target) {
    return {
      sx: 0,
      sy: 0,
      tx: 0,
      ty: 0,
      sourcePos: Position.Left,
      targetPos: Position.Right,
    };
  }
  const [sx, sy, sourcePos] = getParams(source, target);
  const [tx, ty, targetPos] = getParams(target, source);



  return {
    sx: isPosition(sx) ? 0 : sx,
    sy: isPosition(sy) ? 0 : sy,
    tx: isPosition(tx) ? 0 : tx,
    ty: isPosition(ty) ? 0 : ty,
    sourcePos: isPosition(sourcePos) ? sourcePos : Position.Right,
    targetPos: isPosition(targetPos) ? targetPos : Position.Left,
  }
}

const isPosition = (pos: unknown): pos is Position => {
  return pos === Position.Left || pos === Position.Right || pos === Position.Top || pos === Position.Bottom;
}

export const isControlPoint = (
  point: ControlPointData | XYPosition
): point is ControlPointData => 'id' in point;


export const getEdgePath = (shape: "bezier" | "smoothstep" | "step",
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position) => {
  if (shape === "bezier")
    return getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });
  if (shape === "smoothstep" || shape === "step")
    return getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });
  return getStraightPath({ sourceX, sourceY, targetX, targetY });
}