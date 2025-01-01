"use client";

import React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { WorkspaceMembersProps } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { buttonVariants } from "@/components/ui/button";
import { Loader2, MoreVerticalIcon } from "lucide-react";
import { deleteMember, updateMember } from "@/lib/actions/members";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  workspaceId: string;
  currentUserId: string;
  member: WorkspaceMembersProps;
};

const Member = ({ workspaceId, currentUserId, member }: Props) => {
  const { mutate: deleteUser, isPending: deleting } = useMutation({
    mutationKey: ["delete-member", member.id],
    mutationFn: async () => {
      const result = await deleteMember({ workspaceId, memberId: member.id });

      return result;
    },
    onSuccess: (res) => {
      if (res.status !== 200) {
        toast.error("Something went wrong! could not delete member.");
      }

      toast.success("User has been removed");
    },
    onError: (err) => {
      toast.error("Something went wrong! " + err.message);
    },
  });

  const { mutate: updateUser, isPending: updating } = useMutation({
    mutationKey: ["update-member", member.id],
    mutationFn: async (role: "ADMIN" | "MEMBER") => {
      const result = await updateMember({
        workspaceId,
        memberId: member.id,
        role,
      });

      return result;
    },
    onSuccess: (res) => {
      if (res.status !== 200) {
        toast.error("Something went wrong! could not update member.");
      }

      toast.success("User has been updated");
    },
    onError: (err) => {
      toast.error("Something went wrong! " + err.message);
    },
  });

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-10 border border-neutral-500 rounded-full transition">
        <AvatarImage src={member.image} />

        <AvatarFallback className="bg-neutral-200 uppercase text-lg rounded-full flex items-center justify-center font-medium text-neutral-500">
          {member.username[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <p className="text-sm font-medium capitalize">{member.username}</p>

        <p className="text-xs text-muted-foreground">{member.email}</p>
      </div>

      {member.role === "ADMIN" && (
        <Badge className="w-fit" variant="destructive">
          Admin
        </Badge>
      )}

      {member.userId !== currentUserId && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({
                variant: "secondary",
                size: "icon",
              }),
              "ml-auto"
            )}
            disabled={deleting || updating}
          >
            {updating || deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MoreVerticalIcon className="size-4 text-muted-foreground" />
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem
              className="font-medium"
              disabled={deleting || updating}
              onClick={() => {
                updateUser("ADMIN");
              }}
            >
              Set as Administrator
            </DropdownMenuItem>

            <DropdownMenuItem
              className="font-medium"
              disabled={deleting || updating}
              onClick={() => {
                updateUser("MEMBER");
              }}
            >
              Set as Member
            </DropdownMenuItem>

            <DropdownMenuItem
              className="font-medium text-amber-700 capitalize"
              disabled={deleting || updating}
              onClick={() => {
                deleteUser();
              }}
            >
              Remove {member.username}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default Member;
