import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Header skeleton */}
      <div className="px-8 py-6 border-b">
        <Skeleton className="h-8 w-48" />
      </div>
      
      {/* Kanban board skeleton */}
      <div className="flex-1 px-8 py-6 overflow-hidden">
        <div className="grid grid-cols-3 gap-4 h-full">
          {/* Column 1 - Planned */}
          <div className="flex flex-col h-full border rounded-md bg-secondary divide-y">
            <div className="p-2 flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-hidden">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>

          {/* Column 2 - In Progress */}
          <div className="flex flex-col h-full border rounded-md bg-secondary divide-y">
            <div className="p-2 flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-hidden">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>

          {/* Column 3 - Done */}
          <div className="flex flex-col h-full border rounded-md bg-secondary divide-y">
            <div className="p-2 flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-hidden">
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

