import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import styles from './SurgeryCostShare.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = 'v1' | 'v2';
type ProductType = 'surgerycare' | 'telehealth' | 'orthopedic' | 'careathome';
type BillingType = 'custom' | 'fixed' | 'waived' | 'irs_minimum' | 'insurance' | 'traditional';
type StatusFilter = 'all' | 'configured' | 'waived' | 'missing';
type PlanType = 'PPO' | 'HDHP';

const PRODUCTS: { key: ProductType; label: string; surgery: boolean }[] = [
  { key: 'surgerycare', label: 'SurgeryCare', surgery: true },
  { key: 'telehealth',  label: 'Telehealth',  surgery: false },
  { key: 'orthopedic',  label: 'Orthopedic',  surgery: false },
  { key: 'careathome',  label: 'Care@Home',   surgery: false },
];

const SURGERY_BILLING_OPTIONS: { value: BillingType; label: string }[] = [
  { value: 'waived',      label: 'Waived' },
  { value: 'irs_minimum', label: 'IRS Minimum' },
  { value: 'insurance',   label: 'Insurance' },
  { value: 'custom',      label: 'Custom' },
];

const OTHER_BILLING_OPTIONS: { value: BillingType; label: string }[] = [
  { value: 'waived',      label: 'Waived' },
  { value: 'fixed',       label: 'Fixed' },
  { value: 'traditional', label: 'Traditional' },
];

const ELIGIBILITY_TIERS = [
  { key: 'ee',     label: 'Employee Only',        singleMember: true },
  { key: 'ee_sp',  label: 'Employee + Spouse',     singleMember: false },
  { key: 'ee_ch',  label: 'Employee + Child(ren)', singleMember: false },
  { key: 'family', label: 'Family',                singleMember: false },
  { key: 'e1d',    label: 'E1D',                   singleMember: false },
  { key: 'e2d',    label: 'E2D',                   singleMember: false },
  { key: 'e3d',    label: 'E3D',                   singleMember: false },
];

type CostShareStatus = 'configured' | 'missing';

interface TierDetail {
  label: string;
  indiv?: string;
  family?: string;
  coinsurance?: string;
}

interface PlanProduct {
  status: CostShareStatus;
  billingType: BillingType;
  summary?: string;
  tierDetails?: TierDetail[];
}

interface Plan {
  id: string;
  name: string;
  planGroup: string;
  carrierName: string;   // Orbit carrier name field from health plan
  year: string;
  hdhp: boolean;
  dedEmbedded: boolean;
  oopEmbedded: boolean;
  products: Record<ProductType, PlanProduct | null>;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: '1', name: 'ACT BCBSIL Select PPO', planGroup: 'Allstate Select Plan (BCBSIL)',
    carrierName: 'Blue Cross Blue Shield of Illinois',
    year: '2025', hdhp: false, dedEmbedded: true, oopEmbedded: true,
    products: {
      surgerycare: {
        status: 'configured', billingType: 'custom', summary: 'Custom · 1 tier',
        tierDetails: [{ label: 'Employee Only', indiv: '$1,500', family: undefined }],
      },
      telehealth:  { status: 'configured', billingType: 'traditional', summary: 'Traditional' },
      orthopedic:  { status: 'configured', billingType: 'fixed',       summary: 'Fixed · $195 per visit' },
      careathome:  null,
    },
  },
  {
    id: '2', name: 'ACT BCBSIL Select PPO COBRA', planGroup: 'Allstate Select Plan (BCBSIL)',
    carrierName: 'Blue Cross Blue Shield of Illinois',
    year: '2025', hdhp: false, dedEmbedded: true, oopEmbedded: true,
    products: {
      surgerycare: {
        status: 'configured', billingType: 'custom', summary: 'Custom · 2 tiers',
        tierDetails: [
          { label: 'Employee Only',     indiv: '$1,500', family: '$3,000' },
          { label: 'Employee + Spouse', indiv: '$1,500', family: '$3,000' },
        ],
      },
      telehealth:  { status: 'configured', billingType: 'waived',      summary: 'Waived · $0 cost' },
      orthopedic:  { status: 'configured', billingType: 'traditional', summary: 'Traditional' },
      careathome:  null,
    },
  },
  {
    id: '3', name: 'ACT BCBSIL Select PPO_NMR', planGroup: 'Allstate Select Plan (BCBSIL)',
    carrierName: 'Blue Cross Blue Shield of Illinois',
    year: '2025', hdhp: false, dedEmbedded: false, oopEmbedded: true,
    products: {
      surgerycare: {
        status: 'configured', billingType: 'custom', summary: 'Custom · 3 tiers',
        tierDetails: [
          { label: 'Employee Only',         indiv: '$1,500', family: undefined },
          { label: 'Employee + Child(ren)', indiv: undefined, family: '$3,000' },
          { label: 'Family',                indiv: undefined, family: '$3,000' },
        ],
      },
      telehealth:  { status: 'configured', billingType: 'traditional', summary: 'Traditional' },
      orthopedic:  { status: 'configured', billingType: 'fixed',       summary: 'Fixed · $195 per visit' },
      careathome:  null,
    },
  },
  {
    id: '4', name: 'ACT BCBSIL Value HSA Blue Preferred POS COBRA', planGroup: 'Allstate Value Plan (BCBSIL)',
    carrierName: 'Blue Cross Blue Shield of Illinois',
    year: '2025', hdhp: true, dedEmbedded: false, oopEmbedded: true,
    products: {
      surgerycare: {
        status: 'configured', billingType: 'irs_minimum', summary: 'IRS Minimum',
        tierDetails: [
          { label: 'Employee Only', indiv: '$1,650', family: undefined },
          { label: 'Family',        indiv: undefined, family: '$3,300' },
          { label: 'E1D',           indiv: undefined, family: '$3,300' },
        ],
      },
      telehealth:  { status: 'configured', billingType: 'traditional', summary: 'Traditional' },
      orthopedic:  { status: 'configured', billingType: 'waived',      summary: 'Waived · $0 cost' },
      careathome:  { status: 'configured', billingType: 'fixed',       summary: 'Fixed · $260 per visit' },
    },
  },
  {
    id: '5', name: 'Allstate Select Plan 07 Florida', planGroup: 'Allstate Select Plan (BCBSIL)',
    carrierName: 'Blue Cross Blue Shield of Illinois',
    year: '2025', hdhp: false, dedEmbedded: false, oopEmbedded: false,
    products: {
      surgerycare: {
        status: 'configured', billingType: 'custom', summary: 'Custom · 3 tiers',
        tierDetails: [
          { label: 'Employee Only', indiv: '$2,000', family: undefined },
          { label: 'E2D',           indiv: undefined, family: '$4,000' },
          { label: 'E3D',           indiv: undefined, family: '$4,000' },
        ],
      },
      telehealth:  { status: 'configured', billingType: 'fixed',  summary: 'Fixed · $10 per visit' },
      orthopedic:  null,
      careathome:  null,
    },
  },
];

// ── Prior year (2024) mock data ───────────────────────────────────────────────
// Keyed by plan ID. Represents what was configured in the previous plan year.
// IRS 2024 minimums: EE Only $1,500 / Family $3,000

interface PriorYearProductConfig {
  billingType: BillingType;
  tierDetails?: { label: string; indiv?: string; family?: string }[];
  summary: string;
  reportingType: 'accum' | 'claims' | 'none';
  reportingMethod?: 'manual' | 'automated';
  accumTarget?: 'ded' | 'oop' | 'both';
  contacts?: { name: string; email: string }[];
}

