"use client";

import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { joinWorkspace } from "@/lib/actions/workspace";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  workspaceId: string;
  code: string;
  name: string;
};

const JoinWorkspace = ({ workspaceId, code, name }: Props) => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationKey: ["join-workspace", workspaceId, code],
    mutationFn: async () => {
      const result = await joinWorkspace({ workspaceId, code });

      return result;
    },
    onSuccess: (result) => {
      if (result.status !== 200) {
        toast.error("Unable to join workspace!");
      }

      toast.success("Invite Accepted!");

      router.push(`/workspaces/${workspaceId}`);
    },
    onError: () => {
      toast.error("Unable to join workspace!");
    },
  });

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Join Workspace</CardTitle>

        <CardDescription>
          You have been invited to join <strong>{name}</strong> workspace.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-end gap-2.5">
          <Button
            className="w-fit"
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => router.push("/")}
          >
            Cancel
          </Button>

          <Button
            className="w-fit"
            type="button"
            disabled={isPending}
            onClick={() => {
              if (code.trim() === "") return;

              mutate();
            }}
          >
            Join Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JoinWorkspace;
