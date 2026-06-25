import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Dialog.module.css';
import { XIcon } from '../Icons';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 's' | 'm' | 'l';
}

const sizeClass: Record<string, string> = {
  s: styles.sizeS,
  m: styles.sizeM,
  l: styles.sizeL,
};

export function Dialog({ open, onClose, title, children, size = 'm' }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className={`${styles.panel} ${sizeClass[size]}`}>
        <div className={styles.header}>
          <h2 className={styles.title} id="dialog-title">
            {title}
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close dialog">
            <XIcon />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Dialog;
