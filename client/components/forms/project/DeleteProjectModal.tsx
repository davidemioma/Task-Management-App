"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/lib/actions/projects";
import DeleteModal from "@/components/modals/DeleteModal";
import { getWorkspaceProjectsQueryId } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    <DeleteModal
      open={open}
      setOpen={setOpen}
      title="Are you absolutely sure?"
      subtitle="This action cannot be undone. This will permanently delete your project."
      isPending={isPending}
      onDelete={mutate}
    >
      <Button variant="destructive" size="sm">
        <Trash />
        Delete Project
      </Button>
    </DeleteModal>
  );
};

export default DeleteProjectModal;
