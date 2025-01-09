"use client";

import React from "react";
import { AnalyticsType } from "@/types";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type Props = {
  data: AnalyticsType | null | undefined;
  isLoading: boolean;
  isError: boolean;
};

const Analytics = ({ data, isError, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="border rounded-md p-6 flex items-center justify-center">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border rounded-md p-6 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Unable to get project analytics!
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <ScrollArea className="w-full whitespace-nowrap border shrink-0 rounded-md">
      <div className="w-full flex">
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Total Tasks"
            value={data.taskCount}
            variant={data.taskDifference > 0 ? "up" : "down"}
            increaseValue={data.taskDifference}
          />

          <Separator orientation="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Assigned Tasks"
            value={data.assignedTaskCount}
            variant={data.assignedTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.assignedTaskDifference}
          />

          <Separator orientation="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Completed Tasks"
            value={data.completedTaskCount}
            variant={data.completedTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.completedTaskDifference}
          />

          <Separator orientation="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Inomplete Tasks"
            value={data.incompleteTaskCount}
            variant={data.incompleteTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.incompleteTaskDifference}
          />

          <Separator orientation="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Overdue Tasks"
            value={data.overdueTaskCount}
            variant={data.overdueTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.overdueTaskDifference}
          />
        </div>
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default Analytics;
