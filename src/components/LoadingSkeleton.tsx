import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
  type?: 'table' | 'card' | 'line';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 4,
  className = '',
  type = 'line',
}) => {
  if (type === 'table') {
    return (
      <div className={`space-y-3 ${className}`} aria-label="Loading data...">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="skeleton-box w-8 h-8 rounded-lg shrink-0" />
            <div className="skeleton-box h-4 flex-1 rounded" />
            <div className="skeleton-box h-4 w-24 rounded" />
            <div className="skeleton-box h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`} aria-label="Loading cards...">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border-card bg-[#FBF7F0] space-y-3">
            <div className="flex items-center justify-between">
              <div className="skeleton-box h-4 w-32 rounded" />
              <div className="skeleton-box h-4 w-12 rounded-full" />
            </div>
            <div className="skeleton-box h-10 w-full rounded" />
            <div className="flex items-center justify-between pt-2">
              <div className="skeleton-box h-3 w-20 rounded" />
              <div className="skeleton-box h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} aria-label="Loading content...">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton-box h-4 rounded"
          style={{ width: `${85 - (i % 3) * 15}%` }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
