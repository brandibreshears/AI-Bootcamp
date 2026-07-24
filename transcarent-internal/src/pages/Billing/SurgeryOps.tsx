import React, { useState } from 'react';
import styles from './SurgeryOps.module.css';
import { Button } from '../../components/ui/Button/Button';

// ── Types ─────────────────────────────────────────────────────────────────────

type SurgeryOpsTab = 'eligibility' | 'invoice' | 'reconciliation';
type BillingType = 'irs_minimum' | 'custom' | 'waived' | 'insurance';
type CptMatchStatus = 'match' | 'changed' | 'missing' | 'new';

interface AccumProgress {
  applied: number | null;
  remaining: number | null;
  maximum: number | null;
}

interface OrbitData {
  indDeductible: AccumProgress;
  famDeductible: AccumProgress;
  indOopMax: AccumProgress;
  famOopMax: AccumProgress;
  lastChecked: string;
}

interface CostShareConfig {
  billingType: BillingType;
  dedEmbedded: boolean;
  oopEmbedded: boolean;
  tierLabel: string;
  tierDeductible: number | null;
  coinsurancePct: number;
  deductibleWaived: boolean;
  planType: 'HDHP' | 'PPO';
}

interface PlanBenefit {
  // Actual health plan benefit design from carrier — what the member owes without Transcarent's cost share method
  deductibleIndiv: number;
  deductibleFamily: number;
  oopMaxIndiv: number;
  oopMaxFamily: number;
  coinsurancePct: number; // standard plan coinsurance, e.g. 20
}

interface SurgeryCase {
  id: string;
  memberName: string;
  memberId: string;
  memberDob: string;
  client: string;
  carrier: string;
  planName: string;
  eligibilityTier: string;
  eligibilityTierLabel: string;
  surgeryType: string;
  facility: string;
  surgeonName: string;
  scheduledDate: string;
  caseNumber: string;
  orbitData: OrbitData;
  costShareConfig: CostShareConfig;
  planBenefit: PlanBenefit;
}

interface CptCodeRow {
  code: string;
  description: string;
  expectedQty: number | null;
  receivedQty: number | null;
  expectedRate: number | null;
  receivedRate: number | null;
  matchStatus: CptMatchStatus;
  aiConfidence: number | null;
  override: boolean;
}

interface TranscarentCost {
  deductibleRemaining: number;
  deductibleToCollect: number;
  coinsuranceAmount: number;
  total: number;
  mustCollectFullDeductible: boolean;
  waived: boolean;
}

interface TypicalCost {
  typicalDed: number;
  coinsuranceBase: number;
  coinsuranceAmount: number;
  total: number;
  benchmark: number;
  planTypeLabel: string;
}

// ── Accumulator override types ─────────────────────────────────────────────

type AccumKey = 'indDeductible' | 'famDeductible' | 'indOopMax' | 'famOopMax';

interface OrbitOverrides {
  indDeductible?: AccumProgress;
  famDeductible?: AccumProgress;
  indOopMax?: AccumProgress;
  famOopMax?: AccumProgress;
}

// ── Reconciliation types ───────────────────────────────────────────────────

type ReconStatus = 'pending_upload' | 'ai_review' | 'approved' | 'disputed';
type ReconWizardStep = 'upload' | 'scanning' | 'review' | 'confirmed';
type ReconStatusFilter = 'all' | ReconStatus;

