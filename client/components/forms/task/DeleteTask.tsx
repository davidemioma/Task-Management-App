"use client";

import React, { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { deleteTask } from "@/lib/actions/tasks";
import { getWorkspaceTasksId } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import DeleteModal from "@/components/modals/DeleteModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  workspaceId: string;
  projectId: string;
  taskId: string;
};

const DeleteTask = ({
  open,
  setOpen,
  workspaceId,
  projectId,
  taskId,
}: Props) => {
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();

  const status = searchParams.get("status");

  const assigneeId = searchParams.get("assigneeId");

  const dueDate = searchParams.get("dueDate");

  const { mutate, isPending } = useMutation({
    mutationKey: ["delete-task"],
    mutationFn: async () => {
      const result = await deleteTask({ workspaceId, projectId, taskId });

      return result;
    },
    onSuccess: (res) => {
      if (res.status !== 200) {
        toast.error("Something went wrong! could not delete task.");
      }

      queryClient.invalidateQueries({
        queryKey: [
          getWorkspaceTasksId,
          workspaceId,
          projectId,
          assigneeId,
          dueDate,
          status,
        ],
      });

      toast.success("Task deleted");

      setOpen(false);
    },
    onError: (err) => {
      toast.error("Something went wrong! " + err.message);
    },
  });

  return (
    <DeleteModal
      open={open}
      setOpen={setOpen}
      title="Are you absolutely sure?"
      subtitle="This action cannot be undone. This will permanently delete your task."
      isPending={isPending}
      onDelete={mutate}
    />
  );
};

export default DeleteTask;
