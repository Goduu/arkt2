import useEdgesStateSynced from "@/components/yjs/useEdgesStateSynced";
import { ArktEdge, ArktEdgeData, ControlPointData } from "./type";
import { DEFAULT_ALGORITHM } from "./constants";
import { useCallback } from "react";
import { Edge } from "@xyflow/react";
import { DEFAULT_PATH_ID } from "@/components/yjs/constants";

export const useEdgeControls = (id: string) => {
    const [, setEdges,] = useEdgesStateSynced();

    const onLabelChange = (label: string) => {
        setEdges((edges) => {
            return edges.map(edge => {
                if (edge.id !== id) {
                    return edge;
                }
                return {
                    ...edge,
                    data: {
                        ...edge.data,
                        label,
                        pathId: edge.data?.pathId || DEFAULT_PATH_ID,
                        points: edge.data?.points || [],
                        algorithm: edge.data?.algorithm || DEFAULT_ALGORITHM,
                    } satisfies ArktEdgeData
                };
            });
        })
    };


    const isEditableEdge = (edge: Edge): edge is ArktEdge =>
        edge.type === 'editable-edge';


    const onControlPointsChange = useCallback(
        (update: (points: ControlPointData[]) => ControlPointData[]) => {
            setEdges((edges: ArktEdge[]) =>
                edges.map((e) => {
                    if (e.id !== id) return e;
                    if (!isEditableEdge(e)) return e;

                    if (!e.data) return e;

                    const updatedPoints = update(e.data.points);
                    const updatedData: ArktEdgeData = { ...e.data, points: updatedPoints };

                    return { ...e, data: updatedData };
                })
            );
        },
        [id, setEdges]
    );

    return {
        onLabelChange,
        onControlPointsChange,
    };
};