import { redirect } from "next/navigation";
import ErrorPage from "@/components/ErrorPage";
import { getCurrentUser } from "@/lib/data/auth";
import { getWorkspacesByUserId } from "@/lib/data/workspaces";

export default async function Home() {
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

  const workspaces = await getWorkspacesByUserId();

  if (!workspaces || workspaces.length < 1) {
    return redirect("/workspaces/create");
  } else {
    return redirect(`/workspaces/${workspaces[0].id}`);
  }
}
