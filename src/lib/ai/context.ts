// Lightweight diagram types and summarization helpers for AI context

function safeString(input: unknown): string {
    try {
        return typeof input === "string" ? input : JSON.stringify(input);
    } catch {
        return "";
    }
}

// Minimal, self-contained shapes suitable for AI summarization (no React Flow deps)
export type EdgeDataLite = {
    label?: string;
};

export type EdgeLite = {
    id: string;
    source: string;
    target: string;
    data?: EdgeDataLite;
    // Presence indicates arrowheads; the concrete type is irrelevant to summarization
    markerStart?: unknown;
    markerEnd?: unknown;
};

export type NodeDataLite = {
    label?: string;
    description?: string;
    virtualOf?: string;
    templateId?: string;
    diagram?: SubDiagramLite;
};

export type NodeLite = {
    id: string;
    type?: string;
    data?: NodeDataLite;
};

export type SubDiagramLite = {
    nodes?: Array<NodeLite>;
    edges?: Array<EdgeLite>;
};

export type DiagramLite = {
    id: string;
    name?: string;
    nodes?: Array<NodeLite>;
    edges?: Array<EdgeLite>;
};

export function buildContextSummary(
    diagramsRecord: Record<string, DiagramLite> | undefined,
    rootId: string | undefined
): string {
    if (!diagramsRecord || Object.keys(diagramsRecord).length === 0) return "No diagram context provided.";

    const lines: string[] = [];

    const diagramIds = Object.keys(diagramsRecord);
    const orderedDiagramIds = rootId && diagramsRecord[rootId] ? [rootId, ...diagramIds.filter((d) => d !== rootId)] : diagramIds;

    const formatDescription = (input: unknown): string => {
        if (input == null) return "";
        let text = safeString(input);
        text = text.replace(/\s+/g, " ").trim();
        if (!text) return "";
        const MAX_DESC = 300;
        if (text.length > MAX_DESC) text = text.slice(0, MAX_DESC) + "…";
        return text.replace(/"/g, '\\"');
    };

    type NodeInfo = {
        node: NodeLite;
        diagramId: string;
        diagramName?: string;
        pathIds: string[];
        pathLabels: string[];
    };
    type EdgeInfo = {
        edge: EdgeLite;
        diagramId: string;
        diagramName?: string;
        containerPathIds: string[];
        containerPathLabels: string[];
    };

    const nodeById = new Map<string, NodeInfo>();
    const allEdges: EdgeInfo[] = [];

    for (const diagramId of orderedDiagramIds) {
        const diagram = diagramsRecord[diagramId];
        if (!diagram) continue;

        const rootFrame = {
            diagramId,
            diagramName: diagram.name,
            nodes: diagram.nodes ?? [],
            edges: diagram.edges ?? [],
            pathIds: [] as string[],
            pathLabels: [] as string[],
        };

        const stack = [rootFrame];

        while (stack.length > 0) {
            const frame = stack.pop()!;

            for (const node of frame.nodes ?? []) {
                const nodeId = String(node?.id ?? '');
                if (!nodeId) continue;

                const label = node?.data?.label ?? "";
                nodeById.set(nodeId, {
                    node,
                    diagramId: frame.diagramId,
                    diagramName: frame.diagramName,
                    pathIds: [...frame.pathIds],
                    pathLabels: [...frame.pathLabels],
                });

                const childNodes = node?.data?.diagram?.nodes ?? [];
                const childEdges = node?.data?.diagram?.edges ?? [];
                if (childNodes.length > 0 || childEdges.length > 0) {
                    const nextPathIds = [...(frame.pathIds ?? []), nodeId];
                    const nextPathLabels = [...(frame.pathLabels ?? []), label];
                    stack.push({
                        diagramId: frame.diagramId,
                        diagramName: frame.diagramName,
                        nodes: childNodes,
                        edges: childEdges,
                        pathIds: nextPathIds,
                        pathLabels: nextPathLabels,
                    });
                }
            }

            for (const edge of frame.edges ?? []) {
                allEdges.push({
                    edge,
                    diagramId: frame.diagramId,
                    diagramName: frame.diagramName,
                    containerPathIds: [...frame.pathIds],
                    containerPathLabels: [...frame.pathLabels],
                });
            }
        }
    }

    const resolveUltimateOriginalId = (startId: string): string => {
        let currentDiagramId: string = startId;
        const seen = new Set<string>();

        while (true) {
            if (seen.has(currentDiagramId)) break;
            seen.add(currentDiagramId);

            const info = nodeById.get(currentDiagramId);
            const maybeVirtualOf = info?.node?.data?.virtualOf;
            const maybeType = info?.node?.type;

            if (maybeVirtualOf && typeof maybeVirtualOf === "string") {
                currentDiagramId = maybeVirtualOf;
                continue;
            }

            if (maybeType === "virtual") {
                break;
            }
            break;
        }
        return currentDiagramId;
    };

    for (const diagramId of orderedDiagramIds) {
        const diagram = diagramsRecord[diagramId];
        if (!diagram) continue;

        lines.push(`Diagram: ${diagram.name ?? "(unnamed)"} [${diagramId}]`);

        const emitNodeRecursive = (node: NodeLite, pathIds: string[], pathLabels: string[]) => {
            const type = node?.type ?? "unknown";
            const isVirtual = type === "virtual" || Boolean(node?.data?.virtualOf);

            if (!isVirtual) {
                const label = node?.data?.label ?? "(unnamed)";
                const desc = formatDescription(node?.data?.description);
                const descPart = desc ? ` desc="${desc}"` : "";
                lines.push(`- Node ${label} (${type}) [${node?.id}] path=[${pathIds.join("/")}]${descPart}`);
            }

            const children = node?.data?.diagram?.nodes ?? [];
            for (const child of children) {
                emitNodeRecursive(child, [...pathIds, String(node?.id ?? "?")], [...pathLabels, String(node?.data?.label ?? "")]);
            }
        };

        for (const node of diagram.nodes ?? []) {
            emitNodeRecursive(node, [], []);
        }
    }

    const dedupe = new Set<string>();
    for (const { edge } of allEdges) {
        const rawSrc = String(edge?.source ?? "");
        const rawTgt = String(edge?.target ?? "");
        if (!rawSrc || !rawTgt) continue;

        const src = resolveUltimateOriginalId(rawSrc);
        const tgt = resolveUltimateOriginalId(rawTgt);
        if (!src || !tgt || src === tgt) continue;

        const srcInfo = nodeById.get(src);
        const tgtInfo = nodeById.get(tgt);
        const srcLabel = srcInfo?.node?.data?.label ?? src;
        const tgtLabel = tgtInfo?.node?.data?.label ?? tgt;

        const hasStart = Boolean(edge?.markerStart);
        const hasEnd = Boolean(edge?.markerEnd);
        const arrow = hasStart && hasEnd ? "<->" : hasStart ? "<-" : hasEnd ? "->" : "--";
        const text = edge?.data?.label ? ` label="${String(edge.data.label)}"` : "";

        const key = `${src}|${tgt}|${hasStart ? 1 : 0}|${hasEnd ? 1 : 0}|${edge?.data?.label ?? ""}`;
        if (dedupe.has(key)) continue;
        dedupe.add(key);

        lines.push(`- Edge ${srcLabel} [${src}] ${arrow} ${tgtLabel} [${tgt}]${text}`);
    }

    let summary = lines.join("\n");
    const MAX_CHARS = 120_000;
    if (summary.length > MAX_CHARS) {
        summary = summary.slice(0, MAX_CHARS) + "\n...[truncated]";
    }
    return summary;
}


