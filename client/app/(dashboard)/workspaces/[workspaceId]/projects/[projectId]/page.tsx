import { redirect } from "next/navigation";
import ErrorPage from "@/components/ErrorPage";
import { getCurrentUser } from "@/lib/data/auth";

export default async function ProjectPage() {
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

  return <div>ProjectPage</div>;
}
