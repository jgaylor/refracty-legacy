'use client';

import { useEffect, useRef } from 'react';
import { SidebarContent } from './Sidebar';
import type { User } from '@supabase/supabase-js';
import { useDrawer } from './DrawerContext';

interface SidebarDrawerProps {
  initialUser?: User | null;
}

export function SidebarDrawer({ initialUser }: SidebarDrawerProps) {
  const { isOpen, setIsOpen } = useDrawer();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer when clicking outside or on a link
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    const handleLinkClick = (event: MouseEvent) => {
      // Close drawer when clicking on any link inside the drawer
      const target = event.target as HTMLElement;
      if (target.closest('a') && drawerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('click', handleLinkClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleLinkClick);
    };
  }, [isOpen]);

  // Close drawer on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black transition-opacity"
          style={{ opacity: 0.5 }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--bg-primary)', borderRightColor: 'var(--border-color)' }}
      >
        <aside className="h-full w-full border-r sidebar-bg">
          <SidebarContent initialUser={initialUser} />
        </aside>
      </div>
    </>
  );
}

