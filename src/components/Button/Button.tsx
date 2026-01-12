import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const variantClass = variant === 'primary' ? styles.primary : styles.secondary;
  
  return (
    <button
      className={`${styles.root} ${variantClass} hitArea ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