interface ReconCase {
  id: string;
  caseNumber: string;
  memberName: string;
  surgeryType: string;
  scheduledDate: string;
  facility: string;
  status: ReconStatus;
  fileName?: string;
  aiScannedAt?: string;
  disputeReason?: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const SURGERY_CASES: SurgeryCase[] = [
  {
    id: 'SC-001',
    memberName: 'Sarah Mitchell',
    memberId: 'MB-00291847',
    memberDob: '1985-04-12',
    client: 'Apex Industries',
    carrier: 'Aetna',
    planName: 'Apex HDHP HSA',
    eligibilityTier: 'EE',
    eligibilityTierLabel: 'Employee Only',
    surgeryType: 'Hip Replacement',
    facility: 'Cedars-Sinai Medical Center',
    surgeonName: 'Dr. Robert Chen',
    scheduledDate: '2026-07-28',
    caseNumber: 'TC-100842',
    orbitData: {
      indDeductible: { applied: 500, remaining: 1150, maximum: 1650 },
      famDeductible: { applied: null, remaining: null, maximum: null },
      indOopMax: { applied: 500, remaining: 2800, maximum: 3300 },
      famOopMax: { applied: null, remaining: null, maximum: null },
      lastChecked: 'Jul 1, 2026 · 9:14 AM',
    },
    costShareConfig: {
      billingType: 'irs_minimum',
      dedEmbedded: false,
      oopEmbedded: false,
      tierLabel: 'Employee Only',
      tierDeductible: 1650,
      coinsurancePct: 0,
      deductibleWaived: false,
      planType: 'HDHP',
    },
    planBenefit: {
      // Apex HDHP HSA actual plan benefit from Aetna — Transcarent bills IRS min $1,650 instead
      deductibleIndiv: 3000,
      deductibleFamily: 6000,
      oopMaxIndiv: 6000,
      oopMaxFamily: 12000,
      coinsurancePct: 20,
    },
  },
  {
    id: 'SC-002',
    memberName: 'Marcus Webb',
    memberId: 'MB-00384729',
    memberDob: '1990-07-22',
    client: 'BrightPath Co',
    carrier: 'United Healthcare',
    planName: 'BrightPath Select PPO',
    eligibilityTier: 'ES',
    eligibilityTierLabel: 'Employee + Spouse',
    surgeryType: 'Knee Replacement',
    facility: 'Mayo Clinic – Rochester',
    surgeonName: 'Dr. Amy Park',
    scheduledDate: '2026-07-15',
    caseNumber: 'TC-200109',
    orbitData: {
      indDeductible: { applied: 1500, remaining: 0, maximum: 1500 },
      famDeductible: { applied: 2100, remaining: 900, maximum: 3000 },
      indOopMax: { applied: 1500, remaining: 1500, maximum: 3000 },
      famOopMax: { applied: 2100, remaining: 3900, maximum: 6000 },
      lastChecked: 'Jul 1, 2026 · 10:02 AM',
    },
    costShareConfig: {
      billingType: 'custom',
      dedEmbedded: true,
      oopEmbedded: true,
      tierLabel: 'Employee + Spouse',
      tierDeductible: 1500,
      coinsurancePct: 0,
      deductibleWaived: false,
      planType: 'PPO',
    },
    planBenefit: {
      // BrightPath Select PPO actual benefit from UHC — Transcarent bills custom $1,500 instead
      deductibleIndiv: 2500,
      deductibleFamily: 5000,
      oopMaxIndiv: 5000,
      oopMaxFamily: 10000,
      coinsurancePct: 20,
    },
  },
  {
    id: 'SC-003',
    memberName: 'Elena Vasquez',
    memberId: 'MB-00459821',
    memberDob: '1978-11-03',
    client: 'Delta Health',
    carrier: 'Cigna',
    planName: 'Delta Care Waived Plan',
    eligibilityTier: 'EF',
    eligibilityTierLabel: 'Family',
    surgeryType: 'Spinal Fusion',
    facility: 'Hospital for Special Surgery',
    surgeonName: 'Dr. James Wu',
    scheduledDate: '2026-08-05',
    caseNumber: 'TC-304211',
    orbitData: {
      indDeductible: { applied: 800, remaining: 700, maximum: 1500 },
      famDeductible: { applied: 1400, remaining: 1600, maximum: 3000 },
      indOopMax: { applied: 800, remaining: 2200, maximum: 3000 },
      famOopMax: { applied: 1400, remaining: 4600, maximum: 6000 },
      lastChecked: 'Jul 1, 2026 · 11:31 AM',
    },
    costShareConfig: {
      billingType: 'waived',
      dedEmbedded: true,
      oopEmbedded: true,
      tierLabel: 'Family',
      tierDeductible: null,
      coinsurancePct: 0,
      deductibleWaived: true,
      planType: 'PPO',
    },
    planBenefit: {
      // Delta Care actual PPO benefit from Cigna — Transcarent waives the deductible entirely
      deductibleIndiv: 2000,
      deductibleFamily: 4000,
      oopMaxIndiv: 4000,
      oopMaxFamily: 8000,
      coinsurancePct: 20,
    },
  },
];

const PROCEDURE_BENCHMARKS: Record<string, number> = {
  'Hip Replacement': 32000,
  'Knee Replacement': 28500,
  'Spinal Fusion': 44500,
  'Cardiac Surgery': 75000,
  'Bariatric Surgery': 22000,
  'Hysterectomy': 18000,
};

const MOCK_CPT_ROWS: CptCodeRow[] = [
  {
    code: '22612', description: 'Posterior lumbar arthrodesis, single level',
    expectedQty: 1, receivedQty: 1, expectedRate: 8200, receivedRate: 8200,
    matchStatus: 'match', aiConfidence: 98, override: false,
  },
  {
    code: '22614', description: 'Posterior arthrodesis, additional level',
    expectedQty: 1, receivedQty: 1, expectedRate: 3400, receivedRate: 3400,
    matchStatus: 'match', aiConfidence: 95, override: false,
  },
  {
    code: '22851', description: 'Intervertebral biomechanical device insertion',
    expectedQty: 2, receivedQty: 3, expectedRate: 1800, receivedRate: 1800,
    matchStatus: 'changed', aiConfidence: 91, override: false,
  },
  {
    code: '20937', description: 'Bone graft, morselized',
    expectedQty: 1, receivedQty: null, expectedRate: 450, receivedRate: null,
    matchStatus: 'missing', aiConfidence: null, override: false,
  },
  {
    code: '99233', description: 'Subsequent hospital care, high complexity',
    expectedQty: 2, receivedQty: 2, expectedRate: 220, receivedRate: 220,
    matchStatus: 'match', aiConfidence: 99, override: false,
  },
  {
    code: '72148', description: 'MRI lumbar spine without contrast',
    expectedQty: null, receivedQty: 1, expectedRate: null, receivedRate: 920,
    matchStatus: 'new', aiConfidence: 87, override: false,
  },
];

const CPT_SUGGESTIONS = [
  { code: '27130', description: 'Total hip arthroplasty' },
  { code: '27447', description: 'Total knee arthroplasty' },
  { code: '22612', description: 'Posterior lumbar arthrodesis, single level' },
  { code: '99233', description: 'Subsequent hospital care, high complexity' },
  { code: '99232', description: 'Subsequent hospital care, moderate complexity' },
];

const RECON_CASES: ReconCase[] = [
  {
    id: 'RC-001',
    caseNumber: 'TC-304211',
    memberName: 'Elena Vasquez',
    surgeryType: 'Spinal Fusion',
    scheduledDate: '2026-08-05',
    facility: 'Hospital for Special Surgery',
    status: 'ai_review',
    fileName: 'Claim_TC-304211_EOB.pdf',
    aiScannedAt: 'Jul 1, 2026 · 2:14 PM',
  },
  {
    id: 'RC-002',
    caseNumber: 'TC-200109',
    memberName: 'Marcus Webb',
    surgeryType: 'Knee Replacement',
    scheduledDate: '2026-07-15',
    facility: 'Mayo Clinic – Rochester',
    status: 'pending_upload',
  },
  {
    id: 'RC-003',
    caseNumber: 'TC-100842',
    memberName: 'Sarah Mitchell',
    surgeryType: 'Hip Replacement',
    scheduledDate: '2026-07-28',
    facility: 'Cedars-Sinai Medical Center',
    status: 'approved',
    fileName: 'Claim_TC-100842_EOB.pdf',
    aiScannedAt: 'Jun 28, 2026 · 9:41 AM',
  },
  {
    id: 'RC-004',
    caseNumber: 'TC-512904',
    memberName: 'Darius Johnson',
    surgeryType: 'Bariatric Surgery',
    scheduledDate: '2026-06-20',
    facility: 'Northwestern Memorial Hospital',
    status: 'disputed',
    fileName: 'Claim_TC-512904_EOB.pdf',
    aiScannedAt: 'Jun 22, 2026 · 11:03 AM',
    disputeReason: 'CPT 43644 quantity — received ×2, expected ×1. Facility billing office has been contacted.',
  },
  {
    id: 'RC-005',
    caseNumber: 'TC-609833',
    memberName: 'Angela Torres',
    surgeryType: 'Hysterectomy',
    scheduledDate: '2026-07-01',
    facility: 'Brigham and Women\'s Hospital',
    status: 'pending_upload',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDollar(n: number | null): string {
  if (n === null) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calcTranscarentCost(sc: SurgeryCase, orbitData: OrbitData): TranscarentCost {
  const { costShareConfig } = sc;
  if (costShareConfig.billingType === 'waived') {
    return { deductibleRemaining: 0, deductibleToCollect: 0, coinsuranceAmount: 0, total: 0, mustCollectFullDeductible: false, waived: true };
  }
  const isSingleMember = sc.eligibilityTier === 'EE';
  const useIndividual = costShareConfig.dedEmbedded || isSingleMember;
  const orbitDed = useIndividual ? orbitData.indDeductible : orbitData.famDeductible;
  const orbitOop = useIndividual ? orbitData.indOopMax : orbitData.famOopMax;
  const deductibleRemaining = orbitDed.remaining ?? 0;
  const oopRemaining = orbitOop.remaining ?? Infinity;
  const mustCollectFullDeductible = deductibleRemaining > 0;
  const deductibleToCollect = Math.min(deductibleRemaining, oopRemaining);
  const coinsuranceAmount = 0; // standard: waived after deductible for surgery
  return { deductibleRemaining, deductibleToCollect, coinsuranceAmount, total: deductibleToCollect, mustCollectFullDeductible, waived: false };
}

function buildEffectiveOrbit(sc: SurgeryCase, overrides: OrbitOverrides, unavailable: boolean): OrbitData {
  const blank: AccumProgress = { applied: null, remaining: null, maximum: null };
  return {
    lastChecked: sc.orbitData.lastChecked,
    indDeductible: overrides.indDeductible ?? (unavailable ? blank : sc.orbitData.indDeductible),
    famDeductible: overrides.famDeductible ?? (unavailable ? blank : sc.orbitData.famDeductible),
    indOopMax:     overrides.indOopMax     ?? (unavailable ? blank : sc.orbitData.indOopMax),
    famOopMax:     overrides.famOopMax     ?? (unavailable ? blank : sc.orbitData.famOopMax),
  };
}

function calcTypicalCost(sc: SurgeryCase): TypicalCost {
  const benchmark = PROCEDURE_BENCHMARKS[sc.surgeryType] ?? 30000;
  const isSingleMember = sc.eligibilityTier === 'EE';
  // Use actual plan deductible from carrier — higher than Transcarent's cost share amount
  const typicalDed = isSingleMember
    ? sc.planBenefit.deductibleIndiv
    : sc.planBenefit.deductibleFamily;
  const coinsurancePct = sc.planBenefit.coinsurancePct / 100;
  const coinsuranceBase = Math.max(0, benchmark - typicalDed);
  const coinsuranceAmount = Math.round(coinsuranceBase * coinsurancePct);
  const total = typicalDed + coinsuranceAmount;
  const planTypeLabel = `${sc.planName} — standard benefit`;
  return { typicalDed, coinsuranceBase, coinsuranceAmount, total, benchmark, planTypeLabel };
}

// ── AccumBar component ────────────────────────────────────────────────────────

function AccumBar({ prog, label }: { prog: AccumProgress; label: string }) {
  const hasData = prog.maximum !== null;
  const pct = hasData ? Math.min(100, ((prog.applied ?? 0) / prog.maximum!) * 100) : 0;
  const met = hasData && (prog.remaining ?? 1) === 0;
  return (
    <div className={styles.accumBar}>
      <div className={styles.accumBarLabelRow}>
        <span className={styles.accumBarLabel}>{label}</span>
        {hasData ? (
          <span className={styles.accumBarAmounts}>
            {fmtDollar(prog.applied)} of {fmtDollar(prog.maximum)}
            <span className={met ? styles.accumMet : styles.accumRemaining}>
              {met ? ' · Met ✓' : ` · ${fmtDollar(prog.remaining)} remaining`}
            </span>
          </span>
        ) : (
          <span className={styles.accumNA}>N/A</span>
        )}
      </div>
      <div className={styles.accumBarTrack}>
        {hasData && <div className={`${styles.accumBarFill} ${met ? styles.accumBarFillMet : ''}`} style={{ width: `${pct}%` }} />}
      </div>
    </div>
  );
}

// ── AccumBarOverrideable ──────────────────────────────────────────────────────

function AccumBarOverrideable({
  liveData, label, isActive, overrideData, forceEdit, onSaveOverride, onClearOverride,
}: {
  liveData: AccumProgress;
  label: string;
  isActive: boolean;
  overrideData?: AccumProgress;
  forceEdit?: boolean;
  onSaveOverride: (v: AccumProgress) => void;
  onClearOverride: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const displayProg = overrideData ?? liveData;
  const [draft, setDraft] = useState({ applied: '', remaining: '', maximum: '' });

  function openEdit() {
    const cur = overrideData ?? liveData;
    setDraft({
      applied: cur.applied !== null ? String(cur.applied) : '',
      remaining: cur.remaining !== null ? String(cur.remaining) : '',
      maximum: cur.maximum !== null ? String(cur.maximum) : '',
    });
    setEditing(true);
  }

  function saveEdit() {
    const toNum = (s: string) => s === '' ? null : Number(s);
    onSaveOverride({ applied: toNum(draft.applied), remaining: toNum(draft.remaining), maximum: toNum(draft.maximum) });
    setEditing(false);
  }

  const showForm = editing || forceEdit;

  React.useEffect(() => {
    if (forceEdit && !editing) {
      openEdit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceEdit]);

  return (
    <div className={`${styles.accumBarWrap} ${isActive ? styles.accumBarWrapActive : ''}`}>
      {isActive && <div className={styles.accumActiveTag}>Applied to this case</div>}
      <div className={styles.accumBarRow}>
        <div style={{ flex: 1 }}>
          <AccumBar prog={displayProg} label={label} />
        </div>
        {!showForm && (
          <div className={styles.accumBarActions}>
            {overrideData && <span className={styles.overriddenBadge}>Manual</span>}
            <button className={styles.accumEditBtn} onClick={openEdit} title="Override">✏</button>
            {overrideData && (
              <button className={styles.accumClearBtn} onClick={onClearOverride} title="Clear">✕</button>
            )}
          </div>
        )}
      </div>
      {showForm && (
        <div className={styles.accumEditForm}>
          <div className={styles.accumEditFields}>
            {(['applied', 'remaining', 'maximum'] as const).map(f => (
              <div key={f} className={styles.accumEditField}>
                <label className={styles.accumEditLabel}>{f.charAt(0).toUpperCase() + f.slice(1)} ($)</label>
                <input
                  className={styles.accumEditInput}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={draft[f]}
                  onChange={e => setDraft(d => ({ ...d, [f]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className={styles.accumEditActions}>
            {!forceEdit && <button className={styles.btnTertiary} onClick={() => setEditing(false)}>Cancel</button>}
            {overrideData && <button className={styles.btnTertiary} onClick={() => { onClearOverride(); setEditing(false); }}>Clear</button>}
            <button className={styles.accumEditSave} onClick={saveEdit}>Save override</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Cost Estimate Export preview ──────────────────────────────────────────────

function CostEstimateExport({ sc, tc, ttc }: { sc: SurgeryCase; tc: TranscarentCost; ttc: TypicalCost }) {
  const transcarentTotal = tc.waived ? 0 : tc.total;
  const savings = ttc.total - transcarentTotal;
  return (
    <div className={styles.exportPreview}>
      {/* Header bar */}
      <div className={styles.exportPreviewHeader}>
        <div className={styles.exportLogoRow}>
          <div className={styles.exportLogoMark}>TC</div>
          <span className={styles.exportLogoText}>Transcarent</span>
        </div>
        <div className={styles.exportPreviewTitle}>Cost Estimate Summary</div>
        <div className={styles.exportPreviewMeta}>
          Prepared for <strong>{sc.memberName}</strong> &nbsp;·&nbsp; {sc.surgeryType} &nbsp;·&nbsp; {sc.facility}
        </div>
        <div className={styles.exportPreviewMeta} style={{ marginTop: 2 }}>
          Surgery date: {fmtDate(sc.scheduledDate)} &nbsp;·&nbsp; {sc.client}
        </div>
      </div>

      {/* Primary call-out: Your Estimated Responsibility */}
      <div className={styles.estimatedResponsibilityCard}>
        <div className={styles.erLabel}>Your Estimated Responsibility</div>
        <div className={`${styles.erAmount} ${tc.waived ? styles.erAmountGreen : ''}`}>
          {tc.waived ? '$0' : fmtDollar(transcarentTotal)}
        </div>
        {tc.waived ? (
          <div className={styles.erSubtext}>Your deductible is fully covered through your employer benefit — no out-of-pocket costs expected.</div>
        ) : (
          <div className={styles.erSubtext}>Based on your current plan year accumulators as of {sc.orbitData.lastChecked}.</div>
        )}
        {savings > 0 && (
          <div className={styles.erSavings}>
            Estimated savings vs. standard plan: <strong>{fmtDollar(savings)}</strong>
          </div>
        )}
      </div>

      {/* How we arrived here — comparison table */}
      <div className={styles.exportSectionLabel}>How your estimate compares</div>
      <div className={styles.compareGrid}>
        {/* Without Transcarent */}
        <div className={styles.compareCol}>
          <div className={styles.compareColHeader}>Without Transcarent</div>
          <div className={styles.compareColSub}>{sc.planName} standard benefit</div>
          <div className={styles.compareRow}>
            <span>Plan deductible</span>
            <span>{fmtDollar(ttc.typicalDed)}</span>
          </div>
          <div className={styles.compareRow}>
            <span>Coinsurance ({sc.planBenefit.coinsurancePct}%)</span>
            <span>{fmtDollar(ttc.coinsuranceAmount)}</span>
          </div>
          <div className={`${styles.compareRow} ${styles.compareRowTotal}`}>
            <span>Estimated responsibility</span>
            <span>~{fmtDollar(ttc.total)}</span>
          </div>
        </div>

        <div className={styles.compareDivider}>
          <div className={styles.compareLine} />
          <span className={styles.compareVs}>vs</span>
          <div className={styles.compareLine} />
        </div>

        {/* With Transcarent */}
        <div className={`${styles.compareCol} ${styles.compareColHighlight}`}>
          <div className={styles.compareColHeader}>With Transcarent</div>
          <div className={styles.compareColSub}>{sc.eligibilityTierLabel} — {sc.client}</div>

          {tc.waived ? (
            <>
              <div className={styles.compareRow}>
                <span>Deductible</span>
                <span className={styles.waivedText}>Covered</span>
              </div>
              <div className={styles.compareRow}>
                <span>Coinsurance</span>
                <span className={styles.waivedText}>Covered</span>
              </div>
              <div className={`${styles.compareRow} ${styles.compareRowTotal}`}>
                <span>Your estimated responsibility</span>
                <span className={styles.totalGreen}>$0</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.compareRow}>
                <span>Remaining deductible</span>
                <span>{fmtDollar(tc.deductibleToCollect)}</span>
              </div>
              <div className={styles.compareRow}>
                <span>Coinsurance after deductible</span>
                <span className={styles.waivedText}>{tc.coinsuranceAmount === 0 ? 'Covered' : fmtDollar(tc.coinsuranceAmount)}</span>
              </div>
              <div className={`${styles.compareRow} ${styles.compareRowTotal}`}>
                <span>Your estimated responsibility</span>
                <span className={styles.totalGreen}>{fmtDollar(transcarentTotal)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.exportDisclaimer}>
        This estimate reflects your current plan year accumulators as of {sc.orbitData.lastChecked} and is for informational purposes only. Your actual responsibility will be confirmed prior to your procedure. Coinsurance comparison uses your plan's standard in-network benefit design. The Transcarent case rate is not disclosed in this estimate.
      </div>
    </div>
  );
}

// ── Tab 1: Eligibility & Cost Share ──────────────────────────────────────────

function EligibilityTab() {
  const [selectedCaseId, setSelectedCaseId] = useState(SURGERY_CASES[0].id);
  const [showExport, setShowExport] = useState(false);
  const [orbitUnavailable, setOrbitUnavailable] = useState(false);
  const [orbitOverrides, setOrbitOverrides] = useState<OrbitOverrides>({});
  const sc = SURGERY_CASES.find(c => c.id === selectedCaseId) ?? SURGERY_CASES[0];
  const isSingleMember = sc.eligibilityTier === 'EE';
  const useIndividual = sc.costShareConfig.dedEmbedded || isSingleMember;
  const effectiveOd = buildEffectiveOrbit(sc, orbitOverrides, orbitUnavailable);
  const tc = calcTranscarentCost(sc, effectiveOd);
  const ttc = calcTypicalCost(sc);

  function setOverride(key: AccumKey, val: AccumProgress) {
    setOrbitOverrides(p => ({ ...p, [key]: val }));
  }
  function clearOverride(key: AccumKey) {
    setOrbitOverrides(p => { const n = { ...p }; delete n[key]; return n; });
  }
  function handleCaseChange(id: string) {
    setSelectedCaseId(id);
    setShowExport(false);
    setOrbitUnavailable(false);
    setOrbitOverrides({});
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.caseSelectorRow}>
        <label className={styles.caseSelectorLabel}>Surgery case</label>
        <select
          className={styles.caseSelect}
          value={selectedCaseId}
          onChange={e => handleCaseChange(e.target.value)}
        >
          {SURGERY_CASES.map(c => (
            <option key={c.id} value={c.id}>
              {c.memberName} — {c.surgeryType} — {c.caseNumber}
            </option>
          ))}
        </select>
        <button className={styles.refreshBtn}>↻ Refresh Orbit data</button>
      </div>

      <div className={styles.twoCol}>
        {/* Left: member, surgery, cost share config */}
        <div className={styles.leftCol}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardTitle}>Member</div>
            <InfoRow label="Name" value={sc.memberName} />
            <InfoRow label="DOB" value={sc.memberDob} />
            <InfoRow label="Member ID" value={sc.memberId} mono />
            <InfoRow label="Client" value={sc.client} />
            <InfoRow label="Carrier" value={sc.carrier} />
            <InfoRow label="Plan" value={sc.planName} />
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Eligibility tier</span>
              <span className={styles.infoValue}>
                <span className={styles.eligBadge}>{sc.eligibilityTier}</span>
                {sc.eligibilityTierLabel}
              </span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoCardTitle}>Surgery Details</div>
            <InfoRow label="Type" value={sc.surgeryType} />
            <InfoRow label="Facility" value={sc.facility} />
            <InfoRow label="Surgeon" value={sc.surgeonName} />
            <InfoRow label="Surgery date" value={fmtDate(sc.scheduledDate)} />
            <InfoRow label="Case #" value={sc.caseNumber} mono />
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoCardTitle}>
              Cost Share Configuration
              <span className={styles.infoCardSource}>from Client Plan</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Plan type</span>
              <span className={styles.infoValue}>
                <span className={`${styles.planTypePill} ${sc.costShareConfig.planType === 'HDHP' ? styles.pillHDHP : styles.pillPPO}`}>
                  {sc.costShareConfig.planType}
                </span>
              </span>
            </div>
            <InfoRow
              label="Billing type"
              value={
                sc.costShareConfig.billingType === 'irs_minimum' ? 'IRS Minimum' :
                sc.costShareConfig.billingType === 'custom' ? 'Custom' :
                sc.costShareConfig.billingType === 'waived' ? 'Waived' : 'Insurance'
              }
            />
            <InfoRow label="Deductible structure" value={sc.costShareConfig.dedEmbedded ? 'Embedded' : 'Aggregate'} />
            <InfoRow label="Applied tier" value={sc.costShareConfig.tierLabel} />
            {sc.costShareConfig.tierDeductible !== null && (
              <InfoRow label="Tier deductible" value={fmtDollar(sc.costShareConfig.tierDeductible)} />
            )}
            <InfoRow label="Coinsurance %" value={`${sc.costShareConfig.coinsurancePct}%`} />
          </div>
        </div>

        {/* Right: Orbit data + cost calculation */}
        <div className={styles.rightCol}>
          <div className={styles.infoCard}>
            {/* Header row with status toggle */}
            <div className={styles.orbitCardHeader}>
              <div>
                <div className={styles.infoCardTitle} style={{ marginBottom: 0 }}>Orbit Accumulator Data</div>
                <div className={styles.infoCardSource}>Last checked: {sc.orbitData.lastChecked}</div>
              </div>
              <div className={styles.orbitStatusArea}>
                {orbitUnavailable
                  ? <span className={styles.orbitStatusManual}>⚠ Manual data</span>
                  : Object.keys(orbitOverrides).length > 0
                    ? <span className={styles.orbitStatusPartial}>◑ Partial override</span>
                    : <span className={styles.orbitStatusLive}>● Live from Orbit</span>
                }
                <label className={styles.orbitUnavailableToggle}>
                  <input
                    type="checkbox"
                    checked={orbitUnavailable}
                    onChange={e => {
                      setOrbitUnavailable(e.target.checked);
                      if (!e.target.checked) setOrbitOverrides({});
                    }}
                  />
                  Mark unavailable
                </label>
              </div>
            </div>

            {orbitUnavailable && (
              <div className={styles.orbitUnavailableBanner}>
                Orbit is unavailable — enter accumulator values manually. These values will be used in the cost calculation below.
              </div>
            )}

            {/* Tier applicability callout */}
            <div className={styles.accumTierCallout}>
              <span className={styles.eligBadge}>{sc.eligibilityTier}</span>
              <span className={styles.accumTierText}>
                {sc.eligibilityTierLabel} · <strong>{useIndividual ? 'Individual' : 'Family'}</strong> accumulator applies
                {' '}({sc.costShareConfig.dedEmbedded ? 'embedded plan' : 'aggregate plan'})
              </span>
            </div>

            {/* In-Network Deductible group */}
            <div className={styles.accumGroup}>
              <div className={styles.accumGroupTitle}>In-Network Deductible</div>
              <AccumBarOverrideable
                liveData={sc.orbitData.indDeductible}
                label="Individual"
                isActive={useIndividual}
                overrideData={orbitOverrides.indDeductible}
                forceEdit={orbitUnavailable}
                onSaveOverride={v => setOverride('indDeductible', v)}
                onClearOverride={() => clearOverride('indDeductible')}
              />
              {!isSingleMember && (
                <AccumBarOverrideable
                  liveData={sc.orbitData.famDeductible}
                  label="Family"
                  isActive={!useIndividual}
                  overrideData={orbitOverrides.famDeductible}
                  forceEdit={orbitUnavailable && !useIndividual}
                  onSaveOverride={v => setOverride('famDeductible', v)}
                  onClearOverride={() => clearOverride('famDeductible')}
                />
              )}
            </div>

            {/* In-Network OOP Max group */}
            <div className={styles.accumGroup}>
              <div className={styles.accumGroupTitle}>In-Network Out-of-Pocket Max</div>
              <AccumBarOverrideable
                liveData={sc.orbitData.indOopMax}
                label="Individual"
                isActive={useIndividual}
                overrideData={orbitOverrides.indOopMax}
                forceEdit={orbitUnavailable}
                onSaveOverride={v => setOverride('indOopMax', v)}
                onClearOverride={() => clearOverride('indOopMax')}
              />
              {!isSingleMember && (
                <AccumBarOverrideable
                  liveData={sc.orbitData.famOopMax}
                  label="Family"
                  isActive={!useIndividual}
                  overrideData={orbitOverrides.famOopMax}
                  forceEdit={orbitUnavailable && !useIndividual}
                  onSaveOverride={v => setOverride('famOopMax', v)}
                  onClearOverride={() => clearOverride('famOopMax')}
                />
              )}
            </div>
          </div>

          <div className={styles.costCalcCard}>
            <div className={styles.costCalcHeader}>
              <span>Expected Member Cost</span>
              <span className={styles.liveTag}>Live calculation</span>
            </div>

            {tc.waived ? (
              <div className={styles.waivedBanner}>
                Cost share is waived for this member's plan.
                <div className={styles.waivedTotal}>Expected member responsibility: <strong>$0</strong></div>
              </div>
            ) : (
              <>
                <div className={styles.costRow}>
                  <span>Deductible remaining</span>
                  <span>{fmtDollar(tc.deductibleRemaining)}</span>
                </div>
                {tc.mustCollectFullDeductible && (
                  <div className={styles.collectFullAlert}>
                    Full deductible must be collected before surgery
                  </div>
                )}
                <div className={styles.costRow}>
                  <span>Deductible to collect</span>
                  <span>{fmtDollar(tc.deductibleToCollect)}</span>
                </div>
                <div className={styles.costRow}>
                  <span>Coinsurance after deductible</span>
                  <span className={styles.waivedText}>{tc.coinsuranceAmount === 0 ? 'Waived (0%)' : fmtDollar(tc.coinsuranceAmount)}</span>
                </div>
                <div className={`${styles.costRow} ${styles.costRowTotal}`}>
                  <span>Expected member responsibility</span>
                  <strong>{fmtDollar(tc.total)}</strong>
                </div>
              </>
            )}

            <div className={styles.costCalcActions}>
              <button className={styles.estimateBtn} onClick={() => setShowExport(true)}>
                Preview member cost estimate
              </button>
            </div>
          </div>
        </div>
      </div>

      {showExport && (
        <>
          <div className={styles.modalOverlay} onClick={() => setShowExport(false)} />
          <div className={styles.exportModal}>
            <div className={styles.exportModalHeader}>
              <div>
                <div className={styles.exportModalTitle}>Member Cost Estimate</div>
                <div className={styles.exportModalSub}>Member-facing view — case rate not included</div>
              </div>
              <button className={styles.modalClose} onClick={() => setShowExport(false)}>✕</button>
            </div>
            <div className={styles.exportModalBody}>
              <CostEstimateExport sc={sc} tc={tc} ttc={ttc} />
            </div>
            <div className={styles.exportModalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowExport(false)}>Close</button>
              <button className={styles.btnPrimary}>Export PDF</button>
              <button className={styles.btnPrimary}>Send to Member</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${mono ? styles.mono : ''}`}>{value}</span>
    </div>
  );
}

// ── Tab 2: Invoice Request ────────────────────────────────────────────────────

function InvoiceRequestTab() {
  const [form, setForm] = useState({
    treatmentType: 'surgery',
    caseNumber: 'TC-100842',
    memberName: 'Sarah Mitchell',
    memberId: 'MB-00291847',
    client: 'Apex Industries',
    carrier: 'Aetna',
    facility: 'Cedars-Sinai Medical Center',
    surgeon: 'Dr. Robert Chen',
    surgeryDate: '2026-07-28',
    cptCodes: '27130',
    drg: '470 – Major joint replacement or reattachment',
    travelIncluded: false,
    travelAmount: '',
    notes: '',
  });
  const [readyForInvoicing, setReadyForInvoicing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setField(key: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  if (submitted) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.submittedBanner}>
          <div className={styles.submittedIcon}>✓</div>
          <div className={styles.submittedText}>
            <div className={styles.submittedTitle}>Invoice Request Submitted</div>
            <div className={styles.submittedSub}>
              AR Invoice generated for <strong>{form.memberName}</strong> · {form.caseNumber}.
              This case now appears in <strong>Member Payments → Surgery – Not Issued</strong>.
            </div>
          </div>
          <button className={styles.submittedNewBtn} onClick={() => setSubmitted(false)}>New request</button>
        </div>

        <div className={styles.arInvoiceCard}>
          <div className={styles.arInvoiceTitle}>AR Invoice — Generated</div>
          <div className={styles.arInvoiceGrid}>
            {[
              ['Case #', form.caseNumber, true],
              ['Member', form.memberName, false],
              ['Client', form.client, false],
              ['Carrier', form.carrier, false],
              ['Facility', form.facility, false],
              ['Surgeon', form.surgeon, false],
              ['Surgery date', fmtDate(form.surgeryDate), false],
              ['CPT codes', form.cptCodes, true],
              ['DRG', form.drg, false],
            ].map(([label, value, mono]) => (
              <div key={String(label)} className={styles.arRow}>
                <span className={styles.arLabel}>{label}</span>
                <span className={`${styles.arValue} ${mono ? styles.mono : ''}`}>{value}</span>
              </div>
            ))}
            <div className={styles.arRow}>
              <span className={styles.arLabel}>Status</span>
              <span className={styles.preCalcBadge}>pre_calculated</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.formHeader}>
        <div className={styles.formTitle}>Surgery Invoice Request</div>
        <div className={styles.formSub}>Mirrors the Salesforce Invoice Request. Submitting generates a pre-calculated AR Invoice for Surgery – Not Issued.</div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formSection}>
          <div className={styles.formSectionTitle}>Treatment</div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Treatment type</label>
            <select className={styles.fieldSelect} value={form.treatmentType} onChange={e => setField('treatmentType', e.target.value)}>
              <option value="surgery">Surgery</option>
              <option value="oncology">Oncology COE</option>
              <option value="cardiac">Cardiac COE</option>
              <option value="orthopedic">Orthopedic</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Case number</label>
            <input className={styles.fieldInput} value={form.caseNumber} onChange={e => setField('caseNumber', e.target.value)} />
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formSectionTitle}>Member</div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Member name</label>
            <input className={styles.fieldInput} value={form.memberName} onChange={e => setField('memberName', e.target.value)} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Member ID</label>
            <input className={styles.fieldInput} value={form.memberId} onChange={e => setField('memberId', e.target.value)} />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Client</label>
              <input className={styles.fieldInput} value={form.client} onChange={e => setField('client', e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Carrier</label>
              <input className={styles.fieldInput} value={form.carrier} onChange={e => setField('carrier', e.target.value)} />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formSectionTitle}>Facility &amp; Surgeon</div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Facility / COE</label>
            <input className={styles.fieldInput} value={form.facility} onChange={e => setField('facility', e.target.value)} />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Surgeon</label>
              <input className={styles.fieldInput} value={form.surgeon} onChange={e => setField('surgeon', e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Surgery date</label>
              <input className={styles.fieldInput} type="date" value={form.surgeryDate} onChange={e => setField('surgeryDate', e.target.value)} />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formSectionTitle}>Procedure Codes</div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>CPT codes (comma-separated)</label>
            <input
              className={styles.fieldInput}
              value={form.cptCodes}
              onChange={e => setField('cptCodes', e.target.value)}
              placeholder="e.g. 27130, 99233"
            />
            <div className={styles.cptSuggestions}>
              {CPT_SUGGESTIONS.map(s => (
                <button
                  key={s.code}
                  className={styles.cptChip}
                  onClick={() => {
                    const current = form.cptCodes.split(',').map(c => c.trim()).filter(Boolean);
                    if (!current.includes(s.code)) setField('cptCodes', [...current, s.code].join(', '));
                  }}
                >
                  {s.code} — {s.description}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>DRG</label>
            <input className={styles.fieldInput} value={form.drg} onChange={e => setField('drg', e.target.value)} placeholder="e.g. 470 – Major joint replacement" />
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formSectionTitle}>Travel &amp; Accommodations</div>
          <label className={styles.checkRow}>
            <input type="checkbox" checked={form.travelIncluded} onChange={e => setField('travelIncluded', e.target.checked)} />
            <span className={styles.checkLabel}>Travel assistance included</span>
          </label>
          {form.travelIncluded && (
            <div className={styles.fieldGroup} style={{ marginTop: 12 }}>
              <label className={styles.fieldLabel}>Travel amount ($)</label>
              <input className={styles.fieldInput} style={{ maxWidth: 160 }} value={form.travelAmount} onChange={e => setField('travelAmount', e.target.value)} placeholder="e.g. 1500" />
            </div>
          )}
        </div>

        <div className={styles.formSection}>
          <div className={styles.formSectionTitle}>Notes</div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Internal notes</label>
            <textarea className={styles.fieldTextarea} rows={3} value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Any relevant context..." />
          </div>
        </div>
      </div>

      <div className={styles.invoiceReadyBar}>
        <label className={styles.readyToggle}>
          <div className={styles.toggle}>
            <input type="checkbox" checked={readyForInvoicing} onChange={e => setReadyForInvoicing(e.target.checked)} />
            <span className={styles.toggleTrack} />
          </div>
          <div>
            <div className={styles.readyLabel}>Ready for invoicing</div>
            <div className={styles.readySub}>Generates an AR Invoice and moves this case to Surgery – Not Issued</div>
          </div>
        </label>
        <div className={styles.formActions}>
          <button className={styles.btnSecondary}>Save draft</button>
          <Button appearance="primary" size="small" onClick={() => setSubmitted(true)}>
            Submit Invoice Request
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Recon CPT review sub-component ───────────────────────────────────────────

function CptReviewTable({ caseId, onConfirm, readonly }: { caseId: string; onConfirm?: () => void; readonly?: boolean }) {
  const [rows, setRows] = useState<CptCodeRow[]>(MOCK_CPT_ROWS);
  const [confirmed, setConfirmed] = useState(false);

  function toggleOverride(code: string) {
    setRows(prev => prev.map(r => r.code === code ? { ...r, override: !r.override } : r));
  }

  const mismatches = rows.filter(r => r.matchStatus !== 'match' && !r.override).length;
  const matchCount = rows.filter(r => r.matchStatus === 'match' || r.override).length;

  return (
    <>
      <div className={styles.reconTableWrap}>
        <table className={styles.reconTable}>
          <thead>
            <tr>
              <th>CPT Code</th>
              <th>Description</th>
              <th className={styles.colCenter}>Exp. Qty</th>
              <th className={styles.colCenter}>Rec. Qty</th>
              <th className={styles.colCenter}>Exp. Rate</th>
              <th className={styles.colCenter}>Rec. Rate</th>
              <th>Status</th>
              <th className={styles.colCenter}>AI Confidence</th>
              {!readonly && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const effectiveStatus = row.override ? 'match' : row.matchStatus;
              const statusCls = effectiveStatus === 'match' ? styles.statusMatch : effectiveStatus === 'changed' ? styles.statusChanged : effectiveStatus === 'missing' ? styles.statusMissing : styles.statusNew;
              const qtyDiff = row.receivedQty !== null && row.expectedQty !== null && row.receivedQty !== row.expectedQty;
              return (
                <tr key={row.code} className={row.override ? styles.rowOverridden : ''}>
                  <td className={`${styles.codeCell} ${styles.mono}`}>{row.code}</td>
                  <td className={styles.descCell}>{row.description}</td>
                  <td className={styles.colCenter}>{row.expectedQty ?? '—'}</td>
                  <td className={`${styles.colCenter} ${qtyDiff ? styles.cellDiff : ''}`}>{row.receivedQty ?? '—'}</td>
                  <td className={styles.colCenter}>{row.expectedRate ? fmtDollar(row.expectedRate) : '—'}</td>
                  <td className={styles.colCenter}>{row.receivedRate ? fmtDollar(row.receivedRate) : '—'}</td>
                  <td><span className={`${styles.reconStatus} ${statusCls}`}>{row.override ? '✓ Accepted' : effectiveStatus === 'match' ? '✓ Match' : effectiveStatus === 'changed' ? '⚠ Changed' : effectiveStatus === 'missing' ? '✕ Missing' : '+ New'}</span></td>
                  <td className={styles.colCenter}>{row.aiConfidence !== null ? <span className={`${styles.aiConf} ${row.aiConfidence >= 95 ? styles.aiHigh : row.aiConfidence >= 85 ? styles.aiMid : styles.aiLow}`}>{row.aiConfidence}%</span> : '—'}</td>
                  {!readonly && <td>{row.matchStatus !== 'match' && <button className={`${styles.overrideBtn} ${row.override ? styles.overrideBtnUndo : ''}`} onClick={() => toggleOverride(row.code)}>{row.override ? 'Undo' : 'Accept'}</button>}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.reconFooter}>
        <div className={styles.reconSummaryChips}>
          <span className={`${styles.summaryChip} ${styles.statusMatch}`}>{matchCount} matched</span>
          <span className={`${styles.summaryChip} ${styles.statusChanged}`}>{rows.filter(r => r.matchStatus === 'changed' && !r.override).length} changed</span>
          <span className={`${styles.summaryChip} ${styles.statusMissing}`}>{rows.filter(r => r.matchStatus === 'missing' && !r.override).length} missing</span>
          <span className={`${styles.summaryChip} ${styles.statusNew}`}>{rows.filter(r => r.matchStatus === 'new' && !r.override).length} new</span>
        </div>
        {!readonly && (
          confirmed ? (
            <div className={styles.reconConfirmed}>✓ Confirmed — sent to Client Billing · Surgery Reconciliations</div>
          ) : (
            <div className={styles.reconActions}>
              {mismatches > 0 && <span className={styles.reconWarning}>{mismatches} item{mismatches !== 1 ? 's' : ''} need review</span>}
              <Button appearance="primary" size="small" onClick={() => { setConfirmed(true); onConfirm?.(); }}>
                Confirm &amp; Send to Client Billing
              </Button>
            </div>
          )
        )}
      </div>
    </>
  );
}

// ── Recon wizard sub-component ────────────────────────────────────────────────

function ReconWizard({ rc, onStatusChange }: { rc: ReconCase; onStatusChange: (id: string, s: ReconStatus) => void }) {
  const [step, setStep] = useState<ReconWizardStep>(
    rc.status === 'pending_upload' ? 'upload' :
    rc.status === 'approved' ? 'confirmed' :
    'review'
  );
  const [scanPhase, setScanPhase] = useState(0); // 0=idle,1=loading doc,2=extracting,3=matching,4=done
  const [fileName, setFileName] = useState(rc.fileName ?? '');

  function simulateUpload(name: string) {
    setFileName(name);
    setStep('scanning');
    setScanPhase(1);
    setTimeout(() => setScanPhase(2), 900);
    setTimeout(() => setScanPhase(3), 1900);
    setTimeout(() => { setScanPhase(4); setStep('review'); onStatusChange(rc.id, 'ai_review'); }, 3000);
  }

  const WIZARD_STEPS: { key: ReconWizardStep; label: string }[] = [
    { key: 'upload', label: 'Upload Document' },
    { key: 'scanning', label: 'AI Scan' },
    { key: 'review', label: 'Review & Accept' },
    { key: 'confirmed', label: 'Confirmed' },
  ];
  const stepIdx = WIZARD_STEPS.findIndex(s => s.key === step);

  return (
    <div className={styles.wizardWrap}>
      {/* Step progress bar */}
      <div className={styles.wizardSteps}>
        {WIZARD_STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className={`${styles.wizardStep} ${i < stepIdx ? styles.wizardStepDone : i === stepIdx ? styles.wizardStepActive : styles.wizardStepPending}`}>
              <div className={styles.wizardStepCircle}>{i < stepIdx ? '✓' : i + 1}</div>
              <div className={styles.wizardStepLabel}>{s.label}</div>
            </div>
            {i < WIZARD_STEPS.length - 1 && <div className={`${styles.wizardConnector} ${i < stepIdx ? styles.wizardConnectorDone : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      {step === 'upload' && (
        <div
          className={styles.uploadArea}
          onClick={() => simulateUpload(`Claim_${rc.caseNumber}_EOB.pdf`)}
        >
          <div className={styles.uploadIcon}>📄</div>
          <div className={styles.uploadTitle}>Drop claim document here</div>
          <div className={styles.uploadSub}>PDF, TIFF, or image — EOB, CMS-1500, or UB-04</div>
          <div className={styles.uploadMeta}>{rc.surgeryType} · {rc.caseNumber} · {rc.memberName}</div>
          <button
            className={styles.uploadBtn}
            onClick={e => { e.stopPropagation(); simulateUpload(`Claim_${rc.caseNumber}_EOB.pdf`); }}
          >
            Choose file
          </button>
        </div>
      )}

      {step === 'scanning' && (
        <div className={styles.scanningArea}>
          <div className={styles.scanningTitle}>AI is scanning your document</div>
          <div className={styles.scanningFile}>📄 {fileName}</div>
          <div className={styles.scanningSteps}>
            <div className={`${styles.scanStep} ${scanPhase >= 1 ? styles.scanStepActive : ''} ${scanPhase > 1 ? styles.scanStepDone : ''}`}>
              <span className={styles.scanStepDot} />{scanPhase > 1 ? '✓' : ''} Loading document
            </div>
            <div className={`${styles.scanStep} ${scanPhase >= 2 ? styles.scanStepActive : ''} ${scanPhase > 2 ? styles.scanStepDone : ''}`}>
              <span className={styles.scanStepDot} />{scanPhase > 2 ? '✓' : ''} Extracting CPT codes
            </div>
            <div className={`${styles.scanStep} ${scanPhase >= 3 ? styles.scanStepActive : ''} ${scanPhase > 3 ? styles.scanStepDone : ''}`}>
              <span className={styles.scanStepDot} />{scanPhase > 3 ? '✓' : ''} Matching against expected codes
            </div>
          </div>
        </div>
      )}

      {step === 'review' && (
        <>
          <div className={`${styles.claimUploadedRow} ${rc.status === 'disputed' ? styles.claimUploadedRowDisputed : ''}`}>
            <span className={styles.claimUploadedCheck}>{rc.status === 'disputed' ? '⚠' : '✓'}</span>
            <span className={styles.claimFileName}>{fileName || rc.fileName}</span>
            <span className={styles.claimMeta}>AI scan complete · {MOCK_CPT_ROWS.filter(r => r.aiConfidence !== null).length} CPT codes identified</span>
            {rc.status !== 'disputed' && (
              <button className={styles.claimReplace} onClick={() => { setStep('upload'); onStatusChange(rc.id, 'pending_upload'); }}>Replace</button>
            )}
          </div>
          {rc.status === 'disputed' && rc.disputeReason && (
            <div className={styles.disputeBanner}>
              <strong>Disputed:</strong> {rc.disputeReason}
            </div>
          )}
          <CptReviewTable caseId={rc.id} readonly={rc.status === 'disputed'} onConfirm={() => onStatusChange(rc.id, 'approved')} />
        </>
      )}

      {step === 'confirmed' && (
        <div className={styles.confirmedArea}>
          <div className={styles.confirmedIcon}>✓</div>
          <div className={styles.confirmedTitle}>Reconciliation Complete</div>
          <div className={styles.confirmedSub}>
            Claim reconciliation for <strong>{rc.memberName}</strong> · {rc.caseNumber} has been confirmed and sent to Client Billing.
          </div>
          <div className={styles.confirmedMeta}>
            {rc.aiScannedAt && <>AI scan completed: {rc.aiScannedAt}</>}
          </div>
          <CptReviewTable caseId={rc.id} readonly />
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Reconciliation ─────────────────────────────────────────────────────

function ReconciliationTab() {
  const [statusFilter, setStatusFilter] = useState<ReconStatusFilter>('all');
  const [selectedId, setSelectedId] = useState<string>('RC-001');
  const [caseStatuses, setCaseStatuses] = useState<Record<string, ReconStatus>>(
    Object.fromEntries(RECON_CASES.map(c => [c.id, c.status]))
  );

  function handleStatusChange(id: string, newStatus: ReconStatus) {
    setCaseStatuses(p => ({ ...p, [id]: newStatus }));
  }

  const STATUS_TABS: { key: ReconStatusFilter; label: string }[] = [
    { key: 'all', label: 'All Cases' },
    { key: 'pending_upload', label: 'Pending Upload' },
    { key: 'ai_review', label: 'AI Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'disputed', label: 'Disputed' },
  ];

  const filteredCases = statusFilter === 'all'
    ? RECON_CASES
    : RECON_CASES.filter(c => caseStatuses[c.id] === statusFilter);

  const selectedCase = RECON_CASES.find(c => c.id === selectedId) ?? RECON_CASES[0];
  // Merge live status changes back onto the selected case
  const liveSelectedCase: ReconCase = { ...selectedCase, status: caseStatuses[selectedCase.id] };

  function statusLabel(s: ReconStatus): string {
    return s === 'pending_upload' ? 'Pending Upload' : s === 'ai_review' ? 'AI Review' : s === 'approved' ? 'Approved' : 'Disputed';
  }
  function statusClass(s: ReconStatus): string {
    return s === 'pending_upload' ? styles.reconBadgePending : s === 'ai_review' ? styles.reconBadgeReview : s === 'approved' ? styles.reconBadgeApproved : styles.reconBadgeDisputed;
  }

  return (
    <div className={styles.tabContent}>
      {/* Status filter tab bar */}
      <div className={styles.reconStatusBar}>
        {STATUS_TABS.map(t => {
          const count = t.key === 'all' ? RECON_CASES.length : RECON_CASES.filter(c => caseStatuses[c.id] === t.key).length;
          return (
            <button
              key={t.key}
              className={`${styles.reconStatusTab} ${statusFilter === t.key ? styles.reconStatusTabActive : ''}`}
              onClick={() => setStatusFilter(t.key)}
            >
              {t.label}
              {count > 0 && <span className={styles.reconStatusCount}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Split: case list + wizard */}
      <div className={styles.reconSplit}>
        {/* Left: case list */}
        <div className={styles.reconCaseList}>
          {filteredCases.length === 0 && (
            <div className={styles.reconEmptyList}>No cases in this status.</div>
          )}
          {filteredCases.map(rc => {
            const liveStatus = caseStatuses[rc.id];
            return (
              <button
                key={rc.id}
                className={`${styles.reconCaseCard} ${selectedId === rc.id ? styles.reconCaseCardActive : ''}`}
                onClick={() => setSelectedId(rc.id)}
              >
                <div className={styles.reconCaseCardTop}>
                  <span className={styles.reconCaseName}>{rc.memberName}</span>
                  <span className={`${styles.reconBadge} ${statusClass(liveStatus)}`}>{statusLabel(liveStatus)}</span>
                </div>
                <div className={styles.reconCaseCardSub}>{rc.surgeryType} · {rc.caseNumber}</div>
                <div className={styles.reconCaseCardMeta}>{fmtDate(rc.scheduledDate)} · {rc.facility}</div>
              </button>
            );
          })}
        </div>

        {/* Right: wizard */}
        <div className={styles.reconWizardPane}>
          <div className={styles.reconWizardHeader}>
            <div>
              <div className={styles.reconWizardTitle}>{selectedCase.memberName} — {selectedCase.surgeryType}</div>
              <div className={styles.reconWizardSub}>{selectedCase.caseNumber} · {selectedCase.facility}</div>
            </div>
            <span className={`${styles.reconBadge} ${statusClass(caseStatuses[selectedCase.id])}`}>
              {statusLabel(caseStatuses[selectedCase.id])}
            </span>
          </div>
          <ReconWizard key={selectedId} rc={liveSelectedCase} onStatusChange={handleStatusChange} />
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SurgeryOps() {
  const [activeTab, setActiveTab] = useState<SurgeryOpsTab>('eligibility');

  const TABS: { key: SurgeryOpsTab; label: string }[] = [
    { key: 'eligibility', label: 'Eligibility & Cost Share' },
    { key: 'invoice', label: 'Invoice Request' },
    { key: 'reconciliation', label: 'Reconciliation' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Surgery Ops</h1>
          <p className={styles.pageSubtitle}>Pre-invoice workflow for surgery cases — eligibility, cost share, and claims reconciliation</p>
        </div>
      </div>

      <div className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'eligibility' && <EligibilityTab />}
      {activeTab === 'invoice' && <InvoiceRequestTab />}
      {activeTab === 'reconciliation' && <ReconciliationTab />}
    </div>
  );
}
