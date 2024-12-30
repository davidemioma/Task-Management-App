"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useMedia } from "react-use";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type Props = {
  children: React.ReactNode;
  trigger: React.ReactNode;
  open: boolean;
  onOpenChange: () => void;
};

const Wrapper = ({ children, trigger, open, onOpenChange }: Props) => {
  const isDesktop = useMedia("(min-width: 1024px)", true);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger ? (
          <DialogTrigger>{trigger}</DialogTrigger>
        ) : (
          <DialogTrigger className={cn(buttonVariants())}>
            Create Workspace
          </DialogTrigger>
        )}

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a workspace</DialogTitle>
          </DialogHeader>

          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer>
      {trigger ? (
        <DrawerTrigger>{trigger}</DrawerTrigger>
      ) : (
        <DrawerTrigger className={cn(buttonVariants())}>
          Create Workspace
        </DrawerTrigger>
      )}

      <DrawerContent className="p-5">
        <DrawerHeader>
          <DrawerTitle>Create a workspace</DrawerTitle>
        </DrawerHeader>

        {children}
      </DrawerContent>
    </Drawer>
  );
};

export default Wrapper;
