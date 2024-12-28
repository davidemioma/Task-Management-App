"use client";

import React, { useEffect, useState } from "react";
import Sidebar from ".";
import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MobileSidebar = () => {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={cn(buttonVariants({ variant: "secondary" }))}>
        <MenuIcon className="size-5" />
      </SheetTrigger>

      <SheetContent className="p-0" side="left">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
