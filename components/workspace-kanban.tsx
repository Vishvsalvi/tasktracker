"use client";

import { useState, useTransition } from "react";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
  type DragEndEvent,
} from "@/components/ui/shadcn-io/kanban";
import type { DragStartEvent } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Priority, Status, type Task } from "@/lib/types";
import { createTask, updateTask, deleteTask, updateTaskStatus } from "@/lib/actions/task-actions";
import { Plus, Trash2, Loader, Pencil } from "lucide-react";
import { toast } from "sonner";

type KanbanTask = {
  id: string;
  name: string;
  column: string;
  priority: Priority;
  createdAt: Date;
  description: string | null;
  dueDate: Date | null;
};

type KanbanColumn = {
  id: string;
  name: string;
};

const columns: KanbanColumn[] = [
  { id: "TODO", name: "Planned" },
  { id: "IN_PROGRESS", name: "In Progress" },
  { id: "COMPLETED", name: "Done" },
];

const priorityColors = {
  LOW: "text-blue-600 dark:text-blue-400",
  MEDIUM: "text-yellow-600 dark:text-yellow-400",
  HIGH: "text-red-600 dark:text-red-400",
};

// Format date consistently to avoid hydration errors
function formatDate(date: Date): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

export function WorkspaceKanban({ tasks: initialTasks, workspaceId }: { tasks: Task[]; workspaceId: string }) {
  const [tasks, setTasks] = useState<KanbanTask[]>(
    initialTasks.map((task) => ({
      id: task.id,
      name: task.title,
      column: task.status,
      priority: task.priority,
      createdAt: task.createdAt,
      description: task.description,
      dueDate: task.dueDate,
    }))
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<Status>(Status.TODO);
  const [isPending, startTransition] = useTransition();
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState("");

  // Track original column at drag start to handle state updates correctly
  const [dragStartColumn, setDragStartColumn] = useState<string | null>(null);

  const handleDataChange = (newData: KanbanTask[]) => {
    setTasks(newData);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setDragStartColumn(task.column);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDragStartColumn(null);
      return;
    }

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) {
      setDragStartColumn(null);
      return;
    }

    // Determine the new column/status from the drop target
    // Priority: 1) Column ID if dropped on column, 2) Task's column if dropped on task
    const columnId = columns.find(col => col.id === over.id)?.id;
    const overTask = tasks.find((task) => task.id === over.id);
    
    let newStatus: Status;
    if (columnId) {
      // Dropped directly on a column (empty area)
      newStatus = columnId as Status;
    } else if (overTask) {
      // Dropped on another task - use that task's column
      newStatus = overTask.column as Status;
    } else {
      // Fallback: use the current task's column (shouldn't happen normally)
      newStatus = activeTask.column as Status;
    }

    // Use the original column from drag start, or fallback to current if not tracked
    const originalStatus = (dragStartColumn || activeTask.column) as Status;
    setDragStartColumn(null);

    // Only update database if the status actually changed
    if (originalStatus !== newStatus) {
      // Update database
      startTransition(async () => {
        const result = await updateTaskStatus(activeTask.id, newStatus);
        if (!result.success) {
          toast.error(result.error || "Failed to update task status");
          // Revert the change in local state
          setTasks((prev) => 
            prev.map((task) => 
              task.id === activeTask.id ? { ...task, column: originalStatus } : task
            )
          );
        }
      });
    }
  };

  const handleCreateTask = () => {
    startTransition(async () => {
      const result = await createTask(workspaceId, {
        title,
        description: description || undefined,
        priority,
        status: newTaskStatus,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });

      if (result.success && result.task) {
        toast.success("Task created successfully");
        const newKanbanTask: KanbanTask = {
          id: result.task.id,
          name: result.task.title,
          column: result.task.status,
          priority: result.task.priority,
          createdAt: result.task.createdAt,
          description: result.task.description,
          dueDate: result.task.dueDate,
        };
        setTasks([...tasks, newKanbanTask]);
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        toast.error(result.error || "Failed to create task");
      }
    });
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;

    startTransition(async () => {
      const result = await updateTask(selectedTask.id, {
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      });

      if (result.success && result.task) {
        toast.success("Task updated successfully");
        setTasks((prev) =>
          prev.map((task) =>
            task.id === selectedTask.id
              ? {
                  ...task,
                  name: result.task!.title,
                  description: result.task!.description,
                  priority: result.task!.priority,
                  dueDate: result.task!.dueDate,
                }
              : task
          )
        );
        setIsEditDialogOpen(false);
        setSelectedTask(null);
        resetForm();
      } else {
        toast.error(result.error || "Failed to update task");
      }
    });
  };

  const handleDeleteTask = () => {
    if (!selectedTask) return;

    startTransition(async () => {
      const result = await deleteTask(selectedTask.id);

      if (result.success) {
        toast.success("Task deleted successfully");
        setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id));
        setIsEditDialogOpen(false);
        setSelectedTask(null);
        resetForm();
      } else {
        toast.error(result.error || "Failed to delete task");
      }
    });
  };

  const openCreateDialog = (status: Status) => {
    setNewTaskStatus(status);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (task: KanbanTask) => {
    setSelectedTask(task);
    setTitle(task.name);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority(Priority.MEDIUM);
    setDueDate("");
  };

  return (
    <>
      <div className="h-full w-full">
        <KanbanProvider
          columns={columns}
          data={tasks}
          onDataChange={handleDataChange}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="h-full"
        >
          {(column) => (
            <KanbanBoard id={column.id} key={column.id} className="h-full">
              <KanbanHeader className="flex items-center justify-between">
                <span>{column.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openCreateDialog(column.id as Status)}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </KanbanHeader>
              <KanbanCards<KanbanTask> id={column.id}>
                {(task: KanbanTask) => (
                <KanbanCard<KanbanTask>
                  key={task.id}
                  id={task.id}
                  name={task.name}
                  column={task.column}
                  priority={task.priority}
                  createdAt={task.createdAt}
                  description={task.description}
                  dueDate={task.dueDate}
                 
                >
                  <div 
                    className="relative group space-y-2"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(task);
                    }}
                  >
                    <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          openEditDialog(task);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        type="button"
                        title="Edit task"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setDeletingTaskId(task.id);
                          startTransition(async () => {
                            const result = await deleteTask(task.id);
                            if (result.success) {
                              toast.success("Task deleted successfully");
                              setTasks((prev) => prev.filter((t) => t.id !== task.id));
                            } else {
                              toast.error(result.error || "Failed to delete task");
                            }
                            setDeletingTaskId(null);
                          });
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        type="button"
                        title="Delete task"
                        disabled={deletingTaskId === task.id}
                      >
                        {deletingTaskId === task.id ? (
                          <Loader className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <p className="m-0 font-medium text-sm leading-relaxed pr-14">{task.name}</p>
                    {task.description && (
                      <p className="m-0 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                      <span className={`font-semibold ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span>
                        {formatDate(task.createdAt)}
                      </span>
                    </div>
                  </div>
                </KanbanCard>
                )}
              </KanbanCards>
            </KanbanBoard>
          )}
        </KanbanProvider>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to {columns.find(c => c.id === newTaskStatus)?.name || 'this column'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value={Priority.LOW}>Low</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>High</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={isPending || !title.trim()}>
              {isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating task...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details or delete the task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <select
                id="edit-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value={Priority.LOW}>Low</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>High</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedTask(null);
                  resetForm();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateTask} disabled={isPending || !title.trim()}>
                {isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

