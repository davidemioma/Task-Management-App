"use client";

import React from "react";
import { getAnalyticsKey } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Analytics from "@/components/analytics/Analytics";
import { getProjectAnalytics } from "@/lib/data/analytics";

type Props = {
  projectId: string;
  workspaceId: string;
};

const ProjectAnalytics = ({ projectId, workspaceId }: Props) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [getAnalyticsKey, workspaceId, projectId],
    queryFn: async () => {
      const result = await getProjectAnalytics({ workspaceId, projectId });

      return result;
    },
  });

  return <Analytics data={data} isLoading={isLoading} isError={isError} />;
};

export default ProjectAnalytics;
