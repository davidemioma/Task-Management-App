"use client";

import React, { useState } from "react";
import Wrapper from "./Wrapper";
import CreateWorkspace from "./CreateWorkspace";

type Props = {
  trigger?: React.ReactNode;
};

const WorkspaceForm = ({ trigger }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper
      trigger={trigger}
      open={open}
      onOpenChange={() => {
        setOpen((prev) => !prev);
      }}
    >
      <CreateWorkspace onClose={() => setOpen(false)} />
    </Wrapper>
  );
};

export default WorkspaceForm;
