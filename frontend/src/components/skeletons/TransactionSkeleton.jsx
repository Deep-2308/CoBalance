import Skeleton from "../ui/Skeleton";

/**
 * Transaction list skeleton loading state.
 * Layout: Header block + transaction rows
 */
const TransactionSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Block */}
      <Skeleton className="h-16 w-full" />

      {/* Transaction Rows */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionSkeleton;
