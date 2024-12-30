"use client";

import React from "react";
import { WorkspaceProps } from "@/types";
import { getWorkspaceQueryId } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { RiAddCircleFill } from "react-icons/ri";
import WorkspaceForm from "../forms/WorkspaceForm";
import SelectWorkspaces from "./SelectWorkspaces";
import { Skeleton } from "@/components/ui/skeleton";
import { getWorkspacesByUserId } from "@/lib/data/workspaces";

const WorkspaceSwitcher = () => {
  const {
    data: workspaces,
    isPending,
    isError,
  } = useQuery({
    queryKey: [getWorkspaceQueryId],
    queryFn: async () => {
      const workspaces = await getWorkspacesByUserId();

      return workspaces as WorkspaceProps[];
    },
  });

  if (isError) {
    return (
      <p className="text-muted-foreground text-sm">Unable to get workspaces</p>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />

          <Skeleton className="size-5 rounded-full" />
        </div>

        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase">Workspaces</p>

        <WorkspaceForm
          trigger={
            <RiAddCircleFill className="size-5 hover:opacity-75 transition" />
          }
        />
      </div>

      {!isError && !isPending && workspaces && workspaces.length > 0 && (
        <SelectWorkspaces workspaces={workspaces} />
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
