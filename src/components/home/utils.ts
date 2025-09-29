import { DEFAULT_NODE_WIDTH } from "../nodes/arkt/utils"
import { TemplateData } from "../templates/types"
import { DEFAULT_NODE_HEIGHT } from "../nodes/arkt/utils"
import { DEFAULT_FILL_COLOR } from "../colors/utils"
import { DEFAULT_STROKE_COLOR } from "../colors/utils"
import { ArktEdge, ArktEdgeData, ControlPointData } from "../edges/ArktEdge/type"
import { Algorithm, DEFAULT_ALGORITHM } from "../edges/ArktEdge/constants"
import { Color } from "../colors/types"
import { getDefaultMarker } from "../controls/EdgeControls"
import { NodeUnion } from "../nodes/types"
import { IntegrationNode } from "../nodes/integrations/type"
import { ArktNode } from "../nodes/arkt/types"
import { FreehandNodeType } from "../nodes/freehand/types"

type ExampleNode = {
    templateData?: TemplateData;
    width?: number;
    height?: number;
    position: { x: number, y: number };
    id: string;
    label: string;
    type?: NodeUnion["type"];
}

export const getExampleNode = ({ templateData, position, id, type, label, width, height }: ExampleNode) => {

    if (type === "freehand") {
        return {
            id: id,
            type: type,
            position: position,
            data: {
                pathId: "example",
                points: [[100, -50, 0.5], [100, 0, 0.5], [100, 50, 0.5]],
                fillColor: templateData?.fillColor || DEFAULT_FILL_COLOR,
                strokeColor: templateData?.strokeColor || DEFAULT_STROKE_COLOR,
                rotation: 0,
                initialSize: { width: width ?? DEFAULT_NODE_WIDTH, height: height ?? DEFAULT_NODE_HEIGHT },
            }
        } satisfies FreehandNodeType;
    }

    if (type === "integration") {
        return {
            id: id,
            type: type,
            position: position,
            data: {
                pathId: "example",
                type: "github",
                url: "https://github.com/facebook/react/blob/main/packages/react-suspense-test-utils/src/ReactSuspenseTestUtils.js",
                description: "React Suspense Test Utils",
            }
        } satisfies IntegrationNode;
    }

    return {
        id: id,
        type: "arktNode",
        position: position,
        width: width ?? DEFAULT_NODE_WIDTH,
        height: height ?? DEFAULT_NODE_HEIGHT,
        style: { width: width ?? DEFAULT_NODE_WIDTH, height: height ?? DEFAULT_NODE_HEIGHT },
        data: {
            label: label,
            pathId: "example",
            description: "",
            fillColor: templateData?.fillColor || DEFAULT_FILL_COLOR,
            textColor: DEFAULT_FILL_COLOR,
            iconKey: templateData?.iconKey,
            templateId: templateData?.id,
            rotation: 0,
            strokeWidth: 2,
            fontSize: 12,
            isDraft: true,
            strokeColor: templateData?.strokeColor || DEFAULT_STROKE_COLOR,
        },
    } satisfies ArktNode;
}


type ExampleEdge = {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    label?: string;
    direction?: "start" | "end" | "both" | "none";
    strokeColor?: Color;
    strokeWidth?: number;
    algorithm?: Algorithm;
    fontSize?: number;
    labelFill?: Color;
    points?: ControlPointData[];
    theme?: string;
}

export const getExampleEdge = ({
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    label,
    direction,
    strokeColor,
    strokeWidth,
    algorithm,
    fontSize,
    labelFill,
    points,
    theme,
}: ExampleEdge): ArktEdge => {

    const finalStrokeColor = strokeColor || DEFAULT_STROKE_COLOR;
    const finalDirection: "start" | "end" | "both" | "none" = direction ?? "none";

    const markerStart = (finalDirection === "start" || finalDirection === "both")
        ? getDefaultMarker(finalStrokeColor, theme)
        : undefined;
    const markerEnd = (finalDirection === "end" || finalDirection === "both")
        ? getDefaultMarker(finalStrokeColor, theme)
        : undefined;

    const data: ArktEdgeData = {
        pathId: "example",
        strokeColor: finalStrokeColor,
        strokeWidth: strokeWidth ?? 2,
        algorithm: algorithm ?? DEFAULT_ALGORITHM,
        points: points ?? [],
        direction: finalDirection,
        fontSize: fontSize ?? 12,
        labelFill: labelFill ?? DEFAULT_FILL_COLOR,
        label: label ?? "",
    };

    return {
        id,
        type: "arktEdge",
        selected: false,
        source,
        sourceHandle: sourceHandle || "right",
        target,
        targetHandle: targetHandle || "left",
        data,
        markerStart,
        markerEnd,
    };
}

export const templates: Record<string, TemplateData> = {
    user: {
        id: "1",
        name: "Customer",
        description: "Customer",
        iconKey: "user",
        strokeColor: { family: "blue", indicative: "high" },
        fillColor: { family: "blue", indicative: "low" },
        updatedAt: 0,
    },
    page: {
        id: "2",
        name: "Page",
        description: "Page",
        iconKey: "laptop",
        strokeColor: { family: "green", indicative: "high" },
        fillColor: { family: "green", indicative: "low" },
        updatedAt: 0,
    },
    database: {
        id: "2",
        name: "Database",
        description: "Database",
        strokeColor: { family: "slate", indicative: "high" },
        iconKey: "database",
        updatedAt: 0,
    },
    gateway: {
        id: "3",
        name: "Gateway",
        description: "Gateway",
        iconKey: "globe-lock",
        strokeColor: { family: "stone", indicative: "high" },
        fillColor: { family: "stone", indicative: "low" },
        updatedAt: 0,
    }
}