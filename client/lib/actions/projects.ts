"use server";

import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export const createProject = async ({
  workspaceId,
  values,
}: {
  workspaceId: string;
  values: FormData;
}) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/projects`,
      values,
      {
        headers: {
          Authorization: `clerkId ${user.id}`,
        },
      }
    );

    const result = await res.data;

    revalidatePath(`/workspaces/${workspaceId}`);

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Create Project", err);

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
