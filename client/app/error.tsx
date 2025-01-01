"use client";

import ErrorPage from "@/components/ErrorPage";

export default function Error() {
  return (
    <ErrorPage
      title="Error"
      heading="Oops! Something went wrong."
      subheading="There is something wrong with the task you are trying to perform!"
      linkText="Go Back Home"
      href="/"
    />
  );
}
