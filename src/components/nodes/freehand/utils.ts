import { ReactFlowInstance } from "@xyflow/react";
import { Points } from "./types";
import { pathOptions } from "./path";

export function processPoints(
    points: [number, number, number][],
    screenToFlowPosition: ReactFlowInstance['screenToFlowPosition'],
) {
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;

    const flowPoints: Points = [];

    for (const point of points) {
        const { x, y } = screenToFlowPosition({ x: point[0], y: point[1] });
        x1 = Math.min(x1, x);
        y1 = Math.min(y1, y);
        x2 = Math.max(x2, x);
        y2 = Math.max(y2, y);

        flowPoints.push([x, y, point[2]]);
    }

    // We correct for the thickness of the line
    const thickness = pathOptions.size * 0.5;
    x1 -= thickness;
    y1 -= thickness;
    x2 += thickness;
    y2 += thickness;

    for (const flowPoint of flowPoints) {
        flowPoint[0] -= x1;
        flowPoint[1] -= y1;
    }
    const width = x2 - x1;
    const height = y2 - y1;

    return {
        position: { x: x1, y: y1 },
        width,
        height,
        data: { points: flowPoints, initialSize: { width, height } },
    };
}