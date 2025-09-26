import { z } from "zod";

export function buildCreateDiagramTool() {
    return {
        createDiagram: {
            type: "function" as const,
            description:
                "This tool is used to create a new diagram, either from an existing diagram or from scratch.",
            inputSchema: z.object({
                prompt: z
                    .string()
                    .describe(
                        "A prompt with all information needed to create a new diagram."
                    ),
            }),
            outputSchema: CreateDiagramOutputSchema
        },
    } as const;
}


const NodeSchema: z.ZodType = z.lazy(() =>
    z.object({
        id: z.string().describe("Temporary id for reference in the edges and pathId"),
        type: z.string().describe("The type of the node. always 'arktNode'"),
        data: z.object({
            label: z.string().describe("The label of the node."),
            description: z.string().describe("Small description of the node."),
            pathId: z.string().describe("An id of a node. If this is filled, it means that this node is nested inside another node."),
            templateId: z.string()
                .describe(
                    `The ID of the template used by the node. It represents an entity in the diagram.
                    Just fill up this field if the template label/description makes sense for the node.
                    If present, it MUST be an existing template ID from the given availableTemplates.`
                ).optional(),
            virtualOf: z
                .string()
                .describe(
                    `References the ID of an existing node that this node represents virtually. 
                    A virtual node is a placeholder or mirror of a real node from another diagram level, 
                    allowing cross-level linking and drill-down navigation. 
                    Must be the ID of an existing node or label of a newly created node.
                    If this field is set, the node.type MUST be virtual.
                  `
                )
                .optional(),
        }),
    })
);

const EdgeSchema = z.lazy(() =>
    z.object({
        source: z.string().describe("The label of the source node. It MUST be a valid node label which has the same pathId as the source node."),
        target: z.string().describe("The label of the target node. It MUST be a valid node label which has the same pathId as the target node."),
        data: z.object({
            label: z.string().describe("Short label that describes what the edge is connecting."),
        }),
    })
);


export const CreateDiagramOutputSchema = z.object({
    initialDiagramId: z.string().describe("It MUST be an existing diagram ID from the context where the nodes should be created."),
    initialNodeId: z.string().describe("The ID of the existing node where the diagram should be created.").nullable(),
    nodes: z.array(NodeSchema),
    edges: z.array(EdgeSchema).describe("The edges of the diagram."),
})



export type CreateDiagramOutput = z.infer<typeof CreateDiagramOutputSchema>;

