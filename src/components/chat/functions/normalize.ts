import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from "@/components/colors/utils";
import { ArktEdge, ArktEdgeData } from "@/components/edges/ArktEdge/type";
import { ArktNode, ArktNodeData } from "@/components/nodes/arkt/types";
import { TemplateData } from "@/components/templates/types";
import { nanoid } from "nanoid";
import { arrangeElkLayout } from "./arrangeElkLayout";
import { DEFAULT_PATH_ID } from "@/components/yjs/constants";
import { DEFAULT_ALGORITHM } from "@/components/edges/ArktEdge/constants";

type RawNode = {
  id?: string | number;
  type?: ArktNode | string;
  position?: { x?: number; y?: number } | undefined;
  width?: number;
  height?: number;
  data?: Partial<ArktNodeData> | undefined;
};

type RawEdge = {
  id?: string | number;
  type?: string;
  source?: string | number;
  target?: string | number;
  data?: Partial<ArktEdgeData> | undefined;
};

export type RawDiagramInput = {
  initialDiagramId?: string | null;
  initialNodeId?: string | number | null;
  nodes?: RawNode[];
  edges?: RawEdge[];
};

function toStringId(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return nanoid();
  return String(value);
}

const normalizeNode = (raw: RawNode, nodeTemplates:  TemplateData[], isDraft: boolean = false): ArktNode => {
  const id = toStringId(raw.id ?? `${isDraft ? "draft" : ""}${nanoid()}`);
  const template = nodeTemplates.find((t) => t.id === raw.data?.templateId);
  if(raw.data?.templateId && !template) {
    throw new Error(`Template ${raw.data?.templateId} not found`);
  }

  const type = "arktNode"
  const position = {
    x: Number(raw.position?.x ?? 0),
    y: Number(raw.position?.y ?? 0),
  };

  const width = typeof raw.width === "number" ? raw.width : 90
  const height = typeof raw.height === "number" ? raw.height : 40;

  const baseData: ArktNodeData = {
    pathId: raw.data?.pathId ?? DEFAULT_PATH_ID,
    label: raw.data?.label ?? "Node",
    description: raw.data?.description ?? "",
    fillColor: template?.fillColor ?? DEFAULT_FILL_COLOR,
    textColor: template?.strokeColor ?? DEFAULT_FILL_COLOR,
    iconKey: template?.iconKey || raw.data?.iconKey,
    templateId: raw.data?.templateId,
    rotation: typeof raw.data?.rotation === "number" ? raw.data?.rotation : 0,
    strokeWidth: typeof raw.data?.strokeWidth === "number" ? raw.data?.strokeWidth : 2,
    virtualOf: raw.data?.virtualOf,
    fontSize: typeof raw.data?.fontSize === "number" ? raw.data?.fontSize : 12,
    isDraft: raw.data?.isDraft ?? isDraft,
    strokeColor: template?.strokeColor ?? DEFAULT_STROKE_COLOR,
  }

  const node: ArktNode = {
    id,
    type,
    position,
    data: baseData,
    style: { width, height },
    selected: true,
  };

  return node;
}

function normalizeEdge(raw: RawEdge, nodes: ArktNode[]): ArktEdge | null {
  const source = raw.source !== undefined ? String(raw.source) : undefined;
  const target = raw.target !== undefined ? String(raw.target) : undefined;

  const sourceNodeId = nodes.find((n) => n.id === source || n.data.label === source)?.id;
  const targetNodeId = nodes.find((n) => n.id === target || n.data.label === target)?.id;
  if (!sourceNodeId || !targetNodeId) return null;

  const id = toStringId(raw.id ?? nanoid());

  const data: ArktEdgeData = {
    pathId: raw.data?.pathId ?? DEFAULT_PATH_ID,
    algorithm: DEFAULT_ALGORITHM,
    direction: raw.data?.direction ?? "none",
    points: [],
    strokeColor: raw.data?.strokeColor ?? DEFAULT_STROKE_COLOR,
    strokeWidth: typeof raw.data?.strokeWidth === "number" ? raw.data?.strokeWidth : 2,
    fontSize: typeof raw.data?.fontSize === "number" ? raw.data?.fontSize : 15,
    label: raw.data?.label ?? "",
    labelFill: raw.data?.labelFill ?? DEFAULT_FILL_COLOR,
  };

  const edge: ArktEdge = {
    id,
    type: "arktEdge",
    source: sourceNodeId,
    target: targetNodeId,
    data,
    selected: true,
  }

  return edge;
}

/*
Takes the input from the LLM and normalize nodes and edges.
Also arrange them using elk layout.
*/
export const normalizeDiagramInput = async (
  input: RawDiagramInput,
  nodeTemplates: TemplateData[],
  isDraft: boolean = true
): Promise<{ nodes: ArktNode[]; edges: ArktEdge[] }> => {
  const nodes = (input.nodes ?? []).map((n) => normalizeNode(n, nodeTemplates, isDraft));

  const edges: ArktEdge[] = (input.edges ?? [])
    .map((e) => normalizeEdge(e, nodes))
    .filter((e): e is ArktEdge => Boolean(e));

  const { nodes: remappedNodes, edges: remappedEdges } = await arrangeElkLayout(nodes, edges);

  return { nodes: remappedNodes, edges: remappedEdges };
}


