"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import TaskFilters from "./TaskFilters";
import { columns } from "./table/Columns";
import { Separator } from "../ui/separator";
import { DataTable } from "../ui/data-table";
import TasksKanban from "./kanban/TasksKaban";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceTasksId } from "@/lib/utils";
import TaskCalendar from "./calendar/TaskCalendar";
import { getFilteredTasks } from "@/lib/data/tasks";
import CreateTaskModal from "../forms/task/CreateTaskModal";
import { useParams, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TaskViewSwitcher = () => {
  const params = useParams();

  const searchParams = useSearchParams();

  const workspaceId = params.workspaceId;

  const projectId = params.projectId;

  const status = searchParams.get("status");

  const assigneeId = searchParams.get("assigneeId");

  const dueDate = searchParams.get("dueDate");

  const {
    data: tasks,
    isLoading: isLoadingTasks,
    isError: isTasksError,
  } = useQuery({
    queryKey: [
      getWorkspaceTasksId,
      workspaceId,
      projectId,
      assigneeId,
      dueDate,
      status,
    ],
    queryFn: async () => {
      const result = await getFilteredTasks({
        workspaceId: workspaceId as string,
        projectId: projectId as string,
        status: status,
        assigneeId: assigneeId,
        dueDate: dueDate,
      });

      return result;
    },
  });

  return (
    <Tabs defaultValue="table" className="w-full border rounded-lg">
      <div className="h-full w-full flex flex-col p-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-y-2">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
              Table
            </TabsTrigger>

            <TabsTrigger className="h-8 w-full lg:w-auto" value="kanban">
              Kanban
            </TabsTrigger>

            <TabsTrigger className="h-8 w-full lg:w-auto" value="calendar">
              Calendar
            </TabsTrigger>
          </TabsList>

          <CreateTaskModal />
        </div>

        <Separator className="my-4" />

        <TaskFilters />

        <Separator className="my-4" />

        {isLoadingTasks ? (
          <div className="w-full h-[250px] flex items-center justify-center border rounded-lg">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : isTasksError ? (
          <div className="w-full h-[250px] flex items-center justify-center border rounded-lg">
            <span className="text-muted-foreground">Unable to get tasks</span>
          </div>
        ) : (
          <>
            <TabsContent className="mt-0" value="table">
              {tasks && tasks[0].id ? (
                <DataTable searchKey="name" columns={columns} data={tasks} />
              ) : (
                <DataTable columns={columns} data={[]} />
              )}
            </TabsContent>

            <TabsContent className="mt-0" value="kanban">
              <TasksKanban data={tasks || []} />
            </TabsContent>

            <TabsContent className="mt-0 h-full pb-5" value="calendar">
              <TaskCalendar data={tasks || []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};

export default TaskViewSwitcher;
