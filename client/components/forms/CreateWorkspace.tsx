"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkspace } from "@/lib/actions/workspace";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  WorkspaceSchema,
  WorkspaceValidator,
} from "@/lib/validators/workspace";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const CreateWorkspace = () => {
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<WorkspaceValidator>({
    resolver: zodResolver(WorkspaceSchema),
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
    mutationKey: ["create-workspace"],
    mutationFn: async (values: WorkspaceValidator) => {
      const formData = new FormData();

      formData.append("name", values.name);

      if (values.image) {
        formData.append(
          "file",
          values.image instanceof File ? values.image : ""
        );
      }

      const result = await createWorkspace(formData);

      return result;
    },
    onSuccess: (res) => {
      if (res.status !== 201) {
        toast.error("Something went wrong! could not create workspace.");
      }

      toast.success(res.data);

      setOpen(false);
    },
    onError: (err) => {
      toast.error("Something went wrong! " + err.message);
    },
  });

  const onSubmit = (values: WorkspaceValidator) => {
    mutate(values);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        if (isPending) return;

        setOpen((prev) => !prev);
      }}
    >
      <DialogTrigger className={cn(buttonVariants())}>
        Create Workspace
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a workspace</DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspace;
