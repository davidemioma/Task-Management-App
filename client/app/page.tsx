import { Suspense } from "react";
import { redirect } from "next/navigation";
import ErrorPage from "@/components/ErrorPage";
import { getCurrentUser } from "@/lib/data/auth";
import LoadingScreen from "@/components/LoadingScreen";

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

  return (
    <Suspense fallback={<LoadingScreen />}>
      <div>{JSON.stringify(currentUser)}</div>
    </Suspense>
  );
}
