// import { z } from "zod";
// import type { Edge, Node } from "@xyflow/react";
// import { IconSchema } from "@/lib/iconRegistry";
// import { SubDiagram } from "@/lib/types";
// import { Map as YMap } from "yjs";
// import { ControlPointData } from "../../edges/ControlPoint";
// import { Algorithm } from "../../edges/constants";

// export const TailwindFamilySchema = z.enum(["white", "black", "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "green", "lime", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"]);
// export type TailwindFamily = z.infer<typeof TailwindFamilySchema>;

// // export const TailwindShadeSchema = z.enum(["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"]);
// export const TailwindShadeSchema = z.enum(["300", "500", "700"]);
// export type TailwindShade = z.infer<typeof TailwindShadeSchema>;


// export const ColorSchema = z.object({
//     family: TailwindFamilySchema,
//     shade: TailwindShadeSchema.nullable(),
// });

// export const ArktNodeTypeSchema = z.enum(["archNode", "archEllipseNode", "archPolylineNode", "archDiamondNode", "archTextNode", "virtual"]);
// export const ArktBasicNodeTypesSchema = ArktNodeTypeSchema.
//     exclude(["archTextNode"])
//     .describe(`archNode: normal rectangular node,
//                 archEllipseNode: circular node,
//                 archPolylineNode: polyline node no edges to or from this node,
//                 archDiamondNode: diamond-formatted node,
//                 virtual: virtual representing of another node`
//     );
// export type ArktNodeType = z.infer<typeof ArktNodeTypeSchema>;

// export const EdgeTypeSchema = z.enum(["straight", "smoothstep", "bezier", "step"]).nullable();
// export type EdgeType = z.infer<typeof EdgeTypeSchema>;
// export const LineFormSchema = z.enum(["dashed", "dotted", "solid"]);
// export type LineForm = z.infer<typeof LineFormSchema>;

// export const ArktPolylineDataSchema = z.object({
//     lineId: z.string().optional(),
//     points: z.array(z.object({
//         x: z.number(),
//         y: z.number(),
//     })),
//     form: z.optional(LineFormSchema),
//     type: z.optional(EdgeTypeSchema),
//     padding: z.number().optional(),
// })

// export type ArktPolylineData = z.infer<typeof ArktPolylineDataSchema> | undefined;

// export const ArktNodeDataSchema = z.object({
//     pathId: z.string(),
//     label: z.string().optional(),
//     description: z.string().optional(),
//     fillColor: ColorSchema.optional(),
//     textColor: ColorSchema.optional(),
//     iconKey: z.optional(IconSchema),
//     githubLink: z.string().optional(),
//     templateId: z.string().optional(),
//     rotation: z.number().optional(),
//     strokeWidth: z.number().optional(),
//     virtualOf: z.string().optional(),
//     fontSize: z.number().optional(),
//     expandGroupId: z.string().optional(),
//     isDraft: z.boolean().optional(),
//     strokeColor: ColorSchema.optional(),
//     isEphemeralExpansion: z.boolean().optional(),
//     originalId: z.string().optional(),
//     // line data
//     polyline: ArktPolylineDataSchema.optional(),
// });

// export type Color = z.infer<typeof ColorSchema>;

// export type ArktNodeData = z.infer<typeof ArktNodeDataSchema> & {
//     diagram?: SubDiagram;
//     transientSubDiagram?: SubDiagram;
//     childDiagramId?: string
// }

// export type ArktNode = Node<ArktNodeData>

// export type ArktNodeControlData = ArktNodeData & {
//     type: ArktNodeType;
// }

// export type FlattenedNode = {
//     nodeId: string;
//     templateId: ArktNodeData["templateId"]
//     label: ArktNodeData["label"];
//     diagramId: string;
//     pathIds: string[];
//     pathLabels: string[];
//     nodeType?: ArktNodeType
// };
