import { z } from "zod";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

export const TaskSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required." }),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  dueDate: z.coerce.date(),
  description: z.string().optional(),
  projectId: z.string().trim().min(1, { message: "Project Id is required." }),
  assigneeId: z.string().trim().min(1, { message: "Asignee Id is required." }),
});

export type TaskValidator = z.infer<typeof TaskSchema>;
