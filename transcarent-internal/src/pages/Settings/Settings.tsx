import React, { useState } from 'react';
import styles from './Settings.module.css';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { ToastContainer, useToast } from '../../components/ui/Toast';

interface Preferences {
  emailNotifications: boolean;
  smsAlerts: boolean;
  weeklySummary: boolean;
}

export default function Settings() {
  const { toasts, addToast, removeToast } = useToast();

  const [prefs, setPrefs] = useState<Preferences>({
    emailNotifications: true,
    smsAlerts: false,
    weeklySummary: true,
  });

  const toggle = (key: keyof Preferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = () => {
    addToast('success', 'Profile settings saved successfully.');
  };

  const handleSavePreferences = () => {
    addToast('success', 'Notification preferences updated.');
  };

  return (
    <div className={styles.page}>
      <Card elevated>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile</h2>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Full Name</span>
            <span className={styles.fieldValue}>Danielle Kees</span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Email Address</span>
            <span className={styles.fieldValue}>dkees@transcarent.com</span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Role</span>
            <span className={styles.fieldValue}>Care Navigator</span>
          </div>
          <Button
            appearance="primary"
            className={styles.saveBtn}
            onClick={handleSaveProfile}
          >
            Save Profile
          </Button>
        </section>
      </Card>

      <Card elevated>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Preferences</h2>

          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Email Notifications</span>
              <span className={styles.toggleDesc}>Receive updates and alerts via email</span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={prefs.emailNotifications}
                onChange={() => toggle('emailNotifications')}
                aria-label="Email Notifications"
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>SMS Alerts</span>
              <span className={styles.toggleDesc}>Get text messages for urgent care episodes</span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={prefs.smsAlerts}
                onChange={() => toggle('smsAlerts')}
                aria-label="SMS Alerts"
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Weekly Summary</span>
              <span className={styles.toggleDesc}>Receive a weekly digest of member activity</span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={prefs.weeklySummary}
                onChange={() => toggle('weeklySummary')}
                aria-label="Weekly Summary"
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          <Button
            appearance="primary"
            className={styles.saveBtn}
            onClick={handleSavePreferences}
          >
            Save Preferences
          </Button>
        </section>
      </Card>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
