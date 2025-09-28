import useEdgesStateSynced from "@/components/yjs/useEdgesStateSynced";
import { ArktEdge, ArktEdgeData, ControlPointData } from "./type";
import { DEFAULT_ALGORITHM } from "./constants";
import { useCallback } from "react";
import { Edge } from "@xyflow/react";
import { DEFAULT_PATH_ID } from "@/components/yjs/constants";
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from "@/components/colors/utils";
import { getDefaultMarker } from "@/components/controls/EdgeControls";
import { useTheme } from "next-themes";
import { Color } from "@/components/colors/types";

export const useEdgeControls = (id: string) => {
    const [, setEdges,] = useEdgesStateSynced();
    const { resolvedTheme: theme } = useTheme();

    const onEdgeDataUpdate = (newEdgeData: Partial<ArktEdgeData>) => {
        setEdges((edges) => {
            return edges.map(edge => {
                if (edge.id !== id) {
                    return edge;
                }
                const { markerStart, markerEnd } = getEdgeMarkers(newEdgeData.direction || edge.data?.direction || "none", newEdgeData.strokeColor || edge.data?.strokeColor || DEFAULT_STROKE_COLOR);
                return {
                    ...edge,
                    markerStart,
                    markerEnd,
                    data: {
                        ...edge.data,
                        label: newEdgeData.label !== undefined ? newEdgeData.label : edge.data?.label || "",
                        pathId: newEdgeData.pathId || edge.data?.pathId || DEFAULT_PATH_ID,
                        points: newEdgeData.points || edge.data?.points || [],
                        algorithm: newEdgeData.algorithm || edge.data?.algorithm || DEFAULT_ALGORITHM,
                        fontSize: newEdgeData.fontSize || edge.data?.fontSize || 12,
                        labelFill: newEdgeData.labelFill || edge.data?.labelFill || DEFAULT_FILL_COLOR,
                        strokeColor: newEdgeData.strokeColor || edge.data?.strokeColor || DEFAULT_STROKE_COLOR,
                        strokeWidth: newEdgeData.strokeWidth || edge.data?.strokeWidth || 2,
                        direction: newEdgeData.direction || edge.data?.direction || "none",
                    } satisfies ArktEdgeData
                };
            });
        })
    };

    const onEdgeMarkerChange = (direction: "start" | "end" | "both" | "none") => {

        setEdges((edges) => {
            return edges.map(edge => {
                if (edge.id !== id) {
                    return edge;
                }
                const { markerStart, markerEnd } = getEdgeMarkers(direction, edge.data?.strokeColor ?? DEFAULT_STROKE_COLOR);
                return {
                    ...edge,
                    markerStart,
                    markerEnd,
                };
            });
        });
    };

    const getEdgeMarkers = (direction: "start" | "end" | "both" | "none", strokeColor: Color) => {
        return {
            markerStart: direction === "start" || direction === "both" ? getDefaultMarker(strokeColor, theme) : undefined,
            markerEnd: direction === "end" || direction === "both" ? getDefaultMarker(strokeColor, theme) : undefined,
        };
    };


    const isArktEdge = (edge: Edge): edge is ArktEdge =>
        edge.type === 'arktEdge';


    const onControlPointsChange = useCallback(
        (update: (points: ControlPointData[]) => ControlPointData[]) => {
            setEdges((edges: ArktEdge[]) =>
                edges.map((e) => {
                    if (e.id !== id) return e;
                    if (!isArktEdge(e)) return e;

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
        onEdgeMarkerChange,
    };
};