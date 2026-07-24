import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { ToastContainer, useToast } from '../../components/ui/Toast';

interface Preferences {
  emailNotifications: boolean;
  smsAlerts: boolean;
  weeklySummary: boolean;
}

interface BillingPreferences {
  autoGenerateInvoices: boolean;
  eftAutoWithdraw: boolean;
  pastDueNotifications: boolean;
}

export default function Settings() {
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<Preferences>({
    emailNotifications: true,
    smsAlerts: false,
    weeklySummary: true,
  });

  const [billingPrefs, setBillingPrefs] = useState<BillingPreferences>({
    autoGenerateInvoices: true,
    eftAutoWithdraw: false,
    pastDueNotifications: true,
  });

  const toggle = (key: keyof Preferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleBilling = (key: keyof BillingPreferences) => {
    setBillingPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = () => {
    addToast('success', 'Profile settings saved successfully.');
  };

  const handleSavePreferences = () => {
    addToast('success', 'Notification preferences updated.');
  };

  const handleSaveBillingPrefs = () => {
    addToast('success', 'Billing settings saved.');
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

      <Card elevated>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Billing Settings</h2>
          <p className={styles.sectionDesc}>
            Configure automation behavior for client invoice generation, EFT withdrawals, and finance team alerts.
          </p>

          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Auto-Generate Invoices</span>
              <span className={styles.toggleDesc}>
                Automatically generate client invoices at the end of each billing cycle using utilization data
              </span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={billingPrefs.autoGenerateInvoices}
                onChange={() => toggleBilling('autoGenerateInvoices')}
                aria-label="Auto-Generate Invoices"
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>EFT Auto-Withdraw</span>
              <span className={styles.toggleDesc}>
                Automatically initiate EFT withdrawal on the due date for clients with banking info on file
              </span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={billingPrefs.eftAutoWithdraw}
                onChange={() => toggleBilling('eftAutoWithdraw')}
                aria-label="EFT Auto-Withdraw"
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Past-Due Notifications</span>
              <span className={styles.toggleDesc}>
                Notify the Finance team when a client invoice becomes past due
              </span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={billingPrefs.pastDueNotifications}
                onChange={() => toggleBilling('pastDueNotifications')}
                aria-label="Past-Due Notifications"
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          <div className={styles.billingActions}>
            <Button appearance="secondary" onClick={() => navigate('/billing/client-invoicing')}>
              Open Client Invoicing Dashboard →
            </Button>
            <Button appearance="primary" className={styles.saveBtn} onClick={handleSaveBillingPrefs}>
              Save Billing Settings
            </Button>
          </div>
        </section>
      </Card>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
