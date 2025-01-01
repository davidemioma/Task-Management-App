"use client";

import React, { useState } from "react";
import Wrapper from "../Wrapper";
import { cn } from "@/lib/utils";
import ProjectForm from "./ProjectForm";
import { PencilIcon } from "lucide-react";
import { WorkspaceProjectProps } from "@/types";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  project: WorkspaceProjectProps;
};

const EditProjectModal = ({ project }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper
      trigger={
        <div
          className={cn(
            buttonVariants({
              variant: "secondary",
              size: "sm",
            })
          )}
        >
          <PencilIcon />
          Edit Project
        </div>
      }
      title="Edit Project"
      open={open}
      onOpenChange={() => {
        setOpen((prev) => !prev);
      }}
    >
      <ProjectForm
        workspaceId={project.workspaceId}
        initialData={project}
        onClose={() => setOpen(false)}
      />
    </Wrapper>
  );
};

export default EditProjectModal;
