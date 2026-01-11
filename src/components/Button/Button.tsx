import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.root} hitArea ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
