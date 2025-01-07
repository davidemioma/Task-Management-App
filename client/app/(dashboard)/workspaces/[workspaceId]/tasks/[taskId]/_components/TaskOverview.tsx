import React from "react";
import { WorkspaceTaskProps } from "@/types";
import { Badge } from "@/components/ui/badge";
import OverviewProperty from "./OverviewProperty";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import TaskDate from "@/components/task/table/TaskDate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  task: WorkspaceTaskProps;
};

const TaskOverview = ({ task }: Props) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="text-lg font-semibold">Overview</h3>

        <Separator className="my-4" />

        <div className="flex flex-col gap-4">
          <OverviewProperty label="Assignee">
            <Avatar className="size-6">
              <AvatarImage src={task.user.image} />

              <AvatarFallback className="bg-white rounded-full text-sm">
                {task.user.username[0]}
              </AvatarFallback>
            </Avatar>

            <p className="text-sm font-medium">{task.user.username}</p>
          </OverviewProperty>

          <OverviewProperty label="Due Date">
            <TaskDate dueDate={task.dueDate} />
          </OverviewProperty>

          <OverviewProperty label="Status">
            <Badge variant={task.status}>
              {snakeCaseToTitleCase(task.status)}
            </Badge>
          </OverviewProperty>
        </div>
      </div>
    </div>
  );
};

export default TaskOverview;
