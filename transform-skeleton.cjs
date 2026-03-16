const fs = require('fs');

const content = `/**
 * Skeleton - Dark premium loading placeholders
 * Uses bg-card and bg-card-hover for shimmer
 */

// Base Skeleton Component
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={\`animate-pulse bg-card-hover rounded \${className}\`}
      {...props}
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/60 p-6">
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-10 w-24" />
    </div>
  );
}

// Listing Card Skeleton
export function ListingCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-border/60">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
      <table className="min-w-full divide-y divide-border/60">
        <thead className="bg-card-hover">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border/60">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Dashboard Stats Skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/60 p-6">
      <Skeleton className="h-4 w-28 mb-2" />
      <Skeleton className="h-10 w-16" />
    </div>
  );
}

// Message/Conversation Card Skeleton
export function ConversationCardSkeleton() {
  return (
    <div className="bg-card border border-border/60 rounded-lg p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('./src/components/common/Skeleton.jsx', content, 'utf8');
console.log('✅ Skeleton components updated to dark premium');
