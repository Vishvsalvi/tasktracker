"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createWorkspace(name: string) {
  // Validate workspace name early (before auth check)
  const trimmedName = name?.trim();
  if (!trimmedName || trimmedName.length === 0) {
    return {
      success: false,
      error: "Workspace name is required",
    };
  }

  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to create a workspace",
      };
    }

    // Create the workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: trimmedName,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/");
    revalidatePath("/workspace");

    return {
      success: true,
      workspace,
    };
  } catch (error) {
    console.error("Error creating workspace:", error);
    return {
      success: false,
      error: "Failed to create workspace",
    };
  }
}

export async function getWorkspaces() {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to view workspaces",
      };
    }

    // Get all workspaces for the user (optimized query)
    const workspaces = await prisma.workspace.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      workspaces,
    };
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return {
      success: false,
      error: "Failed to fetch workspaces",
    };
  }
}

export async function renameWorkspace(workspaceId: string, newName: string) {
  // Validate workspace name early
  const trimmedName = newName?.trim();
  if (!trimmedName || trimmedName.length === 0) {
    return {
      success: false,
      error: "Workspace name is required",
    };
  }

  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to rename a workspace",
      };
    }

    // Update the workspace name (single query with ownership check)
    const updatedWorkspace = await prisma.workspace.updateMany({
      where: {
        id: workspaceId,
        userId: session.user.id,
      },
      data: {
        name: trimmedName,
      },
    });

    if (updatedWorkspace.count === 0) {
      return {
        success: false,
        error: "Workspace not found or you don't have permission to rename it",
      };
    }

    // Fetch the updated workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/");
    revalidatePath(`/workspace/${workspaceId}`);

    return {
      success: true,
      workspace,
    };
  } catch (error) {
    console.error("Error renaming workspace:", error);
    return {
      success: false,
      error: "Failed to rename workspace",
    };
  }
}

export async function deleteWorkspace(workspaceId: string) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to delete a workspace",
      };
    }

    // Verify ownership first
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: session.user.id,
      },
    });

    if (!workspace) {
      return {
        success: false,
        error: "Workspace not found or you don't have permission to delete it",
      };
    }

    // Delete the workspace (this will cascade delete all tasks)
    await prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/");
    revalidatePath("/workspace");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return {
      success: false,
      error: "Failed to delete workspace",
    };
  }
}

export async function getWorkspaceById(workspaceId: string) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be logged in to view a workspace",
      };
    }

    // Get the workspace
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

    return {
      success: true,
      workspace,
    };
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return {
      success: false,
      error: "Failed to fetch workspace",
    };
  }
}

