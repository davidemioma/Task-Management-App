import { redirect } from "next/navigation";
import ErrorPage from "@/components/ErrorPage";
import { getCurrentUser } from "@/lib/data/auth";
import CreateWorkspace from "@/components/forms/workspace/CreateWorkspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CreateWorkspacePage() {
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

  return (
    <div className="w-full h-[calc(100vh-115px)] flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Create Workspace</CardTitle>
        </CardHeader>

        <CardContent>
          <CreateWorkspace />
        </CardContent>
      </Card>
    </div>
  );
}
