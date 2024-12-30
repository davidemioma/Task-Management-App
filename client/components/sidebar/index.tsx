import React from "react";
import Logo from "../Logo";
import Navigations from "./Navigations";
import { Separator } from "../ui/separator";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const Sidebar = () => {
  return (
    <div className="bg-neutral-100 w-full h-full p-4">
      <Logo />

      <Separator className="my-4" />

      <WorkspaceSwitcher />

      <Separator className="my-4" />

      <Navigations />
    </div>
  );
};

export default Sidebar;
