"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WorkspaceTaskProps } from "@/types";
import { Button } from "@/components/ui/button";
import DeleteTask from "@/components/forms/task/DeleteTask";
import { ChevronRight, PencilIcon, TrashIcon } from "lucide-react";
import UpdateTaskModal from "@/components/forms/task/UpdateTaskModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  task: WorkspaceTaskProps;
};

const TaskHeader = ({ task }: Props) => {
  const [openDelete, setOpenDelete] = useState(false);

  const [openUpdate, setOpenUpdate] = useState(false);

  return (
    <>
      <DeleteTask
        open={openDelete}
        setOpen={setOpenDelete}
        workspaceId={task.workspaceId}
        projectId={task.projectId}
        taskId={task.id}
        isTaskPage
      />

      <UpdateTaskModal
        task={task}
        open={openUpdate}
        setOpen={() => setOpenUpdate((prev) => !prev)}
        onClose={() => setOpenUpdate(false)}
      />

      <div className="flex items-center gap-2">
        <Avatar className="size-10 rounded-md">
          <AvatarImage src={task.project.imageUrl} />

          <AvatarFallback className="rounded-md">
            {task.project.name[0]}
          </AvatarFallback>
        </Avatar>

        <Link
          href={`/workspaces/${task.workspaceId}/projects/${task.projectId}`}
          className="text-sm lg:text-lg text-muted-foreground font-semibold hover:opacity-75 transition"
        >
          {task.project.name}
        </Link>

        <ChevronRight className="size-4 lg:size-5 text-muted-foreground" />

        <p className="text-sm lg:text-lg font-semibold">{task.name}</p>

        <div className="ml-auto flex items-center gap-2.5">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setOpenDelete(true)}
          >
            <TrashIcon className="size-4" />

            <span className="hidden lg:block">Delete Task</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setOpenUpdate(true)}
          >
            <PencilIcon className="size-4" />

            <span className="hidden lg:block">Update Task</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default TaskHeader;
