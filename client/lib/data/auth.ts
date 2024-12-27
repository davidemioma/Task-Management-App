"use server";

import axios from "axios";
import { cache } from "react";
import { UserProps } from "@/types";
import { currentUser } from "@clerk/nextjs/server";

export const getCurrentUser = cache(async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/user`,
    {
      headers: {
        Authorization: `clerkId ${user.id}`,
      },
    }
  );

  if (res.status !== 200) {
    console.error(`Error fetching user: ${res.status} - ${res.statusText}`);

    return { error: "Error fetching current user" };
  }

  const result = (await res.data) as UserProps;

  return result;
});
