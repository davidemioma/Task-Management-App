"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import KanbanCard from "./KanbanCard";
import KanbanHeader from "./KanbanHeader";
import { getWorkspaceTasksId } from "@/lib/utils";
import { TaskStatus } from "@/lib/validators/task";
import { updateKanbanTasks } from "@/lib/actions/tasks";
import { TasksPayload, WorkspaceTaskProps } from "@/types";
import { useParams, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

type Props = {
  data: WorkspaceTaskProps[];
};

type TaskState = {
  [key in TaskStatus]: WorkspaceTaskProps[];
};

const boards: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

const TasksKanban = ({ data }: Props) => {
  const params = useParams();

  const searchParams = useSearchParams();

  const queryClient = useQueryClient();

  const workspaceId = params?.workspaceId;

  const projectId = params?.projectId;

  const status = searchParams.get("status");

  const assigneeId = searchParams.get("assigneeId");

  const dueDate = searchParams.get("dueDate");

  const [tasks, setTasks] = useState<TaskState>(() => {
    const initialTasks: TaskState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      if (!task) return;

      initialTasks[task.status].push(task);
    });

    Object.keys(initialTasks).forEach((status) => {
      initialTasks[status as TaskStatus].sort(
        (a, b) => a.position - b.position
      );
    });

    return initialTasks;
  });

  const { mutate } = useMutation({
    mutationKey: ["update-tasks-kanban", workspaceId, projectId],
    mutationFn: async (tasks: TasksPayload) => {
      const res = await updateKanbanTasks({
        workspaceId: workspaceId as string,
        projectId: projectId as string,
        tasks,
      });

      return res;
    },
    onSuccess: (res) => {
      if (res.status !== 200) {
        toast.error("Something went wrong! could not update tasks.");
      }

      queryClient.invalidateQueries({
        queryKey: [
          getWorkspaceTasksId,
          workspaceId,
          projectId,
          assigneeId,
          dueDate,
          status,
        ],
      });

      toast.success("Tasks Updated!");
    },
    onError: (err) => {
      toast.error("Something went wrong! " + err.message);
    },
  });

  const onKanbanChange = useCallback(
    (tasks: TasksPayload) => {
      mutate(tasks);
    },
    [mutate]
  );

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source } = result;

      if (!destination) {
        return;
      }

      const destinationStatus = destination.droppableId as TaskStatus;

      const sourceStatus = source.droppableId as TaskStatus;

      //if dropped in the same position
      if (
        destinationStatus === sourceStatus &&
        destination.index === source.index
      ) {
        return;
      }

      let updatedTasks: TasksPayload = [];

      setTasks((prev) => {
        const newTasks = { ...prev };

        // Get all tasks belonging to a status
        const sourceColumn = [...newTasks[sourceStatus]];

        // Get task to update
        const [movedTask] = sourceColumn.splice(source.index, 1);

        if (!movedTask) {
          console.error("No task found at source index");

          return prev;
        }

        // update task status
        const updatedTaskToMove =
          sourceStatus !== destinationStatus
            ? { ...movedTask, status: destinationStatus }
            : movedTask;

        // Update all tasks belonging to a source column
        newTasks[sourceStatus] = sourceColumn;

        // Add task to destination column
        const destColumn = [...newTasks[destinationStatus]];

        destColumn.splice(destination.index, 0, updatedTaskToMove);

        newTasks[destinationStatus] = destColumn;

        // Add changed tasks to updatedTasks
        updatedTasks = [];

        updatedTasks.push({
          id: updatedTaskToMove.id,
          status: updatedTaskToMove.status,
          position: destination.index + 1,
        });

        // Update postion for affected tasks in source and destination column
        newTasks[destinationStatus].forEach((task, index) => {
          if (task && task.id !== updatedTaskToMove.id) {
            const newPosition = index + 1;

            if (task.position !== newPosition) {
              updatedTasks.push({
                id: task.id,
                status: task.status,
                position: newPosition,
              });
            }
          }
        });

        if (sourceStatus !== destinationStatus) {
          newTasks[sourceStatus].forEach((task, index) => {
            if (task) {
              const newPosition = index + 1;

              if (task.position !== newPosition) {
                updatedTasks.push({
                  id: task.id,
                  status: task.status,
                  position: newPosition,
                });
              }
            }
          });
        }

        return newTasks;
      });

      onKanbanChange(updatedTasks);
    },
    [onKanbanChange]
  );

  useEffect(() => {
    const newTasks: TaskState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      if (!task) return;

      newTasks[task.status].push(task);
    });

    Object.keys(newTasks).forEach((status) => {
      newTasks[status as TaskStatus].sort((a, b) => a.position - b.position);
    });

    setTasks(newTasks);
  }, [data]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-scroll">
        {boards.map((board) => (
          <div
            key={board}
            className="flex-1 min-w-[200px] bg-muted p-1.5 mx-2 rounded-md"
          >
            <KanbanHeader board={board} taskCount={tasks[board].length} />

            <Droppable droppableId={board}>
              {(provided) => (
                <ol
                  className="min-h-[250px] py-1.5"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {tasks[board].map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          className=""
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <KanbanCard task={task} />
                        </li>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </ol>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TasksKanban;
