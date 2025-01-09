import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getWorkspaceQueryId = "get-workspaces";

export const getWorkspaceProjectsQueryId = "get-workspace-projects";

export const getWorkspaceTasksId = "get-workspace-tasks";

export const getAnalyticsKey = "get-project-analytics";

export const getWorkspaceAnalyticsKey = "get-workspace-analytics";

export const snakeCaseToTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .replace("/_/g", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
