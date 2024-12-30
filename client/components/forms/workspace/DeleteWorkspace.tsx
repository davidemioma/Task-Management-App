"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, getWorkspaceQueryId } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { deleteWorkspace } from "@/lib/actions/workspace";
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
};

const DeleteWorkspace = ({ workspaceId }: Props) => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationKey: ["delete-workspace"],
    mutationFn: async () => {
      const result = await deleteWorkspace(workspaceId);

      return result;
    },
    onSuccess: (res) => {
      if (res.status !== 200) {
        toast.error("Something went wrong! could not delete workspace.");
      }

      queryClient.invalidateQueries({
        queryKey: [getWorkspaceQueryId],
      });

      toast.success("Workspace Deleted!");

      setOpen(false);

      router.push("/");
    },
    onError: (err) => {
      toast.error("Something went wrong! " + err.message);
    },
  });

  return (
    <AlertDialog
      open={open}
      onOpenChange={() => {
        if (isPending) return;

        setOpen((prev) => !prev);
      }}
    >
      <AlertDialogTrigger
        className={cn(buttonVariants({ variant: "destructive" }))}
      >
        Delete Workspace
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            workspace from our servers.
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

export default DeleteWorkspace;
