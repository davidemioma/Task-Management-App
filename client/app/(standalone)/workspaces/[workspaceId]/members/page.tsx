import { Suspense } from "react";
import ErrorPage from "@/components/ErrorPage";
import { getCurrentUser } from "@/lib/data/auth";
import MembersList from "./_components/MembersList";
import { notFound, redirect } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { getWorkspaceMembers } from "@/lib/data/members";

export default async function MembersPage({
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

  const members = await getWorkspaceMembers(workspaceId as string);

  if (!members || members.length < 1) {
    return notFound();
  }

  return (
    <Suspense
      fallback={
        <LoadingScreen className="bg-transparent h-[calc(100vh-105px)]" />
      }
    >
      <div className="min-h-[calc(100vh-160px)] w-full flex items-center justify-center">
        <MembersList members={members} currentUserId={currentUser.id} />
      </div>
    </Suspense>
  );
}
