import { useMemo } from 'react';
import { NodeResizer, type NodeProps } from '@xyflow/react';

import { pointsToPath } from './path';
import type { FreehandNodeType, Points } from './types';

export function FreehandNode({
    data,
    width,
    height,
    selected,
    dragging,
}: NodeProps<FreehandNodeType>) {
    const scaleX = (width ?? 1) / data.initialSize.width;
    const scaleY = (height ?? 1) / data.initialSize.height;

    const points = useMemo(
        () =>
            data.points.map((point) => [
                point[0] * scaleX,
                point[1] * scaleY,
                point[2],
            ]) satisfies Points,
        [data.points, scaleX, scaleY],
    );

    return (
        <>
            <NodeResizer isVisible={selected && !dragging} />
            <svg
                width={width}
                height={height}
                className=''
                style={{
                    pointerEvents: selected ? 'auto' : 'none',
                }}
            >
                <path
                    style={{
                        pointerEvents: 'visiblePainted',
                        cursor: 'pointer',
                        fill: 'currentColor',
                    }}
                    d={pointsToPath(points)}
                />
            </svg>
        </>
    );
}
