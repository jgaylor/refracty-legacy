'use client';

import { SkeletonText } from '../skeletons/SkeletonComponents';

export function InsightsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {/* Single card container matching the actual structure */}
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`px-4 py-4 ${index > 0 ? 'border-t' : ''}`}
            style={{
              borderColor: index > 0 ? 'var(--border-color)' : 'transparent',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Primary: Content text */}
                <div className="mb-1">
                  <SkeletonText width="100%" height="1.125rem" className="mb-1" />
                  {index % 2 === 0 && (
                    <SkeletonText width="85%" height="1.125rem" />
                  )}
                </div>

                {/* Secondary: Metadata */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Person name */}
                  <SkeletonText width="120px" height="0.75rem" />
                  {/* Badge */}
                  <SkeletonText width="80px" height="0.75rem" className="rounded" />
                  {/* Timestamp */}
                  <SkeletonText width="100px" height="0.75rem" />
                </div>
              </div>

              {/* Menu button skeleton */}
              <div className="flex-shrink-0 self-center">
                <SkeletonText width="1.25rem" height="1.25rem" className="rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

