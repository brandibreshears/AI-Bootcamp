import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { mockInvoices } from './Billing';
import styles from './InvoiceApprovalDetail.module.css';

function formatCurrency(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function formatDate(d: string) {
  if (!d) return '—';
  const [year, month, day] = d.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

type Action = 'idle' | 'correction';

export default function InvoiceApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoice = mockInvoices.find((inv) => inv.id === id);

  const [calcExpanded, setCalcExpanded] = useState(false);
  const [action, setAction] = useState<Action>('idle');
  const [correctionNote, setCorrectionNote] = useState('');
  const [approved, setApproved] = useState(false);
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false);

  // For demo: billing manager role is determined by a prop/context in production.
  // Here we show both actions always (the Billing page role toggle drives navigation).
  const isBillingManager = true;

  if (!invoice) {
    return (
      <div className={styles.page}>
        <button className={styles.backLink} onClick={() => navigate('/billing')}>
          ← Back to Member payments
        </button>
        <p style={{ padding: 32, color: '#4C4A64' }}>Invoice not found.</p>
      </div>
    );
  }

  const dedMet = invoice.deductibleMet ?? 0;
  const dedMax = invoice.deductibleMax ?? 0;
  const oopMet = invoice.oopMet ?? 0;
  const oopMax = invoice.oopMax ?? 0;
  const dedRemaining = Math.max(dedMax - dedMet, 0);
  const oopRemaining = Math.max(oopMax - oopMet, 0);
  const coinsurancePct = invoice.coinsurancePct ?? 0;
  const coinsurance = coinsurancePct / 100;
  const copay = invoice.copay ?? 0;
  const rate = invoice.caseRate;

  const amountAboveDed = Math.max(rate - dedRemaining, 0);
  const coinsuranceAmount = amountAboveDed * coinsurance;
  const rawTotal = dedRemaining + coinsuranceAmount + copay;
  const memberDue = Math.min(rawTotal, oopRemaining);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        Billing ›{' '}
        <button className={styles.breadcrumbLink} onClick={() => navigate('/billing')}>
          Member payments
        </button>{' '}
        › Review invoice
      </div>

      <div className={styles.pageHeader}>
        <div>
          <button className={styles.backLink} onClick={() => navigate('/billing')}>
            ← Back to Member payments
          </button>
          <h2 className={styles.pageTitle}>Review invoice</h2>
        </div>
        <div className={styles.caseTag}>
          <span className={styles.caseLabel}>Case number</span>
          <span className={styles.caseValue}>{invoice.caseNumber}</span>
        </div>
      </div>

      {approved && (
        <div className={styles.successBanner}>
          ✓ Invoice approved and sent to member.
        </div>
      )}
      {correctionSubmitted && (
        <div className={styles.correctionBanner}>
          Correction required note sent. Invoice moved to "Correction Required" queue.
        </div>
      )}

      {/* Correction note from manager (if this invoice had one) */}
      {invoice.correctionNote && (
        <div className={styles.correctionNotice}>
          <div className={styles.correctionNoticeLabel}>Correction required by billing manager</div>
          <p className={styles.correctionNoticeText}>{invoice.correctionNote}</p>
        </div>
      )}

      <div className={styles.twoCol}>
        {/* Left: Member & encounter info */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Member &amp; encounter</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Member</span>
              <span className={styles.infoValue}>{invoice.memberName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Client</span>
              <span className={styles.infoValue}>{invoice.client}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Insurance ID</span>
              <span className={styles.infoValue}>{invoice.insuranceId ?? '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date of birth</span>
              <span className={styles.infoValue}>
                {invoice.memberDob ? formatDate(invoice.memberDob) : '—'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Encounter type</span>
              <span className={styles.infoValue}>{invoice.encounterType}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Encounter date</span>
              <span className={styles.infoValue}>{formatDate(invoice.encounterDate)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Invoice type</span>
              <span className={styles.infoValue}>
                {invoice.invoiceType === 'cost_share' ? 'Cost share' : 'Recoupment'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Billing type</span>
              <span className={styles.infoValue}>{invoice.billingType ?? '—'}</span>
            </div>
            {invoice.submittedBy && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Submitted by</span>
                <span className={styles.infoValue}>
                  {invoice.submittedBy}
                  {invoice.submittedDate ? ` · ${formatDate(invoice.submittedDate)}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Accumulator data */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Accumulator data (cost share period)</h3>
          <div className={styles.accumGrid}>
            <div className={styles.accumBox}>
              <span className={styles.accumLabel}>Deductible met</span>
              <span className={styles.accumValue}>{formatCurrency(dedMet)}</span>
              <div className={styles.accumBar}>
                <div
                  className={styles.accumBarFill}
                  style={{ width: dedMax > 0 ? `${Math.min((dedMet / dedMax) * 100, 100)}%` : '0%' }}
                />
              </div>
              <span className={styles.accumSub}>of {formatCurrency(dedMax)} max</span>
            </div>
            <div className={styles.accumBox}>
              <span className={styles.accumLabel}>Out-of-pocket met</span>
              <span className={styles.accumValue}>{formatCurrency(oopMet)}</span>
              <div className={styles.accumBar}>
                <div
                  className={styles.accumBarFill}
                  style={{ width: oopMax > 0 ? `${Math.min((oopMet / oopMax) * 100, 100)}%` : '0%' }}
                />
              </div>
              <span className={styles.accumSub}>of {formatCurrency(oopMax)} max</span>
            </div>
            <div className={styles.accumBox}>
              <span className={styles.accumLabel}>Deductible remaining</span>
              <span className={styles.accumValueNeutral}>{formatCurrency(dedRemaining)}</span>
            </div>
            <div className={styles.accumBox}>
              <span className={styles.accumLabel}>OOP remaining</span>
              <span className={styles.accumValueNeutral}>{formatCurrency(oopRemaining)}</span>
            </div>
            <div className={styles.accumBox}>
              <span className={styles.accumLabel}>Coinsurance rate</span>
              <span className={styles.accumValue}>{coinsurancePct}%</span>
            </div>
            {copay > 0 && (
              <div className={styles.accumBox}>
                <span className={styles.accumLabel}>Copay</span>
                <span className={styles.accumValue}>{formatCurrency(copay)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calculation breakdown */}
      <div className={styles.card}>
        <button
          className={styles.calcToggle}
          onClick={() => setCalcExpanded((v) => !v)}
        >
          <span>How this was calculated</span>
          <span className={`${styles.calcChevron} ${calcExpanded ? styles.calcChevronOpen : ''}`}>
            ▾
          </span>
        </button>
        {calcExpanded && (
          <div className={styles.calcBreakdown}>
            <div className={styles.calcStep}>
              <span className={styles.calcStepLabel}>Case rate</span>
              <span className={styles.calcStepValue}>{formatCurrency(rate)}</span>
            </div>
            <div className={styles.calcStep}>
              <span className={styles.calcStepLabel}>Deductible remaining</span>
              <span className={styles.calcStepValue}>{formatCurrency(dedRemaining)}</span>
            </div>
            <div className={`${styles.calcStep} ${styles.calcStepSub}`}>
              <span className={styles.calcStepLabel}>
                Case rate subject to coinsurance (above deductible)
              </span>
              <span className={styles.calcStepValue}>{formatCurrency(amountAboveDed)}</span>
            </div>
            <div className={`${styles.calcStep} ${styles.calcStepSub}`}>
              <span className={styles.calcStepLabel}>
                Coinsurance ({coinsurancePct}% × {formatCurrency(amountAboveDed)})
              </span>
              <span className={styles.calcStepValue}>{formatCurrency(coinsuranceAmount)}</span>
            </div>
            {copay > 0 && (
              <div className={styles.calcStep}>
                <span className={styles.calcStepLabel}>Specialist copay</span>
                <span className={styles.calcStepValue}>{formatCurrency(copay)}</span>
              </div>
            )}
            <div className={styles.calcStep}>
              <span className={styles.calcStepLabel}>
                Subtotal (ded. remaining + coinsurance{copay > 0 ? ' + copay' : ''})
              </span>
              <span className={styles.calcStepValue}>{formatCurrency(rawTotal)}</span>
            </div>
            <div className={styles.calcStep}>
              <span className={styles.calcStepLabel}>OOP remaining (cap)</span>
              <span className={styles.calcStepValue}>{formatCurrency(oopRemaining)}</span>
            </div>
            <div className={`${styles.calcStep} ${styles.calcStepTotal}`}>
              <span className={styles.calcStepLabel}>Member cost share due</span>
              <span className={styles.calcStepValue}>{formatCurrency(memberDue)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Invoice amount summary */}
      <div className={`${styles.card} ${styles.amountCard}`}>
        <div className={styles.amountRow}>
          <div>
            <p className={styles.amountLabel}>Invoice amount</p>
            <p className={styles.amountSub}>Member cost share due</p>
          </div>
          <span className={styles.amountValue}>{formatCurrency(invoice.invoiceAmount || memberDue)}</span>
        </div>
        <div className={styles.amountMeta}>
          <span>Case rate: {formatCurrency(rate)}</span>
          <span>·</span>
          <span>Coinsurance: {coinsurancePct}%</span>
          {copay > 0 && <><span>·</span><span>Copay: {formatCurrency(copay)}</span></>}
          <span>·</span>
          <span>OOP remaining: {formatCurrency(oopRemaining)}</span>
        </div>
      </div>

      {/* Actions */}
      {!approved && !correctionSubmitted && isBillingManager && (
        <div className={styles.actionsCard}>
          <h3 className={styles.actionsTitle}>Billing manager actions</h3>

          {action === 'idle' && (
            <div className={styles.actionButtons}>
              <Button
                appearance="primary"
                onClick={() => setApproved(true)}
              >
                Approve &amp; send to member
              </Button>
              <Button
                appearance="secondary"
                onClick={() => setAction('correction')}
              >
                Correction required
              </Button>
            </div>
          )}

          {action === 'correction' && (
            <div className={styles.correctionForm}>
              <label className={styles.correctionLabel}>
                Correction note <span style={{ color: '#D93025' }}>*</span>
              </label>
              <p className={styles.correctionHint}>
                Explain what needs to be corrected. This note will be shown to the submitter on all pages of the invoice wizard.
              </p>
              <textarea
                className={styles.correctionTextarea}
                rows={4}
                placeholder="e.g. Deductible amount appears incorrect — please verify against latest EOB from carrier before resubmitting."
                value={correctionNote}
                onChange={(e) => setCorrectionNote(e.target.value)}
              />
              <div className={styles.correctionActions}>
                <Button
                  appearance="negative"
                  onClick={() => {
                    if (correctionNote.trim()) setCorrectionSubmitted(true);
                  }}
                >
                  Submit correction required
                </Button>
                <button className={styles.cancelBtn} onClick={() => setAction('idle')}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isBillingManager && (
        <div className={styles.readOnlyCard}>
          <span>&#128065; <strong>View only.</strong> Only billing managers can approve or request corrections.</span>
        </div>
      )}
    </div>
  );
}
