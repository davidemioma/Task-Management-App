"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { differenceInDays, format } from "date-fns";

type Props = {
  dueDate: Date;
  className?: string;
};

const TaskDate = ({ dueDate, className }: Props) => {
  const today = new Date();

  const endDate = new Date(dueDate);

  const diffInDays = differenceInDays(endDate, today);

  let textColor = "text-muted-foreground";

  if (diffInDays <= 3) {
    textColor = "text-red-500";
  } else if (diffInDays <= 7) {
    textColor = "text-orange-500";
  } else if (diffInDays <= 14) {
    textColor = "text-yellow-500";
  }

  return (
    <div className={textColor}>
      <span className={cn("truncate font-medium", className)}>
        {format(dueDate, "PPP")}
      </span>
    </div>
  );
};

export default TaskDate;
