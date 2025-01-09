"use server";

import axios from "axios";
import { currentUser } from "@clerk/nextjs/server";
import { AnalyticsType, WorkspaceDataType } from "@/types";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export const getWorkspaceAnalytics = async (workspaceId: string) => {
  const user = await currentUser();

  if (!user || !workspaceId) {
    return null;
  }

  const now = new Date();

  const thisMonthStart = startOfMonth(now);

  const thisMonthEnd = endOfMonth(now);

  const lastMonthStart = startOfMonth(subMonths(now, 1));

  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const res = await axios.get(
    `${
      process.env.NEXT_PUBLIC_BASE_API_URL
    }/workspaces/${workspaceId}/analytics?monthStart=${thisMonthStart.toISOString()}&monthEnd=${thisMonthEnd.toISOString()}&lastMonthStart=${lastMonthStart.toISOString()}&lastMonthEnd=${lastMonthEnd.toISOString()}`,
    {
      headers: {
        Authorization: `clerkId ${user.id}`,
      },
    }
  );

  const analytics = (await res.data) as WorkspaceDataType | null;

  return analytics;
};

export const getProjectAnalytics = async ({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) => {
  const user = await currentUser();

  if (!user || !projectId || !workspaceId) {
    return null;
  }

  const now = new Date();

  const thisMonthStart = startOfMonth(now);

  const thisMonthEnd = endOfMonth(now);

  const lastMonthStart = startOfMonth(subMonths(now, 1));

  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const res = await axios.get(
    `${
      process.env.NEXT_PUBLIC_BASE_API_URL
    }/workspaces/${workspaceId}/projects/${projectId}/analytics?monthStart=${thisMonthStart.toISOString()}&monthEnd=${thisMonthEnd.toISOString()}&lastMonthStart=${lastMonthStart.toISOString()}&lastMonthEnd=${lastMonthEnd.toISOString()}`,
    {
      headers: {
        Authorization: `clerkId ${user.id}`,
      },
    }
  );

  const analytics = (await res.data) as AnalyticsType | null;

  return analytics;
};
