import { Suspense } from "react";
import ErrorPage from "@/components/ErrorPage";
import { getCurrentUser } from "@/lib/data/auth";
import { notFound, redirect } from "next/navigation";
import ProjectAvatar from "@/components/ProjectAvatar";
import LoadingScreen from "@/components/LoadingScreen";
import { getWorkspaceProjectById } from "@/lib/data/projects";
import EditProjectModal from "@/components/forms/project/EditProjectModal";
import DeleteProjectModal from "@/components/forms/project/DeleteProjectModal";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ workspaceId?: string; projectId?: string }>;
}) {
  const currentUser = await getCurrentUser();

  const resolvedParams = await params;

  const workspaceId = resolvedParams.workspaceId;

  const projectId = resolvedParams.projectId;

  if (!currentUser) {
    return redirect("/auth/sign-in");
  }

  if ("error" in currentUser) {
    return (
      <ErrorPage
        title="404"
        heading={`Oops!, ${currentUser.error}`}
        subheading="Try refreshing the page"
        linkText="Refresh"
        href="/auth/callback"
      />
    );
  }

  const project = await getWorkspaceProjectById({
    workspaceId: workspaceId as string,
    projectId: projectId as string,
  });

  if (!project) {
    return notFound();
  }

  return (
    <Suspense
      fallback={
        <LoadingScreen className="w-full h-[calc(100vh-200px)] bg-transparent" />
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ProjectAvatar
              imageUrl={project.imageUrl}
              fallback={project.name[0]}
            />

            <h2 className="text-lg font-semibold">{project.name}</h2>
          </div>

          <div className="flex items-center gap-3">
            <EditProjectModal project={project} />

            <DeleteProjectModal
              workspaceId={project.workspaceId}
              projectId={project.id}
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
