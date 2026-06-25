import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant:
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'neutral'
    | 'noCost'
    | 'disabled'
    | 'discarded'
    | 'waived'
    | 'included'
    | 'refundRequested'
    | 'refundFailed'
    | 'refundApproved'
    | 'refundPending'
    | 'refundIssued'
    | 'refundDeclined';
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
