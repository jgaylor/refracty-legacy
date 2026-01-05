'use client';

import { SkeletonAvatar, SkeletonText } from './SkeletonComponents';

export function SidebarListItemSkeleton() {
  return (
    <div className="group relative flex items-center gap-3 px-3 py-1.5 rounded-md">
      {/* Avatar skeleton */}
      <SkeletonAvatar size={20} />
      
      {/* Name skeleton */}
      <SkeletonText width="60%" height="0.875rem" className="flex-1" />
      
      {/* Menu button skeleton - small square */}
      <div className="w-5 h-5 rounded skeleton-box" />
    </div>
  );
}

