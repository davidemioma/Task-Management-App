import React from "react";
import Link from "next/link";
import Navigations from "./Navigations";
import { Separator } from "../ui/separator";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const Sidebar = () => {
  return (
    <div className="bg-neutral-100 w-full h-full p-4">
      <Link href="/" className="text-xl font-bold">
        🐇 Task Management
      </Link>

      <Separator className="my-4" />

      <WorkspaceSwitcher />

      <Separator className="my-4" />

      <Navigations />
    </div>
  );
};

export default Sidebar;
