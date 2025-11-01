"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkspace } from "@/lib/actions/workspace-actions";
import { useWorkspaces } from "@/components/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Layout, Users, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function HomePageContent() {
  const router = useRouter();
  const { refreshWorkspaces } = useWorkspaces();
  const [workspaceName, setWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    setIsCreating(true);
    
    try {
      const result = await createWorkspace(workspaceName.trim());
      
      if (result.success && result.workspace) {
        toast.success("Workspace created successfully!");
        // Refresh workspaces in sidebar
        await refreshWorkspaces();
        // Redirect to the newly created workspace
        router.push(`/workspace/${result.workspace.id}`);
      } else {
        toast.error(result.error || "Failed to create workspace");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("An error occurred while creating the workspace");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-mono">
            TaskTracker
          </h1>
          <p className="text-lg text-muted-foreground">
            Organize your work with powerful kanban boards and task management
          </p>
        </div>

        {/* Create Workspace Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Your First Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter workspace name (e.g., 'Project Alpha', 'Team Tasks')"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                disabled={isCreating}
                className="flex-1"
              />
              <Button type="submit" disabled={isCreating || !workspaceName.trim()}>
                {isCreating ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Workspace"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Layout className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Kanban Board</h3>
                    <p className="text-sm text-muted-foreground">
                      Organize tasks in columns (To Do, In Progress, Done) with drag-and-drop
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Multiple Workspaces</h3>
                    <p className="text-sm text-muted-foreground">
                      Create separate workspaces for different projects or teams
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Task Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Create, edit, and delete tasks with descriptions and due dates
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Easy Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Move tasks between columns to track progress
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground">How to Use</h2>
          <Card>
            <CardContent className="pt-6">
              <ol className="space-y-3 list-decimal list-inside">
                <li className="text-muted-foreground">
                  Create a workspace above to get started
                </li>
                <li className="text-muted-foreground">
                  Create tasks by clicking the &quot;Add Task&quot; button in any column
                </li>
                <li className="text-muted-foreground">
                  Drag tasks between columns to update their status
                </li>
                <li className="text-muted-foreground">
                  Create multiple workspaces for different projects
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

