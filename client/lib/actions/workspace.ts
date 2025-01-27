"use server";

import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export const createWorkspace = async (values: FormData) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces`,
      values,
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

export const updateWorkspace = async ({
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

    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}`,
      values,
      {
        headers: {
          Authorization: `clerkId ${user.id}`,
        },
      }
    );

    const result = await res.data;

    revalidatePath(`/workspaces/${workspaceId}`);

    revalidatePath(`/workspaces/${workspaceId}/settings`);

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Update Workspace", err);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error(
          "You are unauthorized to perform this action! Only Admin."
        );
      } else if (err.response?.status === 404) {
        throw new Error("Workspace not found.");
      } else {
        throw new Error(err.response?.data);
      }
    } else {
      throw new Error("Something went wrong! Internal server error.");
    }
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}`,
      {
        headers: {
          Authorization: `clerkId ${user.id}`,
        },
      }
    );

    const result = await res.data;

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Delete Workspace", err);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error(
          "You are unauthorized to perform this action! Only Admin."
        );
      } else if (err.response?.status === 404) {
        throw new Error("Workspace not found.");
      } else {
        throw new Error(err.response?.data);
      }
    } else {
      throw new Error("Something went wrong! Internal server error.");
    }
  }
};

export const updateInviteCode = async (workspaceId: string) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/invite-code`,
      {},
      {
        headers: {
          Authorization: `clerkId ${user.id}`,
        },
      }
    );

    const result = await res.data;

    revalidatePath(`/workspaces/${workspaceId}`);

    revalidatePath(`/workspaces/${workspaceId}/settings`);

    return { status: res.status, data: result };
  } catch (err) {
    console.error("Update Workspace invite code", err);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error(
          "You are unauthorized to perform this action! Only Admin."
        );
      } else if (err.response?.status === 404) {
        throw new Error("Workspace not found.");
      } else {
        throw new Error(err.response?.data);
      }
    } else {
      throw new Error("Something went wrong! Internal server error.");
    }
  }
};

export const joinWorkspace = async ({
  workspaceId,
  code,
}: {
  workspaceId: string;
  code: string;
}) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized, Youn need to sign in!");
    }

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/workspaces/${workspaceId}/join`,
      {
        code,
      },
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
    console.error("Join Workspace", err);

    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error(
          "You are unauthorized to perform this action! Only Admin."
        );
      } else if (err.response?.status === 404) {
        throw new Error("Workspace not found.");
      } else {
        throw new Error(err.response?.data);
      }
    } else {
      throw new Error("Something went wrong! Internal server error.");
    }
  }
};
