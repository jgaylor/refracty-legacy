'use client';

import { CSSProperties } from 'react';

interface ShimmerProps {
  text: string;
  className?: string;
  speed?: number; // Animation duration in seconds
  colors?: string[]; // Custom gradient colors
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export function Shimmer({
  text,
  className = '',
  speed = 2,
  colors,
  size = 'base',
}: ShimmerProps) {
  // Default theme-aware colors using CSS variables
  const defaultColors = [
    'var(--text-tertiary)',
    'var(--text-secondary)',
    'var(--text-tertiary)',
  ];

  const gradientColors = colors || defaultColors;
  
  // Create gradient stops
  const gradientStops = gradientColors
    .map((color, index) => {
      const position = (index / (gradientColors.length - 1)) * 100;
      return `${color} ${position}%`;
    })
    .join(', ');

  const gradient = `linear-gradient(90deg, ${gradientStops})`;
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };

  const style: CSSProperties = {
    background: gradient,
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
    animation: `shimmer-text ${speed}s linear infinite`,
  };

  return (
    <span
      className={`${sizeClasses[size]} ${className}`}
      style={style}
      aria-label={text}
    >
      {text}
    </span>
  );
}

