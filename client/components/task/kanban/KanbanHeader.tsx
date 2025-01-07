"use client";

import React from "react";
import { TaskStatus } from "@/lib/validators/task";
import { cn, snakeCaseToTitleCase } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import CreateTaskModal from "@/components/forms/task/CreateTaskModal";
import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleIcon,
  PlusIcon,
} from "lucide-react";

type Props = {
  board: TaskStatus;
  taskCount: number;
};

const statusIconsMap: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.BACKLOG]: (
    <CircleDashedIcon className="size-[18px] text-pink-400" />
  ),
  [TaskStatus.TODO]: <CircleIcon className="size-[18px] text-red-400" />,
  [TaskStatus.IN_PROGRESS]: (
    <CircleDotDashedIcon className="size-[18px] text-yellow-400" />
  ),
  [TaskStatus.IN_REVIEW]: (
    <CircleDotIcon className="size-[18px] text-blue-400" />
  ),
  [TaskStatus.DONE]: (
    <CircleCheckIcon className="size-[18px] text-emerald-400" />
  ),
};

const KanbanHeader = ({ board, taskCount }: Props) => {
  const icon = statusIconsMap[board];

  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <div className="flex items-center gap-2">
        {icon}

        <h2 className="text-sm font-medium">{snakeCaseToTitleCase(board)}</h2>

        <div className="bg-neutral-200 flex items-center justify-center size-5 text-neutral-700 font-medium text-xs rounded-md">
          {taskCount}
        </div>
      </div>

      <CreateTaskModal task={board}>
        <div
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "icon",
            })
          )}
        >
          <PlusIcon className="size-4 text-neutral-500" />
        </div>
      </CreateTaskModal>
    </div>
  );
};

export default KanbanHeader;