const PRIOR_YEAR_DATA: Record<string, Partial<Record<ProductType, PriorYearProductConfig>>> = {
  '1': {
    surgerycare: {
      billingType: 'custom', summary: 'Custom · 1 tier',
      tierDetails: [{ label: 'Employee Only', indiv: '$1,500' }],
      reportingType: 'accum', reportingMethod: 'manual', accumTarget: 'both',
      contacts: [{ name: 'Sarah Mitchell', email: 'smitchell@bcbsil.com' }],
    },
    telehealth: { billingType: 'traditional', summary: 'Traditional', reportingType: 'accum', reportingMethod: 'automated', accumTarget: 'oop' },
    orthopedic: { billingType: 'fixed', summary: 'Fixed · $175 per visit', reportingType: 'accum', reportingMethod: 'manual', accumTarget: 'both',
      contacts: [{ name: 'Sarah Mitchell', email: 'smitchell@bcbsil.com' }] },
  },
  '2': {
    surgerycare: {
      billingType: 'custom', summary: 'Custom · 2 tiers',
      tierDetails: [
        { label: 'Employee Only', indiv: '$1,500', family: '$3,000' },
        { label: 'Employee + Spouse', indiv: '$1,500', family: '$3,000' },
      ],
      reportingType: 'accum', reportingMethod: 'manual', accumTarget: 'both',
      contacts: [{ name: 'Sarah Mitchell', email: 'smitchell@bcbsil.com' }],
    },
    telehealth: { billingType: 'waived', summary: 'Waived', reportingType: 'claims' },
    orthopedic: { billingType: 'traditional', summary: 'Traditional', reportingType: 'accum', reportingMethod: 'manual', accumTarget: 'both',
      contacts: [{ name: 'Sarah Mitchell', email: 'smitchell@bcbsil.com' }] },
  },
  '3': {
    surgerycare: {
      billingType: 'custom', summary: 'Custom · 3 tiers',
      tierDetails: [
        { label: 'Employee Only', indiv: '$1,500' },
        { label: 'Employee + Child(ren)', family: '$3,000' },
        { label: 'Family', family: '$3,000' },
      ],
      reportingType: 'accum', reportingMethod: 'manual', accumTarget: 'both',
      contacts: [{ name: 'Sarah Mitchell', email: 'smitchell@bcbsil.com' }],
    },
    telehealth: { billingType: 'traditional', summary: 'Traditional', reportingType: 'accum', reportingMethod: 'automated', accumTarget: 'oop' },
    orthopedic: { billingType: 'fixed', summary: 'Fixed · $175 per visit', reportingType: 'accum', reportingMethod: 'manual', accumTarget: 'both',
      contacts: [{ name: 'Sarah Mitchell', email: 'smitchell@bcbsil.com' }] },
  },
  '4': {
    surgerycare: {
      billingType: 'irs_minimum', summary: 'IRS Minimum (2024)',
      tierDetails: [
        { label: 'Employee Only', indiv: '$1,500' },
        { label: 'Family', family: '$3,000' },
        { label: 'E1D', family: '$3,000' },
      ],
      reportingType: 'accum', reportingMethod: 'automated', accumTarget: 'both',
    },
    telehealth: { billingType: 'traditional', summary: 'Traditional', reportingType: 'accum', reportingMethod: 'automated', accumTarget: 'oop' },
    orthopedic: { billingType: 'waived', summary: 'Waived', reportingType: 'none' },
    careathome: { billingType: 'fixed', summary: 'Fixed · $240 per visit', reportingType: 'accum', reportingMethod: 'manual', accumTarget: 'both',
      contacts: [{ name: 'Tom Greer', email: 'tgreer@bcbsil.com' }] },
  },
  // Plan '5' (Allstate Select Plan 07 Florida) is a NEW plan in 2025 — no prior year data
  'b1': {
    surgerycare: { billingType: 'waived', summary: 'Waived', reportingType: 'none' },
  },
  'b2': {
    surgerycare: {
      billingType: 'irs_minimum', summary: 'IRS Minimum (2024)',
      tierDetails: [
        { label: 'Employee Only', indiv: '$1,500' },
        { label: 'Family', family: '$3,000' },
      ],
      reportingType: 'accum', reportingMethod: 'automated', accumTarget: 'both',
    },
  },
  // b3 (ACN PPO Plus) is NEW in 2025 — no prior year data
  'c1': {
    surgerycare: { billingType: 'waived', summary: 'Waived', reportingType: 'none' },
    orthopedic: { billingType: 'fixed', summary: 'Fixed · $175 per visit', reportingType: 'accum', reportingMethod: 'manual', accumTarget: 'both',
      contacts: [{ name: 'Jessica Park', email: 'jpark@cigna.com' }] },
  },
  'c2': {
    surgerycare: {
      billingType: 'irs_minimum', summary: 'IRS Minimum (2024)',
      tierDetails: [
        { label: 'Employee Only', indiv: '$1,500' },
        { label: 'Family', family: '$3,000' },
      ],
      reportingType: 'accum', reportingMethod: 'automated', accumTarget: 'both',
    },
  },
  'c3': {
    orthopedic: { billingType: 'traditional', summary: 'Traditional', reportingType: 'accum', reportingMethod: 'manual', accumTarget: 'oop',
      contacts: [{ name: 'Jessica Park', email: 'jpark@cigna.com' }] },
  },
};

const IRS_2025 = { indiv: '$1,650', family: '$3,300' };

// ── Client demo configurations ────────────────────────────────────────────────
// Simulates switching between clients with different active product sets.

const PLANS_B: Plan[] = [
  {
    id: 'b1', name: 'ACN Select PPO', planGroup: 'Accenture Core Plan',
    carrierName: 'Aetna',
    year: '2025', hdhp: false, dedEmbedded: true, oopEmbedded: true,
    products: {
      surgerycare: { status: 'configured', billingType: 'waived', summary: 'Waived · $0 cost' },
      telehealth: null, orthopedic: null, careathome: null,
    },
  },
  {
    id: 'b2', name: 'ACN HDHP HSA', planGroup: 'Accenture Core Plan',
    carrierName: 'Aetna',
    year: '2025', hdhp: true, dedEmbedded: false, oopEmbedded: true,
    products: {
      surgerycare: {
        status: 'configured', billingType: 'irs_minimum', summary: 'IRS Minimum',
        tierDetails: [
          { label: 'Employee Only', indiv: '$1,650', family: undefined },
          { label: 'Family',        indiv: undefined, family: '$3,300' },
        ],
      },
      telehealth: null, orthopedic: null, careathome: null,
    },
  },
  {
    id: 'b3', name: 'ACN PPO Plus', planGroup: 'Accenture Plus Plan',
    carrierName: 'Aetna',
    year: '2025', hdhp: false, dedEmbedded: true, oopEmbedded: true,
    products: {
      surgerycare: null,
      telehealth: null, orthopedic: null, careathome: null,
    },
  },
];

const PLANS_C: Plan[] = [
  {
    id: 'c1', name: 'AMZ Select PPO', planGroup: 'Amazon Medical Plan',
    carrierName: 'Cigna',
    year: '2025', hdhp: false, dedEmbedded: true, oopEmbedded: true,
    products: {
      surgerycare: { status: 'configured', billingType: 'waived', summary: 'Waived · $0 cost' },
      telehealth: null,
      orthopedic: { status: 'configured', billingType: 'fixed', summary: 'Fixed · $195 per visit' },
      careathome: null,
    },
  },
  {
    id: 'c2', name: 'AMZ HDHP HSA', planGroup: 'Amazon Medical Plan',
    carrierName: 'Cigna',
    year: '2025', hdhp: true, dedEmbedded: false, oopEmbedded: true,
    products: {
      surgerycare: {
        status: 'configured', billingType: 'irs_minimum', summary: 'IRS Minimum',
        tierDetails: [
          { label: 'Employee Only', indiv: '$1,650', family: undefined },
          { label: 'Family',        indiv: undefined, family: '$3,300' },
        ],
      },
      telehealth: null,
      orthopedic: null,
      careathome: null,
    },
  },
  {
    id: 'c3', name: 'AMZ Select PPO Flex', planGroup: 'Amazon Flex Plan',
    carrierName: 'Cigna',
    year: '2025', hdhp: false, dedEmbedded: false, oopEmbedded: true,
    products: {
      surgerycare: null,
      telehealth: null,
      orthopedic: { status: 'configured', billingType: 'traditional', summary: 'Traditional' },
      careathome: null,
    },
  },
];

type ClientKey = 'A' | 'B' | 'C';
const CLIENT_CONFIGS: Record<ClientKey, { name: string; desc: string; plans: Plan[] }> = {
  A: { name: 'Allstate', desc: 'All products', plans: PLANS },
  B: { name: 'Accenture', desc: 'Surgery only', plans: PLANS_B },
  C: { name: 'Amazon', desc: 'Surgery + Ortho', plans: PLANS_C },
};

// Carriers that have automated accumulator clearinghouse support today
const AUTOMATED_CARRIERS = [
  'Blue Cross Blue Shield of Illinois',
  'Aetna',
  'UnitedHealthcare',
  'Cigna',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  custom: 'Custom', fixed: 'Fixed', waived: 'Waived',
  irs_minimum: 'IRS Minimum', insurance: 'Insurance', traditional: 'Traditional',
};

function planStructureLabel(plan: Plan): string {
  if (plan.dedEmbedded && plan.oopEmbedded) return 'Embedded';
  if (!plan.dedEmbedded && plan.oopEmbedded) return 'Split';
  return 'Aggregate';
}

function derivePlanType(plan: Plan): PlanType {
  return plan.hdhp ? 'HDHP' : 'PPO';
}

function productCellStatus(product: PlanProduct | null): 'missing' | 'waived' | 'configured' {
  if (!product) return 'missing';
  if (product.billingType === 'waived') return 'waived';
  return 'configured';
}

// Derive which product columns are active for this client's plan set.
// Only columns where at least one plan has a non-null product entry are shown.
function getActiveProducts(plans: Plan[]) {
  return PRODUCTS.filter(p => plans.some(plan => plan.products[p.key] !== null));
}

function rowStatus(plan: Plan, activeProd: typeof PRODUCTS): 'complete' | 'partial' | 'empty' {
  const statuses = activeProd.map(p => productCellStatus(plan.products[p.key]));
  const configured = statuses.filter(s => s !== 'missing').length;
  if (configured === 0) return 'empty';
  if (configured === statuses.length) return 'complete';
  return 'partial';
}

// ── Tier row state ────────────────────────────────────────────────────────────

interface TierRowState {
  enabled: boolean;
  dedIndiv: string;
  dedFamily: string;
  coinsurance: string;
}

function defaultRows(): Record<string, TierRowState> {
  return Object.fromEntries(
    ELIGIBILITY_TIERS.map(t => [
      t.key,
      { enabled: ['ee', 'ee_sp', 'ee_ch', 'family'].includes(t.key), dedIndiv: '', dedFamily: '', coinsurance: '' },
    ])
  );
}

// ── V1 ProductCell ────────────────────────────────────────────────────────────

