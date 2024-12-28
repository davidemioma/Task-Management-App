"use server";

import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { WorkspaceSchema, WorkspaceValidator } from "../validators/workspace";

export const createWorkspace = async (values: WorkspaceValidator) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    // Validate inputs
    const validated = WorkspaceSchema.safeParse(values);

    if (!validated.success) {
      throw new Error("Invalid Inputs!");
    }

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces`,
      {
        ...values,
      },
      {
        headers: {
          Authorization: `clerkId ${user.id}`,
        },
      }
    );

    const result = await res.data;

    revalidatePath("/");

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Create Workspace", err);

    if (err instanceof AxiosError) {
      throw new Error(err.response?.data);
    } else {
      throw new Error("Something went wrong! Internal server error.");
    }
  }
};
