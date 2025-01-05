"use client";

import TaskDate from "./TaskDate";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import TaskActions from "./TaskActions";
import { ArrowUpDown } from "lucide-react";
import { WorkspaceTaskProps } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type TaskCol = WorkspaceTaskProps;

export const columns: ColumnDef<TaskCol>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="border-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Task Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="line-clamp-1 px-4">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium text-sm">
        <Avatar className="size-6 rounded-md">
          <AvatarImage src={row.original.project.imageUrl} />

          <AvatarFallback className="rounded-md">
            {row.original.project.name[0]}
          </AvatarFallback>
        </Avatar>

        <span className="line-clamp-1">{row.original.project.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium text-sm">
        <Avatar className="size-6 rounded-md">
          <AvatarImage src={row.original.user.image} />

          <AvatarFallback className="rounded-md">
            {row.original.user.username[0]}
          </AvatarFallback>
        </Avatar>

        <span className="line-clamp-1">{row.original.user.username}</span>
      </div>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => <TaskDate dueDate={row.original.dueDate} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status}>
        {snakeCaseToTitleCase(row.original.status)}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <TaskActions data={row.original} />,
  },
];
