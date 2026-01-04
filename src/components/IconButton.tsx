'use client';

import { ButtonHTMLAttributes, ReactNode, useEffect, useRef } from 'react';

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTouchDevice = useRef(false);
  const isTouching = useRef(false);

  // Detect touch device on mount
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);
  
  // Set up listener to clear hover state if mouse events fire after touch
  useEffect(() => {
    if (!isTouchDevice.current || !buttonRef.current) return;
    
    const element = buttonRef.current;
    
    // Clear hover state if mouseenter fires while we're in a touch interaction
    const handleMouseEnterAfterTouch = () => {
      if (isTouching.current) {
        // Inline reset logic to avoid closure issues
        if (variant === 'standard' || variant === 'compact') {
          if (!isActive) {
            element.style.color = 'var(--text-secondary)';
            element.style.backgroundColor = 'transparent';
          }
        } else if (variant === 'group-hover') {
          if (destructive) {
            element.style.color = '';
          } else {
            element.style.color = 'var(--text-secondary)';
            element.style.backgroundColor = 'transparent';
          }
        }
      }
    };
    
    element.addEventListener('mouseenter', handleMouseEnterAfterTouch);
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnterAfterTouch);
    };
  }, [variant, isActive, destructive]);

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
    // Group hover pattern: visible on mobile, hidden until container hover on desktop
    variantClasses = destructive 
      ? 'opacity-100 md:opacity-0 md:group-hover:opacity-100 text-neutral-500'
      : 'opacity-100 md:opacity-0 md:group-hover:opacity-100';
    
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

  // Reset hover state (used for mobile touch events)
  const resetHoverState = (element: HTMLButtonElement) => {
    if (variant === 'standard' || variant === 'compact') {
      if (!isActive) {
        element.style.color = 'var(--text-secondary)';
        element.style.backgroundColor = 'transparent';
      }
    } else if (variant === 'group-hover') {
      if (destructive) {
        element.style.color = '';
      } else {
        element.style.color = 'var(--text-secondary)';
        element.style.backgroundColor = 'transparent';
      }
    }
  };

  // Hover handlers for CSS variable support (need inline styles for theme variables)
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Don't apply hover styles on touch devices or during touch interactions
    if (isTouchDevice.current || isTouching.current) {
      return;
    }
    
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
    // Don't handle mouse leave on touch devices
    if (isTouchDevice.current) {
      return;
    }
    resetHoverState(e.currentTarget);
    props.onMouseLeave?.(e);
  };

  // Touch handlers to prevent sticky hover states on mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    isTouching.current = true;
    // Clear any existing hover state immediately
    resetHoverState(e.currentTarget);
    props.onTouchStart?.(e);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    const element = e.currentTarget;
    
    // Immediately clear any hover state that might have been applied
    resetHoverState(element);
    
    // Reset touching flag after a short delay to allow click to fire
    setTimeout(() => {
      isTouching.current = false;
    }, 100);
    
    // Also clear hover state after delays to catch any delayed hover states from iOS
    setTimeout(() => {
      resetHoverState(element);
    }, 50);
    
    setTimeout(() => {
      resetHoverState(element);
    }, 200);
    
    setTimeout(() => {
      resetHoverState(element);
    }, 500);
    
    props.onTouchEnd?.(e);
  };

  const combinedClassName = `${baseClasses} ${variantClasses} ${className}`.trim();

  return (
    <button
      {...props}
      ref={buttonRef}
      className={combinedClassName}
      style={styleProps}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </button>
  );
}

