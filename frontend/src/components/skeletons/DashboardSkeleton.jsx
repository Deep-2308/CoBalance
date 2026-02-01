import Skeleton from "../ui/Skeleton";

/**
 * Dashboard skeleton loading state.
 * Layout: Wide balance block, 3 stat cards, 4 activity rows
 */
const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Total Balance Block */}
      <Skeleton className="h-24 w-full" />

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>

      {/* Activity Rows */}
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
