import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Billing.module.css';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { SearchIcon } from '../../components/ui/Icons';

export type InvoiceStatus =
  | 'invoice_draft'
  | 'pre_calculated'
  | 'invoice_pending_approval'
  | 'invoice_approved'
  | 'issued_invoice'
  | 'paid'
  | 'invoice_correction_required';

export type ReportingStatus = 'not_reported' | 'manually_reported' | 'automated_file_report';
export type UserRole = 'staff' | 'billing_manager';

export interface Invoice {
  id: string;
  memberName: string;
  client: string;
  dependent: boolean;
  app: boolean;
  encounterType: string;
  invoiceType: 'cost_share' | 'recoupment';
  caseNumber: string;
  encounterDate: string;
  caseRate: number;
  invoiceAmount: number;
  status: InvoiceStatus;
  submittedBy?: string;
  submittedDate?: string;
  correctionNote?: string;
  carrier?: string;
  reportingStatus?: ReportingStatus;
  insuranceId?: string;
  memberDob?: string;
  innDedAmount?: number;
  innOopAmount?: number;
  deductibleMet?: number;
  deductibleMax?: number;
  oopMet?: number;
  oopMax?: number;
  coinsurancePct?: number;
  copay?: number;
  billingType?: string;
}

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    memberName: 'Sarah Mitchell',
    client: 'Apex Industries',
    dependent: false,
    app: true,
    encounterType: 'Surgery',
    invoiceType: 'cost_share',
    caseNumber: 'TC-100842',
    encounterDate: '2026-01-15',
    caseRate: 12500,
    invoiceAmount: 1250,
    status: 'invoice_pending_approval',
    submittedBy: 'J. Rodriguez',
    submittedDate: '2026-06-10',
    insuranceId: 'UHC-884421',
    memberDob: '1985-04-12',
    innDedAmount: 1500,
    innOopAmount: 3000,
    deductibleMet: 500,
    deductibleMax: 1500,
    oopMet: 500,
    oopMax: 3000,
    coinsurancePct: 20,
    copay: 250,
    billingType: 'IRS Minimum',
  },
  {
    id: '2',
    memberName: 'Marcus Webb',
    client: 'BrightPath Co',
    dependent: true,
    app: false,
    encounterType: 'Telehealth',
    invoiceType: 'cost_share',
    caseNumber: 'TC-200109',
    encounterDate: '2026-02-03',
    caseRate: 875,
    invoiceAmount: 0,
    status: 'invoice_draft',
    insuranceId: 'BCBS-221093',
    memberDob: '1990-07-22',
    innDedAmount: 800,
    innOopAmount: 2500,
  },
  {
    id: '3',
    memberName: 'Elena Vasquez',
    client: 'Delta Health',
    dependent: false,
    app: true,
    encounterType: 'Cancer COE',
    invoiceType: 'cost_share',
    caseNumber: 'TC-304211',
    encounterDate: '2026-03-10',
    caseRate: 21000,
    invoiceAmount: 2100,
    status: 'invoice_correction_required',
    submittedBy: 'T. Chen',
    submittedDate: '2026-06-15',
    correctionNote:
      'Deductible amount appears incorrect — please verify against the latest EOB from carrier before resubmitting.',
    insuranceId: 'AET-554322',
    memberDob: '1978-11-03',
    innDedAmount: 3000,
    innOopAmount: 6000,
    deductibleMet: 1200,
    deductibleMax: 3000,
    oopMet: 2100,
    oopMax: 6000,
    coinsurancePct: 20,
    billingType: 'IRS Minimum',
  },
  // Paid — UHC not reported (4 records for bulk demo)
  {
    id: '4',
    memberName: 'Priya Sharma',
    client: 'Apex Industries',
    dependent: false,
    app: true,
    encounterType: 'Surgery',
    invoiceType: 'cost_share',
    caseNumber: 'TC-104022',
    encounterDate: '2026-01-28',
    caseRate: 6500,
    invoiceAmount: 650,
    status: 'paid',
    carrier: 'United Healthcare',
    reportingStatus: 'not_reported',
    insuranceId: 'UHC-112049',
    memberDob: '1992-03-17',
    innDedAmount: 1500,
    innOopAmount: 3000,
  },
  {
    id: '11',
    memberName: 'Lisa Johnson',
    client: 'Apex Industries',
    dependent: false,
    app: true,
    encounterType: 'Surgery',
    invoiceType: 'cost_share',
    caseNumber: 'TC-110031',
    encounterDate: '2026-02-14',
    caseRate: 9200,
    invoiceAmount: 920,
    status: 'paid',
    carrier: 'United Healthcare',
    reportingStatus: 'not_reported',
    insuranceId: 'UHC-556012',
    memberDob: '1988-07-04',
    innDedAmount: 1500,
    innOopAmount: 3000,
  },
  {
    id: '12',
    memberName: 'Kevin Park',
    client: 'Summit Corp',
    dependent: false,
    app: true,
    encounterType: 'Surgery',
    invoiceType: 'cost_share',
    caseNumber: 'TC-120044',
    encounterDate: '2026-03-05',
    caseRate: 11000,
    invoiceAmount: 1100,
    status: 'paid',
    carrier: 'United Healthcare',
    reportingStatus: 'not_reported',
    insuranceId: 'UHC-998823',
    memberDob: '1979-11-19',
    innDedAmount: 1500,
    innOopAmount: 3000,
  },
  {
    id: '13',
    memberName: 'Maria Santos',
    client: 'NovaCare',
    dependent: true,
    app: true,
    encounterType: 'Ortho',
    invoiceType: 'cost_share',
    caseNumber: 'TC-130077',
    encounterDate: '2026-04-18',
    caseRate: 7800,
    invoiceAmount: 780,
    status: 'paid',
    carrier: 'United Healthcare',
    reportingStatus: 'not_reported',
    insuranceId: 'UHC-334455',
    memberDob: '1994-05-30',
    innDedAmount: 1500,
    innOopAmount: 3000,
  },
  // Paid — UHC manually reported
  {
    id: '6',
    memberName: 'Chloe Park',
    client: 'NovaCare',
    dependent: true,
    app: true,
    encounterType: 'Care at Home',
    invoiceType: 'cost_share',
    caseNumber: 'TC-620011',
    encounterDate: '2026-05-12',
    caseRate: 3200,
    invoiceAmount: 320,
    status: 'paid',
    carrier: 'United Healthcare',
    reportingStatus: 'manually_reported',
    insuranceId: 'UHC-770844',
    memberDob: '1995-12-01',
    innDedAmount: 1000,
    innOopAmount: 2500,
  },
  // Paid — Aetna not reported (2 records)
  {
    id: '8',
    memberName: 'Nina Patel',
    client: 'Delta Health',
    dependent: false,
    app: true,
    encounterType: 'Chemo',
    invoiceType: 'cost_share',
    caseNumber: 'TC-800421',
    encounterDate: '2026-06-01',
    caseRate: 18000,
    invoiceAmount: 1800,
    status: 'paid',
    carrier: 'Aetna',
    reportingStatus: 'not_reported',
    insuranceId: 'AET-330091',
    memberDob: '1971-06-14',
    innDedAmount: 3000,
    innOopAmount: 7500,
  },
  {
    id: '14',
    memberName: 'Robert Chen',
    client: 'BrightPath Co',
    dependent: false,
    app: true,
    encounterType: 'Surgery',
    invoiceType: 'cost_share',
    caseNumber: 'TC-140066',
    encounterDate: '2026-05-22',
    caseRate: 14500,
    invoiceAmount: 1450,
    status: 'paid',
    carrier: 'Aetna',
    reportingStatus: 'not_reported',
    insuranceId: 'AET-667720',
    memberDob: '1983-02-08',
    innDedAmount: 2000,
    innOopAmount: 5000,
  },
  // Paid — BCBS automated file report (system-set, locked)
  {
    id: '15',
    memberName: 'Jennifer Wu',
    client: 'Summit Corp',
    dependent: false,
    app: true,
    encounterType: 'Telehealth',
    invoiceType: 'cost_share',
    caseNumber: 'TC-150088',
    encounterDate: '2026-04-30',
    caseRate: 2800,
    invoiceAmount: 280,
    status: 'paid',
    carrier: 'BCBS',
    reportingStatus: 'automated_file_report',
    insuranceId: 'BCBS-441199',
    memberDob: '1990-09-15',
    innDedAmount: 1200,
    innOopAmount: 3500,
  },
  // Active
  {
    id: '5',
    memberName: 'James Okafor',
    client: 'Summit Corp',
    dependent: false,
    app: true,
    encounterType: 'Ortho',
    invoiceType: 'cost_share',
    caseNumber: 'TC-511022',
    encounterDate: '2026-04-05',
    caseRate: 8800,
    invoiceAmount: 880,
    status: 'issued_invoice',
    carrier: 'Aetna',
    insuranceId: 'AET-990211',
    memberDob: '1980-08-30',
    innDedAmount: 2000,
    innOopAmount: 5000,
  },
  // Drafts
  {
    id: '7',
    memberName: 'David Torres',
    client: 'BrightPath Co',
    dependent: false,
    app: false,
    encounterType: 'Telehealth',
    invoiceType: 'recoupment',
    caseNumber: 'TC-711033',
    encounterDate: '2026-05-20',
    caseRate: 500,
    invoiceAmount: 500,
    status: 'invoice_draft',
  },
  // Surgery – Not issued
  {
    id: '9',
    memberName: 'Rachel Kim',
    client: 'Apex Industries',
    dependent: false,
    app: true,
    encounterType: 'Surgery',
    invoiceType: 'cost_share',
    caseNumber: 'TC-900114',
    encounterDate: '2026-06-02',
    caseRate: 15000,
    invoiceAmount: 0,
    status: 'pre_calculated',
    insuranceId: 'UHC-443021',
    memberDob: '1988-09-25',
    innDedAmount: 1500,
    innOopAmount: 3000,
    deductibleMet: 1200,
    deductibleMax: 1500,
    oopMet: 1200,
    oopMax: 3000,
    coinsurancePct: 20,
    billingType: 'IRS Minimum',
  },
  {
    id: '10',
    memberName: 'Thomas Grant',
    client: 'Summit Corp',
    dependent: true,
    app: true,
    encounterType: 'Surgery',
    invoiceType: 'cost_share',
    caseNumber: 'TC-910088',
    encounterDate: '2026-06-10',
    caseRate: 22000,
    invoiceAmount: 0,
    status: 'pre_calculated',
    insuranceId: 'AET-881122',
    memberDob: '1975-02-14',
    innDedAmount: 2000,
    innOopAmount: 5000,
    deductibleMet: 500,
    deductibleMax: 2000,
    oopMet: 500,
    oopMax: 5000,
    coinsurancePct: 20,
    billingType: 'IRS Minimum',
  },
];

