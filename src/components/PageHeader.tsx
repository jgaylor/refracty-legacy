'use client';

import { Breadcrumb } from './Breadcrumb';
import { PageActions } from './PageActions';
import type { PageAction } from './PageActions';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  actions?: PageAction[];
}

export function PageHeader({ breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="hidden md:block">
        <Breadcrumb items={breadcrumbs} />
      </div>
      {actions && actions.length > 0 && (
        <div className="hidden md:block">
          <PageActions actions={actions} />
        </div>
      )}
    </div>
  );
}

export type { PageAction };
