import { useRef, useState, type PointerEvent } from 'react';
import { useReactFlow, type Edge } from '@xyflow/react';

import { pointsToPath } from './path';
import type { Points } from './types';
import type { FreehandNodeType } from './types';
import { NodeUnion } from '../types';
import { DEFAULT_STROKE_COLOR } from '@/components/colors/utils';
import useUserDataStateSynced from '@/components/yjs/useUserStateSynced';
import { DEFAULT_PATH_ID } from '@/components/yjs/constants';
import { useCommandStore } from '@/app/design/commandStore';
import { useListenToEscape } from '../useListenToEscape';
import { processPoints } from './utils';


type FreehandProps = {
    setNodes: React.Dispatch<React.SetStateAction<NodeUnion[]>>;
    setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
}
export function Freehand({ setNodes, setIsDrawing }: FreehandProps) {
    const { currentUserData } = useUserDataStateSynced()
    const removeCommand = useCommandStore((s) => s.removeCommand);
    const { screenToFlowPosition, getViewport } = useReactFlow<
        FreehandNodeType,
        Edge
    >();

    useListenToEscape(() => {
        setIsDrawing(false)
        removeCommand("freehand-mode")
    })

    const screenPointsRef = useRef<Points>([]);
    const [points, setPoints] = useState<Points>([]);

    function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
        e.currentTarget.setPointerCapture(e.pointerId);
        const rect = e.currentTarget.getBoundingClientRect();
        const nextPreviewPoints = [
            ...points,
            [e.clientX - rect.left, e.clientY - rect.top, e.pressure],
        ] satisfies Points;
        const nextScreenPoints = [
            ...screenPointsRef.current,
            [e.clientX, e.clientY, e.pressure],
        ] satisfies Points;
        screenPointsRef.current = nextScreenPoints;
        setPoints(nextPreviewPoints);
    }

    function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
        if (e.buttons !== 1) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const nextPreviewPoints = [
            ...points,
            [e.clientX - rect.left, e.clientY - rect.top, e.pressure],
        ] satisfies Points;
        const nextScreenPoints = [
            ...screenPointsRef.current,
            [e.clientX, e.clientY, e.pressure],
        ] satisfies Points;
        screenPointsRef.current = nextScreenPoints;
        setPoints(nextPreviewPoints);
    }

    function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
        e.currentTarget.releasePointerCapture(e.pointerId);

        const processedPoints = processPoints(screenPointsRef.current, screenToFlowPosition);
        const newNode: FreehandNodeType = {
            id: crypto.randomUUID(),
            type: 'freehand',
            ...processedPoints,
            data: {
                ...processedPoints.data,
                pathId: currentUserData?.currentDiagramId || DEFAULT_PATH_ID,
                fillColor: DEFAULT_STROKE_COLOR,
                strokeColor: DEFAULT_STROKE_COLOR,
                rotation: 0,
            }
        };
        setNodes((currentNodes) => [...currentNodes, newNode]);
        setPoints([]);
        screenPointsRef.current = [];
        setIsDrawing(false);
        removeCommand("freehand-mode")
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
