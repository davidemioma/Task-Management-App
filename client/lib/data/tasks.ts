"use server";

import axios from "axios";
import { currentUser } from "@clerk/nextjs/server";
import { OptionsProps, WorkspaceTaskProps } from "@/types";

export const getTaskOptions = async (workspaceId: string) => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/options`,
    {
      headers: {
        Authorization: `clerkId ${user.id}`,
      },
    }
  );

  const result = (await res.data) as OptionsProps | null;

  return result;
};

export const getFilteredTasks = async ({
  workspaceId,
  projectId,
  assigneeId,
  dueDate,
  status,
}: {
  workspaceId: string;
  projectId: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  status?: string | null;
}) => {
  const user = await currentUser();

  if (!user) {
    return [];
  }

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/projects/${projectId}/tasks?assigneeId=${assigneeId}&status=${status}&dueDate=${dueDate}`,
    {
      headers: {
        Authorization: `clerkId ${user.id}`,
      },
    }
  );

  const result = (await res.data) as WorkspaceTaskProps[];

  return result;
};

export const getTaskById = async ({
  taskId,
  workspaceId,
}: {
  taskId: string;
  workspaceId: string;
}) => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/tasks/${taskId}`,
    {
      headers: {
        Authorization: `clerkId ${user.id}`,
      },
    }
  );

  const result = (await res.data) as WorkspaceTaskProps;

  return result;
};

export const getMyTasks = async (workspaceId: string) => {
  const user = await currentUser();

  if (!user) {
    return [];
  }

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/tasks`,
    {
      headers: {
        Authorization: `clerkId ${user.id}`,
      },
    }
  );

  const result = (await res.data) as WorkspaceTaskProps[];

  return result;
};
