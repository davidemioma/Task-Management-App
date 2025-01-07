"use server";

import { TasksPayload } from "@/types";
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

    revalidatePath(`/workspaces/${workspaceId}/tasks`);

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Create Task", err);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error(
          "You are not authorized to perform this action. Only members of a workspace!"
        );
      } else if (err.response?.status === 406) {
        throw new Error(
          "You can not have more than 30 tasks in this column! Try deleting some"
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

    revalidatePath(`/workspaces/${workspaceId}/tasks`);

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Delete Task", err);

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

export const updateTask = async ({
  workspaceId,
  taskId,
  values,
}: {
  workspaceId: string;
  taskId: string;
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

    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/tasks/${taskId}`,
      values,
      {
        headers: {
          Authorization: `clerkId ${user.id}`,
        },
      }
    );

    const result = await res.data;

    revalidatePath(`/workspaces/${workspaceId}/projects/${values.projectId}`);

    revalidatePath(`/workspaces/${workspaceId}/tasks`);

    revalidatePath(`/workspaces/${workspaceId}/tasks/${taskId}`);

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Update Task", err);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error(
          "You are not authorized to perform this action. Only members of a workspace!"
        );
      } else if (err.response?.status === 404) {
        throw new Error("Project and task not found!");
      } else if (err.response?.status === 406) {
        throw new Error(
          "You can not have more than 30 tasks in this column! Try deleting some"
        );
      } else {
        throw new Error(err.response?.data);
      }
    } else {
      throw new Error("Something went wrong! Internal server error.");
    }
  }
};

export const updateKanbanTasks = async ({
  workspaceId,
  projectId,
  tasks,
}: {
  workspaceId: string;
  projectId: string;
  tasks: TasksPayload;
}) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/projects/${projectId}/tasks`,
      {
        tasks,
      },
      {
        headers: {
          Authorization: `clerkId ${user.id}`,
        },
      }
    );

    const result = await res.data;

    revalidatePath(`/workspaces/${workspaceId}/projects/${projectId}`);

    revalidatePath(`/workspaces/${workspaceId}/tasks`);

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Update Task", err);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error(
          "You are not authorized to perform this action. Only members of a workspace!"
        );
      } else if (err.response?.status === 404) {
        throw new Error("Project and task not found!");
      } else if (err.response?.status === 406) {
        throw new Error(
          "You can not have more than 30 tasks in this column! Try deleting some"
        );
      } else {
        throw new Error(err.response?.data);
      }
    } else {
      throw new Error("Something went wrong! Internal server error.");
    }
  }
};
