import { Suspense } from "react";
import ErrorPage from "@/components/ErrorPage";
import { getTaskById } from "@/lib/data/tasks";
import { getCurrentUser } from "@/lib/data/auth";
import TaskHeader from "./_components/TaskHeader";
import { notFound, redirect } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { Separator } from "@/components/ui/separator";
import TaskOverview from "./_components/TaskOverview";
import TaskDescription from "./_components/TaskDescription";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ workspaceId?: string; taskId?: string }>;
}) {
  const currentUser = await getCurrentUser();

  const taskId = (await params).taskId;

  const workspaceId = (await params).workspaceId;

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

  const task = await getTaskById({
    taskId: taskId as string,
    workspaceId: workspaceId as string,
  });

  if (!task) {
    return notFound();
  }

  return (
    <Suspense fallback={<LoadingScreen className="bg-transparent w-full" />}>
      <div className="flex flex-col">
        <TaskHeader task={task} />

        <Separator className="my-5" />

        <div className="grid gap-4 lg:grid-cols-2">
          <TaskOverview task={task} />

          <TaskDescription task={task} />
        </div>
      </div>
    </Suspense>
  );
}
