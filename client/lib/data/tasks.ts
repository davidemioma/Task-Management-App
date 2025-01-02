"use server";

import axios from "axios";
import { OptionsProps } from "@/types";
import { currentUser } from "@clerk/nextjs/server";

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
