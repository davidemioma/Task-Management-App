"use client";

import React from "react";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import ProjectAvatar from "../ProjectAvatar";
import { WorkspaceProjectProps } from "@/types";
import { RiAddCircleFill } from "react-icons/ri";
import { useQuery } from "@tanstack/react-query";
import { useParams, usePathname } from "next/navigation";
import { getWorkspaceProjects } from "@/lib/data/projects";
import { cn, getWorkspaceProjectsQueryId } from "@/lib/utils";
import CreateProjectModal from "../forms/project/CreateProjectModal";

const Projects = () => {
  const params = useParams();

  const pathname = usePathname();

  const workspaceId = params.workspaceId;

  const {
    data: projects,
    isPending,
    isError,
  } = useQuery({
    queryKey: [getWorkspaceProjectsQueryId, workspaceId],
    queryFn: async () => {
      const projects = await getWorkspaceProjects(workspaceId as string);

      return projects as WorkspaceProjectProps[];
    },
  });

  if (isError) {
    return (
      <p className="text-muted-foreground text-sm">
        Unable to get workspace projects.
      </p>
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

        <Skeleton className="h-6 w-full" />

        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase">Projects</p>

        <CreateProjectModal
          workspaceId={workspaceId as string}
          trigger={
            <RiAddCircleFill className="size-5 hover:opacity-75 transition" />
          }
        />
      </div>

      {!isError && !isPending && projects && projects.length > 0 && (
        <ul>
          {projects.map((project) => {
            const href = `/workspaces/${workspaceId}/projects/${project.id}`;

            const isActive = pathname === href;

            return (
              <li key={project.id}>
                <Link href={href}>
                  <div
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 text-neutral-500 rounded-md hover:opacity-75 transition",
                      isActive &&
                        "bg-white text-primary shadow-sm hover:opacity-100"
                    )}
                  >
                    <ProjectAvatar
                      imageUrl={project.imageUrl}
                      fallback={project.name[0]}
                    />

                    <span className="truncate">{project.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Projects;
