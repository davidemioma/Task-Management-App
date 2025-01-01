"use server";

import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export const updateMember = async ({
  workspaceId,
  memberId,
  role,
}: {
  workspaceId: string;
  memberId: string;
  role: "ADMIN" | "MEMBER";
}) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/members/${memberId}`,
      { role },
      {
        headers: {
          Authorization: `clerkId ${user.id}`,
        },
      }
    );

    const result = await res.data;

    revalidatePath(`/workspaces/${workspaceId}`);

    revalidatePath(`/workspaces/${workspaceId}/members`);

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Update Member", err);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error(
          "You are not authorized to perform this action. Only Admin!"
        );
      } else if (err.response?.status === 404) {
        throw new Error("Unable to find member!");
      } else {
        throw new Error(err.response?.data);
      }
    } else {
      throw new Error("Something went wrong! Internal server error.");
    }
  }
};

export const deleteMember = async ({
  workspaceId,
  memberId,
}: {
  workspaceId: string;
  memberId: string;
}) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/members/${memberId}`,
      {
        headers: {
          Authorization: `clerkId ${user.id}`,
        },
      }
    );

    const result = await res.data;

    revalidatePath(`/workspaces/${workspaceId}`);

    revalidatePath(`/workspaces/${workspaceId}/members`);

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Delete Member", err);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error(
          "You are not authorized to perform this action. Only Admin!"
        );
      } else if (err.response?.status === 404) {
        throw new Error("Unable to find member!");
      } else {
        throw new Error(err.response?.data);
      }
    } else {
      throw new Error("Something went wrong! Internal server error.");
    }
  }
};
