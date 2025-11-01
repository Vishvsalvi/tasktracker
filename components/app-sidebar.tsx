"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupLabel,
  } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth-actions"
import { createWorkspace, renameWorkspace, deleteWorkspace } from "@/lib/actions/workspace-actions"
import { useWorkspaces } from "@/components/workspace-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import  { LogOut, Plus, Loader, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"
  
  export function AppSidebar() {
    const router = useRouter()
    const { workspaces, isLoading: isLoadingWorkspaces, refreshWorkspaces } = useWorkspaces()
    const [open, setOpen] = useState(false)
    const [workspaceName, setWorkspaceName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null)
    const [newWorkspaceName, setNewWorkspaceName] = useState("")
    const [isRenaming, setIsRenaming] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    useEffect(() => {
      refreshWorkspaces()
    }, [refreshWorkspaces])

    const handleSignOut = async () => {
      setIsLoggingOut(true)
      try {
        await signOut()
        router.push("/auth/signin")
      } catch (error) {
        toast.error("Failed to logout")
        setIsLoggingOut(false)
      }
    }

    const handleCreateWorkspace = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsCreating(true)
      
      const result = await createWorkspace(workspaceName)
      
      if (result.success) {
        toast.success("Workspace created successfully!")
        setWorkspaceName("")
        setOpen(false)
        // Reload workspaces
        await refreshWorkspaces()
      } else {
        toast.error(result.error || "Failed to create workspace")
      }
      
      setIsCreating(false)
    }

    const handleRenameWorkspace = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedWorkspace) return
      
      setIsRenaming(true)
      const result = await renameWorkspace(selectedWorkspace.id, newWorkspaceName)
      
      if (result.success) {
        toast.success("Workspace renamed successfully!")
        setRenameDialogOpen(false)
        setSelectedWorkspace(null)
        setNewWorkspaceName("")
        await refreshWorkspaces()
      } else {
        toast.error(result.error || "Failed to rename workspace")
      }
      
      setIsRenaming(false)
    }

    const handleDeleteWorkspace = async () => {
      if (!selectedWorkspace) return
      
      setIsDeleting(true)
      const result = await deleteWorkspace(selectedWorkspace.id)
      
      if (result.success) {
        toast.success("Workspace deleted successfully!")
        setDeleteDialogOpen(false)
        setSelectedWorkspace(null)
        await refreshWorkspaces()
      } else {
        toast.error(result.error || "Failed to delete workspace")
      }
      
      setIsDeleting(false)
    }

    const openRenameDialog = (workspace: any) => {
      setSelectedWorkspace(workspace)
      setNewWorkspaceName(workspace.name)
      setRenameDialogOpen(true)
    }

    const openDeleteDialog = (workspace: any) => {
      setSelectedWorkspace(workspace)
      setDeleteDialogOpen(true)
    }
    
    return (
      <Sidebar>
        <SidebarHeader className=" font-mono">
        TaskTracker
        </SidebarHeader>
        <SidebarContent className="px-4 mt-4">
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />  Create Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Workspace</DialogTitle> 
                <DialogDescription>
                  Enter a name for your new workspace.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateWorkspace}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      placeholder="My Workspace"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Workspace"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
         <SidebarGroup>
            <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
            {isLoadingWorkspaces ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-4 h-4 animate-spin" />
              </div>
            ) : workspaces.length > 0 ? (
              <div className="space-y-2 mt-2">
                {workspaces.map((workspace) => (
                  <div key={workspace.id} className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start"
                      asChild
                    >
                      <Link href={`/workspace/${workspace.id}`}>
                        {workspace.name}
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Workspace options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openRenameDialog(workspace)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                      
                        <DropdownMenuItem 
                          variant="destructive"
                          onClick={() => openDeleteDialog(workspace)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No workspaces yet
              </p>
            )}
         </SidebarGroup>
          
        </SidebarContent>
        <SidebarFooter className="px-4 mb-4">
          <div className="flex gap-2">
            <ThemeToggle />
            <Button 
              variant="destructive" 
              className="flex-1 min-w-0"
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </SidebarFooter>

        {/* Rename Dialog */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Workspace</DialogTitle>
              <DialogDescription>
                Enter a new name for &quot;{selectedWorkspace?.name}&quot;
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRenameWorkspace}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-workspace-name">Workspace Name</Label>
                  <Input
                    id="new-workspace-name"
                    placeholder="New workspace name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRenameDialogOpen(false)}
                  disabled={isRenaming}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isRenaming}>
                  {isRenaming ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Renaming...
                    </>
                  ) : (
                    "Rename"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Workspace</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedWorkspace?.name}&quot;? This action cannot be undone and will delete all tasks in this workspace.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteWorkspace}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Sidebar>
    )
  }