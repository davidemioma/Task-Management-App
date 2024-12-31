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
