"use client";

import React from "react";
import { WorkspaceTaskProps } from "@/types";
import TaskActions from "../table/TaskActions";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TaskDate from "../table/TaskDate";

type Props = {
  task: WorkspaceTaskProps;
};

const KanbanCard = ({ task }: Props) => {
  return (
    <div className="bg-white space-y-3 p-2.5 mb-1.5 shadow-sm rounded">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium capitalize line-clamp-2">
          {task.name}
        </p>

        <TaskActions data={task} />
      </div>

      <Separator />

      <div className="flex items-center gap-1.5">
        <Avatar className="size-6">
          <AvatarImage src={task.user.image} />

          <AvatarFallback className="text-[10px]">
            {task.user.username[0]}
          </AvatarFallback>
        </Avatar>

        <div className="size-1 bg-neutral-300 rounded-full" />

        <TaskDate className="text-xs" dueDate={task.dueDate} />
      </div>

      <div className="flex items-center gap-1.5">
        <Avatar className="size-6 rounded-md">
          <AvatarImage src={task.project.imageUrl} />

          <AvatarFallback className="rounded-md text-[10px]">
            {task.project.name[0]}
          </AvatarFallback>
        </Avatar>

        <span className="text-xs font-medium">{task.project.name}</span>
      </div>
    </div>
  );
};

export default KanbanCard;
