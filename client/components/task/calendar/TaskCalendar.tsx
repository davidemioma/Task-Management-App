"use client";

import React, { useState } from "react";
import EventCard from "./EventCard";
import { enGB } from "date-fns/locale";
import EventToolbar from "./EventToolbar";
import { WorkspaceTaskProps } from "@/types";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths,
} from "date-fns";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";

type Props = {
  data: WorkspaceTaskProps[];
};

const locales = {
  enGB,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const TaskCalendar = ({ data }: Props) => {
  // Get due date from first task (where calendar starts from).
  const [value, setValue] = useState(
    data.length > 0 ? new Date(data[0].dueDate) : new Date()
  );

  // Format data for calendar
  const events = data.map((task) => ({
    id: task.id,
    title: task.name,
    status: task.status,
    project: {
      id: task.projectId,
      ...task.project,
    },
    assignee: {
      id: task.assigneeId,
      ...task.user,
    },
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
  }));

  const handleNavigation = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setValue((prev) => subMonths(prev, 1));
    } else if (action === "NEXT") {
      setValue((prev) => addMonths(prev, 1));
    } else {
      setValue(new Date());
    }
  };

  return (
    <Calendar
      className="h-full"
      localizer={localizer}
      date={value}
      events={events}
      views={["month"]}
      defaultView="month"
      toolbar
      showAllEvents
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) =>
          localizer?.format(date, "EEE", culture) ?? "",
      }}
      components={{
        eventWrapper: ({ event }) => <EventCard event={event} />,
        toolbar: () => (
          <EventToolbar date={value} onNavigate={handleNavigation} />
        ),
      }}
    />
  );
};

export default TaskCalendar;
