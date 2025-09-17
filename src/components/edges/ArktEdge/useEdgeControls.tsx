import useEdgesStateSynced from "@/components/yjs/useEdgesStateSynced";
import { ArktEdge, ArktEdgeData, ControlPointData } from "./type";
import { DEFAULT_ALGORITHM } from "./constants";
import { useCallback } from "react";
import { Edge } from "@xyflow/react";
import { DEFAULT_PATH_ID } from "@/components/yjs/constants";
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from "@/components/colors/utils";

export const useEdgeControls = (id: string) => {
    const [, setEdges,] = useEdgesStateSynced();

    const onEdgeDataUpdate = (newEdgeData: Partial<ArktEdgeData>) => {
        setEdges((edges) => {
            return edges.map(edge => {
                if (edge.id !== id) {
                    return edge;
                }

                return {
                    ...edge,
                    data: {
                        ...edge.data,
                        label: newEdgeData.label || edge.data?.label || "",
                        pathId: newEdgeData.pathId || edge.data?.pathId || DEFAULT_PATH_ID,
                        points: newEdgeData.points || edge.data?.points || [],
                        algorithm: newEdgeData.algorithm || edge.data?.algorithm || DEFAULT_ALGORITHM,
                        fontSize: newEdgeData.fontSize || edge.data?.fontSize || 12,
                        labelFill: newEdgeData.labelFill || edge.data?.labelFill || DEFAULT_FILL_COLOR,
                        strokeColor: newEdgeData.strokeColor || edge.data?.strokeColor || DEFAULT_STROKE_COLOR,
                        strokeWidth: newEdgeData.strokeWidth || edge.data?.strokeWidth || 2,
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
        onEdgeUpdate: onEdgeDataUpdate,
        onControlPointsChange,
    };
};