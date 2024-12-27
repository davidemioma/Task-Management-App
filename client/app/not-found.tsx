import ErrorPage from "@/components/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      title="404"
      heading="Oops! Page Not Found"
      subheading="The page you're looking for doesn't exist or has been moved."
      linkText="Go Back Home"
      href="/"
    />
  );
}
