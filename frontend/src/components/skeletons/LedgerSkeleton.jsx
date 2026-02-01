import Skeleton from "../ui/Skeleton";

/**
 * Ledger page skeleton loading state.
 * Layout: 6 contact list items with avatar and text lines
 */
const LedgerSkeleton = () => {
  return (
    <div className="space-y-4 py-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4">
          {/* Avatar */}
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          {/* Text Lines */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LedgerSkeleton;
