"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProject } from "@/lib/actions/projects";
import { getWorkspaceProjectsQueryId } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectSchema, ProjectValidator } from "@/lib/validators/project";
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
  workspaceId: string;
};

const ProjectForm = ({ onClose, workspaceId }: Props) => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ProjectValidator>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: "",
      image: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];

    form.setValue("image", file);
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-workspace-project", workspaceId],
    mutationFn: async (values: ProjectValidator) => {
      const formData = new FormData();

      formData.append("name", values.name);

      if (values.image) {
        formData.append(
          "image",
          values.image instanceof File ? values.image : ""
        );
      }

      const result = await createProject({ workspaceId, values: formData });

      return result;
    },
    onSuccess: (res) => {
      if (res.status !== 201) {
        toast.error("Something went wrong! could not create project.");
      }

      queryClient.invalidateQueries({
        queryKey: [getWorkspaceProjectsQueryId],
      });

      toast.success("New project created");

      form.reset();

      onClose?.();

      router.push(`/workspaces/${workspaceId}/projects/${res.data.id}`);
    },
    onError: (err) => {
      toast.error("Something went wrong! " + err.message);
    },
  });

  const onSubmit = (values: ProjectValidator) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-5">
                    {field.value ? (
                      <div className="size-[72px] relative rounded-full overflow-hidden">
                        <Image
                          className="object-cover"
                          src={
                            field.value instanceof File
                              ? URL.createObjectURL(field.value)
                              : field.value
                          }
                          fill
                          alt="project-image"
                        />
                      </div>
                    ) : (
                      <Avatar className="size-[72px]">
                        <AvatarFallback>
                          <ImageIcon className="size-[36px] text-neutral-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <input
                      type="file"
                      ref={inputRef}
                      className="hidden"
                      accept=".jpeg, .jpg, .png, .svg, .webp"
                      disabled={isPending}
                      onChange={handleFileChange}
                    />

                    <div className="flex flex-col">
                      <p className="text-sm">Project Icon</p>

                      <p className="text-sm text-muted-foreground">
                        JPG, JPEG, PNG, Webp or SVG, max 1mb.
                      </p>

                      {field.value ? (
                        <Button
                          type="button"
                          className="w-fit flex-grow-0 mt-2"
                          size="xs"
                          variant="destructive"
                          disabled={isPending}
                          onClick={() => {
                            field.onChange(null);

                            if (inputRef.current) {
                              inputRef.current.value = "";
                            }
                          }}
                        >
                          Remove Image
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="w-fit flex-grow-0 mt-2"
                          size="xs"
                          variant="teritary"
                          disabled={isPending}
                          onClick={() => {
                            inputRef?.current?.click();
                          }}
                        >
                          Upload Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </FormItem>
            )}
          />

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
                    disabled={isPending}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          Create
        </Button>
      </form>
    </Form>
  );
};

export default ProjectForm;