function ProductCell({ product, onClick }: { product: PlanProduct | null; onClick: () => void }) {
  if (!product) {
    return <button className={styles.addLink} onClick={onClick}>Add Cost Share</button>;
  }
  return (
    <div className={styles.productCell}>
      <div className={styles.productCellLabel}>
        Cost Share <button className={styles.viewLink} onClick={onClick}>View</button>
      </div>
      <div className={styles.productCellBilling}>{BILLING_TYPE_LABELS[product.billingType]}</div>
      {product.tierDetails && product.tierDetails.length > 0 ? (
        <div className={styles.tierDetailList}>
          {product.tierDetails.map(t => (
            <div key={t.label} className={styles.tierDetailRow}>
              <span className={styles.tierDetailBadge}>{t.label}</span>
              <span className={styles.tierDetailValues}>
                {t.indiv  ? <span>{t.indiv} <span className={styles.tierDetailDim}>(indiv)</span></span> : null}
                {t.indiv && t.family ? <span className={styles.tierDetailSep}>/</span> : null}
                {t.family ? <span>{t.family} <span className={styles.tierDetailDim}>(fam)</span></span> : null}
              </span>
            </div>
          ))}
        </div>
      ) : (
        product.summary && <div className={styles.productCellSummary}>{product.summary}</div>
      )}
      <div className={styles.productCellLabel} style={{ marginTop: 6 }}>
        Cost Reporting <button className={styles.viewLink}>View</button>
      </div>
      <div className={styles.productCellSummary}>Reporting Accumulators</div>
    </div>
  );
}

// ── V1 Side panel ─────────────────────────────────────────────────────────────

interface PanelProps {
  plan: Plan;
  product: ProductType;
  onClose: () => void;
}

