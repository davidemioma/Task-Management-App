"use client";

import React, { useEffect, useState } from "react";
import qs from "query-string";
import { Button } from "../ui/button";
import { OptionsProps } from "@/types";
import DatePicker from "../ui/date-picker";
import { ListCheckIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTaskOptions } from "@/lib/data/tasks";
import { TaskStatus } from "@/lib/validators/task";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useParams,
  useSearchParams,
  usePathname,
  useRouter,
} from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  hide?: boolean;
};

type TasksFilters = {
  status: string;
  assigneeId: string;
  dueDate: string;
};

const TaskFilters = ({ hide }: Props) => {
  const params = useParams();

  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const workspaceId = params.workspaceId;

  const [filters, setFilters] = useState<TasksFilters>({
    status: searchParams.get("status") || "",
    assigneeId: searchParams.get("assigneeId") || "",
    dueDate: searchParams.get("dueDate") || "",
  });

  const {
    data: options,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-options", workspaceId],
    queryFn: async () => {
      const result = await getTaskOptions(workspaceId as string);

      return result as OptionsProps;
    },
  });

  useEffect(() => {
    if (!options) return;

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          status: filters.status,
          assigneeId: filters.assigneeId,
          dueDate: filters.dueDate,
        },
      },
      { skipNull: true }
    );

    const timer = setTimeout(() => {
      router.push(url);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [filters, options, router, pathname]);

  const clearFilters = () => {
    setFilters({
      status: "",
      assigneeId: "",
      dueDate: "",
    });
  };

  if (hide) return null;

  return (
    <div className="flex items-center gap-5">
      <div className="flex flex-1 items-center gap-3 flex-wrap">
        <Select
          value={filters.status || ""}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value }))
          }
          disabled={isLoading || isError}
        >
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <ListCheckIcon className="size-4" />

              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>

            <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>

            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>

            <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>

            <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.assigneeId || ""}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, assigneeId: value }))
          }
          disabled={isLoading || isError || !options}
        >
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <ListCheckIcon className="size-4" />

              <SelectValue placeholder="Assignee" />
            </div>
          </SelectTrigger>

          <SelectContent>
            {options?.members.map((member) => (
              <SelectItem key={member.id} value={member.user.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={member.user.image} />

                    <AvatarFallback>{member.user.username[0]}</AvatarFallback>
                  </Avatar>

                  <span className="truncate">{member.user.username}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-[180px]">
          <DatePicker
            placeholder="Due Date"
            value={filters.dueDate ? new Date(filters.dueDate) : undefined}
            onChange={(date) =>
              setFilters((prev) => ({ ...prev, dueDate: date.toISOString() }))
            }
            isSearch
          />
        </div>
      </div>

      <Button
        type="button"
        variant="muted"
        size="sm"
        onClick={clearFilters}
        disabled={isLoading || isError}
      >
        Clear
      </Button>
    </div>
  );
};

export default TaskFilters;
