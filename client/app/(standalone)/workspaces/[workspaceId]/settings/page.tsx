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
    <div className="h-[calc(100vh-160px)] w-full flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader className="relative flex flex-row items-center mb-2">
          <Link
            href={`/workspaces/${workspace.id}`}
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <CardTitle className="absolute -translate-y-1/2 top-1/2 -translate-x-1/2 left-1/2">
            Edit {workspace.name}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <EditWorkspace data={workspace} />
        </CardContent>
      </Card>
    </div>
  );
}
