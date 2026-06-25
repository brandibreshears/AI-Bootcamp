import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './TopBar.module.css';
import { BellIcon, SearchIcon } from '../../ui/Icons';
import { Avatar } from '../../ui/Avatar/Avatar';

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/members/')) return 'Member Detail';
  if (pathname === '/members') return 'Members';
  if (pathname === '/claims') return 'Claims';
  if (pathname === '/care') return 'Care';
  if (pathname === '/providers') return 'Providers';
  if (pathname === '/settings') return 'Settings';
  return 'Transcarent';
}

export function TopBar() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search..."
            aria-label="Search"
          />
        </div>
        <button className={styles.iconButton} aria-label="Notifications">
          <BellIcon />
        </button>
        <Avatar name="Danielle Kees" size="sm" />
      </div>
    </header>
  );
}

export default TopBar;
