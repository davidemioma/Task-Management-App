"use client";

import React, { useState } from "react";
import Wrapper from "../Wrapper";
import { cn } from "@/lib/utils";
import TaskForm from "./TaskForm";
import { PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const CreateTaskModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper
      className="h-[80vh] overflow-y-scroll flex flex-col"
      trigger={
        <div
          className={cn(
            buttonVariants({
              size: "sm",
            }),
            "w-full lg:w-auto"
          )}
        >
          <PlusIcon className="size-4" />
          New Task
        </div>
      }
      title="Create Task"
      open={open}
      onOpenChange={() => {
        setOpen((prev) => !prev);
      }}
    >
      <TaskForm onClose={() => setOpen(false)} />
    </Wrapper>
  );
};

export default CreateTaskModal;
