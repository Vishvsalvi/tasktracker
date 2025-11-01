import { getWorkspaceById } from "@/lib/actions/workspace-actions";
import { getTasksByWorkspace } from "@/lib/actions/task-actions";
import { notFound, redirect } from "next/navigation";
import { WorkspaceKanban } from "@/components/workspace-kanban";
import { auth } from "@/auth";
import { headers } from "next/headers";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Check authentication first
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const result = await getWorkspaceById(id);

  if (!result.success || !result.workspace) {
    notFound();
  }

  const tasksResult = await getTasksByWorkspace(id);
  const tasks = tasksResult.success ? tasksResult.tasks || [] : [];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="px-8 py-6 border-b">
        <h1 className="text-2xl font-semibold">{result.workspace.name}</h1>
      </div>
      <div className="flex-1 px-8 py-6 overflow-hidden">
        <WorkspaceKanban tasks={tasks} workspaceId={id} />
      </div>
    </div>
  );
}

