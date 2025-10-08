import z from "zod";

export const TailwindFamilySchema = z.enum(["base", "white", "black", "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "green", "lime", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"]);
export type TailwindFamily = z.infer<typeof TailwindFamilySchema>;

// export const TailwindShadeSchema = z.enum(["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"]);
export const TailwindShadeSchema = z.enum(["300", "500", "700"]);
export type TailwindShade = z.infer<typeof TailwindShadeSchema>;

export const TailwindIndicativeSchema = z.enum(["high", "middle", "low"]);
export type TailwindIndicative = z.infer<typeof TailwindIndicativeSchema>;

export const ColorSchema = z.object({
    family: TailwindFamilySchema,
    // Deprecated: keep for backward compatibility while migrating callers
    indicative: TailwindIndicativeSchema.nullable().optional(),
});

export type Color = z.infer<typeof ColorSchema>;

export const DEFAULT_BUTTON_FILL_COLOR: Color = { family: "teal", indicative: "low" };