function CostSharePanel({ plan, product, onClose }: PanelProps) {
  const existing = plan.products[product];
  const [billingType, setBillingType] = useState<BillingType>(existing?.billingType ?? 'custom');
  const [fixedAmount, setFixedAmount] = useState('');
  const [rows, setRows] = useState<Record<string, TierRowState>>(defaultRows);
  const [applyToAll, setApplyToAll] = useState(false);

  const productLabel = PRODUCTS.find(p => p.key === product)?.label ?? product;
  const applyLabel = plan.hdhp ? 'Apply to all HDHP plans' : 'Apply to all PPO plans';
  const structureLabel = planStructureLabel(plan);

  function updateRow(key: string, field: keyof TierRowState, value: string | boolean) {
    setRows(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  function isIndivNA(tier: typeof ELIGIBILITY_TIERS[number]): boolean {
    return !plan.dedEmbedded && !tier.singleMember;
  }
  function isFamilyNA(tier: typeof ELIGIBILITY_TIERS[number]): boolean {
    return !plan.dedEmbedded && tier.singleMember;
  }

  const indivTooltip = plan.dedEmbedded
    ? 'Per-person deductible. Both individual and family thresholds are active on embedded plans.'
    : 'Applies to Employee Only tier only. Multi-member tiers use the family deductible on this aggregate plan.';

  const familyTooltip = plan.dedEmbedded
    ? 'Family aggregate cap. On embedded plans both thresholds are active simultaneously.'
    : 'Single family-level deductible all members contribute toward.';

  return (
    <>
      <div className={styles.panelBackdrop} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelHeaderLabel}>Cost share for</div>
            <div className={styles.panelHeaderTitle}>{plan.name}</div>
            <div className={styles.panelHeaderSub}>{plan.planGroup}</div>
          </div>
          <button className={styles.panelClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.panelBody}>
          <div className={styles.planStructureRow}>
            <div className={styles.planStructureTop}>
              <span className={styles.planStructureHeading}>Plan structure</span>
              <span className={styles.planStructureNote}>Configured on the health plan · read-only here</span>
            </div>
            <div className={styles.planStructurePills}>
              <span className={`${styles.structurePill} ${plan.dedEmbedded ? styles.pillEmbedded : styles.pillNonEmbedded}`}>
                DED: {plan.dedEmbedded ? 'Embedded' : 'Non-embedded'}
              </span>
              <span className={`${styles.structurePill} ${plan.oopEmbedded ? styles.pillEmbedded : styles.pillNonEmbedded}`}>
                OOP: {plan.oopEmbedded ? 'Embedded' : 'Non-embedded'}
              </span>
              <span className={`${styles.structurePill} ${styles.pillType}`}>{structureLabel}</span>
            </div>
          </div>

          <div className={styles.panelSection}>
            <div className={styles.panelSectionTitle}>
              <span className={styles.panelSectionIcon}>🏥</span>
              {productLabel}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Select billing type</label>
              <select
                className={styles.fieldSelect}
                value={billingType}
                onChange={e => setBillingType(e.target.value as BillingType)}
              >
                <option value="custom">Custom</option>
                <option value="fixed">Fixed</option>
                <option value="waived">Waived</option>
                <option value="irs_minimum">IRS Minimum</option>
              </select>
            </div>

            {billingType === 'custom' && (
              <>
                <div className={styles.eligInfoBanner}>
                  Standard is to collect the deductible only and waive coinsurance. Enter coinsurance only when the plan requires it.
                </div>
                <div className={styles.eligTable}>
                  <div className={styles.eligTableHeader}>
                    <div className={styles.eligColToggle} />
                    <div className={styles.eligColTier}>Eligibility tier</div>
                    <div className={styles.eligColField}>Individual ded.<span className={styles.colTooltip} title={indivTooltip}>ⓘ</span></div>
                    <div className={styles.eligColField}>Family ded.<span className={styles.colTooltip} title={familyTooltip}>ⓘ</span></div>
                    <div className={styles.eligColField}>Coinsurance %</div>
                  </div>
                  {ELIGIBILITY_TIERS.map(tier => {
                    const row = rows[tier.key];
                    const rowDisabled = !row.enabled;
                    const indivNA = isIndivNA(tier);
                    const familyNA = isFamilyNA(tier);
                    return (
                      <div key={tier.key} className={`${styles.eligTableRow} ${rowDisabled ? styles.eligRowDisabled : ''}`}>
                        <div className={styles.eligColToggle}>
                          <label className={styles.toggle}>
                            <input type="checkbox" checked={row.enabled} onChange={e => updateRow(tier.key, 'enabled', e.target.checked)} />
                            <span className={styles.toggleTrack} />
                          </label>
                        </div>
                        <div className={styles.eligColTier}>
                          <span className={`${styles.tierBadge} ${rowDisabled ? styles.tierBadgeOff : ''}`}>{tier.label}</span>
                        </div>
                        <div className={styles.eligColField}>
                          {indivNA ? <span className={styles.naLabel}>N/A</span> : (
                            <input className={styles.eligInput} type="text" placeholder={rowDisabled ? '—' : 'e.g. 1,500'} disabled={rowDisabled} value={row.dedIndiv} onChange={e => updateRow(tier.key, 'dedIndiv', e.target.value)} />
                          )}
                        </div>
                        <div className={styles.eligColField}>
                          {familyNA ? <span className={styles.naLabel}>N/A</span> : (
                            <input className={styles.eligInput} type="text" placeholder={rowDisabled ? '—' : 'e.g. 3,000'} disabled={rowDisabled} value={row.dedFamily} onChange={e => updateRow(tier.key, 'dedFamily', e.target.value)} />
                          )}
                        </div>
                        <div className={styles.eligColField}>
                          <input className={`${styles.eligInput} ${styles.eligInputCenter}`} type="text" placeholder="0%" disabled={rowDisabled} value={row.coinsurance} onChange={e => updateRow(tier.key, 'coinsurance', e.target.value)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <label className={styles.checkRow}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.checkLabel}>Uses deductible status for cost share</span>
                </label>
              </>
            )}

            {billingType === 'fixed' && (
              <div className={styles.fieldGroup} style={{ marginTop: 12 }}>
                <label className={styles.fieldLabel}>Fixed amount ($)</label>
                <input className={styles.fieldInput} type="text" placeholder="e.g. 10" value={fixedAmount} onChange={e => setFixedAmount(e.target.value)} />
              </div>
            )}

            {billingType === 'waived' && (
              <div className={styles.eligInfoBanner} style={{ marginTop: 12 }}>
                Member cost share is waived. No additional fields required.
              </div>
            )}

            {billingType === 'irs_minimum' && (
              <>
                <div className={styles.eligInfoBanner} style={{ marginTop: 12 }}>
                  IRS Minimum applies the statutory minimum cost share for HDHP-qualified plans.
                </div>
                <div className={styles.fieldGroup} style={{ marginTop: 8 }}>
                  <label className={styles.fieldLabel}>Deductible (Individual)</label>
                  <input className={styles.fieldInput} type="text" placeholder="e.g. 1,650" />
                </div>
                <div className={styles.fieldGroup} style={{ marginTop: 8 }}>
                  <label className={styles.fieldLabel}>Deductible (Family)</label>
                  <input className={styles.fieldInput} type="text" placeholder="e.g. 3,300" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.panelFooter}>
          <label className={styles.applyAllRow}>
            <input type="checkbox" checked={applyToAll} onChange={e => setApplyToAll(e.target.checked)} />
            <span className={styles.applyAllLabel}>{applyLabel}</span>
          </label>
          <div className={styles.footerActions}>
            <Button appearance="secondary" size="small" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" size="small">Save</Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── V2 ProductCell ────────────────────────────────────────────────────────────

function V2ProductCell({ product, onClick, isTelehealth = false }: { product: PlanProduct | null; onClick: () => void; isTelehealth?: boolean }) {
  const cellStatus = productCellStatus(product);

  const statusLabel = cellStatus === 'missing' ? 'Not Configured' : cellStatus === 'waived' ? 'Waived' : 'Configured';
  const statusCls = cellStatus === 'missing' ? styles.v2ChipMissing : cellStatus === 'waived' ? styles.v2ChipWaived : styles.v2ChipConfigured;

  return (
    <div className={styles.v2Cell}>
      <div className={styles.v2CellTop}>
        <span className={`${styles.v2StatusChip} ${statusCls}`}>{statusLabel}</span>
        <button className={styles.viewLink} onClick={onClick}>
          {cellStatus === 'missing' ? 'Configure' : 'Edit'}
        </button>
      </div>

      {product && product.billingType !== 'waived' && (
        <div className={styles.v2BillingLabel}>{BILLING_TYPE_LABELS[product.billingType]}</div>
      )}

      {product?.tierDetails && product.tierDetails.length > 0 ? (
        <div className={styles.tierDetailList}>
          {product.tierDetails.map(t => (
            <div key={t.label} className={styles.tierDetailRow}>
              <span className={styles.tierDetailBadge}>{t.label}</span>
              <span className={styles.tierDetailValues}>
                {t.indiv  ? <span>{t.indiv} <span className={styles.tierDetailDim}>(indiv)</span></span> : null}
                {t.indiv && t.family ? <span className={styles.tierDetailSep}>/</span> : null}
                {t.family ? <span>{t.family} <span className={styles.tierDetailDim}>(fam)</span></span> : null}
              </span>
            </div>
          ))}
        </div>
      ) : (
        product?.summary && product.billingType !== 'waived' && (
          <div className={styles.productCellSummary}>{product.summary}</div>
        )
      )}

      {product && (product.billingType !== 'waived' || isTelehealth) && (
        <div className={styles.v2ReportingRow}>
          <span className={styles.v2ReportingLabel}>Reporting</span>
          <span className={styles.v2ReportingValue}>
            {product.billingType === 'waived' && isTelehealth ? '837 Claims' : 'Accumulators'}
          </span>
          <button className={styles.viewLink} onClick={e => e.stopPropagation()}>View</button>
        </div>
      )}
    </div>
  );
}

// ── V2 Panel — billing type body sub-components ───────────────────────────────

function WaivedBody({ isReviewed, setIsReviewed }: { isReviewed: boolean; setIsReviewed: (v: boolean) => void }) {
  return (
    <div className={styles.v2BillingBody}>
      <div className={styles.v2WaivedBanner}>
        Member cost share is fully waived. No deductible or coinsurance will be collected for this product.
      </div>
      <label className={styles.checkRow} style={{ marginTop: 14 }}>
        <input type="checkbox" checked={isReviewed} onChange={e => setIsReviewed(e.target.checked)} />
        <span className={styles.checkLabel}>Mark as reviewed — waived is intentional for this plan</span>
      </label>
    </div>
  );
}

function IrsMinimumBody({ isHDHP }: { isHDHP: boolean }) {
  const [coinsurance, setCoinsurance] = useState('0');
  return (
    <div className={styles.v2BillingBody}>
      {!isHDHP && (
        <div className={styles.v2HdhpWarning}>
          IRS Minimum is designed for HDHP-qualified plans. This plan is not flagged as HDHP — confirm this is intentional.
        </div>
      )}
      <div className={styles.v2InfoBanner}>
        Deductible values are sourced from the IRS 2025 HDHP minimums and are read-only.
      </div>
      <div className={styles.v2ReadOnlyGroup}>
        <div className={styles.v2ReadOnlyField}>
          <span className={styles.v2ReadOnlyLabel}>Deductible (Individual)</span>
          <div className={styles.v2ReadOnlyValue}>
            $1,650
            <span className={styles.v2SourceBadge}>IRS 2025</span>
          </div>
        </div>
        <div className={styles.v2ReadOnlyField}>
          <span className={styles.v2ReadOnlyLabel}>Deductible (Family)</span>
          <div className={styles.v2ReadOnlyValue}>
            $3,300
            <span className={styles.v2SourceBadge}>IRS 2025</span>
          </div>
        </div>
      </div>
      <div className={styles.fieldGroup} style={{ marginTop: 16 }}>
        <label className={styles.fieldLabel}>Coinsurance after deductible (%)</label>
        <input className={styles.fieldInput} type="text" value={coinsurance} onChange={e => setCoinsurance(e.target.value)} style={{ maxWidth: 120 }} />
        {coinsurance !== '0' && coinsurance !== '' && (
          <div className={styles.v2Advisory}>
            Recommended: 0% coinsurance so all fees are waived once the deductible is met.
          </div>
        )}
      </div>
      <div className={styles.v2ChecksRow}>
        <label className={styles.checkRow}><input type="checkbox" defaultChecked /><span className={styles.checkLabel}>Counts toward deductible</span></label>
        <label className={styles.checkRow}><input type="checkbox" defaultChecked /><span className={styles.checkLabel}>Counts toward OOP max</span></label>
      </div>
    </div>
  );
}

function InsuranceBody() {
  return (
    <div className={styles.v2BillingBody}>
      <div className={styles.v2InfoBanner}>
        All values are sourced from the member's carrier plan and are read-only. Cost share mirrors the member's actual insurance benefits.
      </div>
      <div className={styles.v2ReadOnlyGroup}>
        {[
          { label: 'Deductible (Individual)', value: '$1,500' },
          { label: 'Deductible (Family)', value: '$3,000' },
          { label: 'Coinsurance after deductible', value: '20%' },
        ].map(f => (
          <div key={f.label} className={styles.v2ReadOnlyField}>
            <span className={styles.v2ReadOnlyLabel}>{f.label}</span>
            <div className={styles.v2ReadOnlyValue}>
              {f.value}
              <span className={styles.v2SourceBadge}>From carrier</span>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.v2ChecksRow}>
        <label className={styles.checkRow}><input type="checkbox" defaultChecked /><span className={styles.checkLabel}>Counts toward deductible</span></label>
        <label className={styles.checkRow}><input type="checkbox" defaultChecked /><span className={styles.checkLabel}>Counts toward OOP max</span></label>
      </div>
      <button className={styles.v2RefreshBtn}>↻ Refresh from carrier plan</button>
    </div>
  );
}

function FixedBody() {
  const [amount, setAmount] = useState('');
  const [countsOop, setCountsOop] = useState(true);
  return (
    <div className={styles.v2BillingBody}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Fixed amount per visit ($)</label>
        <input className={styles.fieldInput} type="text" placeholder="e.g. 195" value={amount} onChange={e => setAmount(e.target.value)} style={{ maxWidth: 160 }} />
      </div>
      <div style={{ marginTop: 16 }}>
        <label className={styles.checkRow}>
          <input type="checkbox" checked={countsOop} onChange={e => setCountsOop(e.target.checked)} />
          <span className={styles.checkLabel}>Counts toward OOP max</span>
        </label>
        {!countsOop && (
          <div className={styles.v2Advisory} style={{ marginTop: 6 }}>
            When unchecked, accumulator status is not checked or updated. The member pays the fixed fee regardless of deductible/OOP max.
          </div>
        )}
      </div>
    </div>
  );
}

function TraditionalBody() {
  const [preDed, setPreDed] = useState('');
  const [postDed, setPostDed] = useState('0');
  return (
    <div className={styles.v2BillingBody}>
      <div className={styles.v2InfoBanner}>
        Traditional follows regular insurance plan design with pre- and post-deductible costs, but values are set by the client.
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Cost before deductible ($)</label>
        <input className={styles.fieldInput} type="text" placeholder="e.g. 8" value={preDed} onChange={e => setPreDed(e.target.value)} style={{ maxWidth: 160 }} />
      </div>
      <div className={styles.fieldGroup} style={{ marginTop: 12 }}>
        <label className={styles.fieldLabel}>Cost after deductible (% of pre-deductible cost)</label>
        <input className={styles.fieldInput} type="text" placeholder="0" value={postDed} onChange={e => setPostDed(e.target.value)} style={{ maxWidth: 120 }} />
      </div>
      <div className={styles.v2ChecksRow} style={{ marginTop: 16 }}>
        <label className={styles.checkRow}><input type="checkbox" defaultChecked /><span className={styles.checkLabel}>Counts toward deductible</span></label>
        <label className={styles.checkRow}><input type="checkbox" defaultChecked /><span className={styles.checkLabel}>Counts toward OOP max</span></label>
      </div>
    </div>
  );
}

// ── Reporting section component ───────────────────────────────────────────────

const CLAIMS_CARRIERS = [
  { label: 'Aetna',                              payerId: '60054' },
  { label: 'Blue Cross Blue Shield of Illinois', payerId: '14163' },
  { label: 'Cigna',                              payerId: '62308' },
  { label: 'UnitedHealthcare',                   payerId: '87726' },
];

interface ReportingSectionProps {
  product: ProductType;
  carrierName: string;
  isWaived?: boolean;
}

function ReportingSection({ product, carrierName, isWaived = false }: ReportingSectionProps) {
  const isTelehealth = product === 'telehealth';

  // Single top-level choice: accumulators OR 837 claims (mutually exclusive)
  // Waived + non-telehealth → locked to 'none'. Waived + telehealth → claims or none only.
  type ReportingType = 'accum' | 'claims' | 'none';
  const lockedToNone = isWaived && !isTelehealth;
  const defaultType: ReportingType = lockedToNone ? 'none' : isWaived ? 'claims' : 'accum';
  const [reportingType, setReportingType] = useState<ReportingType>(defaultType);

  // Accumulator state
  const [accumTarget, setAccumTarget] = useState<'ded' | 'oop' | 'both'>('both');
  const [accumCarrierAction, setAccumCarrierAction] = useState<'ded_only' | 'oop_only' | 'both'>('oop_only');
  const [method, setMethod] = useState<'manual' | 'automated'>('manual');
  const [contacts, setContacts] = useState([{ name: '', email: '' }]);

  // 837 Claims state
  const [claimsMode, setClaimsMode] = useState<'all' | 'no_zero'>('all');
  const [claimsCarrier, setClaimsCarrier] = useState('');

  const isAutomatedSupported = AUTOMATED_CARRIERS.includes(carrierName);

  function addContact() { setContacts(prev => [...prev, { name: '', email: '' }]); }
  function updateContact(i: number, field: 'name' | 'email', val: string) {
    setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  }
  function removeContact(i: number) {
    setContacts(prev => prev.filter((_, idx) => idx !== i));
  }

  // Options depend on product: telehealth gets both choices; others only accumulators
  const typeOptions: { value: ReportingType; label: string }[] = isTelehealth
    ? (isWaived
        ? [{ value: 'claims', label: '837 Claims file' }, { value: 'none', label: 'No reporting' }]
        : [
            { value: 'accum',  label: 'Accumulator file' },
            { value: 'claims', label: '837 Claims file' },
            { value: 'none',   label: 'No reporting' },
          ])
    : [
        { value: 'accum', label: 'Accumulator file' },
        { value: 'none',  label: 'No reporting' },
      ];

  return (
    <div className={styles.v2ReportingPanel}>

      {/* Waived + non-telehealth: locked to no reporting */}
      {lockedToNone && (
        <div className={styles.v2WaivedLockBanner}>
          Cost share is waived — reporting is automatically set to <strong>No reporting</strong> and cannot be changed. Only Telehealth plans may still configure 837 Claims file reporting when waived.
        </div>
      )}

      {/* Waived telehealth: accumulator not available */}
      {isWaived && isTelehealth && (
        <div className={styles.v2InfoBanner} style={{ marginBottom: 12 }}>
          Cost share is waived — accumulator reporting is not applicable. 837 Claims file reporting is still available for this Telehealth plan.
        </div>
      )}

      {/* ── Reporting type picker (either/or) — hidden when locked ───────────── */}
      {!lockedToNone && (
        <div className={styles.fieldGroup} style={{ marginBottom: 14 }}>
          <label className={styles.fieldLabel}>Reporting type</label>
          <div className={styles.v2SegmentedControl}>
            {typeOptions.map(opt => (
              <button
                key={opt.value}
                className={`${styles.v2Segment} ${reportingType === opt.value ? styles.v2SegmentActive : ''}`}
                onClick={() => setReportingType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Accumulator path ──────────────────────────────────────────────────── */}
      {reportingType === 'accum' && (
        <>
          <div className={styles.fieldGroup} style={{ marginBottom: 10 }}>
            <label className={styles.fieldLabel}>Send to accumulator</label>
            <div className={styles.v2SegmentedControl}>
              {([
                { value: 'ded',  label: 'DED only' },
                { value: 'oop',  label: 'OOP only' },
                { value: 'both', label: 'Both DED + OOP' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  className={`${styles.v2Segment} ${accumTarget === opt.value ? styles.v2SegmentActive : ''}`}
                  onClick={() => setAccumTarget(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup} style={{ marginBottom: 14 }}>
            <label className={styles.fieldLabel}>Reporting method</label>
            <div className={styles.v2SegmentedControl}>
              {([
                { value: 'manual',    label: 'Manual' },
                { value: 'automated', label: 'Automated' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  className={`${styles.v2Segment} ${method === opt.value ? styles.v2SegmentActive : ''}`}
                  onClick={() => setMethod(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {method === 'automated' && (
            <div className={styles.v2ReportingMethodBody}>
              {isAutomatedSupported ? (
                <div className={styles.v2CarrierConfirmed}>
                  <span className={styles.v2CarrierConfirmedIcon}>✓</span>
                  <div>
                    <div className={styles.v2CarrierConfirmedName}>{carrierName}</div>
                    <div className={styles.v2CarrierConfirmedSub}>Automated accumulator feed confirmed — clearinghouse connection active</div>
                  </div>
                </div>
              ) : (
                <div className={styles.v2HdhpWarning}>
                  <strong>{carrierName}</strong> is not in the clearinghouse network. Switch to Manual or contact the Billing &amp; Payments team.
                </div>
              )}
              <div className={styles.v2SupportedCarrierList}>
                <span className={styles.v2SupportedCarrierLabel}>Currently supported carriers</span>
                {AUTOMATED_CARRIERS.map(c => (
                  <span key={c} className={`${styles.v2SupportedCarrierItem} ${c === carrierName ? styles.v2SupportedCarrierMatch : ''}`}>
                    {c === carrierName ? '✓ ' : ''}{c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {method === 'manual' && <ContactCards contacts={contacts} onAdd={addContact} onUpdate={updateContact} onRemove={removeContact} />}
        </>
      )}

      {/* ── 837 Claims path ───────────────────────────────────────────────────── */}
      {reportingType === 'claims' && (
        <>
          <div className={styles.fieldGroup} style={{ marginBottom: 10 }}>
            <label className={styles.fieldLabel}>Report claims back to Carrier?</label>
            <select
              className={styles.fieldSelect}
              value={claimsMode}
              onChange={e => setClaimsMode(e.target.value as typeof claimsMode)}
            >
              <option value="all">Report all claims to Carrier</option>
              <option value="no_zero">Report all claims — exclude $0 claims</option>
            </select>
          </div>

          <div className={styles.fieldGroup} style={{ marginBottom: 14 }}>
            <label className={styles.fieldLabel}>
              Claims Reporting Carrier
              <span className={styles.v2InfoIcon} title="The carrier payer ID used to route 837 claim files">ⓘ</span>
            </label>
            <select
              className={styles.fieldSelect}
              value={claimsCarrier}
              onChange={e => setClaimsCarrier(e.target.value)}
            >
              <option value="">-- Select carrier</option>
              {CLAIMS_CARRIERS.map(c => (
                <option key={c.payerId} value={c.payerId}>{c.label} — {c.payerId}</option>
              ))}
            </select>
          </div>

        </>
      )}

      {reportingType === 'none' && (
        <div className={styles.v2Advisory}>
          No reporting will be sent for this product. This can be updated at any time.
        </div>
      )}
    </div>
  );
}

function ContactCards({ contacts, onAdd, onUpdate, onRemove }: {
  contacts: { name: string; email: string }[];
  onAdd: () => void;
  onUpdate: (i: number, field: 'name' | 'email', val: string) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className={styles.v2ReportingMethodBody}>

      <div className={styles.v2ContactList}>
        {contacts.map((contact, i) => (
          <div key={i} className={styles.v2ContactCard}>
            <div className={styles.v2ContactCardHeader}>
              <span className={styles.v2ContactCardLabel}>
                {i === 0 ? 'Primary contact' : `Additional contact ${i}`}
              </span>
              {contacts.length > 1 && (
                <button className={styles.v2EmailRemove} onClick={() => onRemove(i)}>Remove</button>
              )}
            </div>
            <div className={styles.fieldGroup} style={{ marginBottom: 8 }}>
              <label className={styles.fieldLabel}>Name</label>
              <input className={styles.fieldInput} type="text" placeholder="e.g. Jane Smith"
                value={contact.name} onChange={e => onUpdate(i, 'name', e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Email</label>
              <input className={styles.fieldInput} type="email" placeholder="email@carrier.com"
                value={contact.email} onChange={e => onUpdate(i, 'email', e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <button className={styles.v2AddEmailBtn} onClick={onAdd}>+ Add recipient</button>
    </div>
  );
}

function CustomBody({ plan }: { plan: Plan }) {
  const [rows, setRows] = useState<Record<string, TierRowState>>(defaultRows);

  function updateRow(key: string, field: keyof TierRowState, value: string | boolean) {
    setRows(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }
  function isIndivNA(tier: typeof ELIGIBILITY_TIERS[number]) { return !plan.dedEmbedded && !tier.singleMember; }
  function isFamilyNA(tier: typeof ELIGIBILITY_TIERS[number]) { return !plan.dedEmbedded && tier.singleMember; }

  const enabledRows = ELIGIBILITY_TIERS.filter(t => rows[t.key].enabled);
  const filledRows = enabledRows.filter(t => {
    const r = rows[t.key];
    return r.dedIndiv !== '' || r.dedFamily !== '';
  });

  return (
    <div className={styles.v2BillingBody}>
      <div className={styles.v2InfoBanner}>
        Standard is to collect the deductible only and set coinsurance to 0% after deductible is met.
      </div>
      <div className={styles.eligTable}>
        <div className={styles.eligTableHeader}>
          <div className={styles.eligColToggle} />
          <div className={styles.eligColTier}>Eligibility tier</div>
          <div className={styles.eligColField}>Individual ded.</div>
          <div className={styles.eligColField}>Family ded.</div>
          <div className={styles.eligColField}>Coinsurance %</div>
        </div>
        {ELIGIBILITY_TIERS.map(tier => {
          const row = rows[tier.key];
          const rowDisabled = !row.enabled;
          const indivNA = isIndivNA(tier);
          const familyNA = isFamilyNA(tier);
          return (
            <div key={tier.key} className={`${styles.eligTableRow} ${rowDisabled ? styles.eligRowDisabled : ''}`}>
              <div className={styles.eligColToggle}>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={row.enabled} onChange={e => updateRow(tier.key, 'enabled', e.target.checked)} />
                  <span className={styles.toggleTrack} />
                </label>
              </div>
              <div className={styles.eligColTier}>
                <span className={`${styles.tierBadge} ${rowDisabled ? styles.tierBadgeOff : ''}`}>{tier.label}</span>
              </div>
              <div className={styles.eligColField}>
                {indivNA ? <span className={styles.naLabel}>N/A</span> : (
                  <input className={styles.eligInput} type="text" placeholder={rowDisabled ? '—' : 'e.g. 1,500'} disabled={rowDisabled} value={row.dedIndiv} onChange={e => updateRow(tier.key, 'dedIndiv', e.target.value)} />
                )}
              </div>
              <div className={styles.eligColField}>
                {familyNA ? <span className={styles.naLabel}>N/A</span> : (
                  <input className={styles.eligInput} type="text" placeholder={rowDisabled ? '—' : 'e.g. 3,000'} disabled={rowDisabled} value={row.dedFamily} onChange={e => updateRow(tier.key, 'dedFamily', e.target.value)} />
                )}
              </div>
              <div className={styles.eligColField}>
                <input
                  className={`${styles.eligInput} ${styles.eligInputCenter}`}
                  type="text" placeholder="0%" disabled={rowDisabled}
                  value={row.coinsurance}
                  onChange={e => {
                    updateRow(tier.key, 'coinsurance', e.target.value);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <label className={styles.checkRow}>
        <input type="checkbox" defaultChecked />
        <span className={styles.checkLabel}>Uses deductible status for cost share</span>
      </label>

      {/* Tier completion indicator */}
      <div className={styles.v2TierCompletion}>
        <span className={styles.v2TierCompletionLabel}>
          {filledRows.length} of {enabledRows.length} active tiers configured
        </span>
        <div className={styles.v2TierProgressBar}>
          <div
            className={styles.v2TierProgressFill}
            style={{ width: enabledRows.length > 0 ? `${(filledRows.length / enabledRows.length) * 100}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}

// ── V2 Side panel ─────────────────────────────────────────────────────────────

interface V2PanelProps {
  plan: Plan;
  product: ProductType;
  onClose: () => void;
  onBulk: () => void;
}

function V2CostSharePanel({ plan, product, onClose, onBulk }: V2PanelProps) {
  const existing = plan.products[product];
  const isSurgery = PRODUCTS.find(p => p.key === product)?.surgery ?? false;
  const billingOptions = isSurgery
    ? SURGERY_BILLING_OPTIONS.filter(o => {
        if (plan.hdhp && o.value === 'waived') return false;      // HDHP cannot waive surgery
        if (!plan.hdhp && o.value === 'irs_minimum') return false; // PPO cannot use IRS minimum
        return true;
      })
    : OTHER_BILLING_OPTIONS;
  const defaultBilling = existing?.billingType ?? (isSurgery ? 'custom' : 'traditional');
  const [billingType, setBillingType] = useState<BillingType>(defaultBilling as BillingType);
  const [isReviewed, setIsReviewed] = useState(false);

  const productLabel = PRODUCTS.find(p => p.key === product)?.label ?? product;
  const structureLabel = planStructureLabel(plan);
  const planType = derivePlanType(plan);

  return (
    <>
      <div className={styles.panelBackdrop} onClick={onClose} />
      <div className={styles.panel}>

        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.v2PanelHeaderContent}>
            <div className={styles.panelHeaderLabel}>Configuring cost share</div>
            <div className={styles.v2PanelTitleRow}>
              <div className={styles.panelHeaderTitle}>{plan.name}</div>
              <span className={`${styles.v2PlanTypePill} ${planType === 'HDHP' ? styles.v2PillHDHP : styles.v2PillPPO}`}>
                {planType}
              </span>
            </div>
            <div className={styles.panelHeaderSub}>{plan.planGroup}</div>
            <div className={styles.v2CarrierName}>
              <span className={styles.v2CarrierNameLabel}>Carrier</span>
              {plan.carrierName}
            </div>
            <div className={styles.planStructurePills} style={{ marginTop: 8 }}>
              <span className={`${styles.structurePill} ${plan.dedEmbedded ? styles.pillEmbedded : styles.pillNonEmbedded}`}>
                DED: {plan.dedEmbedded ? 'Embedded' : 'Non-embedded'}
              </span>
              <span className={`${styles.structurePill} ${plan.oopEmbedded ? styles.pillEmbedded : styles.pillNonEmbedded}`}>
                OOP: {plan.oopEmbedded ? 'Embedded' : 'Non-embedded'}
              </span>
              <span className={`${styles.structurePill} ${styles.pillType}`}>{structureLabel}</span>
              <span className={styles.structurePill} style={{ background: '#f0f0f0', color: '#777', border: '1px solid #ddd', fontSize: 10, fontStyle: 'italic' }}>
                from health plan · read-only
              </span>
            </div>
          </div>
          <button className={styles.panelClose} onClick={onClose}>✕</button>
        </div>

        {/* Product label + billing type segmented control */}
        <div className={styles.v2PanelProductBar}>
          <div className={styles.v2PanelProductLabel}>
            <span className={styles.panelSectionIcon}>🏥</span>
            {productLabel}
          </div>
          <div className={styles.v2SegmentedControl}>
            {billingOptions.map(opt => (
              <button
                key={opt.value}
                className={`${styles.v2Segment} ${billingType === opt.value ? styles.v2SegmentActive : ''}`}
                onClick={() => setBillingType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel body */}
        <div className={styles.panelBody}>
          {billingType === 'waived'      && <WaivedBody isReviewed={isReviewed} setIsReviewed={setIsReviewed} />}
          {billingType === 'irs_minimum' && <IrsMinimumBody isHDHP={plan.hdhp} />}
          {billingType === 'insurance'   && <InsuranceBody />}
          {billingType === 'custom'      && <CustomBody plan={plan} />}
          {billingType === 'fixed'       && <FixedBody />}
          {billingType === 'traditional' && <TraditionalBody />}

          {/* Reporting section — shown for configured plans, and for waived telehealth (837 only) */}
          {(billingType !== 'waived' || product === 'telehealth') && (
            <>
              <div className={styles.v2ReportingDivider}>
                <span className={styles.v2ReportingDividerLabel}>
                  {billingType === 'waived' && product === 'telehealth' ? '837 Claims Reporting' : 'Accumulator Reporting'}
                </span>
              </div>
              <ReportingSection product={product} carrierName={plan.carrierName} isWaived={billingType === 'waived'} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.panelFooter}>
          <div className={styles.v2FooterTop}>
            <button className={styles.v2BulkBtn} onClick={onBulk}>
              Apply to multiple plans…
            </button>
          </div>
          <div className={styles.footerActions}>
            <Button appearance="secondary" size="small" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" size="small">Save configuration</Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Bulk config modal ─────────────────────────────────────────────────────────

interface BulkModalProps {
  product: ProductType;
  currentPlan: Plan;
  allPlans: Plan[];
  onClose: () => void;
}

function BulkConfigModal({ product, currentPlan, allPlans, onClose }: BulkModalProps) {
  const isSurgery = PRODUCTS.find(p => p.key === product)?.surgery ?? false;
  const [planTypeFilter, setPlanTypeFilter] = useState<'all' | 'PPO' | 'HDHP'>('all');
  const billingOptions = isSurgery
    ? SURGERY_BILLING_OPTIONS.filter(o => {
        if (planTypeFilter !== 'PPO'  && o.value === 'waived')      return false; // HDHP/mixed: no waived
        if (planTypeFilter !== 'HDHP' && o.value === 'irs_minimum') return false; // PPO/mixed: no IRS minimum
        return true;
      })
    : OTHER_BILLING_OPTIONS;
  const [billingType, setBillingType] = useState<BillingType>(isSurgery ? 'custom' : 'traditional');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set([currentPlan.id]));

  const productLabel = PRODUCTS.find(p => p.key === product)?.label ?? product;

  const filteredPlans = allPlans.filter(p => {
    if (planTypeFilter === 'all') return true;
    const pt = derivePlanType(p);
    return pt === planTypeFilter || (planTypeFilter === 'PPO' && pt === 'COBRA');
  });

  function togglePlan(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div className={styles.bulkBackdrop} onClick={onClose} />
      <div className={styles.bulkModal}>
        <div className={styles.bulkModalHeader}>
          <div>
            <div className={styles.bulkModalTitle}>Bulk configure — {productLabel}</div>
            <div className={styles.bulkModalSub}>Set the same billing type across multiple plans at once.</div>
          </div>
          <button className={styles.panelClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.bulkModalBody}>
          {/* Left: billing type + fields */}
          <div className={styles.bulkLeft}>
            <div className={styles.bulkSectionLabel}>Billing type to apply</div>
            <div className={styles.v2SegmentedControl} style={{ flexWrap: 'wrap' }}>
              {billingOptions.map(opt => (
                <button key={opt.value} className={`${styles.v2Segment} ${billingType === opt.value ? styles.v2SegmentActive : ''}`} onClick={() => setBillingType(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>

            {billingType === 'waived' && (
              <div className={styles.v2WaivedBanner} style={{ marginTop: 16 }}>
                Member cost share will be fully waived for all selected plans.
              </div>
            )}
            {billingType === 'irs_minimum' && (
              <div className={styles.v2InfoBanner} style={{ marginTop: 16 }}>
                IRS 2025 minimum values will be applied: $1,650 individual / $3,300 family. Coinsurance 0% recommended.
              </div>
            )}
            {billingType === 'traditional' && (
              <>
                <div className={styles.fieldGroup} style={{ marginTop: 16 }}>
                  <label className={styles.fieldLabel}>Cost before deductible ($)</label>
                  <input className={styles.fieldInput} type="text" placeholder="e.g. 8" style={{ maxWidth: 160 }} />
                </div>
                <div className={styles.fieldGroup} style={{ marginTop: 10 }}>
                  <label className={styles.fieldLabel}>Cost after deductible (%)</label>
                  <input className={styles.fieldInput} type="text" placeholder="0" style={{ maxWidth: 120 }} />
                </div>
              </>
            )}
            {billingType === 'fixed' && (
              <div className={styles.fieldGroup} style={{ marginTop: 16 }}>
                <label className={styles.fieldLabel}>Fixed amount per visit ($)</label>
                <input className={styles.fieldInput} type="text" placeholder="e.g. 195" style={{ maxWidth: 160 }} />
              </div>
            )}
          </div>

          {/* Right: plan selection */}
          <div className={styles.bulkRight}>
            <div className={styles.bulkSectionLabel}>Select target plans</div>
            <div className={styles.bulkFilterRow}>
              {(['all', 'PPO', 'HDHP'] as const).map(f => (
                <button key={f} className={`${styles.v2StatusFilterChip} ${planTypeFilter === f ? styles.v2ChipFilterActive : ''}`} onClick={() => setPlanTypeFilter(f)}>
                  {f === 'all' ? 'All plan types' : f}
                </button>
              ))}
            </div>
            <div className={styles.bulkPlanList}>
              {filteredPlans.map(p => {
                const pt = derivePlanType(p);
                const cs = productCellStatus(p.products[product]);
                return (
                  <label key={p.id} className={`${styles.bulkPlanRow} ${selectedIds.has(p.id) ? styles.bulkPlanRowSelected : ''}`}>
                    <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => togglePlan(p.id)} />
                    <div className={styles.bulkPlanInfo}>
                      <div className={styles.bulkPlanName}>{p.name}</div>
                      <div className={styles.bulkPlanMeta}>
                        <span className={`${styles.v2PlanTypePill} ${pt === 'HDHP' ? styles.v2PillHDHP : styles.v2PillPPO}`} style={{ fontSize: 9, padding: '1px 6px' }}>{pt}</span>
                        <span className={`${styles.v2StatusChip} ${cs === 'missing' ? styles.v2ChipMissing : cs === 'waived' ? styles.v2ChipWaived : styles.v2ChipConfigured}`} style={{ fontSize: 9, padding: '1px 6px' }}>
                          {cs === 'missing' ? 'Not configured' : cs === 'waived' ? 'Waived' : 'Configured'}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.bulkModalFooter}>
          <span className={styles.bulkSelectedCount}>{selectedIds.size} plan{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <div className={styles.footerActions}>
            <Button appearance="secondary" size="small" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" size="small">Apply to {selectedIds.size} plan{selectedIds.size !== 1 ? 's' : ''}</Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Copy from Prior Year Modal ────────────────────────────────────────────────

interface CopyPriorYearModalProps {
  plans: Plan[];
  activeProducts: typeof PRODUCTS;
  onClose: () => void;
}

const REPORTING_TYPE_LABELS: Record<string, string> = {
  accum: 'Accumulator file',
  claims: '837 Claims file',
  none: 'No reporting',
};

function CopyPriorYearModal({ plans, activeProducts, onClose }: CopyPriorYearModalProps) {
  // Only include plans that have prior year data (carry through year over year)
  const eligiblePlans = plans.filter(p => PRIOR_YEAR_DATA[p.id]);

  // Per-plan, per-product decision: 'keep' | 'fresh'
  type Decision = 'keep' | 'fresh';
  const initialDecisions = () => {
    const d: Record<string, Partial<Record<ProductType, Decision>>> = {};
    for (const plan of eligiblePlans) {
      d[plan.id] = {};
      for (const prod of activeProducts) {
        if (PRIOR_YEAR_DATA[plan.id]?.[prod.key]) {
          d[plan.id][prod.key] = 'keep';
        }
      }
    }
    return d;
  };
  const [decisions, setDecisions] = useState<Record<string, Partial<Record<ProductType, Decision>>>>(initialDecisions);

  function setDecision(planId: string, prodKey: ProductType, val: Decision) {
    setDecisions(prev => ({
      ...prev,
      [planId]: { ...prev[planId], [prodKey]: val },
    }));
  }

  const keepCount = Object.values(decisions).flatMap(d => Object.values(d)).filter(v => v === 'keep').length;
  const newPlans = plans.filter(p => !PRIOR_YEAR_DATA[p.id]);

  return (
    <>
      <div className={styles.copyModalOverlay} onClick={onClose} />
      <div className={styles.copyModalBox}>

        {/* Header */}
        <div className={styles.copyModalHeader}>
          <div>
            <div className={styles.copyModalTitle}>Copy from 2024 Plan Year</div>
            <div className={styles.copyModalSubtitle}>
              Review prior year configurations and choose per plan whether to carry forward or start fresh.
              Plans new to this client in 2025 are shown separately and require manual configuration.
            </div>
          </div>
          <button className={styles.copyModalClose} onClick={onClose}>✕</button>
        </div>

        {/* IRS callout */}
        <div className={styles.copyModalIrsBanner}>
          <strong>IRS Minimum plans:</strong> If you choose "Keep", the billing type will carry forward but deductible amounts are automatically updated to the 2025 IRS minimums — Employee Only <strong>{IRS_2025.indiv}</strong> / Family <strong>{IRS_2025.family}</strong>. You cannot carry the 2024 dollar amounts forward for IRS Minimum plans.
        </div>

        {/* Scrollable body */}
        <div className={styles.copyModalBody}>

          {/* Eligible plans (have prior year data) */}
          {eligiblePlans.map(plan => {
            const priorPlan = PRIOR_YEAR_DATA[plan.id];
            return (
              <div key={plan.id} className={styles.copyModalPlanCard}>
                <div className={styles.copyModalPlanHeader}>
                  <div>
                    <div className={styles.copyModalPlanName}>{plan.name}</div>
                    <div className={styles.copyModalPlanMeta}>{plan.planGroup} · {plan.carrierName} · UUID: {plan.id}</div>
                  </div>
                  <span className={`${styles.v2PlanTypePill} ${plan.hdhp ? styles.v2PillHDHP : styles.v2PillPPO}`}>
                    {plan.hdhp ? 'HDHP' : 'PPO'}
                  </span>
                </div>

                {/* Column headers */}
                <div className={styles.copyModalTableHeader}>
                  <div className={styles.copyModalColProduct}>Product</div>
                  <div className={styles.copyModalColConfig}>2024 Configuration</div>
                  <div className={styles.copyModalColReporting}>2024 Reporting</div>
                  <div className={styles.copyModalColAction}>2025 Action</div>
                </div>

                {/* One row per active product */}
                {activeProducts.map(prod => {
                  const prior = priorPlan?.[prod.key];
                  const isIrs = prior?.billingType === 'irs_minimum';
                  const dec = decisions[plan.id]?.[prod.key];

                  return (
                    <div key={prod.key} className={`${styles.copyModalTableRow} ${dec === 'fresh' ? styles.copyModalRowFresh : dec === 'keep' ? styles.copyModalRowKeep : styles.copyModalRowNoData}`}>

                      {/* Product name */}
                      <div className={styles.copyModalColProduct}>
                        <span className={styles.copyModalProductLabel}>{prod.label}</span>
                      </div>

                      {/* Prior year billing config */}
                      <div className={styles.copyModalColConfig}>
                        {!prior ? (
                          <span className={styles.copyModalNoData}>Not in 2024</span>
                        ) : (
                          <>
                            <span className={styles.copyModalBillingChip}>{BILLING_TYPE_LABELS[prior.billingType]}</span>
                            {isIrs ? (
                              <span className={styles.copyModalIrsInline}>
                                <span className={styles.copyModalTierOld}>{prior.tierDetails?.[0]?.indiv}</span>
                                {' → '}
                                <span className={styles.copyModalTierNew}>{IRS_2025.indiv}</span>
                                {' / '}
                                <span className={styles.copyModalTierOld}>{prior.tierDetails?.[1]?.family}</span>
                                {' → '}
                                <span className={styles.copyModalTierNew}>{IRS_2025.family}</span>
                              </span>
                            ) : prior.tierDetails ? (
                              <span className={styles.copyModalTierInline}>
                                {prior.tierDetails.map(t => `${t.label} ${t.indiv ?? t.family}`).join(' · ')}
                              </span>
                            ) : null}
                          </>
                        )}
                      </div>

                      {/* Prior year reporting */}
                      <div className={styles.copyModalColReporting}>
                        {prior ? (
                          <>
                            <span>{REPORTING_TYPE_LABELS[prior.reportingType]}</span>
                            {prior.reportingMethod && <span className={styles.copyModalReportingMethod}> · {prior.reportingMethod}</span>}
                            {prior.contacts && prior.contacts.length > 0 && (
                              <div className={styles.copyModalContactRow}>
                                {prior.contacts.map(c => (
                                  <span key={c.email} className={styles.copyModalContactChip}>{c.name}</span>
                                ))}
                              </div>
                            )}
                          </>
                        ) : <span className={styles.copyModalNoData}>—</span>}
                      </div>

                      {/* Keep / Start fresh toggle */}
                      <div className={styles.copyModalColAction}>
                        {prior ? (
                          <div className={styles.copyModalDecision}>
                            <button
                              className={`${styles.copyModalDecisionBtn} ${dec === 'keep' ? styles.copyModalDecisionKeep : ''}`}
                              onClick={() => setDecision(plan.id, prod.key, 'keep')}
                            >
                              ✓ Copy
                            </button>
                            <button
                              className={`${styles.copyModalDecisionBtn} ${dec === 'fresh' ? styles.copyModalDecisionFresh : ''}`}
                              onClick={() => setDecision(plan.id, prod.key, 'fresh')}
                            >
                              New Setup
                            </button>
                          </div>
                        ) : <span className={styles.copyModalNoData}>Manual setup required</span>}
                        {isIrs && dec === 'keep' && (
                          <div className={styles.copyModalIrsNote}>Auto-updated to 2025 IRS values</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* New plans section */}
          {newPlans.length > 0 && (
            <div className={styles.copyModalNewPlansSection}>
              <div className={styles.copyModalNewPlansLabel}>New plans in 2025 — require manual configuration</div>
              {newPlans.map(plan => (
                <div key={plan.id} className={styles.copyModalNewPlanRow}>
                  <div>
                    <div className={styles.copyModalPlanName}>{plan.name}</div>
                    <div className={styles.copyModalPlanMeta}>{plan.planGroup} · {plan.carrierName}</div>
                  </div>
                  <span className={styles.copyModalNewBadge}>New</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.copyModalFooter}>
          <div className={styles.copyModalFooterNote}>
            {keepCount} product configuration{keepCount !== 1 ? 's' : ''} will be copied · {eligiblePlans.length} plan{eligiblePlans.length !== 1 ? 's' : ''} carrying forward
          </div>
          <div className={styles.copyModalFooterActions}>
            <button className={styles.copyModalCancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.copyModalApplyBtn} onClick={onClose}>
              Apply {keepCount} selection{keepCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SurgeryCostShare() {
  const [viewMode, setViewMode] = useState<ViewMode>('v1');
  const [selectedClient, setSelectedClient] = useState<ClientKey>('A');
  const [search, setSearch] = useState('');
  const [planYearFilter, setPlanYearFilter] = useState('2025');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [panelState, setPanelState] = useState<{ plan: Plan; product: ProductType } | null>(null);
  const [bulkState, setBulkState] = useState<{ plan: Plan; product: ProductType } | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);

  const clientConfig = CLIENT_CONFIGS[selectedClient];
  const currentPlans = clientConfig.plans;
  const activeProducts = getActiveProducts(currentPlans);

  const filtered = currentPlans.filter(p => {
    const matchesSearch = [p.name, p.planGroup].some(v => v.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (viewMode === 'v2' && statusFilter !== 'all') {
      return activeProducts.some(pr => productCellStatus(p.products[pr.key]) === statusFilter);
    }
    return true;
  });

  function openPanel(plan: Plan, product: ProductType) {
    setPanelState({ plan, product });
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        Client <span>›</span> Member Cost Share <span>›</span> <strong>Member cost share</strong>
      </div>

      {/* V1 / V2 view toggle */}
      <div className={styles.versionBar}>
        <span className={styles.versionLabel}>UI version</span>
        <div className={styles.versionToggleGroup}>
          <button
            className={`${styles.versionBtn} ${viewMode === 'v1' ? styles.versionBtnActive : ''}`}
            onClick={() => setViewMode('v1')}
          >
            V1 · Current
          </button>
          <button
            className={`${styles.versionBtn} ${viewMode === 'v2' ? styles.versionBtnActive : ''}`}
            onClick={() => setViewMode('v2')}
          >
            V2 · Enhanced
          </button>
        </div>
        {viewMode === 'v2' && (
          <span className={styles.versionNote}>Status chips · billing-type-first panel · dynamic columns · accumulator reporting</span>
        )}
      </div>

      {/* V2-only: client demo switcher */}
      {viewMode === 'v2' && (
        <div className={styles.clientSwitcherBar}>
          <span className={styles.clientSwitcherLabel}>Demo client</span>
          <div className={styles.clientSwitcherGroup}>
            {(Object.entries(CLIENT_CONFIGS) as [ClientKey, typeof CLIENT_CONFIGS[ClientKey]][]).map(([key, cfg]) => (
              <button
                key={key}
                className={`${styles.clientSwitcherBtn} ${selectedClient === key ? styles.clientSwitcherBtnActive : ''}`}
                onClick={() => { setSelectedClient(key); setPanelState(null); setBulkState(null); setStatusFilter('all'); }}
              >
                <span className={styles.clientSwitcherKey}>{key}</span>
                <span className={styles.clientSwitcherName}>{cfg.name}</span>
                <span className={styles.clientSwitcherDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>
          <span className={styles.clientSwitcherHint}>
            {activeProducts.length} product{activeProducts.length !== 1 ? 's' : ''} active for this client
          </span>
        </div>
      )}

      {/* Title row */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Member cost share</h2>
        <div className={styles.headerSearch}>
          <span className={styles.searchByLabel}>Search by carrier, plan year</span>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="2" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input className={styles.searchInput} type="text" placeholder="" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Period row */}
      <div className={styles.periodRow}>
        <div className={styles.periodSelector}>
          <span className={styles.periodLabel}>Viewing cost share period</span>
          <div className={styles.periodValue}>
            01/01/2025 – 12/31/2025
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ marginLeft: 8 }}>
              <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {viewMode === 'v2' && (
          <button className={styles.v2CopyPriorBtn} onClick={() => setShowCopyModal(true)}>↩ Copy from 2024 period</button>
        )}
        <button className={styles.managePeriodLink}>MANAGE MEMBER COST SHARE PERIOD</button>
      </div>

      {(() => {
        const missingCount = currentPlans.reduce((acc, plan) =>
          acc + activeProducts.filter(p => productCellStatus(plan.products[p.key]) === 'missing').length, 0);
        if (missingCount === 0) return null;
        return (
          <div className={styles.warningBanner}>
            <span className={styles.warningIcon}>ℹ</span>
            <div>
              <strong>{missingCount} product configuration{missingCount !== 1 ? 's' : ''} not yet configured</strong>
              <div className={styles.warningText}>
                {currentPlans.filter(plan => activeProducts.some(p => productCellStatus(plan.products[p.key]) === 'missing')).length} plan{currentPlans.filter(plan => activeProducts.some(p => productCellStatus(plan.products[p.key]) === 'missing')).length !== 1 ? 's' : ''} have at least one product missing cost share. Waived plans are not included in this count.
              </div>
            </div>
          </div>
        );
      })()}

      <div className={styles.filtersRow}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Filter:</span>
          <select className={styles.filterSelect} value={planYearFilter} onChange={e => setPlanYearFilter(e.target.value)}>
            <option value="2025">Plan Year 2025</option>
            <option value="2026">Plan Year 2026</option>
            <option value="all">All Years</option>
          </select>
        </div>

        {/* V2-only: status filter chips */}
        {viewMode === 'v2' && (
          <div className={styles.v2StatusFilterBar}>
            {([
              { key: 'all',        label: 'All' },
              { key: 'configured', label: 'Configured' },
              { key: 'waived',     label: 'Waived' },
              { key: 'missing',    label: 'Not Configured' },
            ] as { key: StatusFilter; label: string }[]).map(f => (
              <button
                key={f.key}
                className={`${styles.v2StatusFilterChip} ${statusFilter === f.key ? styles.v2ChipFilterActive : ''}`}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={`${styles.table} ${viewMode === 'v2' && activeProducts.length <= 3 ? styles.tableCompact : ''}`}>
          <thead>
            <tr>
              <th className={styles.th} style={{ minWidth: 220 }}>Plan Name</th>
              <th className={styles.th}>Plan Year</th>
              <th className={styles.th}>
                {viewMode === 'v2' ? 'Type' : 'HDHP'}
              </th>
              {(viewMode === 'v2' ? activeProducts : PRODUCTS).map(p => (
                <th key={p.key} className={styles.th}>{p.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(plan => {
              const planType = derivePlanType(plan);
              const rStatus = viewMode === 'v2' ? rowStatus(plan, activeProducts) : null;
              const rowCls = [
                styles.tr,
                rStatus === 'complete' ? styles.v2RowComplete : '',
                rStatus === 'partial'  ? styles.v2RowPartial  : '',
                rStatus === 'empty'    ? styles.v2RowEmpty    : '',
              ].filter(Boolean).join(' ');
              const displayProducts = viewMode === 'v2' ? activeProducts : PRODUCTS;
              return (
                <tr key={plan.id} className={rowCls}>
                  <td className={styles.td}>
                    <div className={styles.planName}>{plan.name}</div>
                    <div className={styles.planGroup}>{plan.planGroup}</div>
                    {viewMode === 'v2' && (
                      <div className={styles.v2CarrierNameInCell}>{plan.carrierName}</div>
                    )}
                  </td>
                  <td className={styles.td}>
                    <span className={styles.yearBadge}>{plan.year}</span>
                  </td>
                  <td className={styles.td}>
                    {viewMode === 'v1' ? (
                      plan.hdhp && (
                        <span className={styles.hdhpBadge}>
                          <span className={styles.hdhpCheck}>✓</span> HDHP
                        </span>
                      )
                    ) : (
                      <span className={`${styles.v2PlanTypePill} ${planType === 'HDHP' ? styles.v2PillHDHP : styles.v2PillPPO}`}>
                        {planType}
                      </span>
                    )}
                  </td>
                  {displayProducts.map(p => (
                    <td key={p.key} className={styles.td}>
                      {viewMode === 'v1' ? (
                        <ProductCell product={plan.products[p.key]} onClick={() => openPanel(plan, p.key)} />
                      ) : (
                        <V2ProductCell product={plan.products[p.key]} onClick={() => openPanel(plan, p.key)} isTelehealth={p.key === 'telehealth'} />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* V1 panel */}
      {panelState && viewMode === 'v1' && (
        <CostSharePanel plan={panelState.plan} product={panelState.product} onClose={() => setPanelState(null)} />
      )}

      {/* V2 panel */}
      {panelState && viewMode === 'v2' && (
        <V2CostSharePanel
          plan={panelState.plan}
          product={panelState.product}
          onClose={() => setPanelState(null)}
          onBulk={() => { setBulkState(panelState); setPanelState(null); }}
        />
      )}

      {/* Bulk modal */}
      {bulkState && viewMode === 'v2' && (
        <BulkConfigModal
          product={bulkState.product}
          currentPlan={bulkState.plan}
          allPlans={currentPlans}
          onClose={() => setBulkState(null)}
        />
      )}

      {/* Copy from prior year modal */}
      {showCopyModal && viewMode === 'v2' && (
        <CopyPriorYearModal
          plans={currentPlans}
          activeProducts={activeProducts}
          onClose={() => setShowCopyModal(false)}
        />
      )}
    </div>
  );
}
