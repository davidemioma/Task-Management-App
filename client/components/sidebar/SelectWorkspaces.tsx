"use client";

import React from "react";
import Image from "next/image";
import { WorkspaceProps } from "@/types";
import { useRouter, useParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  workspaces: WorkspaceProps[];
};

const SelectWorkspaces = ({ workspaces }: Props) => {
  const router = useRouter();

  const params = useParams();

  const workspaceId = params.workspaceId as string;

  return (
    <Select
      value={workspaceId}
      onValueChange={(value) => {
        router.push(`/workspaces/${value}`);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a workspace..." />
      </SelectTrigger>

      <SelectContent>
        {workspaces.map((workspace) => (
          <SelectItem key={workspace.id} value={workspace.id}>
            <div className="flex items-center gap-3 font-medium">
              {workspace.imageUrl ? (
                <div className="size-10 relative rounded-full overflow-hidden">
                  <Image
                    className="object-cover"
                    src={workspace.imageUrl}
                    fill
                    alt="workspace-logo"
                  />
                </div>
              ) : (
                <Avatar className="size-10 rounded-full">
                  <AvatarFallback className="bg-blue-600 text-white font-semibold uppercase text-lg rounded-full">
                    {workspace.name[0]}
                  </AvatarFallback>
                </Avatar>
              )}

              <span className="truncate">{workspace.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectWorkspaces;
