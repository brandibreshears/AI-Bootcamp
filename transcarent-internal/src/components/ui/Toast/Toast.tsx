import React, { useEffect } from 'react';
import styles from './Toast.module.css';
import { CheckIcon, XIcon, WarningIcon, InfoIcon } from '../Icons';

interface ToastProps {
  id: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckIcon,
  error: XIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

export function Toast({ id, variant, message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const Icon = icons[variant];

  return (
    <div className={`${styles.toast} ${styles[variant]}`} role="alert">
      <span className={`${styles.icon} ${styles[variant]}`}>
        <Icon />
      </span>
      <span className={styles.message}>{message}</span>
      <button className={styles.dismiss} onClick={() => onDismiss(id)} aria-label="Dismiss">
        <XIcon />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; variant: 'success' | 'error' | 'warning' | 'info'; message: string }>;
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <Toast key={t.id} id={t.id} variant={t.variant} message={t.message} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default Toast;
