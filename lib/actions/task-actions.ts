"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Priority, Status } from "@/lib/types";

export async function getTasksByWorkspace(workspaceId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be logged in to view tasks",
      };
    }

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: session.user.id,
      },
    });

    if (!workspace) {
      return {
        success: false,
        error: "Workspace not found or you don't have permission to view it",
      };
    }

    const tasks = await prisma.task.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      tasks,
    };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      success: false,
      error: "Failed to fetch tasks",
    };
  }
}

export async function createTask(
  workspaceId: string,
  data: {
    title: string;
    description?: string;
    priority: Priority;
    status: Status;
    dueDate?: Date;
  }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be logged in to create a task",
      };
    }

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: session.user.id,
      },
    });

    if (!workspace) {
      return {
        success: false,
        error: "Workspace not found or you don't have permission to create tasks in it",
      };
    }

    if (!data.title || data.title.trim().length === 0) {
      return {
        success: false,
        error: "Task title is required",
      };
    }

    const task = await prisma.task.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim(),
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
        workspaceId,
      },
    });

    revalidatePath(`/workspace/${workspaceId}`);

    return {
      success: true,
      task,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      error: "Failed to create task",
    };
  }
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    priority?: Priority;
    status?: Status;
    dueDate?: Date | null;
  }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be logged in to update a task",
      };
    }

    // Verify task belongs to user's workspace
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
      },
      include: {
        workspace: true,
      },
    });

    if (!task || task.workspace.userId !== session.user.id) {
      return {
        success: false,
        error: "Task not found or you don't have permission to update it",
      };
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim();
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: updateData,
    });

    revalidatePath(`/workspace/${task.workspaceId}`);

    return {
      success: true,
      task: updatedTask,
    };
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      success: false,
      error: "Failed to update task",
    };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be logged in to delete a task",
      };
    }

    // Verify task belongs to user's workspace
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
      },
      include: {
        workspace: true,
      },
    });

    if (!task || task.workspace.userId !== session.user.id) {
      return {
        success: false,
        error: "Task not found or you don't have permission to delete it",
      };
    }

    const workspaceId = task.workspaceId;

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    revalidatePath(`/workspace/${workspaceId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      success: false,
      error: "Failed to delete task",
    };
  }
}

export async function updateTaskStatus(taskId: string, status: Status) {
  return updateTask(taskId, { status });
}

