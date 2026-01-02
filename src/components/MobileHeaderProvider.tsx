'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { PageAction } from './PageActions';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface MobileHeaderConfig {
  pageTitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  moreActions?: PageAction[];
}

interface MobileHeaderContextType {
  config: MobileHeaderConfig | null;
  setConfig: (config: MobileHeaderConfig | null) => void;
}

const MobileHeaderContext = createContext<MobileHeaderContextType | undefined>(undefined);

export function MobileHeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<MobileHeaderConfig | null>(null);

  return (
    <MobileHeaderContext.Provider value={{ config, setConfig }}>
      {children}
    </MobileHeaderContext.Provider>
  );
}

export function useMobileHeader() {
  const context = useContext(MobileHeaderContext);
  if (context === undefined) {
    throw new Error('useMobileHeader must be used within a MobileHeaderProvider');
  }
  return context;
}

