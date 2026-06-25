import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {children}
    </span>
  );
}

export default Badge;
