"use client";

import React from "react";
import { Separator } from "../ui/separator";
import CreateTaskModal from "../forms/task/CreateTaskModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TaskViewSwitcher = () => {
  return (
    <Tabs defaultValue="table" className="w-full border rounded-lg">
      <div className="h-full flex flex-col p-4 overflow-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-y-2">
          <TabsList className="w-full lg:w-auto">
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

        <div>Filters</div>

        <Separator className="my-4" />

        <>
          <TabsContent className="mt-0" value="table">
            Table
          </TabsContent>

          <TabsContent className="mt-0" value="kanban">
            Kanban
          </TabsContent>

          <TabsContent className="mt-0" value="calendar">
            Calendar
          </TabsContent>
        </>
      </div>
    </Tabs>
  );
};

export default TaskViewSwitcher;
