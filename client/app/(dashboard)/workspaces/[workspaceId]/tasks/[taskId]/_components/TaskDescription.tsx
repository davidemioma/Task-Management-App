import React from "react";
import { WorkspaceTaskProps } from "@/types";
import { Separator } from "@/components/ui/separator";

type Props = {
  task: WorkspaceTaskProps;
};

const TaskDescription = ({ task }: Props) => {
  return (
    <div className="border p-4 rounded-lg">
      <h3 className="text-lg font-semibold">Description</h3>

      <Separator className="my-4" />

      <div className="flex flex-col gap-4">
        {task.description ? (
          <span>{task.description}</span>
        ) : (
          <span className="text-muted-foreground">No description set</span>
        )}
      </div>
    </div>
  );
};

export default TaskDescription;
