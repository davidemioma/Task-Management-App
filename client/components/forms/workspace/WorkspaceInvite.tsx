"use client";

import React from "react";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getWorkspaceQueryId } from "@/lib/utils";
import { updateInviteCode } from "@/lib/actions/workspace";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Props = {
  workspaceId: string;
  initialCode: string;
};

const WorkspaceInvite = ({ workspaceId, initialCode }: Props) => {
  const queryClient = useQueryClient();

  const url = `${window.location.origin}/workspaces/${workspaceId}/join?code=${initialCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Invite link copied to clipboard!");
    });
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-workspace-invite-code"],
    mutationFn: async () => {
      const result = await updateInviteCode(workspaceId);

      return result;
    },
    onSuccess: (res) => {
      if (res.status !== 200) {
        toast.error("Something went wrong! could not update workspace.");
      }

      queryClient.invalidateQueries({
        queryKey: [getWorkspaceQueryId],
      });

      toast.success("Invite Code Updated!");
    },
    onError: (err) => {
      toast.error("Something went wrong! " + err.message);
    },
  });

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Input value={url} disabled />

        <Button
          className="size-12"
          variant="secondary"
          disabled={isPending}
          onClick={handleCopy}
        >
          <CopyIcon className="size-5" />
        </Button>
      </div>

      <Button
        type="button"
        className="w-fit flex-grow-0 mt-2"
        size="xs"
        variant="teritary"
        disabled={isPending}
        onClick={() => {
          mutate();
        }}
      >
        Reset Invite Link
      </Button>
    </div>
  );
};

export default WorkspaceInvite;
