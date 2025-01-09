"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import MobileSidebar from "./sidebar/MobileSidebar";
import WorkspaceForm from "./forms/workspace/WorkspaceForm";

const pathnameMap = {
  tasks: {
    title: "My Tasks",
    description: "View all your tasks here.",
  },
  projects: {
    title: "My Projects",
    description: "View all your projects here.",
  },
};

const Navbar = () => {
  const pathname = usePathname();

  const pathnameParts = pathname.split("/");

  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || {
    title: "Home",
    description: "Monitor all of your projects and tasks here.",
  };

  return (
    <nav className="flex items-center justify-between py-4 px-6">
      <div className="flex items-center gap-2.5">
        <div className="lg:hidden">
          <MobileSidebar />
        </div>

        <div className="hidden lg:inline-flex flex-col">
          <h1 className="text-xl font-semibold capitalize">{title}</h1>

          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <UserButton signInUrl="/auth/sign-in" />

        <WorkspaceForm />
      </div>
    </nav>
  );
};

export default Navbar;
