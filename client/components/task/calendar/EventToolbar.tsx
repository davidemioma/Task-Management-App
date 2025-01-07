"use client";

import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

type Props = {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
};

const EventToolbar = ({ date, onNavigate }: Props) => {
  return (
    <div className="w-full lg:w-auto flex items-center justify-center lg:justify-start gap-2 mb-4">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => onNavigate("PREV")}
      >
        <ChevronLeftIcon className="size-4" />
      </Button>

      <div className="w-full lg:w-auto flex items-center gap-2 px-3 py-2 border border-input justify-center rounded-md">
        <CalendarIcon className="size-4" />

        <p className="text-sm">{format(date, "MMMM yyyy")}</p>
      </div>

      <Button
        variant="secondary"
        size="icon"
        onClick={() => onNavigate("NEXT")}
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
};

export default EventToolbar;
