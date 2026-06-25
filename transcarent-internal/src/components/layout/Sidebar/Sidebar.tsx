import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import {
  GridIcon,
  PeopleIcon,
  DocumentIcon,
  HeartIcon,
  HospitalIcon,
  GearIcon,
} from '../../ui/Icons';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <GridIcon /> },
  { path: '/members', label: 'Members', icon: <PeopleIcon /> },
  { path: '/claims', label: 'Claims', icon: <DocumentIcon /> },
  { path: '/care', label: 'Care', icon: <HeartIcon /> },
  { path: '/providers', label: 'Providers', icon: <HospitalIcon /> },
  { path: '/settings', label: 'Settings', icon: <GearIcon /> },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>TC</div>
        <span className={styles.logoText}>Transcarent</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.footer}>© 2024 Transcarent, Inc.</div>
    </aside>
  );
}

export default Sidebar;
