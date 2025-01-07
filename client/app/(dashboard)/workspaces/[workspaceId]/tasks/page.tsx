import { Suspense } from "react";
import { redirect } from "next/navigation";
import ErrorPage from "@/components/ErrorPage";
import { getMyTasks } from "@/lib/data/tasks";
import { getCurrentUser } from "@/lib/data/auth";
import { DataTable } from "@/components/ui/data-table";
import LoadingScreen from "@/components/LoadingScreen";
import { columns } from "@/components/task/table/Columns";

export default async function MyTasksPage({
  params,
}: {
  params: Promise<{ workspaceId?: string }>;
}) {
  const currentUser = await getCurrentUser();

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

  const tasks = await getMyTasks(workspaceId as string);

  return (
    <Suspense fallback={<LoadingScreen className="bg-transparent w-full" />}>
      <div className="w-full h-full space-y-2">
        <h1 className="text-2xl font-bold">Your Tasks</h1>

        <DataTable searchKey="name" columns={columns} data={tasks} />
      </div>
    </Suspense>
  );
}
