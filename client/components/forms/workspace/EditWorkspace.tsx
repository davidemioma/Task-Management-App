"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { WorkspaceProps } from "@/types";
import { ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getWorkspaceQueryId } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateWorkspace } from "@/lib/actions/workspace";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  WorkspaceSchema,
  WorkspaceValidator,
} from "@/lib/validators/workspace";
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
  data: WorkspaceProps;
};

const EditWorkspace = ({ data, onClose }: Props) => {
  const queryClient = useQueryClient();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<WorkspaceValidator>({
    resolver: zodResolver(WorkspaceSchema),
    defaultValues: {
      name: data?.name || "",
      image: data?.imageUrl || undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];

    form.setValue("image", file);
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-workspace"],
    mutationFn: async (values: WorkspaceValidator) => {
      const formData = new FormData();

      formData.append("name", values.name);

      if (values.image) {
        formData.append("image", values.image);
      }

      const result = await updateWorkspace({
        workspaceId: data.id,
        values: formData,
      });

      return result;
    },
    onSuccess: (res) => {
      if (res.status !== 200) {
        toast.error("Something went wrong! could not update workspace.");
      }

      queryClient.invalidateQueries({
        queryKey: [getWorkspaceQueryId],
      });

      toast.success("Workspace Updated!");

      onClose?.();
    },
    onError: (err) => {
      toast.error("Something went wrong! " + err.message);
    },
  });

  const onSubmit = (values: WorkspaceValidator) => {
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
                          alt="worspace-image"
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
                      <p className="text-sm">Workspace Icon</p>

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
                            field.onChange("");

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
          Save Changes
        </Button>
      </form>
    </Form>
  );
};

export default EditWorkspace;
