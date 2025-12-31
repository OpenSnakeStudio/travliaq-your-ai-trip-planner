import { Skeleton } from "@/components/ui/skeleton";

export function ActivitiesPanelSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <Skeleton className="h-6 w-40" />
      </div>

      {/* Destination tabs */}
      <div className="flex gap-2 p-4 border-b border-border/50">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      {/* Filters section */}
      <div className="p-4 space-y-3 border-b border-border/50">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>

      {/* Activities grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-border/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="p-4 border-t border-border/50">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function AccommodationPanelSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Accommodation tabs */}
      <div className="flex gap-2 p-4 border-b border-border/50">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>

      {/* Form section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Destination */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Travelers */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
          </div>
        </div>

        {/* Results placeholder */}
        <div className="pt-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-border/50 rounded-lg p-4 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search button */}
      <div className="p-4 border-t border-border/50">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function PreferencesPanelSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <Skeleton className="h-6 w-44" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* AI badge */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>

        {/* Travel pace */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>

        {/* Comfort level */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Travel style */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </div>

        {/* Collapsible sections */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* Summary card */}
        <div className="border border-border/50 rounded-lg p-4 space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-32 mt-2" />
        </div>
      </div>

      {/* Save button */}
      <div className="p-4 border-t border-border/50">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
