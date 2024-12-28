"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkspace } from "@/lib/actions/workspace";
import { Button, buttonVariants } from "@/components/ui/button";
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

  const form = useForm<WorkspaceValidator>({
    resolver: zodResolver(WorkspaceSchema),
    defaultValues: {
      name: "",
      image: undefined,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-workspace"],
    mutationFn: async (values: WorkspaceValidator) => {
      const result = await createWorkspace(values);

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
