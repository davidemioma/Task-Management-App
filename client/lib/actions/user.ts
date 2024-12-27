"use server";

import axios from "axios";
import { currentUser } from "@clerk/nextjs/server";

export const onBoardUser = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/onboard`,
      {
        clerk_id: user.id,
        image: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        username: user.username || `${user.firstName} ${user.lastName}`,
      }
    );

    const result = await res.data;

    return { status: res.status, data: result };
  } catch (err) {
    console.error("OnBoard User", err);

    throw new Error("Something went wrong! Internal server error.");
  }
};
