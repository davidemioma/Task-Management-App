"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ErrorPage from "@/components/ErrorPage";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, Users2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import LoadingScreen from "@/components/LoadingScreen";
import { Card, CardContent } from "@/components/ui/card";
import Analytics from "@/components/analytics/Analytics";
import { cn, getWorkspaceAnalyticsKey } from "@/lib/utils";
import { getWorkspaceAnalytics } from "@/lib/data/analytics";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateProjectModal from "@/components/forms/project/CreateProjectModal";

const WorkspaceDetails = () => {
  const { workspaceId } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: [getWorkspaceAnalyticsKey, workspaceId],
    queryFn: async () => {
      const res = await getWorkspaceAnalytics(workspaceId as string);

      return res;
    },
  });

  if (isLoading) {
    return (
      <LoadingScreen className="bg-transparent h-[calc(100vh-150px)] w-full" />
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-transparent flex items-center justify-center h-[calc(100vh-150px)] w-full">
        <ErrorPage
          title="404"
          heading="Oops! Page Not Found"
          subheading="Unable to get workspace analytics."
          linkText="Go Back Home"
          href="/"
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-10">
      <Analytics
        data={data.analytics}
        isLoading={isLoading}
        isError={isError}
      />

      <div className="w-full space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>

          <CreateProjectModal
            trigger={
              <Button variant="muted">
                <PlusIcon className="size-4 text-neutral-400" />
                Create Project
              </Button>
            }
            workspaceId={workspaceId as string}
          />
        </div>

        <Separator />

        {data.projects.length > 0 ? (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/workspaces/${workspaceId}/projects/${project.id}`}
                >
                  <Card className="rounded-lg hover:opacity-75 transition shadow-none">
                    <CardContent className="p-4 flex items-center gap-2.5">
                      <Avatar className="size-12 rounded-md">
                        <AvatarImage src={project.imageUrl} />

                        <AvatarFallback className="text-lg rounded-md">
                          {project.name[0]}
                        </AvatarFallback>
                      </Avatar>

                      <p className="text-lg font-medium line-clamp-1">
                        {project.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="w-full py-4 text-sm text-muted-foreground text-center">
            No projects found
          </div>
        )}
      </div>

      <div className="w-full space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Members</h2>

          <Link
            className={cn(buttonVariants({ variant: "secondary" }))}
            href={`/workspaces/${workspaceId}/members`}
          >
            <Users2 className="size-4 text-neutral-400" />
            View All
          </Link>
        </div>

        <Separator />

        {data.members.length > 0 ? (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.members.map((member) => (
              <li key={member.id}>
                <Card className="rounded-lg overflow-hidden shadow-none">
                  <CardContent className="p-4 flex items-center gap-2.5">
                    <Avatar className="size-12 rounded-full">
                      <AvatarImage src={member.user.image} />

                      <AvatarFallback className="text-lg rounded-full">
                        {member.user.username[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col overflow-hidden">
                      <p className="text-lg font-medium line-clamp-1">
                        {member.user.username}
                      </p>

                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {member.user.email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <div className="w-full py-4 text-sm text-muted-foreground text-center">
            No members found
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceDetails;
