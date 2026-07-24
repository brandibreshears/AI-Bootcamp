import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ClientBillingTool.module.css';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { ToastContainer, useToast } from '../../components/ui/Toast';

type PaymentMethod = 'EFT' | 'Portal';
type ClientInvoiceStatus = 'open' | 'pending' | 'past_due' | 'paid' | 'processing';

interface ClientInvoice {
  id: string;
  client: string;
  invoiceNumber: string;
  billingPeriod: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: ClientInvoiceStatus;
  sentDate: string;
  dueDate: string;
  contactEmail: string;
}

const mockClientInvoices: ClientInvoice[] = [
  {
    id: '1',
    client: 'Apex Industries',
    invoiceNumber: 'CINV-2026-00041',
    billingPeriod: 'May 2026',
    amount: 148250.00,
    paymentMethod: 'EFT',
    status: 'paid',
    sentDate: 'Jun 2, 2026',
    dueDate: 'Jun 16, 2026',
    contactEmail: 'ar@apexindustries.com',
  },
  {
    id: '2',
    client: 'Meridian Healthcare Group',
    invoiceNumber: 'CINV-2026-00042',
    billingPeriod: 'May 2026',
    amount: 92400.00,
    paymentMethod: 'Portal',
    status: 'past_due',
    sentDate: 'Jun 2, 2026',
    dueDate: 'Jun 16, 2026',
    contactEmail: 'billing@meridianhealth.com',
  },
  {
    id: '3',
    client: 'Sunrise Logistics',
    invoiceNumber: 'CINV-2026-00043',
    billingPeriod: 'May 2026',
    amount: 37800.00,
    paymentMethod: 'EFT',
    status: 'processing',
    sentDate: 'Jun 2, 2026',
    dueDate: 'Jun 16, 2026',
    contactEmail: 'finance@sunriselogistics.com',
  },
  {
    id: '4',
    client: 'TechBridge Solutions',
    invoiceNumber: 'CINV-2026-00044',
    billingPeriod: 'May 2026',
    amount: 210500.00,
    paymentMethod: 'EFT',
    status: 'open',
    sentDate: 'Jun 3, 2026',
    dueDate: 'Jun 17, 2026',
    contactEmail: 'accounts@techbridge.io',
  },
  {
    id: '5',
    client: 'Crestwood Municipal',
    invoiceNumber: 'CINV-2026-00045',
    billingPeriod: 'May 2026',
    amount: 55100.00,
    paymentMethod: 'Portal',
    status: 'pending',
    sentDate: 'Jun 3, 2026',
    dueDate: 'Jun 17, 2026',
    contactEmail: 'payments@crestwoodgov.org',
  },
  {
    id: '6',
    client: 'NorthStar Retail Corp',
    invoiceNumber: 'CINV-2026-00046',
    billingPeriod: 'May 2026',
    amount: 128900.00,
    paymentMethod: 'Portal',
    status: 'open',
    sentDate: 'Jun 3, 2026',
    dueDate: 'Jun 17, 2026',
    contactEmail: 'ap@northstarretail.com',
  },
  {
    id: '7',
    client: 'Horizon Energy Partners',
    invoiceNumber: 'CINV-2026-00047',
    billingPeriod: 'May 2026',
    amount: 74650.00,
    paymentMethod: 'EFT',
    status: 'past_due',
    sentDate: 'May 15, 2026',
    dueDate: 'May 29, 2026',
    contactEmail: 'finance@horizonenergy.com',
  },
];

type Tab = 'all' | 'open' | 'pending' | 'past_due' | 'paid';

const STATUS_LABELS: Record<ClientInvoiceStatus, string> = {
  open: 'Open',
  pending: 'Pending',
  past_due: 'Past Due',
  paid: 'Paid',
  processing: 'Processing',
};

const STATUS_BADGE: Record<ClientInvoiceStatus, 'info' | 'warning' | 'error' | 'success' | 'neutral'> = {
  open: 'info',
  pending: 'warning',
  past_due: 'error',
  paid: 'success',
  processing: 'neutral',
};

