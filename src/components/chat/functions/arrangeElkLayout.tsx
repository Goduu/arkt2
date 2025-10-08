import { ArktEdge } from "@/components/edges/ArktEdge/type";
import { ArktNode } from "@/components/nodes/arkt/types";
import { ElkExtendedEdge, LayoutOptions } from "elkjs/lib/elk.bundled";
import ELK, { ElkNode } from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions: LayoutOptions = {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': '150',
    'elk.layered.spacing.edgeEdge': '150',
    'elk.layered.spacing.edgeNode': '150',
    'elk.spacing.componentComponent': '50',
    'elk.spacing.nodeNode': '80',
};

const getLayoutedElements = (nodes: ElkNode[], edges: ElkExtendedEdge[], options: LayoutOptions) => {
    const isHorizontal = options?.['elk.direction'] === 'RIGHT';
    const graph = {
        id: 'root',
        layoutOptions: options,
        children: nodes.map((node) => ({
            ...node,
            // Adjust the target and source handle positions based on the layout
            // direction.
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',

            // Hardcode a width and height for elk to use when layouting.
            width: 150,
            height: 50,
        })),
        edges: edges,
    };

    return elk
        .layout(graph)
        .then((layoutedGraph) => ({
            nodes: layoutedGraph?.children?.map((node) => ({
                ...node,
                // React Flow expects a position property on the node instead of `x`
                // and `y` fields.
                position: { x: node.x, y: node.y },
            })),

            edges: layoutedGraph.edges,
        }))
        .catch(console.error);
};



const convertArktEdgesToElkEdges = (edges: ArktEdge[]): ElkExtendedEdge[] => {
    return edges.map((edge) => ({
        ...edge,
        sources: [edge.source],
        targets: [edge.target],
    }));
};

const convertArktNodesToElkNodes = (nodes: ArktNode[]): ElkNode[] => {
    return nodes.map((node) => ({
        ...node,
        id: node.id,
        width: node.style?.width && Number(node.style?.width) || 90,
        height: node.style?.height && Number(node.style?.height) || 40,
    }));
};

const remapFromElkNodesToArktNodes = (elkNodes: ElkNode[], arktNodes: ArktNode[]): ArktNode[] => {
    return arktNodes.map((node) => {
        const elkNode = elkNodes.find((n) => n.id === node.id);
        return {
            ...node,
            ...elkNode,
            selected: true,
        };
    });
};

const remapFromElkEdgesToArktEdges = (elkEdges: ElkExtendedEdge[], arktEdges: ArktEdge[]): ArktEdge[] => {
    return arktEdges.map((edge) => {
        const elkEdge = elkEdges.find((e) => e.id === edge.id);
        return { ...edge, ...elkEdge };
    });
};

export const arrangeElkLayout = async (nodes: ArktNode[], edges: ArktEdge[]) => {

    const elkNodes = convertArktNodesToElkNodes(nodes);
    const elkEdges = convertArktEdgesToElkEdges(edges);
    const layoutedElements = await getLayoutedElements(elkNodes, elkEdges, elkOptions);

    let remappedNodes: ArktNode[] = nodes;
    let remappedEdges: ArktEdge[] = edges;
    if (layoutedElements && layoutedElements.nodes) {
        const { nodes: layoutedNodes } = layoutedElements;
        remappedNodes = remapFromElkNodesToArktNodes(layoutedNodes, nodes);
    }
    if (layoutedElements && layoutedElements.edges) {
        const { edges: layoutedEdges } = layoutedElements;
        remappedEdges = remapFromElkEdgesToArktEdges(layoutedEdges, edges);
    }
    return { nodes: remappedNodes, edges: remappedEdges };

}