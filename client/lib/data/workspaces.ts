"use server";

import axios from "axios";
import { WorkspaceProps } from "@/types";
import { currentUser } from "@clerk/nextjs/server";

export const getWorkspacesByUserId = async () => {
  const user = await currentUser();

  if (!user) {
    return [];
  }

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces`,
    {
      headers: {
        Authorization: `clerkId ${user.id}`,
      },
    }
  );

  const result = (await res.data) as WorkspaceProps[];

  return result;
};

export const getWorkspaceById = async (workspaceId: string) => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}`,
    {
      headers: {
        Authorization: `clerkId ${user.id}`,
      },
    }
  );

  const result = (await res.data) as WorkspaceProps | null;

  return result;
};
