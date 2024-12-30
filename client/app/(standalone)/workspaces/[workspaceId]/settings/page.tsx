import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import ErrorPage from "@/components/ErrorPage";
import { getCurrentUser } from "@/lib/data/auth";
import { notFound, redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getWorkspaceById } from "@/lib/data/workspaces";
import EditWorkspace from "@/components/forms/workspace/EditWorkspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeleteWorkspace from "@/components/forms/workspace/DeleteWorkspace";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId?: string }>;
}) {
  const resolvedParams = await params;

  const workspaceId = resolvedParams.workspaceId;

  const currentUser = await getCurrentUser();

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

  const workspace = await getWorkspaceById(workspaceId || "");

  if (!workspace) {
    return notFound();
  }

  return (
    <div className="min-h-[calc(100vh-160px)] w-full flex items-center justify-center">
      <div className="space-y-4">
        <Card className="w-full max-w-xl">
          <CardHeader className="flex flex-col gap-4">
            <Link
              href={`/workspaces/${workspace.id}`}
              className={cn("w-fit", buttonVariants({ variant: "secondary" }))}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            <CardTitle>Edit {workspace.name}</CardTitle>
          </CardHeader>

          <CardContent>
            <EditWorkspace data={workspace} />
          </CardContent>
        </Card>

        <Card className="w-full max-w-xl">
          <CardContent className="pt-7">
            <div className="flex flex-col mb-4">
              <h3 className="font-bold">Danger Zone</h3>

              <p className="text-sm text-muted-foreground">
                Deleting a workspace is irreversible and will remove all
                associated data.
              </p>
            </div>

            <DeleteWorkspace workspaceId={workspace.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
