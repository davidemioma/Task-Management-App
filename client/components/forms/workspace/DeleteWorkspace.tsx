"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getWorkspaceQueryId } from "@/lib/utils";
import { deleteWorkspace } from "@/lib/actions/workspace";
import DeleteModal from "@/components/modals/DeleteModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    <DeleteModal
      open={open}
      setOpen={setOpen}
      title="Are you absolutely sure?"
      subtitle="This action cannot be undone. This will permanently delete your workspace."
      isPending={isPending}
      onDelete={mutate}
    >
      <Button variant="destructive" size="sm">
        Delete Workspace
      </Button>
    </DeleteModal>
  );
};

export default DeleteWorkspace;