const TABS = [
  'Drafts',
  'Surgery – Not issued',
  'Correction Required',
  'Pending Approval',
  'Active',
  'Paid',
  'View All',
] as const;
type Tab = (typeof TABS)[number];

function getTabStatuses(tab: Tab): InvoiceStatus[] {
  switch (tab) {
    case 'Drafts': return ['invoice_draft'];
    case 'Surgery – Not issued': return ['pre_calculated'];
    case 'Correction Required': return ['invoice_correction_required'];
    case 'Pending Approval': return ['invoice_pending_approval'];
    case 'Active': return ['invoice_approved', 'issued_invoice'];
    case 'Paid': return ['paid'];
    case 'View All': return [
      'invoice_draft', 'pre_calculated', 'invoice_pending_approval',
      'invoice_approved', 'issued_invoice', 'paid', 'invoice_correction_required',
    ];
  }
}

function statusBadgeVariant(status: InvoiceStatus) {
  switch (status) {
    case 'invoice_draft': return 'neutral';
    case 'pre_calculated': return 'info';
    case 'invoice_pending_approval': return 'warning';
    case 'invoice_approved': return 'info';
    case 'issued_invoice': return 'info';
    case 'paid': return 'success';
    case 'invoice_correction_required': return 'error';
    default: return 'neutral';
  }
}

