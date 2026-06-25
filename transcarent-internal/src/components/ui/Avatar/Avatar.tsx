import React from 'react';
import styles from './Avatar.module.css';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string;
}

export function Avatar({ name, size = 'md', src }: AvatarProps) {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();

  return (
    <div className={`${styles.avatar} ${styles[size]}`} aria-label={name}>
      {src ? <img src={src} alt={name} /> : initials}
    </div>
  );
}

export default Avatar;
