"use client";

import React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTask } from "@/lib/actions/tasks";
import { getTaskOptions } from "@/lib/data/tasks";
import { Textarea } from "@/components/ui/textarea";
import DatePicker from "@/components/ui/date-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { OptionsProps, WorkspaceTaskProps } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TaskSchema, TaskStatus, TaskValidator } from "@/lib/validators/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  onClose?: () => void;
  initialData?: WorkspaceTaskProps;
};

const TaskForm = ({ initialData, onClose }: Props) => {
  const params = useParams();

  const projectId = params.projectId;

  const workspaceId = params.workspaceId;

  const form = useForm<TaskValidator>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || TaskStatus.BACKLOG,
      dueDate: initialData?.dueDate || undefined,
      projectId: initialData?.projectId || (projectId as string) || "",
      assigneeId: initialData?.assigneeId || "",
    },
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

  const { mutate: createTaskHandler, isPending } = useMutation({
    mutationKey: ["create-task", workspaceId],
    mutationFn: async (values: TaskValidator) => {
      const result = await createTask({
        workspaceId: workspaceId as string,
        values,
      });

      return result;
    },
    onSuccess: (res) => {
      if (res.status !== 201) {
        toast.error("Something went wrong! could not create task.");
      }

      toast.success("New task created");

      form.reset();

      onClose?.();
    },
    onError: (err) => {
      toast.error("Something went wrong! " + err.message);
    },
  });

  const onSubmit = (values: TaskValidator) => {
    if (initialData) {
      return;
    } else {
      createTaskHandler(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Name..."
                    {...field}
                    disabled={isPending || isLoading || isError || !options}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>

                <FormControl>
                  <Textarea
                    placeholder="Write something..."
                    {...field}
                    rows={5}
                    disabled={isPending || isLoading || isError || !options}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>

                <FormControl>
                  <DatePicker
                    {...field}
                    isPending={isPending || isLoading || isError || !options}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>

                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        disabled={isPending || isLoading || isError || !options}
                      >
                        <SelectValue
                          placeholder={
                            isLoading
                              ? "Loading projects..."
                              : isError
                              ? "Unable to get projects"
                              : "Select a project..."
                          }
                        />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {options?.projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7 rounded-md">
                              <AvatarImage
                                src={project.imageUrl}
                                alt="project-image"
                              />

                              <AvatarFallback className="bg-blue-600 text-white font-semibold uppercase text-lg rounded-md">
                                {project.name[0]}
                              </AvatarFallback>
                            </Avatar>

                            <span className="capitalize truncate">
                              {project.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      disabled={isPending || isLoading || isError || !options}
                    >
                      <SelectValue
                        placeholder={
                          isLoading
                            ? "Loading members..."
                            : isError
                            ? "Unable to get members"
                            : "Select Assignee"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {options?.members.map((member) => (
                      <SelectItem key={member.id} value={member.user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7 rounded-full">
                            <AvatarImage
                              src={member.user.image}
                              alt="member-image"
                            />

                            <AvatarFallback className="bg-blue-600 text-white font-semibold uppercase text-lg rounded-full">
                              {member.user.username[0]}
                            </AvatarFallback>
                          </Avatar>

                          <span className="capitalize truncate">
                            {member.user.username}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      disabled={isPending || isLoading || isError || !options}
                    >
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>

                    <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>

                    <SelectItem value={TaskStatus.IN_PROGRESS}>
                      In Progress
                    </SelectItem>

                    <SelectItem value={TaskStatus.IN_REVIEW}>
                      In Review
                    </SelectItem>

                    <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending || isLoading || isError || !options}
        >
          {initialData ? "Save" : "Create"}
        </Button>
      </form>
    </Form>
  );
};

export default TaskForm;