function formatDollars(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

type ModalType = 'generate' | 'eft' | 'send' | null;

export default function ClientBillingTool() {
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const filtered = activeTab === 'all'
    ? mockClientInvoices
    : mockClientInvoices.filter((inv) => {
        if (activeTab === 'past_due') return inv.status === 'past_due';
        return inv.status === activeTab;
      });

  const openCount = mockClientInvoices.filter((i) => i.status === 'open').length;
  const openAmount = mockClientInvoices.filter((i) => i.status === 'open').reduce((s, i) => s + i.amount, 0);
  const pendingCount = mockClientInvoices.filter((i) => i.status === 'pending').length;
  const pastDueCount = mockClientInvoices.filter((i) => i.status === 'past_due').length;
  const pastDueAmount = mockClientInvoices.filter((i) => i.status === 'past_due').reduce((s, i) => s + i.amount, 0);
  const paidAmount = mockClientInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  const handleResend = (inv: ClientInvoice) => {
    setSendingId(inv.id);
    setTimeout(() => {
      setSendingId(null);
      addToast('success', `Invoice ${inv.invoiceNumber} resent to ${inv.contactEmail}.`);
    }, 1200);
  };

  const handleEFT = (inv: ClientInvoice) => {
    setSelectedInvoice(inv);
    setModal('eft');
  };

  const handleEFTConfirm = () => {
    setModal(null);
    addToast('success', `EFT withdrawal initiated for ${selectedInvoice?.invoiceNumber}. Funds expected in 1–3 business days.`);
    setSelectedInvoice(null);
  };

  const handleGenerate = () => {
    setModal('generate');
  };

  const handleGenerateConfirm = () => {
    setModal(null);
    addToast('success', 'Invoice generated and queued for review. It will be sent once approved.');
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Invoices' },
    { key: 'open', label: `Open (${openCount})` },
    { key: 'pending', label: `Pending (${pendingCount})` },
    { key: 'past_due', label: `Past Due (${pastDueCount})` },
    { key: 'paid', label: 'Paid' },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Client Billing &amp; Invoice Automation</h1>
          <p className={styles.pageSubtitle}>
            Automate invoice generation, EFT withdrawals, and send workflows across all client billing cycles.
          </p>
        </div>
        <Button appearance="primary" onClick={handleGenerate}>
          + Generate Invoice
        </Button>
      </div>

      {/* Stats strip */}
      <div className={styles.statsRow}>
        <Card elevated>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Open</span>
            <span className={styles.statValue}>{formatDollars(openAmount)}</span>
            <span className={styles.statMeta}>{openCount} invoice{openCount !== 1 ? 's' : ''}</span>
          </div>
        </Card>
        <Card elevated>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pending Collection</span>
            <span className={styles.statValue}>{pendingCount}</span>
            <span className={styles.statMeta}>awaiting client action</span>
          </div>
        </Card>
        <Card elevated>
          <div className={styles.statCard} data-alert>
            <span className={styles.statLabel}>Past Due</span>
            <span className={`${styles.statValue} ${styles.statValueAlert}`}>{formatDollars(pastDueAmount)}</span>
            <span className={styles.statMeta}>{pastDueCount} invoice{pastDueCount !== 1 ? 's' : ''} overdue</span>
          </div>
        </Card>
        <Card elevated>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Collected This Cycle</span>
            <span className={`${styles.statValue} ${styles.statValueSuccess}`}>{formatDollars(paidAmount)}</span>
            <span className={styles.statMeta}>May 2026 billing cycle</span>
          </div>
        </Card>
      </div>

      {/* Invoice table */}
      <Card elevated>
        <div className={styles.tableSection}>
          {/* Tabs */}
          <div className={styles.tabs}>
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Invoice #</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Due Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <div className={styles.clientCell}>
                      <span className={styles.clientName}>{inv.client}</span>
                      <span className={styles.clientEmail}>{inv.contactEmail}</span>
                    </div>
                  </td>
                  <td className={styles.mono}>{inv.invoiceNumber}</td>
                  <td>{inv.billingPeriod}</td>
                  <td className={styles.amount}>{formatDollars(inv.amount)}</td>
                  <td>
                    <span className={`${styles.methodPill} ${inv.paymentMethod === 'EFT' ? styles.methodEFT : styles.methodPortal}`}>
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <Badge variant={STATUS_BADGE[inv.status]}>
                      {STATUS_LABELS[inv.status]}
                    </Badge>
                  </td>
                  <td>{inv.sentDate}</td>
                  <td className={inv.status === 'past_due' ? styles.dueDateAlert : ''}>
                    {inv.dueDate}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {(inv.status === 'open' || inv.status === 'past_due') && (
                        <Button
                          appearance="secondary"
                          size="small"
                          onClick={() => handleResend(inv)}
                          loading={sendingId === inv.id}
                        >
                          Resend
                        </Button>
                      )}
                      {inv.paymentMethod === 'EFT' && (inv.status === 'open' || inv.status === 'past_due') && (
                        <Button
                          appearance="primary"
                          size="small"
                          onClick={() => handleEFT(inv)}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className={styles.emptyState}>No invoices in this category.</div>
          )}
        </div>
      </Card>

      {/* Notifications panel */}
      <Card elevated>
        <div className={styles.notificationsSection}>
          <h2 className={styles.sectionTitle}>Internal Notifications</h2>
          <div className={styles.notifList}>
            <div className={`${styles.notifItem} ${styles.notifAlert}`}>
              <span className={styles.notifDot} />
              <div>
                <span className={styles.notifText}>
                  <strong>Horizon Energy Partners</strong> — CINV-2026-00047 is 14 days past due ({formatDollars(74650)}).
                </span>
                <span className={styles.notifTime}>Today, 9:02 AM</span>
              </div>
            </div>
            <div className={`${styles.notifItem} ${styles.notifAlert}`}>
              <span className={styles.notifDot} />
              <div>
                <span className={styles.notifText}>
                  <strong>Meridian Healthcare Group</strong> — CINV-2026-00042 is 13 days past due ({formatDollars(92400)}).
                </span>
                <span className={styles.notifTime}>Today, 9:02 AM</span>
              </div>
            </div>
            <div className={styles.notifItem}>
              <span className={`${styles.notifDot} ${styles.notifDotSuccess}`} />
              <div>
                <span className={styles.notifText}>
                  <strong>Apex Industries</strong> — CINV-2026-00041 EFT payment confirmed ({formatDollars(148250)}).
                </span>
                <span className={styles.notifTime}>Jun 16, 2026, 2:14 PM</span>
              </div>
            </div>
            <div className={styles.notifItem}>
              <span className={`${styles.notifDot} ${styles.notifDotInfo}`} />
              <div>
                <span className={styles.notifText}>
                  <strong>Sunrise Logistics</strong> — EFT withdrawal processing (CINV-2026-00043). Expected Jun 30.
                </span>
                <span className={styles.notifTime}>Jun 27, 2026, 10:45 AM</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Generate Invoice Modal */}
      {modal === 'generate' && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Generate Client Invoice</h2>
            <p className={styles.modalSubtitle}>
              Pulls utilization data for the selected client and billing period to generate a draft invoice for review.
            </p>
            <div className={styles.modalFields}>
              <div className={styles.modalField}>
                <label className={styles.fieldLabel}>Client</label>
                <select className={styles.fieldSelect}>
                  <option>TechBridge Solutions</option>
                  <option>NorthStar Retail Corp</option>
                  <option>Crestwood Municipal</option>
                </select>
              </div>
              <div className={styles.modalField}>
                <label className={styles.fieldLabel}>Billing Period</label>
                <select className={styles.fieldSelect}>
                  <option>June 2026</option>
                  <option>May 2026</option>
                  <option>April 2026</option>
                </select>
              </div>
              <div className={styles.modalField}>
                <label className={styles.fieldLabel}>Payment Method</label>
                <select className={styles.fieldSelect}>
                  <option>EFT (on file)</option>
                  <option>Client Portal</option>
                </select>
              </div>
            </div>
            <div className={styles.modalActions}>
              <Button appearance="secondary" onClick={() => setModal(null)}>Cancel</Button>
              <Button appearance="primary" onClick={handleGenerateConfirm}>Generate &amp; Queue for Review</Button>
            </div>
          </div>
        </div>
      )}

      {/* EFT Withdrawal Modal */}
      {modal === 'eft' && selectedInvoice && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Initiate EFT Withdrawal</h2>
            <p className={styles.modalSubtitle}>
              Funds will be withdrawn directly from {selectedInvoice.client}'s account on file.
            </p>
            <div className={styles.eftSummary}>
              <div className={styles.eftRow}>
                <span>Invoice</span>
                <span className={styles.mono}>{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className={styles.eftRow}>
                <span>Amount</span>
                <span className={styles.eftAmount}>{formatDollars(selectedInvoice.amount)}</span>
              </div>
              <div className={styles.eftRow}>
                <span>Client</span>
                <span>{selectedInvoice.client}</span>
              </div>
              <div className={styles.eftRow}>
                <span>Billing Period</span>
                <span>{selectedInvoice.billingPeriod}</span>
              </div>
              <div className={styles.eftRow}>
                <span>Bank Account</span>
                <span>•••• 8821 (Chase Business)</span>
              </div>
              <div className={styles.eftRow}>
                <span>Expected Settlement</span>
                <span>1–3 business days</span>
              </div>
            </div>
            <div className={styles.modalActions}>
              <Button appearance="secondary" onClick={() => setModal(null)}>Cancel</Button>
              <Button appearance="primary" onClick={handleEFTConfirm}>Confirm Withdrawal</Button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
