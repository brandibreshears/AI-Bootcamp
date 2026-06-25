import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AppShell.module.css';
import { Sidebar } from '../Sidebar/Sidebar';
import { TopBar } from '../TopBar/TopBar';

export function AppShell() {
  return (
    <>
      <Sidebar />
      <TopBar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}

export default AppShell;
