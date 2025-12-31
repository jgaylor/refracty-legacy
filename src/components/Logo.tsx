'use client';

import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href, className = '' }: LogoProps) {
  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Rounded icon with "R" */}
      <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
        <span className="text-white font-medium text-sm">R</span>
      </div>
      {/* Logo text */}
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Refracty
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

