"use client";

import React from "react";
import Wrapper from "../Wrapper";
import TaskForm from "./TaskForm";
import { WorkspaceTaskProps } from "@/types";

type Props = {
  open: boolean;
  setOpen: () => void;
  onClose: () => void;
  task: WorkspaceTaskProps;
};

const UpdateTaskModal = ({ open, setOpen, onClose, task }: Props) => {
  return (
    <Wrapper
      className="h-[80vh] overflow-y-scroll flex flex-col"
      trigger={<></>}
      title="Update Task"
      open={open}
      onOpenChange={setOpen}
    >
      <TaskForm onClose={onClose} initialData={task} />
    </Wrapper>
  );
};

export default UpdateTaskModal;
