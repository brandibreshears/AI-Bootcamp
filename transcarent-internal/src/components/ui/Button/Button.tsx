import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  appearance?: 'primary' | 'secondary' | 'tertiary' | 'negative';
  size?: 'small' | 'medium';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

function Button({
  appearance = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  children,
  onClick,
  type = 'button',
  className,
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[appearance],
    styles[size],
    disabled ? styles.disabled : '',
    loading ? styles.loading : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}

export { Button };
export default Button;
