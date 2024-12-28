import { z } from "zod";

export const WorkspaceSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required." }),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export type WorkspaceValidator = z.infer<typeof WorkspaceSchema>;
