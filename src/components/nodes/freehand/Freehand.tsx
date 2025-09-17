import { useRef, useState, type PointerEvent } from 'react';
import { useReactFlow, type Edge, type ReactFlowInstance } from '@xyflow/react';

import { pathOptions, pointsToPath } from './path';
import type { Points } from './types';
import type { FreehandNodeType } from './types';
import { NodeUnion } from '../types';
import { DEFAULT_STROKE_COLOR } from '@/components/colors/utils';
import useUserDataStateSynced from '@/components/yjs/useUserStateSynced';
import { DEFAULT_PATH_ID } from '@/components/yjs/constants';

function processPoints(
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

export function Freehand({ setNodes }: { setNodes: React.Dispatch<React.SetStateAction<NodeUnion[]>> }) {
    const { currentUserData } = useUserDataStateSynced()
    const { screenToFlowPosition, getViewport } = useReactFlow<
        FreehandNodeType,
        Edge
    >();

    const pointRef = useRef<Points>([]);
    const [points, setPoints] = useState<Points>([]);

    function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
        (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
        const nextPoints = [
            ...points,
            [e.pageX, e.pageY, e.pressure],
        ] satisfies Points;
        pointRef.current = nextPoints;
        setPoints(nextPoints);
    }

    function handlePointerMove(e: PointerEvent) {
        if (e.buttons !== 1) return;
        const points = pointRef.current;
        const nextPoints = [
            ...points,
            [e.pageX, e.pageY, e.pressure],
        ] satisfies Points;
        pointRef.current = nextPoints;
        setPoints(nextPoints);
    }

    function handlePointerUp(e: PointerEvent) {
        (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);

        const processedPoints = processPoints(points, screenToFlowPosition);
        const newNode: FreehandNodeType = {
            id: crypto.randomUUID(),
            type: 'freehand',
            ...processedPoints,
            data: {
                ...processedPoints.data,
                fillColor: DEFAULT_STROKE_COLOR,
                pathId: currentUserData?.currentDiagramId || DEFAULT_PATH_ID
            }
        };
        setNodes((currentNodes) => [...currentNodes, newNode]);
        setPoints([]);
    }

    return (
        <div
            className="freehand-overlay"
            onPointerDown={handlePointerDown}
            onPointerMove={points.length > 0 ? handlePointerMove : undefined}
            onPointerUp={handlePointerUp}
        >
            <svg fill="currentColor">
                {points && <path d={pointsToPath(points, getViewport().zoom)} />}
            </svg>
        </div>
    );
}
