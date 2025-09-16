import z from "zod";

export const TailwindFamilySchema = z.enum(["white", "black", "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "green", "lime", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"]);
export type TailwindFamily = z.infer<typeof TailwindFamilySchema>;

// export const TailwindShadeSchema = z.enum(["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"]);
export const TailwindShadeSchema = z.enum(["300", "500", "700"]);
export type TailwindShade = z.infer<typeof TailwindShadeSchema>;

export const ColorSchema = z.object({
    family: TailwindFamilySchema,
    shade: TailwindShadeSchema.nullable(),
});

export type Color = z.infer<typeof ColorSchema>;
