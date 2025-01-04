import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getWorkspaceQueryId = "get-workspaces";

export const getWorkspaceProjectsQueryId = "get-workspace-projects";

export const getWorkspaceTasksId = "get-workspace-tasks";
