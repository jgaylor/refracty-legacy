'use client';

import { useState, useRef, useEffect } from 'react';
import { IconButton } from './IconButton';

export interface PageAction {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface PageActionsProps {
  actions: PageAction[];
}

export function PageActions({ actions }: PageActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action: PageAction) => {
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        isActive={isOpen}
        aria-label="Page actions"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
      </IconButton>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-[60] border"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-tertiary transition-colors"
                style={{
                  color: action.destructive ? '#ef4444' : 'var(--text-primary)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

