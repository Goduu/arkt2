import { useEffect, useRef } from "react";
import { drag, D3DragEvent } from 'd3-drag';
import { select } from 'd3-selection';
import { useUpdateNodeInternals } from "@xyflow/react";
import { useNodeControls } from "./arkt/useNodeControls";

export const useRotationHandler = (id: string, selected: boolean) => {
    const rotateControlRef = useRef<HTMLDivElement>(null);
    const updateNodeInternals = useUpdateNodeInternals();
    const { onNodeUpdate } = useNodeControls(id);


    useEffect(() => {
        if (!rotateControlRef.current) {
            return;
        }
        rotateControlRef.current.className = selected ? 'nodrag rotatable-node__handle' : 'nodrag';
    }, [selected]);


    useEffect(() => {
        if (!rotateControlRef.current) {
            return;
        }

        // on double click set rotation to 0
        rotateControlRef.current.addEventListener('dblclick', () => {
            onNodeUpdate({ rotation: 0 });
            updateNodeInternals(id);
        });

        const selection = select(rotateControlRef.current);
        const dragHandler = drag<HTMLDivElement, unknown, null>().on('drag', (evt: D3DragEvent<HTMLDivElement, unknown, null>) => {
            const dx = evt.x - 100;
            const dy = evt.y - 100;
            const rad = Math.atan2(dx, dy);
            const deg = rad * (180 / Math.PI);
            onNodeUpdate({ rotation: 180 - deg });
            updateNodeInternals(id);
        });

        selection.call(dragHandler);
        // clean up
        return () => {
            rotateControlRef.current?.removeEventListener('dblclick', () => {
                onNodeUpdate({ rotation: 0 });
                updateNodeInternals(id);
            });
        };
    }, [id, updateNodeInternals]);

    return { rotateControlRef };
};