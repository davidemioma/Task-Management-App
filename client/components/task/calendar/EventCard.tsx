"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/lib/validators/task";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  event: {
    id: string;
    title: string;
    status: TaskStatus;
    project: {
      name: string;
      imageUrl: string;
      id: string;
    };
    assignee: {
      username: string;
      image: string;
      id: string;
    };
    start: Date;
    end: Date;
  };
};

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "border-l-pink-400",
  [TaskStatus.TODO]: "border-l-red-400",
  [TaskStatus.IN_PROGRESS]: "border-l-yellow-400",
  [TaskStatus.IN_REVIEW]: "border-l-blue-400",
  [TaskStatus.DONE]: "border-l-emerald-400",
};

const EventCard = ({ event }: Props) => {
  const params = useParams();

  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    router.push(`/workspaces/${params.workspaceId}/tasks/${event.id}`);
  };

  return (
    <div className="px-2">
      <div
        onClick={onClick}
        className={cn(
          "p-1.5 bg-white flex flex-col gap-1.5 text-primary text-xs border border-l-4 rounded-md cursor-pointer hover:opacity-75 transition",
          statusColorMap[event.status]
        )}
      >
        <p>{event.title}</p>

        <div className="flex items-center gap-1">
          <Avatar className="size-5">
            <AvatarImage src={event.assignee.image} />

            <AvatarFallback>{event.assignee.username[0]}</AvatarFallback>
          </Avatar>

          <div className="size-1 bg-neutral-300 rounded-full" />

          <Avatar className="size-5 rounded-md">
            <AvatarImage src={event.project.imageUrl} />

            <AvatarFallback className="text-xs rounded-md">
              {event.project.name[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
