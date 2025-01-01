import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required." }),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export type ProjectValidator = z.infer<typeof ProjectSchema>;
