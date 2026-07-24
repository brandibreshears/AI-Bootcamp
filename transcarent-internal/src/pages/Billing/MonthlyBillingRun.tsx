import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MonthlyBillingRun.module.css';
import { Button } from '../../components/ui/Button/Button';
import { ToastContainer, useToast } from '../../components/ui/Toast';

// ── Types ──────────────────────────────────────────────────────────────────────

type RunPhase = 'preflight' | 'review' | 'generate';
type EligibilityStatus = 'current' | 'stale' | 'missing';

interface ClientEligibility {
  clientId: string;
  client: string;
  enrolledMembers: number;
  lastPulled: string; // ISO date
  status: EligibilityStatus;
  pepmRate: number;
  pepmInvoiceFormat: 'combined' | 'separate';
  invoiceTerms: string;
  approved: boolean;
}

interface ServiceLine {
  service: string;
  rate: number;
  cases: number;
  total: number;
}

interface ClientServiceInvoice {
  clientId: string;
  client: string;
  lines: ServiceLine[];
  invoiceTerms: string;
  approved: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const PERIOD_LABEL = 'May 2026';
const PERIOD_START = '2026-05-01';
const PERIOD_END = '2026-05-31';
const TODAY = '2026-06-30';

function fmtUSD(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysSince(iso: string): number {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date(TODAY + 'T00:00:00');
  return Math.floor((today.getTime() - d.getTime()) / 86400000);
}

function pepmInvoiceNum(client: ClientEligibility): string {
  return `PEPM${new Date(PERIOD_END + 'T00:00:00').toLocaleString('en-US', { month: 'short' }).toUpperCase()}2026`;
}

function serviceInvoiceNum(): string {
  const d = new Date(TODAY + 'T00:00:00');
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  const mmddyyyy = String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + d.getFullYear();
  return `Wk${week}26-${mmddyyyy}`;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const INIT_ELIGIBILITY: ClientEligibility[] = [
  {
    clientId: 'vincit',
    client: 'Vincit Group',
    enrolledMembers: 974,
    lastPulled: '2026-06-28',
    status: 'current',
    pepmRate: 8.00,
    pepmInvoiceFormat: 'separate',
    invoiceTerms: 'Net 30',
    approved: false,
  },
  {
    clientId: 'apex',
    client: 'Apex Industries',
    enrolledMembers: 1842,
    lastPulled: '2026-06-28',
    status: 'current',
    pepmRate: 6.50,
    pepmInvoiceFormat: 'separate',
    invoiceTerms: 'Net 15',
    approved: false,
  },
  {
    clientId: 'northwest',
    client: 'Northwest Steel',
    enrolledMembers: 512,
    lastPulled: '2026-05-22',
    status: 'stale',
    pepmRate: 9.00,
    pepmInvoiceFormat: 'combined',
    invoiceTerms: 'Net 30',
    approved: false,
  },
  {
    clientId: 'healthstream',
    client: 'Healthstream Inc.',
    enrolledMembers: 3210,
    lastPulled: '2026-06-27',
    status: 'current',
    pepmRate: 5.75,
    pepmInvoiceFormat: 'separate',
    invoiceTerms: 'Net 30',
    approved: false,
  },
  {
    clientId: 'grover',
    client: 'Grover Monster Inc.',
    enrolledMembers: 0,
    lastPulled: '',
    status: 'missing',
    pepmRate: 7.25,
    pepmInvoiceFormat: 'separate',
    invoiceTerms: 'Net 30',
    approved: false,
  },
];

const INIT_SERVICE_INVOICES: ClientServiceInvoice[] = [
  {
    clientId: 'vincit',
    client: 'Vincit Group',
    invoiceTerms: 'Net 30',
    approved: false,
    lines: [
      { service: 'Expert Opinion — Surgery/MSK', rate: 1800, cases: 3, total: 5400 },
      { service: 'Orthopedic Consult', rate: 285, cases: 8, total: 2280 },
      { service: 'Virtual Physical Therapy', rate: 995, cases: 5, total: 4975 },
    ],
  },
  {
    clientId: 'apex',
    client: 'Apex Industries',
    invoiceTerms: 'Net 15',
    approved: false,
    lines: [
      { service: 'Expert Opinion — Surgery/MSK', rate: 2139, cases: 1, total: 2139 },
      { service: 'Virtual PT Services', rate: 995, cases: 5, total: 4975 },
      { service: 'Behavioral Health Case Management', rate: 100, cases: 2, total: 200 },
    ],
  },
  {
    clientId: 'northwest',
    client: 'Northwest Steel',
    invoiceTerms: 'Net 30',
    approved: false,
    lines: [
      { service: 'Orthopedic Consult', rate: 285, cases: 4, total: 1140 },
    ],
  },
  {
    clientId: 'healthstream',
    client: 'Healthstream Inc.',
    invoiceTerms: 'Net 30',
    approved: false,
    lines: [
      { service: 'Expert Opinion — Oncology', rate: 2500, cases: 2, total: 5000 },
      { service: 'Cancer Care at COE — Care Management Fee', rate: 0, cases: 1, total: 0 },
      { service: 'Virtual Mental Health Therapy', rate: 150, cases: 6, total: 900 },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function MonthlyBillingRun() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [phase, setPhase] = useState<RunPhase>('preflight');
  const [eligibility, setEligibility] = useState<ClientEligibility[]>(INIT_ELIGIBILITY);
  const [serviceInvoices, setServiceInvoices] = useState<ClientServiceInvoice[]>(INIT_SERVICE_INVOICES);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [periodOverride, setPeriodOverride] = useState(PERIOD_LABEL);

  const staleCount = eligibility.filter(e => e.status === 'stale' || e.status === 'missing').length;
  const allEligApproved = eligibility.filter(e => e.status === 'current').every(e => e.approved);
  const allServiceApproved = serviceInvoices.every(s => s.approved);
  const allApproved = allEligApproved && allServiceApproved;

  const totalPepm = eligibility.reduce((s, e) => s + (e.enrolledMembers * e.pepmRate), 0);
  const totalServices = serviceInvoices.reduce((s, si) => s + si.lines.reduce((t, l) => t + l.total, 0), 0);

  const approveElig = (clientId: string) => {
    setEligibility(prev => prev.map(e => e.clientId === clientId ? { ...e, approved: true } : e));
  };

  const approveAllElig = () => {
    setEligibility(prev => prev.map(e => e.status === 'current' ? { ...e, approved: true } : e));
  };

  const approveService = (clientId: string) => {
    setServiceInvoices(prev => prev.map(s => s.clientId === clientId ? { ...s, approved: true } : s));
  };

  const approveAllServices = () => {
    setServiceInvoices(prev => prev.map(s => ({ ...s, approved: true })));
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      addToast('success', `Monthly bill run complete — ${eligibility.filter(e => e.approved).length} PEPM invoices and ${serviceInvoices.filter(s => s.approved).length} service invoices generated.`);
    }, 2200);
  };

  const PHASES: { key: RunPhase; label: string; num: number }[] = [
    { key: 'preflight', label: 'Eligibility Pre-Flight', num: 1 },
    { key: 'review', label: 'Review Invoices', num: 2 },
    { key: 'generate', label: 'Generate & Send', num: 3 },
  ];

  const phaseIndex = PHASES.findIndex(p => p.key === phase);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <button className={styles.backLink} onClick={() => navigate('/billing/client-invoicing')}>
            ← Client Invoicing
          </button>
          <h1 className={styles.pageTitle}>Monthly Bill Run</h1>
          <p className={styles.pageSubtitle}>
            Generates PEPM invoices and Service Offerings invoices for all active clients.
            Billing period: <strong>{periodOverride}</strong>.
          </p>
        </div>
        <div className={styles.headerMeta}>
          <div className={styles.metaStat}>
            <span className={styles.metaValue}>{fmtUSD(totalPepm)}</span>
            <span className={styles.metaLabel}>Total PEPM</span>
          </div>
          <div className={styles.metaStat}>
            <span className={styles.metaValue}>{fmtUSD(totalServices)}</span>
            <span className={styles.metaLabel}>Total Services</span>
          </div>
        </div>
      </div>

      {/* Phase progress */}
      <div className={styles.phaseBar}>
        {PHASES.map((p, i) => (
          <React.Fragment key={p.key}>
            <div className={`${styles.phaseStep} ${phaseIndex === i ? styles.phaseStepActive : ''} ${phaseIndex > i ? styles.phaseStepDone : ''}`}>
              <div className={styles.phaseCircle}>
                {phaseIndex > i ? '✓' : p.num}
              </div>
              <div className={styles.phaseLabel}>{p.label}</div>
            </div>
            {i < PHASES.length - 1 && (
              <div className={`${styles.phaseConnector} ${phaseIndex > i ? styles.phaseConnectorDone : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Phase 1: Pre-flight ── */}
      {phase === 'preflight' && (
        <div className={styles.phaseContent}>
          <div className={styles.phaseHeader}>
            <div>
              <h2 className={styles.phaseTitle}>Eligibility Pre-Flight Check</h2>
              <p className={styles.phaseDesc}>
                Enrollment counts come from the eligibility pipeline automatically. Review each client's current count before generating invoices.
                Stale or missing data should be resolved before proceeding.
              </p>
            </div>
            {staleCount === 0 && (
              <Button appearance="secondary" size="small" onClick={approveAllElig}>
                Approve All Current
              </Button>
            )}
          </div>

          {staleCount > 0 && (
            <div className={styles.staleWarning}>
              ⚠ {staleCount} client{staleCount > 1 ? 's have' : ' has'} stale or missing eligibility data.
              Contact the eligibility team to refresh before invoicing, or exclude these clients from this run.
            </div>
          )}

          <div className={styles.eligibilityGrid}>
            {eligibility.map(e => {
              const monthly = e.enrolledMembers * e.pepmRate;
              const age = e.lastPulled ? daysSince(e.lastPulled) : null;
              return (
                <div key={e.clientId} className={`${styles.eligCard} ${e.status === 'stale' ? styles.eligCardStale : e.status === 'missing' ? styles.eligCardMissing : ''}`}>
                  <div className={styles.eligCardHeader}>
                    <div className={styles.eligClient}>{e.client}</div>
                    <span className={`${styles.eligBadge} ${styles[`eligBadge_${e.status}`]}`}>
                      {e.status === 'current' ? 'Current' : e.status === 'stale' ? 'Stale' : 'Missing'}
                    </span>
                  </div>

                  <div className={styles.eligStats}>
                    <div className={styles.eligStat}>
                      <div className={styles.eligStatValue}>{e.enrolledMembers > 0 ? e.enrolledMembers.toLocaleString() : '—'}</div>
                      <div className={styles.eligStatLabel}>Enrolled Members</div>
                    </div>
                    <div className={styles.eligStat}>
                      <div className={styles.eligStatValue}>${e.pepmRate.toFixed(2)}</div>
                      <div className={styles.eligStatLabel}>PEPM Rate</div>
                    </div>
                    <div className={styles.eligStat}>
                      <div className={`${styles.eligStatValue} ${styles.eligMonthly}`}>{e.enrolledMembers > 0 ? fmtUSD(monthly) : '—'}</div>
                      <div className={styles.eligStatLabel}>Monthly Total</div>
                    </div>
                  </div>

                  <div className={styles.eligMeta}>
                    {e.lastPulled
                      ? <span className={age && age > 30 ? styles.eligMetaStale : ''}>
                          Eligibility pulled {fmtDate(e.lastPulled)} ({age}d ago)
                        </span>
                      : <span className={styles.eligMetaStale}>No eligibility data on file</span>
                    }
                  </div>

                  <div className={styles.eligCardFooter}>
                    <div className={styles.eligTerms}>{e.invoiceTerms} · {e.pepmInvoiceFormat === 'combined' ? 'Combined invoice' : 'Separate PEPM invoice'}</div>
                    {e.status === 'current' && (
                      e.approved
                        ? <span className={styles.eligApprovedBadge}>✓ Approved</span>
                        : <button className={styles.eligApproveBtn} onClick={() => approveElig(e.clientId)}>Approve</button>
                    )}
                    {e.status !== 'current' && (
                      <span className={styles.eligExcludeNote}>Excluded from this run</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.phaseNav}>
            <div />
            <Button
              appearance="primary"
              onClick={() => setPhase('review')}
              disabled={!allEligApproved}
            >
              Continue to Review →
            </Button>
          </div>
        </div>
      )}

      {/* ── Phase 2: Review ── */}
      {phase === 'review' && (
        <div className={styles.phaseContent}>
          {/* PEPM section */}
          <div className={styles.invoiceSection}>
            <div className={styles.invoiceSectionHeader}>
              <div>
                <h2 className={styles.invoiceSectionTitle}>PEPM Invoices</h2>
                <p className={styles.invoiceSectionDesc}>
                  One invoice per client. Invoice number format: <code>PEPM[MON][YEAR]</code>.
                  Description: "Monthly Access Fee" · Enrolled Employees × Rate.
                </p>
              </div>
              <Button appearance="secondary" size="small" onClick={approveAllElig}>Approve All</Button>
            </div>

            <div className={styles.invoiceCards}>
              {eligibility.filter(e => e.status === 'current' && e.approved).map(e => {
                const monthly = e.enrolledMembers * e.pepmRate;
                return (
                  <div key={e.clientId} className={styles.invoiceCard}>
                    <div className={styles.invoiceCardHeader}>
                      <div>
                        <div className={styles.invoiceCardClient}>{e.client}</div>
                        <div className={styles.invoiceCardNum}>{pepmInvoiceNum(e)}</div>
                      </div>
                      <span className={`${styles.invoiceApproved}`}>✓ Eligible confirmed</span>
                    </div>

                    <div className={styles.invoiceLineHeader}>
                      <span>Description</span>
                      <span>Enrolled</span>
                      <span>Rate</span>
                      <span className={styles.colRight}>Total</span>
                    </div>
                    <div className={styles.invoiceLine}>
                      <span>Monthly Access Fee</span>
                      <span>{e.enrolledMembers.toLocaleString()}</span>
                      <span>${e.pepmRate.toFixed(2)}</span>
                      <span className={`${styles.invoiceLineTotal} ${styles.colRight}`}>{fmtUSD(monthly)}</span>
                    </div>
                    <div className={styles.invoiceCardTotal}>
                      <span>Amount Due · {e.invoiceTerms}</span>
                      <span>{fmtUSD(monthly)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service Offerings section */}
          <div className={styles.invoiceSection}>
            <div className={styles.invoiceSectionHeader}>
              <div>
                <h2 className={styles.invoiceSectionTitle}>Service Offerings Invoices</h2>
                <p className={styles.invoiceSectionDesc}>
                  Utilization for period {fmtDate(PERIOD_START)} – {fmtDate(PERIOD_END)}.
                  Encounter counts pulled from Member Payments. Invoice number format: <code>Wk[week][yr]-[MMDDYYYY]</code>.
                </p>
              </div>
              <Button appearance="secondary" size="small" onClick={approveAllServices}>Approve All</Button>
            </div>

            <div className={styles.invoiceCards}>
              {serviceInvoices.map(si => {
                const siTotal = si.lines.reduce((t, l) => t + l.total, 0);
                return (
                  <div key={si.clientId} className={styles.invoiceCard}>
                    <div className={styles.invoiceCardHeader}>
                      <div>
                        <div className={styles.invoiceCardClient}>{si.client}</div>
                        <div className={styles.invoiceCardNum}>{serviceInvoiceNum()}</div>
                      </div>
                      {si.approved
                        ? <span className={styles.invoiceApproved}>✓ Approved</span>
                        : <button className={styles.invoiceApproveBtn} onClick={() => approveService(si.clientId)}>Approve</button>
                      }
                    </div>

                    <div className={styles.invoiceLineHeader}>
                      <span>Transcarent Service Offering</span>
                      <span>Rate</span>
                      <span># Cases</span>
                      <span className={styles.colRight}>Total Cost</span>
                    </div>
                    {si.lines.map((line, i) => (
                      <div key={i} className={styles.invoiceLine}>
                        <span>{line.service}</span>
                        <span>{line.rate > 0 ? fmtUSD(line.rate) : '% of case rate'}</span>
                        <span>{line.cases}</span>
                        <span className={`${styles.invoiceLineTotal} ${styles.colRight}`}>
                          {line.rate > 0 ? fmtUSD(line.total) : 'See surgery invoices'}
                        </span>
                      </div>
                    ))}
                    <div className={styles.invoiceCardTotal}>
                      <span>Total Service Offering Charge · {si.invoiceTerms}</span>
                      <span>{fmtUSD(siTotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.phaseNav}>
            <Button appearance="secondary" onClick={() => setPhase('preflight')}>← Back</Button>
            <Button
              appearance="primary"
              onClick={() => setPhase('generate')}
              disabled={!allServiceApproved}
            >
              Continue to Generate →
            </Button>
          </div>
        </div>
      )}

      {/* ── Phase 3: Generate ── */}
      {phase === 'generate' && (
        <div className={styles.phaseContent}>
          <div className={styles.generateSection}>
            <h2 className={styles.phaseTitle}>Generate &amp; Send Invoices</h2>
            <p className={styles.phaseDesc}>
              Review the final summary before generating. Once generated, invoices are sent to each client's billing contacts.
            </p>

            <div className={styles.generateSummary}>
              <div className={styles.generateSummaryTitle}>Run Summary — {PERIOD_LABEL}</div>

              <div className={styles.generateTable}>
                <div className={styles.generateTableHeader}>
                  <span>Client</span>
                  <span>PEPM Invoice</span>
                  <span className={styles.colRight}>PEPM Total</span>
                  <span>Services Invoice</span>
                  <span className={styles.colRight}>Services Total</span>
                  <span className={styles.colRight}>Run Total</span>
                </div>
                {eligibility.filter(e => e.status === 'current' && e.approved).map(e => {
                  const si = serviceInvoices.find(s => s.clientId === e.clientId);
                  const pepmTotal = e.enrolledMembers * e.pepmRate;
                  const svcTotal = si ? si.lines.reduce((t, l) => t + l.total, 0) : 0;
                  return (
                    <div key={e.clientId} className={styles.generateTableRow}>
                      <span className={styles.generateClient}>{e.client}</span>
                      <span className={styles.generateInvNum}>{pepmInvoiceNum(e)}</span>
                      <span className={styles.colRight}>{fmtUSD(pepmTotal)}</span>
                      <span className={styles.generateInvNum}>{si ? serviceInvoiceNum() : '—'}</span>
                      <span className={styles.colRight}>{si ? fmtUSD(svcTotal) : '—'}</span>
                      <span className={`${styles.colRight} ${styles.generateRowTotal}`}>{fmtUSD(pepmTotal + svcTotal)}</span>
                    </div>
                  );
                })}
                <div className={styles.generateTableFooter}>
                  <span style={{ gridColumn: '1 / 3' }}>Total</span>
                  <span className={styles.colRight}>{fmtUSD(totalPepm)}</span>
                  <span />
                  <span className={styles.colRight}>{fmtUSD(totalServices)}</span>
                  <span className={`${styles.colRight} ${styles.generateGrandTotal}`}>{fmtUSD(totalPepm + totalServices)}</span>
                </div>
              </div>
            </div>

            {generated ? (
              <div className={styles.generateSuccess}>
                <div className={styles.generateSuccessIcon}>✓</div>
                <div>
                  <div className={styles.generateSuccessTitle}>Invoices Generated Successfully</div>
                  <div className={styles.generateSuccessDesc}>
                    {eligibility.filter(e => e.approved).length} PEPM invoices and {serviceInvoices.filter(s => s.approved).length} service invoices sent to client billing contacts.
                    Run logged with timestamp for audit trail.
                  </div>
                  <div className={styles.generateSuccessActions}>
                    <Button appearance="secondary" size="small" onClick={() => navigate('/billing/client-invoicing')}>
                      View All Invoices
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.phaseNav}>
                <Button appearance="secondary" onClick={() => setPhase('review')}>← Back to Review</Button>
                <Button appearance="primary" loading={generating} onClick={handleGenerate}>
                  Generate &amp; Send All Invoices
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
