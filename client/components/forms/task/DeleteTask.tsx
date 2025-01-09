"use client";

import React, { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteTask } from "@/lib/actions/tasks";
import { useSearchParams } from "next/navigation";
import DeleteModal from "@/components/modals/DeleteModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAnalyticsKey,
  getWorkspaceTasksId,
  getWorkspaceAnalyticsKey,
} from "@/lib/utils";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  workspaceId: string;
  projectId: string;
  taskId: string;
  isTaskPage?: boolean;
};

const DeleteTask = ({
  open,
  setOpen,
  workspaceId,
  projectId,
  taskId,
  isTaskPage,
}: Props) => {
  const router = useRouter();

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

      queryClient.invalidateQueries({
        queryKey: [getAnalyticsKey, workspaceId, projectId],
      });

      queryClient.invalidateQueries({
        queryKey: [getWorkspaceAnalyticsKey, workspaceId],
      });

      toast.success("Task deleted");

      setOpen(false);

      if (isTaskPage) {
        router.push(`/workspaces/${workspaceId}/tasks`);
      }
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
