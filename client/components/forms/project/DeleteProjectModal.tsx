"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/lib/actions/projects";
import { buttonVariants } from "@/components/ui/button";
import { cn, getWorkspaceProjectsQueryId } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  workspaceId: string;
  projectId: string;
};

const DeleteProjectModal = ({ workspaceId, projectId }: Props) => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationKey: ["delete-workspace-project"],
    mutationFn: async () => {
      const result = await deleteProject({ workspaceId, projectId });

      return result;
    },
    onSuccess: (res) => {
      if (res.status !== 200) {
        toast.error("Something went wrong! could not delete project.");
      }

      queryClient.invalidateQueries({
        queryKey: [getWorkspaceProjectsQueryId],
      });

      toast.success("Project deleted");

      setOpen(false);

      router.push(`/workspaces/${workspaceId}`);
    },
    onError: (err) => {
      toast.error("Something went wrong! " + err.message);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({
            variant: "destructive",
            size: "sm",
          })
        )}
      >
        <Trash />
        Delete Project
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            project.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={() => {
              mutate();
            }}
            disabled={isPending}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProjectModal;
