import { useMemo } from 'react';
import { NodeResizer, type NodeProps } from '@xyflow/react';

import { pointsToPath } from './path';
import type { FreehandNodeType, Points } from './types';
import { colorToHex } from '@/components/colors/utils';
import { useRotationHandler } from '../useRotationHandler';

export function FreehandNode({
    id,
    width,
    height,
    data,
    selected,
    dragging,
}: NodeProps<FreehandNodeType>) {
    const { rotateControlRef } = useRotationHandler(id, "freehand", selected);

    const { fillColor, strokeColor, rotation } = data;
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
        <div className='relative w-full h-full overflow-visible'
            style={{
                transform: `rotate(${rotation}deg)`,
            }}
        >
            <NodeResizer isVisible={selected && !dragging} handleStyle={{ width: 0, height: 0 }} />
            <div>

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
                            fill: colorToHex(fillColor),
                            stroke: colorToHex(strokeColor),
                        }}
                        d={pointsToPath(points)}
                    />
                </svg>
            </div>

            <div ref={rotateControlRef} />

        </div>
    );
}
