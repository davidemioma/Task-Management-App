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
