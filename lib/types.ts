// Shared types for client and server components
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "TODO" | "IN_PROGRESS" | "COMPLETED";

export const Priority = {
  LOW: "LOW" as Priority,
  MEDIUM: "MEDIUM" as Priority,
  HIGH: "HIGH" as Priority,
};

export const Status = {
  TODO: "TODO" as Status,
  IN_PROGRESS: "IN_PROGRESS" as Status,
  COMPLETED: "COMPLETED" as Status,
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
};

