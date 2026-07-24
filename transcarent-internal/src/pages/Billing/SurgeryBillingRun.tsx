import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SurgeryBillingRun.module.css';
import { Button } from '../../components/ui/Button/Button';
import { ToastContainer, useToast } from '../../components/ui/Toast';

// ── Types ──────────────────────────────────────────────────────────────────────

type CaseStatus = 'pending_invoice' | 'invoiced' | 'payment_received' | 'provider_paid';
type ReconStatus = 'pending' | 'invoiced';

interface SurgeryCase {
  caseId: string;
  client: string;
  procedure: string;
  dos: string; // surgery date ISO
  globalCaseRate: number;
  travel: number;
  mni: number;
  caseMgmtFee: number;
  deductible: number;
  careAllowance: number;
  status: CaseStatus;
  invoiceSentDate?: string;
  paymentDueDate?: string;
  paymentReceivedDate?: string;
  mniW2Eligible: boolean;
  selected: boolean;
  expanded: boolean;
}

interface ReconciliationCase {
  caseId: string;
  client: string;
  procedure: string;
  surgeryDate: string;
  invoiceDate: string;
  claimsDocsDate: string;
  originalTotal: number;
  actualTotal: number;
  status: ReconStatus;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-06-30');

function daysUntil(isoDate: string): number {
  const target = new Date(isoDate + 'T00:00:00');
  return Math.ceil((target.getTime() - TODAY.getTime()) / 86400000);
}

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtUSD(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function caseTotal(c: SurgeryCase): number {
  return c.globalCaseRate + c.travel + c.mni + c.caseMgmtFee - c.deductible - c.careAllowance;
}

// Invoice number format: Wk[week#][2-digit-year]-[MMDDYYYY]
function weekInvoiceNum(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00');
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  const yr = String(d.getFullYear()).slice(-2);
  const mmddyyyy = String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + d.getFullYear();
  return `Wk${week}${yr}-${mmddyyyy}`;
}

type UrgencyLevel = 'critical' | 'urgent' | 'due' | 'upcoming' | 'future' | 'paid' | 'invoiced';

function getUrgency(c: SurgeryCase): { label: string; level: UrgencyLevel } {
  if (c.status === 'payment_received' || c.status === 'provider_paid') {
    return { label: 'Payment Received', level: 'paid' };
  }
  if (c.status === 'invoiced') {
    const pd = c.paymentDueDate ? daysUntil(c.paymentDueDate) : daysUntil(c.dos) - 7;
    if (pd < 0) return { label: 'Payment Overdue', level: 'critical' };
    if (pd === 0) return { label: 'Payment Due Today', level: 'critical' };
    return { label: `Payment due in ${pd}d`, level: 'urgent' };
  }
  // pending_invoice
  const d = daysUntil(c.dos);
  if (d <= 0) return { label: 'Surgery Today / Past', level: 'critical' };
  if (d <= 7) return { label: `Surgery in ${d}d — Invoice Overdue`, level: 'critical' };
  if (d === 14) return { label: 'Invoice Due Today (D-14)', level: 'due' };
  if (d < 14) return { label: `Invoice Overdue (D-${d})`, level: 'critical' };
  if (d <= 21) return { label: `Invoice due in ${d - 14}d`, level: 'upcoming' };
  return { label: `Surgery in ${d}d`, level: 'future' };
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const INIT_CASES: SurgeryCase[] = [
  {
    caseId: '191827',
    client: 'Vincit Group',
    procedure: 'Total Knee Replacement',
    dos: '2026-07-07',
    globalCaseRate: 28500,
    travel: 3200,
    mni: 850,
    caseMgmtFee: 5700,
    deductible: 1500,
    careAllowance: 500,
    status: 'invoiced',
    invoiceSentDate: '2026-06-23',
    paymentDueDate: '2026-06-30',
    mniW2Eligible: true,
    selected: false,
    expanded: false,
  },
  {
    caseId: '204536',
    client: 'Apex Industries',
    procedure: 'Spinal Fusion — Lumbar',
    dos: '2026-07-10',
    globalCaseRate: 42000,
    travel: 4800,
    mni: 1200,
    caseMgmtFee: 8400,
    deductible: 2500,
    careAllowance: 1000,
    status: 'invoiced',
    invoiceSentDate: '2026-06-26',
    paymentDueDate: '2026-07-03',
    mniW2Eligible: true,
    selected: false,
    expanded: false,
  },
  {
    caseId: '218847',
    client: 'Northwest Steel',
    procedure: 'Hip Resurfacing',
    dos: '2026-07-14',
    globalCaseRate: 31000,
    travel: 0,
    mni: 0,
    caseMgmtFee: 6200,
    deductible: 0,
    careAllowance: 500,
    status: 'pending_invoice',
    mniW2Eligible: false,
    selected: false,
    expanded: false,
  },
  {
    caseId: '229104',
    client: 'Vincit Group',
    procedure: 'Robotic Partial Knee',
    dos: '2026-07-18',
    globalCaseRate: 22000,
    travel: 2100,
    mni: 600,
    caseMgmtFee: 4400,
    deductible: 1500,
    careAllowance: 500,
    status: 'pending_invoice',
    mniW2Eligible: true,
    selected: false,
    expanded: false,
  },
  {
    caseId: '231562',
    client: 'Healthstream Inc.',
    procedure: 'Cervical Disc Replacement',
    dos: '2026-07-22',
    globalCaseRate: 38000,
    travel: 5200,
    mni: 1400,
    caseMgmtFee: 7600,
    deductible: 0,
    careAllowance: 1000,
    status: 'pending_invoice',
    mniW2Eligible: true,
    selected: false,
    expanded: false,
  },
  {
    caseId: '245780',
    client: 'Grover Monster Inc.',
    procedure: 'Total Shoulder Arthroplasty',
    dos: '2026-08-05',
    globalCaseRate: 26500,
    travel: 1800,
    mni: 480,
    caseMgmtFee: 5300,
    deductible: 1500,
    careAllowance: 0,
    status: 'pending_invoice',
    mniW2Eligible: true,
    selected: false,
    expanded: false,
  },
];

const INIT_RECON: ReconciliationCase[] = [
  {
    caseId: '178442',
    client: 'Apex Industries',
    procedure: 'Total Hip Replacement',
    surgeryDate: '2026-04-15',
    invoiceDate: '2026-04-01',
    claimsDocsDate: '2026-06-20',
    originalTotal: 52400,
    actualTotal: 49800,
    status: 'pending',
  },
  {
    caseId: '182653',
    client: 'Vincit Group',
    procedure: 'Lumbar Microdiscectomy',
    surgeryDate: '2026-05-02',
    invoiceDate: '2026-04-18',
    claimsDocsDate: '2026-06-28',
    originalTotal: 18600,
    actualTotal: 21200,
    status: 'pending',
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function SurgeryBillingRun() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState<'active' | 'recon'>('active');
  const [cases, setCases] = useState<SurgeryCase[]>(INIT_CASES);
  const [recon, setRecon] = useState<ReconciliationCase[]>(INIT_RECON);
  const [clientFilter, setClientFilter] = useState('');
  const [generating, setGenerating] = useState(false);

  const pendingCases = cases.filter(c => c.status === 'pending_invoice');
  const selectedPending = pendingCases.filter(c => c.selected);
  const allPendingSelected = pendingCases.length > 0 && pendingCases.every(c => c.selected);

  const toggleSelect = (caseId: string) => {
    setCases(prev => prev.map(c => c.caseId === caseId ? { ...c, selected: !c.selected } : c));
  };

  const toggleSelectAll = () => {
    const next = !allPendingSelected;
    setCases(prev => prev.map(c => c.status === 'pending_invoice' ? { ...c, selected: next } : c));
  };

  const toggleExpand = (caseId: string) => {
    setCases(prev => prev.map(c => c.caseId === caseId ? { ...c, expanded: !c.expanded } : c));
  };

  const handleMarkPaid = (caseId: string) => {
    setCases(prev => prev.map(c => c.caseId === caseId ? { ...c, status: 'payment_received', paymentReceivedDate: '2026-06-30' } : c));
    addToast('success', `Case #${caseId} — payment marked as received.`);
  };

  const handleGenerate = () => {
    if (selectedPending.length === 0) return;
    setGenerating(true);
    setTimeout(() => {
      const invNum = weekInvoiceNum('2026-06-30');
      setCases(prev => prev.map(c =>
        c.selected && c.status === 'pending_invoice'
          ? { ...c, status: 'invoiced', selected: false, invoiceSentDate: '2026-06-30', paymentDueDate: new Date(new Date(c.dos).getTime() - 7 * 86400000).toISOString().split('T')[0] }
          : c
      ));
      setGenerating(false);
      addToast('success', `Surgery Care Invoice ${invNum} generated — ${selectedPending.length} case${selectedPending.length > 1 ? 's' : ''} included.`);
    }, 1400);
  };

  const handleReconInvoice = (caseId: string) => {
    setRecon(prev => prev.map(r => r.caseId === caseId ? { ...r, status: 'invoiced' } : r));
    const r = recon.find(r => r.caseId === caseId);
    if (!r) return;
    const delta = r.actualTotal - r.originalTotal;
    addToast('success', `Reconciliation invoice generated for case #${caseId} — ${delta > 0 ? `additional ${fmtUSD(delta)} charged` : `credit memo ${fmtUSD(Math.abs(delta))} issued`}.`);
  };

  const filtered = cases.filter(c =>
    !clientFilter || c.client.toLowerCase().includes(clientFilter.toLowerCase()) || c.caseId.includes(clientFilter)
  );

  const pendingRecon = recon.filter(r => r.status === 'pending');

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <button className={styles.backLink} onClick={() => navigate('/billing/client-invoicing')}>
            ← Client Invoicing
          </button>
          <h1 className={styles.pageTitle}>Surgery Invoice Run</h1>
          <p className={styles.pageSubtitle}>
            Weekly batch — week of <strong>June 29, 2026</strong>.
            Initial invoices sent 14 days before surgery. Payment due 7 days before surgery.
          </p>
        </div>
        <div className={styles.headerMeta}>
          <div className={styles.metaStat}>
            <span className={styles.metaValue}>{pendingCases.length}</span>
            <span className={styles.metaLabel}>Pending Invoice</span>
          </div>
          <div className={styles.metaStat}>
            <span className={styles.metaValue}>{cases.filter(c => c.status === 'invoiced').length}</span>
            <span className={styles.metaLabel}>Awaiting Payment</span>
          </div>
          <div className={styles.metaStat}>
            <span className={styles.metaValue}>{pendingRecon.length}</span>
            <span className={styles.metaLabel}>Needs Reconciliation</span>
          </div>
        </div>
      </div>

      {/* Timeline banner */}
      <div className={styles.timelineBanner}>
        <div className={styles.timelineStep}>
          <div className={styles.timelineNum}>D-14</div>
          <div className={styles.timelineLabel}>Invoice Sent to Client</div>
        </div>
        <div className={styles.timelineArrow}>→</div>
        <div className={styles.timelineStep}>
          <div className={styles.timelineNum}>D-7</div>
          <div className={styles.timelineLabel}>Plan Payment to Transcarent</div>
        </div>
        <div className={styles.timelineArrow}>→</div>
        <div className={styles.timelineStep}>
          <div className={styles.timelineNum}>D-0</div>
          <div className={styles.timelineLabel}>Payment to Provider (pre-surgery)</div>
        </div>
        <div className={styles.timelineArrow}>→</div>
        <div className={styles.timelineStep}>
          <div className={styles.timelineNum}>D+30–90</div>
          <div className={styles.timelineLabel}>Claims Docs Received</div>
        </div>
        <div className={styles.timelineArrow}>→</div>
        <div className={styles.timelineStep}>
          <div className={styles.timelineNum}>+2–3 wk</div>
          <div className={styles.timelineLabel}>Reconciliation Invoice (if delta)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'active' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Cases
          <span className={styles.tabBadge}>{cases.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'recon' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('recon')}
        >
          Reconciliation Queue
          {pendingRecon.length > 0 && <span className={`${styles.tabBadge} ${styles.tabBadgeAlert}`}>{pendingRecon.length}</span>}
        </button>
      </div>

      {/* Active Cases tab */}
      {activeTab === 'active' && (
        <div className={styles.tabContent}>
          {/* Filter bar */}
          <div className={styles.filterBar}>
            <input
              className={styles.filterInput}
              placeholder="Filter by client or case #…"
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
            />
            {clientFilter && (
              <button className={styles.filterClear} onClick={() => setClientFilter('')}>✕</button>
            )}
          </div>

          {/* Case table header */}
          <div className={styles.caseTableHeader}>
            <label className={styles.checkWrap}>
              <input type="checkbox" checked={allPendingSelected} onChange={toggleSelectAll} />
            </label>
            <span>Case #</span>
            <span>Client</span>
            <span>Procedure</span>
            <span>Surgery Date</span>
            <span className={styles.colRight}>Invoice Total</span>
            <span>Status</span>
            <span></span>
          </div>

          {/* Case rows */}
          <div className={styles.caseList}>
            {filtered.map(c => {
              const urgency = getUrgency(c);
              const total = caseTotal(c);
              const isPending = c.status === 'pending_invoice';
              return (
                <div key={c.caseId} className={`${styles.caseItem} ${c.expanded ? styles.caseItemExpanded : ''}`}>
                  {/* Summary row */}
                  <div className={styles.caseRow}>
                    <label className={styles.checkWrap}>
                      {isPending
                        ? <input type="checkbox" checked={c.selected} onChange={() => toggleSelect(c.caseId)} />
                        : <span className={styles.checkPlaceholder} />
                      }
                    </label>
                    <span className={styles.caseId}>#{c.caseId}</span>
                    <span className={styles.caseClient}>{c.client}</span>
                    <span className={styles.caseProcedure}>{c.procedure}</span>
                    <span className={styles.caseDos}>
                      <span>{fmtDate(c.dos)}</span>
                      <span className={styles.daysOut}>
                        {daysUntil(c.dos) > 0 ? `${daysUntil(c.dos)}d away` : 'Past'}
                      </span>
                    </span>
                    <span className={`${styles.caseTotal} ${styles.colRight}`}>{fmtUSD(total)}</span>
                    <span>
                      <span className={`${styles.urgencyBadge} ${styles[`urgency_${urgency.level}`]}`}>
                        {urgency.label}
                      </span>
                    </span>
                    <span className={styles.rowActions}>
                      {c.status === 'invoiced' && (
                        <button className={styles.markPaidBtn} onClick={() => handleMarkPaid(c.caseId)}>
                          Mark Paid
                        </button>
                      )}
                      <button
                        className={styles.expandBtn}
                        onClick={() => toggleExpand(c.caseId)}
                        aria-label="Toggle details"
                      >
                        {c.expanded ? '▲' : '▼'}
                      </button>
                    </span>
                  </div>

                  {/* Expanded line items */}
                  {c.expanded && (
                    <div className={styles.caseDetail}>
                      <div className={styles.caseDetailInner}>
                        <div className={styles.detailTitle}>Case Information — Invoice #{c.caseId}</div>
                        <div className={styles.detailNote}>No patient-level information (PHI) included on client invoice.</div>

                        <div className={styles.lineItemList}>
                          <div className={styles.lineItem}>
                            <span>Global Case Rate</span>
                            <span>{fmtUSD(c.globalCaseRate)}</span>
                          </div>
                          {c.travel > 0 && (
                            <div className={styles.lineItem}>
                              <span>Travel &amp; Accommodation</span>
                              <span>{fmtUSD(c.travel)}</span>
                            </div>
                          )}
                          {c.mni > 0 && (
                            <div className={styles.lineItem}>
                              <span>
                                Meals, Incidentals &amp; Gas (M&amp;I)
                                {c.mniW2Eligible && <span className={styles.w2Badge}>W-2</span>}
                              </span>
                              <span>{fmtUSD(c.mni)}</span>
                            </div>
                          )}
                          <div className={styles.lineItem}>
                            <span>Case Management Fee</span>
                            <span>{fmtUSD(c.caseMgmtFee)}</span>
                          </div>
                          {c.deductible > 0 && (
                            <div className={`${styles.lineItem} ${styles.lineItemDeduction}`}>
                              <span>Member Deductible</span>
                              <span>({fmtUSD(c.deductible)})</span>
                            </div>
                          )}
                          {c.careAllowance > 0 && (
                            <div className={`${styles.lineItem} ${styles.lineItemDeduction}`}>
                              <span>Care Allowance</span>
                              <span>({fmtUSD(c.careAllowance)})</span>
                            </div>
                          )}
                          <div className={styles.lineItemTotal}>
                            <span>Amount Due</span>
                            <span>{fmtUSD(total)}</span>
                          </div>
                        </div>

                        {/* Status timeline for this case */}
                        <div className={styles.caseTimeline}>
                          <div className={`${styles.caseTimelineStep} ${c.invoiceSentDate ? styles.caseTimelineStepDone : styles.caseTimelineStepPending}`}>
                            <span className={styles.caseTimelineDot} />
                            <div>
                              <div className={styles.caseTimelineLabel}>Invoice Sent</div>
                              <div className={styles.caseTimelineSub}>{c.invoiceSentDate ? fmtDate(c.invoiceSentDate) : `Due by ${fmtDate(new Date(new Date(c.dos).getTime() - 14 * 86400000).toISOString().split('T')[0])}`}</div>
                            </div>
                          </div>
                          <div className={`${styles.caseTimelineStep} ${c.paymentReceivedDate ? styles.caseTimelineStepDone : c.invoiceSentDate ? styles.caseTimelineStepActive : styles.caseTimelineStepPending}`}>
                            <span className={styles.caseTimelineDot} />
                            <div>
                              <div className={styles.caseTimelineLabel}>Payment Due</div>
                              <div className={styles.caseTimelineSub}>{c.paymentDueDate ? fmtDate(c.paymentDueDate) : `7 days before surgery`}</div>
                            </div>
                          </div>
                          <div className={`${styles.caseTimelineStep} ${c.paymentReceivedDate ? styles.caseTimelineStepDone : styles.caseTimelineStepPending}`}>
                            <span className={styles.caseTimelineDot} />
                            <div>
                              <div className={styles.caseTimelineLabel}>Provider Paid</div>
                              <div className={styles.caseTimelineSub}>Upon client payment receipt</div>
                            </div>
                          </div>
                          <div className={`${styles.caseTimelineStep} ${styles.caseTimelineStepPending}`}>
                            <span className={styles.caseTimelineDot} />
                            <div>
                              <div className={styles.caseTimelineLabel}>Surgery</div>
                              <div className={styles.caseTimelineSub}>{fmtDate(c.dos)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action bar */}
          {selectedPending.length > 0 && (
            <div className={styles.actionBar}>
              <div className={styles.actionBarSummary}>
                <span>{selectedPending.length} case{selectedPending.length > 1 ? 's' : ''} selected</span>
                <span className={styles.actionBarTotal}>
                  Total: {fmtUSD(selectedPending.reduce((sum, c) => sum + caseTotal(c), 0))}
                </span>
              </div>
              <div className={styles.actionBarNote}>
                Invoice number will be assigned upon generation. No PHI included.
              </div>
              <Button
                appearance="primary"
                onClick={handleGenerate}
                loading={generating}
              >
                Generate Surgery Care Invoice ({selectedPending.length} case{selectedPending.length > 1 ? 's' : ''})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Reconciliation tab */}
      {activeTab === 'recon' && (
        <div className={styles.tabContent}>
          <div className={styles.reconHeader}>
            <p className={styles.reconDesc}>
              Post-surgery reconciliation invoices are generated when actual costs differ from the initial estimate.
              Claims documentation is provided by the COE 30–90 days after surgery.
              Reconciliation invoices are generated 2–3 weeks after claims docs are received.
            </p>
          </div>

          {recon.length === 0 && (
            <div className={styles.emptyState}>No reconciliation cases pending.</div>
          )}

          {recon.map(r => {
            const delta = r.actualTotal - r.originalTotal;
            const isCredit = delta < 0;
            return (
              <div key={r.caseId} className={styles.reconCard}>
                <div className={styles.reconCardHeader}>
                  <div>
                    <div className={styles.reconCaseId}>Case #{r.caseId}</div>
                    <div className={styles.reconClient}>{r.client}</div>
                    <div className={styles.reconProcedure}>{r.procedure}</div>
                  </div>
                  <div>
                    <span className={`${styles.reconStatusBadge} ${r.status === 'invoiced' ? styles.reconStatusDone : styles.reconStatusPending}`}>
                      {r.status === 'invoiced' ? 'Reconciliation Invoiced' : 'Pending Reconciliation'}
                    </span>
                  </div>
                </div>

                <div className={styles.reconGrid}>
                  <div className={styles.reconGridItem}>
                    <div className={styles.reconGridLabel}>Surgery Date</div>
                    <div className={styles.reconGridValue}>{fmtDate(r.surgeryDate)}</div>
                  </div>
                  <div className={styles.reconGridItem}>
                    <div className={styles.reconGridLabel}>Original Invoice</div>
                    <div className={styles.reconGridValue}>{fmtDate(r.invoiceDate)}</div>
                  </div>
                  <div className={styles.reconGridItem}>
                    <div className={styles.reconGridLabel}>Claims Docs Received</div>
                    <div className={styles.reconGridValue}>{fmtDate(r.claimsDocsDate)}</div>
                  </div>
                </div>

                <div className={styles.reconAmounts}>
                  <div className={styles.reconAmountRow}>
                    <span>Original Invoice Amount</span>
                    <span>{fmtUSD(r.originalTotal)}</span>
                  </div>
                  <div className={styles.reconAmountRow}>
                    <span>Actual Amount (from claims)</span>
                    <span>{fmtUSD(r.actualTotal)}</span>
                  </div>
                  <div className={`${styles.reconAmountRow} ${styles.reconDeltaRow} ${isCredit ? styles.reconDeltaCredit : styles.reconDeltaCharge}`}>
                    <span>{isCredit ? 'Credit to Client' : 'Additional Charge'}</span>
                    <span>{isCredit ? `(${fmtUSD(Math.abs(delta))})` : fmtUSD(delta)}</span>
                  </div>
                </div>

                {r.status === 'pending' && (
                  <div className={styles.reconAction}>
                    <Button
                      appearance={isCredit ? 'secondary' : 'primary'}
                      size="small"
                      onClick={() => handleReconInvoice(r.caseId)}
                    >
                      {isCredit ? 'Generate Credit Memo' : 'Generate Reconciliation Invoice'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
