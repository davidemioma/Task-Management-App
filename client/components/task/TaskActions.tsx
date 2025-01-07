"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { WorkspaceTaskProps } from "@/types";
import DeleteTask from "../forms/task/DeleteTask";
import {
  ExternalLink,
  MoreVertical,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UpdateTaskModal from "../forms/task/UpdateTaskModal";

type Props = {
  data: WorkspaceTaskProps;
};

const TaskActions = ({ data }: Props) => {
  const router = useRouter();

  const [openDelete, setOpenDelete] = useState(false);

  const [openUpdate, setOpenUpdate] = useState(false);

  return (
    <>
      {openDelete && (
        <DeleteTask
          open={openDelete}
          setOpen={setOpenDelete}
          workspaceId={data.workspaceId}
          projectId={data.projectId}
          taskId={data.id}
        />
      )}

      {openUpdate && (
        <UpdateTaskModal
          open={openUpdate}
          setOpen={() => setOpenUpdate((prev) => !prev)}
          task={data}
          onClose={() => setOpenUpdate(false)}
        />
      )}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>

            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() =>
              router.push(
                `/workspaces/${data.workspaceId}/projects/${data.projectId}/tasks/${data.id}`
              )
            }
          >
            <ExternalLink className="size-4 stroke-2" />
            Task Details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenUpdate(true)}>
            <PencilIcon className="size-4 stroke-2" />
            Edit Task
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              router.push(
                `/workspaces/${data.workspaceId}/projects/${data.projectId}`
              )
            }
          >
            <ExternalLink className="size-4 stroke-2" />
            Open Project
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onClick={() => setOpenDelete(true)}
          >
            <TrashIcon className="size-4 stroke-2" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default TaskActions;
