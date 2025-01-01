"use server";

import axios from "axios";
import { WorkspaceMembersProps } from "@/types";
import { currentUser } from "@clerk/nextjs/server";

export const getWorkspaceMembers = async (workspaceId: string) => {
  const user = await currentUser();

  if (!user) {
    return [];
  }

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/members`,
    {
      headers: {
        Authorization: `clerkId ${user.id}`,
      },
    }
  );

  const result = (await res.data) as WorkspaceMembersProps[];

  return result;
};
