import React from "react";
import { UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/data/auth";
import MobileSidebar from "./sidebar/MobileSidebar";
import CreateWorkspace from "./forms/CreateWorkspace";

const Navbar = async () => {
  const currentUser = await getCurrentUser();

  return (
    <nav className="flex items-center justify-between py-4 px-6">
      <div className="flex items-center gap-2.5">
        <div className="lg:hidden">
          <MobileSidebar />
        </div>

        <div className="hidden lg:inline-flex flex-col">
          <h1 className="text-xl font-semibold capitalize">
            Hello{" "}
            {currentUser && !("error" in currentUser) && currentUser.username},
          </h1>

          <p className="text-sm text-muted-foreground">
            Monitor all of your projects and tasks here.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <UserButton signInUrl="/auth/sign-in" />

        <CreateWorkspace />
      </div>
    </nav>
  );
};

export default Navbar;
