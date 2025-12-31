'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: 'standard' | 'group-hover' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  destructive?: boolean;
  isActive?: boolean;
  children: ReactNode; // SVG icon element
}

export function IconButton({
  variant = 'standard',
  size = 'md',
  destructive = false,
  isActive = false,
  className = '',
  children,
  ...props
}: IconButtonProps) {
  // Size classes for padding
  const sizeClasses = {
    sm: 'p-1',
    md: variant === 'compact' ? 'p-1' : 'p-2',
    lg: 'p-3',
  };

  // Base classes
  const baseClasses = `
    rounded-md
    transition-colors
    focus:outline-none
    disabled:opacity-50
    disabled:cursor-not-allowed
    ${sizeClasses[size]}
  `.trim().replace(/\s+/g, ' ');

  // Variant-specific classes
  let variantClasses = '';
  let styleProps: React.CSSProperties = {};

  if (variant === 'group-hover') {
    // Group hover pattern: hidden until container hover, then normal hover states
    variantClasses = destructive 
      ? 'opacity-0 group-hover:opacity-100 text-neutral-500'
      : 'opacity-0 group-hover:opacity-100';
    
    styleProps = {
      color: destructive ? undefined : 'var(--text-secondary)',
      backgroundColor: 'transparent',
    };
  } else {
    // Standard variant: always visible with hover background
    variantClasses = '';
    
    styleProps = {
      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
    };
  }

  // Hover handlers for CSS variable support (need inline styles for theme variables)
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'standard' || variant === 'compact') {
      if (!isActive) {
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
      }
    } else if (variant === 'group-hover') {
      // Group hover: background on direct hover
      if (destructive) {
        e.currentTarget.style.color = '#ef4444'; // red-600
      } else {
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
      }
    }
    props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'standard' || variant === 'compact') {
      if (!isActive) {
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    } else if (variant === 'group-hover') {
      if (destructive) {
        e.currentTarget.style.color = ''; // Reset to default (text-neutral-500 via class)
      } else {
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }
    props.onMouseLeave?.(e);
  };

  const combinedClassName = `${baseClasses} ${variantClasses} ${className}`.trim();

  return (
    <button
      {...props}
      className={combinedClassName}
      style={styleProps}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}