function statusLabel(status: InvoiceStatus) {
  switch (status) {
    case 'invoice_draft': return 'Draft';
    case 'pre_calculated': return 'Not calculated';
    case 'invoice_pending_approval': return 'Pending approval';
    case 'invoice_approved': return 'Approved';
    case 'issued_invoice': return 'Issued';
    case 'paid': return 'Paid';
    case 'invoice_correction_required': return 'Correction required';
  }
}

function reportingLabel(r?: ReportingStatus) {
  if (!r) return '—';
  switch (r) {
    case 'not_reported': return 'Not reported';
    case 'manually_reported': return 'Manually reported';
    case 'automated_file_report': return 'Automated file report';
  }
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function formatDate(d: string) {
  if (!d) return '—';
  const [year, month, day] = d.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function buildCsv(rows: Invoice[]): string {
  const headers = [
    'Unique Identifier (i.e. Insurance ID)', 'First Name', 'Last Name',
    'Date of Birth', 'DateofService', 'INN DED Amount', 'INN OOP Amount',
  ];
  const csvRows = rows.map((inv) => {
    const parts = inv.memberName.split(' ');
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ');
    return [
      inv.insuranceId ?? '', firstName, lastName,
      inv.memberDob ?? '', inv.encounterDate,
      inv.innDedAmount ?? '', inv.innOopAmount ?? '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });
  return [headers.map((h) => `"${h}"`).join(','), ...csvRows].join('\n');
}

function triggerDownload(csv: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'accumulator-report.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type: 'success' | 'warning';
  onDismiss: () => void;
}

function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className={`${styles.toast} ${type === 'success' ? styles.toastSuccess : styles.toastWarning}`}>
      <span>{type === 'success' ? '✓' : '⚠'} {message}</span>
      <button className={styles.toastClose} onClick={onDismiss}>✕</button>
    </div>
  );
}

// ── Export modal ───────────────────────────────────────────────────────────────

interface ExportModalProps {
  invoices: Invoice[];
  initialSelected: Set<string>;
  onClose: () => void;
  onConfirm: (selectedIds: string[], markAsReported: boolean) => void;
}

function ExportModal({ invoices, initialSelected, onClose, onConfirm }: ExportModalProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set(initialSelected));
  const [markAsReported, setMarkAsReported] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const selectedInvoices = invoices.filter((inv) => checked.has(inv.id));

  function toggleRow(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleProceed() {
    if (checked.size === 0) return;
    setConfirming(true);
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {!confirming ? (
          <>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Export records to carrier</h3>
              <button className={styles.modalClose} onClick={onClose}>✕</button>
            </div>

            <p className={styles.modalSubtitle}>
              Review the records below. Uncheck any you'd like to remove from this export.
            </p>

            {/* Preview table */}
            <div className={styles.exportTableWrapper}>
              <table className={styles.exportTable}>
                <thead>
                  <tr>
                    <th className={styles.exportTh}></th>
                    <th className={styles.exportTh}>Member</th>
                    <th className={styles.exportTh}>Case #</th>
                    <th className={styles.exportTh}>Carrier</th>
                    <th className={styles.exportTh}>Amount</th>
                    <th className={styles.exportTh}>Reporting</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className={`${styles.exportTr} ${!checked.has(inv.id) ? styles.exportTrUnchecked : ''}`}
                    >
                      <td className={styles.exportTd}>
                        <input
                          type="checkbox"
                          checked={checked.has(inv.id)}
                          onChange={() => toggleRow(inv.id)}
                        />
                      </td>
                      <td className={styles.exportTd}>
                        <div className={styles.exportMemberName}>{inv.memberName}</div>
                        <div className={styles.exportMemberClient}>{inv.client}</div>
                      </td>
                      <td className={styles.exportTd}>{inv.caseNumber}</td>
                      <td className={styles.exportTd}>{inv.carrier}</td>
                      <td className={styles.exportTd}><strong>{formatCurrency(inv.invoiceAmount)}</strong></td>
                      <td className={styles.exportTd}>
                        <span className={styles.reportingBadgeUnreported}>Not reported</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {checked.size === 0 && (
              <p className={styles.exportNoneWarning}>Select at least one record to export.</p>
            )}

            {/* Export options */}
            <div className={styles.exportOptions}>
              <label className={`${styles.exportOption} ${markAsReported ? styles.exportOptionSelected : ''}`}>
                <input
                  type="radio"
                  name="exportMode"
                  checked={markAsReported}
                  onChange={() => setMarkAsReported(true)}
                />
                <div>
                  <div className={styles.exportOptionTitle}>
                    Export CSV + mark as manually reported
                    <span className={styles.recommendedBadge}>Recommended</span>
                  </div>
                  <div className={styles.exportOptionDesc}>
                    Downloads the accumulator file and updates the reporting status for all selected records.
                  </div>
                </div>
              </label>

              <label className={`${styles.exportOption} ${!markAsReported ? styles.exportOptionSelected : ''}`}>
                <input
                  type="radio"
                  name="exportMode"
                  checked={!markAsReported}
                  onChange={() => setMarkAsReported(false)}
                />
                <div>
                  <div className={styles.exportOptionTitle}>Export CSV only</div>
                  <div className={styles.exportOptionDesc}>
                    Downloads the file without updating reporting status.
                  </div>
                </div>
              </label>

              {!markAsReported && (
                <div className={styles.exportWarning}>
                  ⚠ Reporting status will <strong>not</strong> be updated. These records will remain as
                  "Not reported." Remember to come back and update their status manually.
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <Button appearance="secondary" onClick={onClose}>Cancel</Button>
              <Button
                appearance="primary"
                onClick={handleProceed}
              >
                {markAsReported
                  ? `Export & mark ${checked.size} record${checked.size !== 1 ? 's' : ''} as reported`
                  : `Export ${checked.size} record${checked.size !== 1 ? 's' : ''} (CSV only)`}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirm export</h3>
              <button className={styles.modalClose} onClick={onClose}>✕</button>
            </div>

            <div className={styles.confirmBody}>
              <div className={styles.confirmIcon}>{markAsReported ? '📤' : '⬇️'}</div>
              <p className={styles.confirmText}>
                You're about to export <strong>{checked.size} record{checked.size !== 1 ? 's' : ''}</strong> to{' '}
                <strong>{[...new Set(selectedInvoices.map((i) => i.carrier))].join(', ')}</strong>.
              </p>
              {markAsReported ? (
                <p className={styles.confirmSubtext}>
                  Their reporting status will be updated to <strong>Manually reported</strong> after download.
                </p>
              ) : (
                <div className={styles.confirmWarningBox}>
                  ⚠ Reporting status will <strong>not</strong> change. These records will remain as "Not reported."
                </div>
              )}
              <ul className={styles.confirmList}>
                {selectedInvoices.map((inv) => (
                  <li key={inv.id} className={styles.confirmListItem}>
                    <span>{inv.memberName}</span>
                    <span className={styles.confirmListMeta}>{inv.caseNumber} · {inv.carrier} · {formatCurrency(inv.invoiceAmount)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.modalFooter}>
              <Button appearance="secondary" onClick={() => setConfirming(false)}>← Back</Button>
              <Button
                appearance="primary"
                onClick={() => onConfirm([...checked], markAsReported)}
              >
                {markAsReported ? 'Confirm & export' : 'Download CSV'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Change status modal ────────────────────────────────────────────────────────

interface ChangeStatusModalProps {
  invoice: Invoice;
  onClose: () => void;
  onConfirm: (newStatus: ReportingStatus, reason: string) => void;
}

function ChangeStatusModal({ invoice, onClose, onConfirm }: ChangeStatusModalProps) {
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');
  const [newStatus, setNewStatus] = useState<ReportingStatus>(
    invoice.reportingStatus === 'manually_reported' ? 'not_reported' : 'manually_reported'
  );
  const [reason, setReason] = useState('');

  const unchanged = newStatus === invoice.reportingStatus;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalSm}`} onClick={(e) => e.stopPropagation()}>
        {step === 'edit' ? (
          <>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Change reporting status</h3>
              <button className={styles.modalClose} onClick={onClose}>✕</button>
            </div>

            <div className={styles.changeStatusBody}>
              <div className={styles.changeStatusMember}>
                <strong>{invoice.memberName}</strong>
                <span className={styles.changeStatusCase}>{invoice.caseNumber} · {invoice.carrier}</span>
              </div>

              <div className={styles.changeStatusCurrent}>
                <span className={styles.changeStatusLabel}>Current status</span>
                <span className={`${styles.reportingBadge} ${
                  invoice.reportingStatus === 'not_reported' ? styles.reportingBadgeUnreported
                  : styles.reportingBadgeManual
                }`}>
                  {reportingLabel(invoice.reportingStatus)}
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.changeStatusLabel}>New status</label>
                <select
                  className={styles.changeStatusSelect}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReportingStatus)}
                >
                  <option value="not_reported">Not reported</option>
                  <option value="manually_reported">Manually reported</option>
                </select>
                {unchanged && (
                  <p className={styles.changeStatusHint}>Select a different status to continue.</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.changeStatusLabel}>
                  Reason for change <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  className={styles.changeStatusTextarea}
                  rows={3}
                  placeholder="e.g. Accidentally marked as reported before file was sent."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button appearance="secondary" onClick={onClose}>Cancel</Button>
              <Button
                appearance="primary"
                onClick={() => !unchanged && setStep('confirm')}
              >
                Next →
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirm status change</h3>
              <button className={styles.modalClose} onClick={onClose}>✕</button>
            </div>

            <div className={styles.confirmBody}>
              <div className={styles.confirmIcon}>🔄</div>
              <p className={styles.confirmText}>
                You're changing <strong>{invoice.memberName}</strong>'s reporting status:
              </p>
              <div className={styles.statusChangeArrow}>
                <span className={`${styles.reportingBadge} ${
                  invoice.reportingStatus === 'not_reported' ? styles.reportingBadgeUnreported : styles.reportingBadgeManual
                }`}>
                  {reportingLabel(invoice.reportingStatus)}
                </span>
                <span className={styles.arrowIcon}>→</span>
                <span className={`${styles.reportingBadge} ${
                  newStatus === 'not_reported' ? styles.reportingBadgeUnreported : styles.reportingBadgeManual
                }`}>
                  {reportingLabel(newStatus)}
                </span>
              </div>
              {reason && (
                <div className={styles.confirmReasonBox}>
                  <span className={styles.confirmReasonLabel}>Reason</span>
                  <span>{reason}</span>
                </div>
              )}
              <p className={styles.confirmSubtext}>This action will be logged. It cannot be undone automatically.</p>
            </div>

            <div className={styles.modalFooter}>
              <Button appearance="secondary" onClick={() => setStep('edit')}>← Back</Button>
              <Button appearance="primary" onClick={() => onConfirm(newStatus, reason)}>
                Confirm change
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Approval drawer ───────────────────────────────────────────────────────────

interface ApprovalDrawerProps {
  invoice: Invoice;
  isBillingManager: boolean;
  onClose: () => void;
  onApprove: (inv: Invoice) => void;
  onCorrectionRequired: (inv: Invoice, note: string) => void;
}

function ApprovalDrawer({ invoice, isBillingManager, onClose, onApprove, onCorrectionRequired }: ApprovalDrawerProps) {
  const [calcExpanded, setCalcExpanded] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [correctionNote, setCorrectionNote] = useState('');
  const [confirmingApprove, setConfirmingApprove] = useState(false);

  const dedMet = invoice.deductibleMet ?? 0;
  const dedMax = invoice.deductibleMax ?? 0;
  const oopMet = invoice.oopMet ?? 0;
  const oopMax = invoice.oopMax ?? 0;
  const dedRemaining = Math.max(dedMax - dedMet, 0);
  const oopRemaining = Math.max(oopMax - oopMet, 0);
  const coinsurancePct = invoice.coinsurancePct ?? 0;
  const copay = invoice.copay ?? 0;
  const rate = invoice.caseRate;
  const amountAboveDed = Math.max(rate - dedRemaining, 0);
  const coinsuranceAmount = amountAboveDed * (coinsurancePct / 100);
  const rawTotal = dedRemaining + coinsuranceAmount + copay;
  const memberDue = Math.min(rawTotal, oopRemaining);

  function fmtC(n: number) {
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
  function fmtD(d: string) {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div className={styles.drawerBackdrop} onClick={onClose} />

      {/* Panel */}
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div>
            <p className={styles.drawerHeaderLabel}>Pending approval</p>
            <h3 className={styles.drawerHeaderTitle}>{invoice.memberName}</h3>
            <p className={styles.drawerHeaderMeta}>{invoice.caseNumber} · {invoice.encounterType} · {fmtD(invoice.encounterDate)}</p>
          </div>
          <button className={styles.drawerClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.drawerBody}>
          {/* Correction note from prior review */}
          {invoice.correctionNote && (
            <div className={styles.drawerCorrectionBanner}>
              <div className={styles.drawerCorrectionLabel}>Correction required</div>
              <p className={styles.drawerCorrectionText}>{invoice.correctionNote}</p>
            </div>
          )}

          {/* Submission info */}
          <div className={styles.drawerSection}>
            <div className={styles.drawerInfoRow}>
              <span className={styles.drawerInfoLabel}>Submitted by</span>
              <span className={styles.drawerInfoValue}>{invoice.submittedBy ?? '—'}</span>
            </div>
            <div className={styles.drawerInfoRow}>
              <span className={styles.drawerInfoLabel}>Submit date</span>
              <span className={styles.drawerInfoValue}>{invoice.submittedDate ? fmtD(invoice.submittedDate) : '—'}</span>
            </div>
            <div className={styles.drawerInfoRow}>
              <span className={styles.drawerInfoLabel}>Client</span>
              <span className={styles.drawerInfoValue}>{invoice.client}</span>
            </div>
            <div className={styles.drawerInfoRow}>
              <span className={styles.drawerInfoLabel}>Insurance ID</span>
              <span className={styles.drawerInfoValue}>{invoice.insuranceId ?? '—'}</span>
            </div>
            <div className={styles.drawerInfoRow}>
              <span className={styles.drawerInfoLabel}>Date of birth</span>
              <span className={styles.drawerInfoValue}>{invoice.memberDob ? fmtD(invoice.memberDob) : '—'}</span>
            </div>
            <div className={styles.drawerInfoRow}>
              <span className={styles.drawerInfoLabel}>Billing type</span>
              <span className={styles.drawerInfoValue}>{invoice.billingType ?? '—'}</span>
            </div>
            <div className={styles.drawerInfoRow}>
              <span className={styles.drawerInfoLabel}>Invoice type</span>
              <span className={styles.drawerInfoValue}>{invoice.invoiceType === 'cost_share' ? 'Cost share' : 'Recoupment'}</span>
            </div>
          </div>

          {/* Accumulators */}
          <div className={styles.drawerSectionTitle}>Accumulator data</div>
          <div className={styles.drawerSection}>
            <div className={styles.drawerAccumGrid}>
              <div className={styles.drawerAccumItem}>
                <span className={styles.drawerInfoLabel}>Deductible met</span>
                <span className={styles.drawerAccumValue}>{fmtC(dedMet)}</span>
                <div className={styles.drawerAccumBar}>
                  <div className={styles.drawerAccumBarFill} style={{ width: dedMax > 0 ? `${Math.min((dedMet / dedMax) * 100, 100)}%` : '0%' }} />
                </div>
                <span className={styles.drawerAccumSub}>of {fmtC(dedMax)}</span>
              </div>
              <div className={styles.drawerAccumItem}>
                <span className={styles.drawerInfoLabel}>OOP met</span>
                <span className={styles.drawerAccumValue}>{fmtC(oopMet)}</span>
                <div className={styles.drawerAccumBar}>
                  <div className={styles.drawerAccumBarFill} style={{ width: oopMax > 0 ? `${Math.min((oopMet / oopMax) * 100, 100)}%` : '0%' }} />
                </div>
                <span className={styles.drawerAccumSub}>of {fmtC(oopMax)}</span>
              </div>
              <div className={styles.drawerAccumItem}>
                <span className={styles.drawerInfoLabel}>Ded. remaining</span>
                <span className={styles.drawerInfoValue}>{fmtC(dedRemaining)}</span>
              </div>
              <div className={styles.drawerAccumItem}>
                <span className={styles.drawerInfoLabel}>OOP remaining</span>
                <span className={styles.drawerInfoValue}>{fmtC(oopRemaining)}</span>
              </div>
              <div className={styles.drawerAccumItem}>
                <span className={styles.drawerInfoLabel}>Coinsurance</span>
                <span className={styles.drawerAccumValue}>{coinsurancePct}%</span>
              </div>
              {copay > 0 && (
                <div className={styles.drawerAccumItem}>
                  <span className={styles.drawerInfoLabel}>Copay</span>
                  <span className={styles.drawerAccumValue}>{fmtC(copay)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Calculation breakdown */}
          <button className={styles.drawerCalcToggle} onClick={() => setCalcExpanded(v => !v)}>
            <span>How this was calculated</span>
            <span className={`${styles.drawerCalcChevron} ${calcExpanded ? styles.drawerCalcChevronOpen : ''}`}>▾</span>
          </button>
          {calcExpanded && (
            <div className={styles.drawerCalcTable}>
              {[
                { label: 'Case rate', value: fmtC(rate), sub: false },
                { label: 'Deductible remaining', value: fmtC(dedRemaining), sub: false },
                { label: `Amount above deductible`, value: fmtC(amountAboveDed), sub: true },
                { label: `Coinsurance (${coinsurancePct}% × ${fmtC(amountAboveDed)})`, value: fmtC(coinsuranceAmount), sub: true },
                ...(copay > 0 ? [{ label: 'Specialist copay', value: fmtC(copay), sub: false }] : []),
                { label: 'Subtotal', value: fmtC(rawTotal), sub: false },
                { label: 'OOP remaining (cap)', value: fmtC(oopRemaining), sub: false },
              ].map(({ label, value, sub }) => (
                <div key={label} className={`${styles.drawerCalcRow} ${sub ? styles.drawerCalcRowSub : ''}`}>
                  <span className={styles.drawerCalcLabel}>{label}</span>
                  <span className={styles.drawerCalcValue}>{value}</span>
                </div>
              ))}
              <div className={`${styles.drawerCalcRow} ${styles.drawerCalcRowTotal}`}>
                <span className={styles.drawerCalcLabel}>Member cost share due</span>
                <span className={styles.drawerCalcValueTotal}>{fmtC(memberDue)}</span>
              </div>
            </div>
          )}

          {/* Invoice amount */}
          <div className={styles.drawerAmountCard}>
            <div className={styles.drawerAmountLabel}>Invoice amount</div>
            <div className={styles.drawerAmountValue}>{fmtC(invoice.invoiceAmount || memberDue)}</div>
            <div className={styles.drawerAmountMeta}>Case rate {fmtC(rate)} · {coinsurancePct}% coinsurance{copay > 0 ? ` · ${fmtC(copay)} copay` : ''}</div>
          </div>

          {/* Actions */}
          {isBillingManager && !confirmingApprove && !correcting && (
            <div className={styles.drawerActions}>
              <Button appearance="primary" onClick={() => setConfirmingApprove(true)}>
                Approve &amp; send to member
              </Button>
              <Button appearance="secondary" onClick={() => setCorrecting(true)}>
                Correction required
              </Button>
            </div>
          )}

          {isBillingManager && confirmingApprove && (
            <div className={styles.drawerConfirm}>
              <p className={styles.drawerConfirmText}>
                Approve and send <strong>{fmtC(invoice.invoiceAmount || memberDue)}</strong> invoice to <strong>{invoice.memberName}</strong>?
              </p>
              <div className={styles.drawerConfirmButtons}>
                <Button appearance="primary" onClick={() => onApprove(invoice)}>Yes, approve &amp; send</Button>
                <button className={styles.cancelBtn} onClick={() => setConfirmingApprove(false)}>Cancel</button>
              </div>
            </div>
          )}

          {isBillingManager && correcting && (
            <div className={styles.drawerCorrectionForm}>
              <label className={styles.drawerCorrectionFormLabel}>
                Correction note <span style={{ color: '#D93025' }}>*</span>
              </label>
              <p className={styles.drawerCorrectionFormHint}>
                This note will appear on all pages of the invoice wizard for the submitter.
              </p>
              <textarea
                className={styles.drawerCorrectionTextarea}
                rows={3}
                placeholder="e.g. Deductible amount appears incorrect — please verify against latest EOB."
                value={correctionNote}
                onChange={e => setCorrectionNote(e.target.value)}
              />
              <div className={styles.drawerCorrectionButtons}>
                <Button
                  appearance="negative"
                  onClick={() => correctionNote.trim() && onCorrectionRequired(invoice, correctionNote)}
                >
                  Submit correction required
                </Button>
                <button className={styles.cancelBtn} onClick={() => setCorrecting(false)}>Cancel</button>
              </div>
            </div>
          )}

          {!isBillingManager && (
            <div className={styles.drawerReadOnly}>
              👁 <strong>View only.</strong> Switch to Billing manager view to take action.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Billing() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('staff');
  const [activeTab, setActiveTab] = useState<Tab>('Pending Approval');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [carrierFilter, setCarrierFilter] = useState('All carriers');
  const [reportedFilter, setReportedFilter] = useState('All reporting');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [changeStatusInvoice, setChangeStatusInvoice] = useState<Invoice | null>(null);
  const [reviewInvoice, setReviewInvoice] = useState<Invoice | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const tabStatuses = getTabStatuses(activeTab);
  const isPaid = activeTab === 'Paid';
  const isPendingApproval = activeTab === 'Pending Approval';
  const isBillingManager = role === 'billing_manager';

  const filtered = invoices.filter((inv) => {
    if (!tabStatuses.includes(inv.status)) return false;
    if (search && ![inv.memberName, inv.caseNumber, inv.client].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    )) return false;
    if (dateFrom && inv.encounterDate < dateFrom) return false;
    if (dateTo && inv.encounterDate > dateTo) return false;
    if (isPaid) {
      if (carrierFilter !== 'All carriers' && inv.carrier !== carrierFilter) return false;
      const reportingMap: Record<string, ReportingStatus> = {
        'Not reported': 'not_reported',
        'Manually reported': 'manually_reported',
        'Automated file report': 'automated_file_report',
      };
      if (reportedFilter !== 'All reporting' && inv.reportingStatus !== reportingMap[reportedFilter]) return false;
    }
    return true;
  });

  const selectableIds = filtered
    .filter((inv) => inv.reportingStatus === 'not_reported')
    .map((inv) => inv.id);

  const allSelectableSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedRows.has(id));

  function toggleRow(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (allSelectableSelected) selectableIds.forEach((id) => next.delete(id));
      else selectableIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function handleExportConfirm(selectedIds: string[], markAsReported: boolean) {
    const toExport = invoices.filter((inv) => selectedIds.includes(inv.id));
    triggerDownload(buildCsv(toExport));
    if (markAsReported) {
      const ids = new Set(selectedIds);
      setInvoices((prev) => prev.map((inv) =>
        ids.has(inv.id) ? { ...inv, reportingStatus: 'manually_reported' } : inv
      ));
      setToast({
        message: `${selectedIds.length} record${selectedIds.length !== 1 ? 's' : ''} exported and marked as manually reported.`,
        type: 'success',
      });
    } else {
      setToast({
        message: 'CSV downloaded. These records are still marked as "Not reported." Remember to update their status.',
        type: 'warning',
      });
    }
    setSelectedRows(new Set());
    setExportModalOpen(false);
  }

  function handleChangeStatusConfirm(inv: Invoice, newStatus: ReportingStatus) {
    setInvoices((prev) => prev.map((i) =>
      i.id === inv.id ? { ...i, reportingStatus: newStatus } : i
    ));
    setToast({
      message: `${inv.memberName}'s reporting status updated to "${reportingLabel(newStatus)}."`,
      type: 'success',
    });
    setChangeStatusInvoice(null);
  }

  function handleApprove(inv: Invoice) {
    setInvoices((prev) => prev.map((i) =>
      i.id === inv.id ? { ...i, status: 'invoice_approved' as InvoiceStatus } : i
    ));
    setToast({ message: `Invoice approved and sent to ${inv.memberName}.`, type: 'success' });
    setReviewInvoice(null);
  }

  function handleCorrectionRequired(inv: Invoice, note: string) {
    setInvoices((prev) => prev.map((i) =>
      i.id === inv.id ? { ...i, status: 'invoice_correction_required' as InvoiceStatus, correctionNote: note } : i
    ));
    setToast({ message: `Correction note sent. Invoice moved to Correction Required.`, type: 'warning' });
    setReviewInvoice(null);
  }

  const uniqueCarriers = Array.from(new Set(
    invoices.filter((inv) => inv.status === 'paid' && inv.carrier).map((inv) => inv.carrier!)
  ));

  // Invoices available to open in export modal (from current selection, not_reported only)
  const exportableSelected = invoices.filter(
    (inv) => selectedRows.has(inv.id) && inv.reportingStatus === 'not_reported'
  );

  return (
    <div className={styles.page} onClick={() => openMenu && setOpenMenu(null)}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      {exportModalOpen && (
        <ExportModal
          invoices={exportableSelected}
          initialSelected={new Set(exportableSelected.map((i) => i.id))}
          onClose={() => setExportModalOpen(false)}
          onConfirm={handleExportConfirm}
        />
      )}

      {changeStatusInvoice && (
        <ChangeStatusModal
          invoice={changeStatusInvoice}
          onClose={() => setChangeStatusInvoice(null)}
          onConfirm={(newStatus, _reason) => handleChangeStatusConfirm(changeStatusInvoice, newStatus)}
        />
      )}

      {reviewInvoice && (
        <ApprovalDrawer
          invoice={reviewInvoice}
          isBillingManager={isBillingManager}
          onClose={() => setReviewInvoice(null)}
          onApprove={handleApprove}
          onCorrectionRequired={handleCorrectionRequired}
        />
      )}

      <div className={styles.breadcrumb}>
        Billing › <strong>Member payments</strong>
      </div>

      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Member payments</h2>
        <div className={styles.headerRight}>
          <div className={styles.roleToggle}>
            <button
              className={`${styles.roleBtn} ${role === 'staff' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('staff')}
            >
              Staff view
            </button>
            <button
              className={`${styles.roleBtn} ${role === 'billing_manager' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('billing_manager')}
            >
              Billing manager
            </button>
          </div>
          <Button appearance="primary" onClick={() => navigate('/billing/generate')}>
            GENERATE INVOICE
          </Button>
        </div>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.dateInputs}>
          <span className={styles.inputLabel} style={{ alignSelf: 'center', marginRight: 4 }}>Show invoices from:</span>
          <div className={styles.inputGroup}>
            <input type="date" className={styles.dateInput} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <span className={styles.inputLabel} style={{ alignSelf: 'center' }}>to</span>
          <div className={styles.inputGroup}>
            <input type="date" className={styles.dateInput} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          {(dateFrom || dateTo) && (
            <button className={styles.refreshLink} onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear dates</button>
          )}
        </div>
        <div className={styles.searchWrapper}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search member, case number, client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.lastUpdated}>
          <span className={styles.lastUpdatedLabel}>Last updated</span>
          <span className={styles.lastUpdatedTime}>Jun 24, 2026 at 9:41am</span>
          <button className={styles.refreshLink}>Refresh</button>
        </div>
      </div>

      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setSelectedRows(new Set());
              setCarrierFilter('All carriers');
              setReportedFilter('All reporting');
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.filterChips}>
        <span className={styles.filterByLabel}>Filter by</span>
        <button className={styles.chip}>Encounter type +</button>
        <button className={styles.chip}>Client +</button>
        <button className={styles.chip}>Invoice type +</button>
        {isPaid && (
          <>
            <select className={styles.chipSelect} value={carrierFilter} onChange={(e) => setCarrierFilter(e.target.value)}>
              <option>All carriers</option>
              {uniqueCarriers.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className={styles.chipSelect} value={reportedFilter} onChange={(e) => setReportedFilter(e.target.value)}>
              <option>All reporting</option>
              <option>Not reported</option>
              <option>Manually reported</option>
              <option>Automated file report</option>
            </select>
          </>
        )}
      </div>

      {/* Paid tab bulk action bar */}
      {isPaid && selectedRows.size > 0 && (
        <div className={styles.bulkActionBar}>
          <span className={styles.bulkCount}>
            {selectedRows.size} record{selectedRows.size !== 1 ? 's' : ''} selected
          </span>
          <div className={styles.bulkActions}>
            <Button
              appearance="primary"
              size="small"
              onClick={() => setExportModalOpen(true)}
            >
              Export &amp; report…
            </Button>
            <button className={styles.clearSelection} onClick={() => setSelectedRows(new Set())}>
              Clear selection
            </button>
          </div>
        </div>
      )}

      {isPendingApproval && !isBillingManager && (
        <div className={styles.readOnlyNotice}>
          <span className={styles.readOnlyIcon}>&#128065;</span>
          <span>
            <strong>View only.</strong> Approvals can only be processed by billing managers. Toggle to{' '}
            <button className={styles.inlineToggleLink} onClick={() => setRole('billing_manager')}>
              Billing manager view
            </button>{' '}
            to take action.
          </span>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {isPaid && (
                <th className={styles.th}>
                  <input
                    type="checkbox"
                    checked={allSelectableSelected}
                    onChange={toggleAll}
                    title="Select all unreported"
                  />
                </th>
              )}
              <th className={styles.th}>Member</th>
              <th className={styles.thCompact}>Age verified (18+)</th>
              <th className={styles.thCompact}>App registered</th>
              <th className={styles.th}>Encounter type</th>
              <th className={styles.th}>Case number</th>
              <th className={styles.th}>Encounter date</th>
              <th className={styles.th}>Case rate</th>
              <th className={styles.th}>Invoice amount</th>
              {isPaid && <th className={styles.th}>Carrier</th>}
              {isPaid && <th className={styles.th}>Reporting status</th>}
              <th className={styles.th}>Status</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isPaid ? 14 : 12} className={styles.emptyState}>
                  No invoices found for this view.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => {
                const isClickable = ['invoice_pending_approval', 'invoice_correction_required', 'invoice_draft', 'pre_calculated'].includes(inv.status);
                function handleRowClick() {
                  setOpenMenu(null);
                  if (inv.status === 'invoice_pending_approval') {
                    setReviewInvoice(inv);
                  } else if (inv.status === 'invoice_correction_required' || inv.status === 'invoice_draft' || inv.status === 'pre_calculated') {
                    navigate('/billing/generate', { state: { invoice: inv } });
                  }
                }
                return (
                <tr
                  key={inv.id}
                  className={`${styles.tr} ${selectedRows.has(inv.id) ? styles.trSelected : ''} ${isClickable ? styles.trClickable : ''}`}
                  onClick={isClickable ? handleRowClick : undefined}
                >
                  {isPaid && (
                    <td className={styles.td}>
                      {inv.reportingStatus === 'not_reported' && (
                        <input
                          type="checkbox"
                          checked={selectedRows.has(inv.id)}
                          onChange={() => toggleRow(inv.id)}
                        />
                      )}
                    </td>
                  )}
                  <td className={styles.td}>
                    <div className={styles.memberName}>{inv.memberName}</div>
                    <div className={styles.memberClient}>{inv.client}</div>
                  </td>
                  <td className={styles.tdCompact}>
                    <span className={!inv.dependent ? styles.boolYes : styles.boolNo}>
                      {!inv.dependent ? '✓' : '✕'}
                    </span>
                  </td>
                  <td className={styles.tdCompact}>
                    <span className={inv.app && !inv.dependent ? styles.boolYes : styles.boolNo}>
                      {inv.app && !inv.dependent ? '✓' : '✕'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div>{inv.encounterType}</div>
                    <div className={styles.memberClient}>{inv.invoiceType === 'cost_share' ? 'Cost share' : 'Recoupment'}</div>
                  </td>
                  <td className={styles.td}>{inv.caseNumber}</td>
                  <td className={styles.td}>{formatDate(inv.encounterDate)}</td>
                  <td className={styles.td}>{formatCurrency(inv.caseRate)}</td>
                  <td className={styles.td}><strong>{formatCurrency(inv.invoiceAmount)}</strong></td>
                  {isPaid && <td className={styles.td}>{inv.carrier ?? '—'}</td>}
                  {isPaid && (
                    <td className={styles.td}>
                      <span className={`${styles.reportingBadge} ${
                        inv.reportingStatus === 'not_reported' ? styles.reportingBadgeUnreported
                        : inv.reportingStatus === 'manually_reported' ? styles.reportingBadgeManual
                        : styles.reportingBadgeAuto
                      }`}>
                        {reportingLabel(inv.reportingStatus)}
                        {inv.reportingStatus === 'automated_file_report' && (
                          <span className={styles.lockIcon} title="Set automatically by the system — cannot be changed manually">🔒</span>
                        )}
                      </span>
                    </td>
                  )}
                  <td className={styles.td}>
                    <Badge variant={statusBadgeVariant(inv.status) as any}>{statusLabel(inv.status)}</Badge>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.menuWrapper} onClick={(e) => e.stopPropagation()}>
                      <button
                        className={styles.menuBtn}
                        onClick={() => setOpenMenu(openMenu === inv.id ? null : inv.id)}
                        aria-label="Actions"
                      >
                        ⋯
                      </button>
                      {openMenu === inv.id && (
                        <div className={styles.dropdownFixed}>
                          {inv.status === 'invoice_pending_approval' && (
                            <button className={styles.dropdownItem} onClick={() => { setReviewInvoice(inv); setOpenMenu(null); }}>
                              {isBillingManager ? 'Review & approve' : 'View'}
                            </button>
                          )}
                          {(inv.status === 'invoice_draft' || inv.status === 'pre_calculated' || inv.status === 'invoice_correction_required') && (
                            <button className={styles.dropdownItem} onClick={() => navigate('/billing/generate', { state: { invoice: inv } })}>
                              {inv.status === 'pre_calculated' ? 'Review & issue' : inv.status === 'invoice_correction_required' ? 'Open & correct' : 'Edit invoice'}
                            </button>
                          )}
                          {inv.status !== 'invoice_draft' && inv.status !== 'pre_calculated' && inv.status !== 'invoice_correction_required' && inv.status !== 'invoice_pending_approval' && (
                            <button className={styles.dropdownItem} onClick={() => navigate(`/billing/approvals/${inv.id}`)}>
                              View details
                            </button>
                          )}
                          {isPaid && inv.reportingStatus !== 'automated_file_report' && (
                            <button className={styles.dropdownItem} onClick={() => { setChangeStatusInvoice(inv); setOpenMenu(null); }}>
                              Change reporting status
                            </button>
                          )}
                          {isPaid && inv.reportingStatus === 'automated_file_report' && (
                            <span className={styles.dropdownItemDisabled} title="Set by system — cannot be changed">
                              Reporting status locked 🔒
                            </span>
                          )}
                          <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={() => setOpenMenu(null)}>
                            Discard
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.paginationInfo}>
          Showing 1–{filtered.length} of {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
        </span>
        <div className={styles.paginationControls}>
          <button className={styles.pageBtn} disabled>‹ Prev</button>
          <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
          <button className={styles.pageBtn} disabled>Next ›</button>
        </div>
      </div>
    </div>
  );
}
