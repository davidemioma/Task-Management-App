"use client";

import React from "react";
import Link from "next/link";
import Member from "./Member";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { WorkspaceMembersProps } from "@/types";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  currentUserId: string;
  members: WorkspaceMembersProps[];
};

const MembersList = ({ members, currentUserId }: Props) => {
  const params = useParams();

  const workspaceId = params.workspaceId;

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <Link
          href={`/workspaces/${workspaceId}`}
          className={cn("w-fit mb-6", buttonVariants({ variant: "secondary" }))}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <CardTitle className="text-xl font-bold">Members List</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {members.map((member) => (
          <Member
            key={member.id}
            member={member}
            currentUserId={currentUserId}
            workspaceId={workspaceId as string}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default MembersList;
