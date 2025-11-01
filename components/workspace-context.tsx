"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { getWorkspaces } from "@/lib/actions/workspace-actions";

interface Workspace {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  isLoading: boolean;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getWorkspaces();
      if (result.success && result.workspaces) {
        setWorkspaces(result.workspaces);
      }
    } catch (error) {
      console.error("Error refreshing workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspaces, isLoading, refreshWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaces() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspaces must be used within a WorkspaceProvider");
  }
  return context;
}

