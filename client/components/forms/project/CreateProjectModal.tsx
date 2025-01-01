"use client";

import React, { useState } from "react";
import Wrapper from "../Wrapper";
import ProjectForm from "./ProjectForm";

type Props = {
  trigger?: React.ReactNode;
  workspaceId: string;
};

const CreateProjectModal = ({ trigger, workspaceId }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper
      trigger={trigger}
      title="Create Project"
      open={open}
      onOpenChange={() => {
        setOpen((prev) => !prev);
      }}
    >
      <ProjectForm workspaceId={workspaceId} onClose={() => setOpen(false)} />
    </Wrapper>
  );
};

export default CreateProjectModal;
