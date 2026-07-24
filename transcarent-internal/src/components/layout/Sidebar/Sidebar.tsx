import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import {
  GridIcon,
  PeopleIcon,
  DocumentIcon,
  HeartIcon,
  HospitalIcon,
  GearIcon,
} from '../../ui/Icons';

function BillingIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="4" width="16" height="12" rx="2" fill="currentColor" />
      <path d="M2 8h16" stroke="white" strokeWidth="1.5" />
      <rect x="5" y="11" width="4" height="2" rx="0.5" fill="white" />
    </svg>
  );
}

function ClientIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="5" width="16" height="11" rx="2" fill="currentColor" />
      <path d="M6 5V4a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="9" y="9" width="2" height="3" rx="1" fill="white" />
    </svg>
  );
}


export function Sidebar() {
  const location = useLocation();
  const isCostShareActive = location.pathname.startsWith('/client/cost-share');

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>TC</div>
        <span className={styles.logoText}>Transcarent</span>
      </div>

      <nav className={styles.nav}>
        {/* Overview */}
        <div className={styles.navSection}>Overview</div>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <span className={styles.navIcon}><GridIcon /></span>
          Dashboard
        </NavLink>

        {/* Member */}
        <div className={styles.navSection}>Member</div>

        <NavLink
          to="/members/accumulators"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <span className={styles.navIcon}><DocumentIcon /></span>
          Accumulator Tool
        </NavLink>

        {/* Client */}
        <div className={styles.navSection}>Client</div>

        <NavLink
          to="/client/cost-share/surgery"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <span className={styles.navIcon}><ClientIcon /></span>
          Member Cost Share
        </NavLink>

        {/* Accumulator */}
        <div className={styles.navSection}>Accumulator</div>

        <NavLink
          to="/accumulator/orbit-check"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <span className={styles.navIcon}><ClientIcon /></span>
          Orbit Data Check
        </NavLink>

        {/* Billing */}
        <div className={styles.navSection}>Billing</div>

        <NavLink
          to="/billing"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <span className={styles.navIcon}><BillingIcon /></span>
          Member Payments
        </NavLink>

        <NavLink
          to="/billing/client-invoicing"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <span className={styles.navIcon}><BillingIcon /></span>
          Client Invoicing
        </NavLink>

        <NavLink
          to="/billing/surgery-ops"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <span className={styles.navIcon}><BillingIcon /></span>
          Surgery Ops
        </NavLink>

        {/* Admin */}
        <div className={styles.navSection}>Admin</div>

        <NavLink
          to="/care"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <span className={styles.navIcon}><HeartIcon /></span>
          Care
        </NavLink>

        <NavLink
          to="/providers"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <span className={styles.navIcon}><HospitalIcon /></span>
          Providers
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <span className={styles.navIcon}><GearIcon /></span>
          Settings
        </NavLink>
      </nav>

      <div className={styles.footer}>© 2024 Transcarent, Inc.</div>
    </aside>
  );
}

export default Sidebar;
