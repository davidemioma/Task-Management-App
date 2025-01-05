"use server";

import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { TaskSchema, TaskValidator } from "../validators/task";

export const createTask = async ({
  workspaceId,
  values,
}: {
  workspaceId: string;
  values: TaskValidator;
}) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    const validParameters = TaskSchema.safeParse(values);

    if (!validParameters.success) {
      throw new Error("Invalid Parameters");
    }

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/tasks`,
      values,
      {
        headers: {
          Authorization: `clerkId ${user.id}`,
        },
      }
    );

    const result = await res.data;

    revalidatePath(`/workspaces/${workspaceId}/projects/${values.projectId}`);

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Create Task", err);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error(
          "You are not authorized to perform this action. Only members of a workspace!"
        );
      } else {
        throw new Error(err.response?.data);
      }
    } else {
      throw new Error("Something went wrong! Internal server error.");
    }
  }
};

export const deleteTask = async ({
  workspaceId,
  projectId,
  taskId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
}) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
      {
        headers: {
          Authorization: `clerkId ${user.id}`,
        },
      }
    );

    const result = await res.data;

    revalidatePath(`/workspaces/${workspaceId}/projects/${projectId}`);

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Create Task", err);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error(
          "You are not authorized to perform this action. Only members of a workspace!"
        );
      } else {
        throw new Error(err.response?.data);
      }
    } else {
      throw new Error("Something went wrong! Internal server error.");
    }
  }
};
