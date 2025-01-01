import { Suspense } from "react";
import ErrorPage from "@/components/ErrorPage";
import { getCurrentUser } from "@/lib/data/auth";
import { notFound, redirect } from "next/navigation";
import { getWorkspace } from "@/lib/data/workspaces";
import JoinWorkspace from "./_components/JoinWorkspace";
import LoadingScreen from "@/components/LoadingScreen";

export default async function Join({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId?: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const resolvedParams = await params;

  const workspaceId = resolvedParams.workspaceId;

  const resolvedSearchParams = await searchParams;

  const code = resolvedSearchParams.code;

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

  const workspace = await getWorkspace(workspaceId as string);

  if (!workspace) {
    return notFound();
  }

  return (
    <Suspense
      fallback={
        <LoadingScreen className="h-[calc(100vh-160px)] bg-transparent" />
      }
    >
      <div className="min-h-[calc(100vh-160px)] w-full flex items-center justify-center">
        <JoinWorkspace
          workspaceId={workspace.id}
          code={code || ""}
          name={workspace.name}
        />
      </div>
    </Suspense>
  );
}
