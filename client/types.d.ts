import { TaskStatus } from "./lib/validators/task";

export type UserProps = {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceProps = {
  id: string;
  userId: string;
  name: string;
  inviteCode: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMembersProps = {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  email: string;
  username: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceProjectProps = {
  id: string;
  workspaceId: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceTaskProps = {
  id: string;
  workspaceId: string;
  projectId: string;
  assigneeId: string;
  name: string;
  description: string;
  position: number;
  dueDate: Date;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    image: string;
  };
  project: {
    name: string;
    imageUrl: string;
  };
};

export type OptionsProps = {
  projects: {
    id: string;
    name: string;
    imageUrl: string;
  }[];
  members: {
    id: string;
    role: string;
    user: {
      id: string;
      username: string;
      image: string;
    };
  }[];
};

export type TasksPayload = {
  id: string;
  status: TaskStatus;
  position: number;
}[];

export type AnalyticsType = {
  taskCount: number;
  taskDifference: number;
  assignedTaskCount: number;
  assignedTaskDifference: number;
  completedTaskCount: number;
  completedTaskDifference: number;
  incompleteTaskCount: number;
  incompleteTaskDifference: number;
  overdueTaskCount: number;
  overdueTaskDifference: number;
};

export type WorkspaceDataType = {
  projects: WorkspaceProjectProps[];
  members: {
    id: string;
    role: string;
    user: {
      email: string;
      username: string;
      image: string;
    };
  }[];
  analytics: AnalyticsType;
};
