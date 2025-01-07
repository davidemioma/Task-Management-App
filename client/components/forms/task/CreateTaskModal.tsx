"use client";

import React, { useState } from "react";
import Wrapper from "../Wrapper";
import { cn } from "@/lib/utils";
import TaskForm from "./TaskForm";
import { PlusIcon } from "lucide-react";
import { TaskStatus } from "@/lib/validators/task";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  task?: TaskStatus;
  children?: React.ReactNode;
};

const CreateTaskModal = ({ children, task }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper
      className="h-[80vh] overflow-y-scroll flex flex-col"
      trigger={
        children ? (
          children
        ) : (
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
        )
      }
      title="Create Task"
      open={open}
      onOpenChange={() => {
        setOpen((prev) => !prev);
      }}
    >
      <TaskForm task={task} onClose={() => setOpen(false)} />
    </Wrapper>
  );
};

export default CreateTaskModal;
