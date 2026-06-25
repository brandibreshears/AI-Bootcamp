import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './GenerateInvoice.module.css';
import { Button } from '../../components/ui/Button/Button';
import { InfoIcon, CheckIcon } from '../../components/ui/Icons';

const STEPS = [
  'Select member',
  'Care experience',
  'Invoice details',
  'Cost share',
  'Review & submit',
];

const ENCOUNTER_OPTIONS = [
  { value: 'care_at_home', label: 'Care at Home' },
  { value: 'ortho', label: 'Orthopedic consultations' },
  { value: 'cancer_coe', label: 'Cancer Care Centers of Excellence (COE)' },
  { value: 'cancer_chemo', label: 'Cancer Chemotherapy' },
  { value: 'cancer_radiation', label: 'Cancer Radiation' },
  { value: 'telehealth', label: 'Telehealth' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'other', label: 'Other' },
];

// Maps the short display names stored on Invoice.encounterType → option values
const ENCOUNTER_TYPE_MAP: Record<string, string> = {
  'Care at Home': 'care_at_home',
  'Care At Home': 'care_at_home',
  'Orthopedic': 'ortho',
  'Orthopedic consultations': 'ortho',
  'Cancer COE': 'cancer_coe',
  'Cancer Care COE': 'cancer_coe',
  'Cancer Chemotherapy': 'cancer_chemo',
  'Cancer Radiation': 'cancer_radiation',
  'Telehealth': 'telehealth',
  'Surgery': 'surgery',
  'Other': 'other',
};

// Maps billingType display strings stored on Invoice → costShareType option values
const BILLING_TYPE_MAP: Record<string, string> = {
  'Waived': 'waived',
  'IRS Minimum': 'irs_minimum',
  'Insurance': 'insurance',
  'Custom': 'custom',
  'Traditional': 'traditional',
  'Fixed Cost': 'fixed_cost',
  'fixed_cost': 'fixed_cost',
  'irs_minimum': 'irs_minimum',
  'insurance': 'insurance',
  'custom': 'custom',
  'traditional': 'traditional',
  'waived': 'waived',
};

const mockMemberResults = [
  { id: 'm1', name: 'Sarah Mitchell', client: 'Apex Industries', dob: '03/14/1988', memberId: 'TC-100842', plan: 'Premium', app: true, dependent: false, uuid: '32120192-c8ed-48fe-9c08-c9ff180b2f7c' },
  { id: 'm2', name: 'Marcus Webb', client: 'BrightPath Co.', dob: '07/22/1990', memberId: 'TC-200109', plan: 'Standard', app: false, dependent: true, uuid: 'a4f81203-d912-41cc-8b3e-f20a1c9d7e55' },
  { id: 'm3', name: 'Elena Vasquez', client: 'Delta Health', dob: '11/05/1975', memberId: 'TC-304211', plan: 'Premium', app: true, dependent: false, uuid: 'b7c92410-3f5a-4d8e-a19c-0d82b6471f3a' },
];

function generateRefNumber() {
  return `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
}

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

export default function GenerateInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const existingInvoice = (location.state as {
    invoice?: {
      correctionNote?: string;
      memberName?: string;
      client?: string;
      encounterType?: string;
      encounterDate?: string;
      invoiceType?: 'cost_share' | 'recoupment';
      caseRate?: number;
      caseNumber?: string;
      deductibleMet?: number;
      deductibleMax?: number;
      oopMet?: number;
      oopMax?: number;
      coinsurancePct?: number;
      copay?: number;
      billingType?: string;
      innDedAmount?: number;
      innOopAmount?: number;
    }
  } | null)?.invoice;
  const correctionNote = existingInvoice?.correctionNote;
  const isCorrection = !!existingInvoice;

  // Start at step 1 when editing a correction-required invoice (skip member selection)
  const [step, setStep] = useState(isCorrection ? 1 : 0);
  const [selectedMember, setSelectedMember] = useState<typeof mockMemberResults[0] | null>(null);

  // Step 0 — Member search
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [searchDob, setSearchDob] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchState, setSearchState] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [searchMemberUuid, setSearchMemberUuid] = useState('');
  const [searchCaseId, setSearchCaseId] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Step 1 — Care experience selection
  const [invoiceType, setInvoiceType] = useState<'cost_share' | 'recoupment' | ''>(existingInvoice?.invoiceType ?? '');
  const [encounter, setEncounter] = useState(
    existingInvoice?.encounterType
      ? (ENCOUNTER_TYPE_MAP[existingInvoice.encounterType]
         ?? ENCOUNTER_OPTIONS.find(o => o.label.toLowerCase() === existingInvoice.encounterType!.toLowerCase())?.value
         ?? existingInvoice.encounterType.toLowerCase().replace(/ /g, '_'))
      : ''
  );
  const [serviceDate, setServiceDate] = useState(existingInvoice?.encounterDate ?? '');
  const [refNumber] = useState(generateRefNumber());

  // Step 2 — Invoice details (fields differ by invoice type)
  // Cost Share fields
  const [csPeriodStart, setCsPeriodStart] = useState('2026-01-01');
  const [csPeriodEnd, setCsPeriodEnd] = useState('2026-12-31');
  const [csPeriodExpanded, setCsPeriodExpanded] = useState(false);
  const [csCopay, setCsCopay] = useState(existingInvoice?.copay != null ? String(existingInvoice.copay) : '');
  const [maxMemberCost, setMaxMemberCost] = useState('');
  const [caseRate, setCaseRate] = useState(existingInvoice?.caseRate != null ? String(existingInvoice.caseRate) : '');
  const [caseNumber, setCaseNumber] = useState(existingInvoice?.caseNumber ?? '');
  const [dueDate, setDueDate] = useState(defaultDueDate());
  // EOB fields (conditionally shown)
  const [eobOn, setEobOn] = useState(false);
  const [facilityName, setFacilityName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  // Recoupment fields
  const [repaymentAmount, setRepaymentAmount] = useState('');

  // Step 3 — Cost share type & accumulator (cost_share only)
  const [costShareType, setCostShareType] = useState<'waived' | 'irs_minimum' | 'insurance' | 'custom' | 'traditional' | 'fixed_cost' | ''>(
    (existingInvoice?.billingType ? (BILLING_TYPE_MAP[existingInvoice.billingType] ?? '') : '') as 'waived' | 'irs_minimum' | 'insurance' | 'custom' | 'traditional' | 'fixed_cost' | ''
  );
  // IRS / Insurance / Custom shared fields
  const [csIndDed, setCsIndDed] = useState(existingInvoice?.deductibleMax != null ? String(existingInvoice.deductibleMax) : '');
  const [csFamDed, setCsFamDed] = useState('');
  const [csCoinsurance, setCsCoinsurance] = useState(existingInvoice?.coinsurancePct != null ? String(existingInvoice.coinsurancePct) : '');
  const [csCountsDed, setCsCountsDed] = useState(true);
  const [csCountsOop, setCsCountsOop] = useState(true);
  // Traditional fields
  const [csCostBefore, setCsCostBefore] = useState('');
  const [csCostAfter, setCsCostAfter] = useState('');
  // Fixed cost fields
  const [csFixedAmount, setCsFixedAmount] = useState('');
  const [csFixedCountsOop, setCsFixedCountsOop] = useState(true);
  // Free visits (Fixed Cost / Traditional)
  const [initialFreeVisits, setInitialFreeVisits] = useState('');

  const [bypassExpanded, setBypassExpanded] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [bypassReason, setBypassReason] = useState('');
  const [spentIndDed, setSpentIndDed] = useState(existingInvoice?.deductibleMet != null ? String(existingInvoice.deductibleMet) : '');
  const [maxIndDed, setMaxIndDed] = useState(
    existingInvoice?.deductibleMax != null ? String(existingInvoice.deductibleMax)
    : existingInvoice?.innDedAmount != null ? String(existingInvoice.innDedAmount)
    : ''
  );
  const [spentFamDed, setSpentFamDed] = useState('');
  const [maxFamDed, setMaxFamDed] = useState('');
  const [spentIndOop, setSpentIndOop] = useState(existingInvoice?.oopMet != null ? String(existingInvoice.oopMet) : '');
  const [maxIndOop, setMaxIndOop] = useState(
    existingInvoice?.oopMax != null ? String(existingInvoice.oopMax)
    : existingInvoice?.innOopAmount != null ? String(existingInvoice.innOopAmount)
    : ''
  );
  const [spentFamOop, setSpentFamOop] = useState('');
  const [maxFamOop, setMaxFamOop] = useState('');

  // Orbit mock accumulators — prefer values from existing invoice when editing
  const deductibleMet = existingInvoice?.deductibleMet ?? 1500;
  const deductibleMax = existingInvoice?.deductibleMax ?? 3000;
  const oopMet = existingInvoice?.oopMet ?? 2800;
  const oopMax = existingInvoice?.oopMax ?? 6000;

  // Coinsurance % derives from Step 3 billing type configuration
  const effectiveCoinsurancePct =
    costShareType === 'irs_minimum' ? (parseFloat(csCoinsurance) || 0)
    : costShareType === 'insurance' ? 0   // read-only from insurance plan (shown as 0%)
    : costShareType === 'custom' ? (parseFloat(csCoinsurance) || 0)
    : costShareType === 'traditional' ? (parseFloat(csCostAfter) || 0)
    : 0;
  const effectiveCoinsurance = effectiveCoinsurancePct / 100;

  // Copay comes from Step 3 input — defaults to 0 if not entered
  const copay = parseFloat(csCopay) || 0;

  const rate = parseFloat(caseRate) || 0;
  const dedRemaining = Math.max(deductibleMax - deductibleMet, 0);
  const oopRemaining = Math.max(oopMax - oopMet, 0);
  // Traditional uses a flat pre-deductible rate instead of dedRemaining as member cost
  const calculatedTotal = (() => {
    if (costShareType === 'traditional') {
      const costBefore = parseFloat(csCostBefore) || 0;
      const postDedAmount = Math.max(rate - dedRemaining, 0) * effectiveCoinsurance;
      const preDedAmount = Math.min(rate, dedRemaining) > 0 ? costBefore : 0;
      return Math.min(preDedAmount + postDedAmount + copay, oopRemaining);
    }
    return Math.min(dedRemaining + Math.max(rate - dedRemaining, 0) * effectiveCoinsurance + copay, oopRemaining);
  })();
  const calculatedCostShare = calculatedTotal.toFixed(2);

  const finalAmount = costShareType === 'waived' ? '0'
    : costShareType === 'fixed_cost' ? (csFixedAmount || '0')
    : manualOverride ? manualAmount
    : invoiceType === 'recoupment' ? repaymentAmount
    : calculatedCostShare;

  const isSurgery = encounter === 'surgery';

  const isSurgeryModel = ['surgery', 'cancer_coe'].includes(encounter);
  const isPreconfigured = ['surgery', 'telehealth', 'care_at_home', 'ortho'].includes(encounter);

  const surgeryModelTypes = [
    { value: 'waived', label: 'Waived', desc: 'Client has waived cost-share — no member fee regardless of accumulator status.' },
    { value: 'irs_minimum', label: 'IRS Minimum', desc: 'Minimum cost required for HDHPs per IRS rules. Deductible values are pulled from IRS tables.' },
    { value: 'insurance', label: 'Insurance', desc: 'Charges based on the member\'s regular insurance plan rules. Values are read-only from the insurance plan.' },
    { value: 'custom', label: 'Custom', desc: 'Custom deductibles and coinsurance set by the client, independent of the regular insurance plan.' },
  ];

  const otherModelTypes = [
    { value: 'waived', label: 'Waived', desc: 'Client has waived cost-share — no member fee regardless of accumulator status.' },
    { value: 'fixed_cost', label: 'Fixed Cost', desc: 'Member pays a fixed dollar amount per encounter. Can optionally count toward OOP max.' },
    { value: 'traditional', label: 'Traditional', desc: 'Differing pre and post-deductible costs set by the client, not taken from the insurance plan.' },
  ];

  const availableTypes = isSurgeryModel ? surgeryModelTypes : otherModelTypes;

  // Skip accum step for recoupment
  const effectiveSteps = invoiceType === 'recoupment'
    ? STEPS.filter((_, i) => i !== 3)
    : STEPS;

  const totalSteps = effectiveSteps.length;

  const step2Valid = invoiceType === 'cost_share'
    ? !!(costShareType !== '' && dueDate && serviceDate && encounter)
    : !!(repaymentAmount && dueDate && serviceDate && encounter);

  const minStep = isCorrection ? 1 : 0;

  const canProceed =
    (step === 0 && (isCorrection || (searchPerformed && selectedMember !== null))) ||
    (step === 1 && invoiceType !== '' && encounter && serviceDate) ||
    (step === 2 && step2Valid) ||
    step === 3 ||
    step === 4;

  function handleNext() {
    if (step < totalSteps - 1) setStep(step + 1);
  }

  function handleBack() {
    if (step > minStep) setStep(step - 1);
  }

  function handleSubmit() {
    navigate('/billing');
  }

  const encounterLabel = ENCOUNTER_OPTIONS.find(o => o.value === encounter)?.label ?? encounter;

  return (
    <div className={step === 0 ? styles.pageWide : styles.page}>
      <div className={styles.header}>
        <button className={styles.backLink} onClick={() => navigate('/billing')}>
          ← Back to Member payments
        </button>
        <h2 className={styles.pageTitle}>Generate invoice by member</h2>
      </div>

      {/* Correction note banner — shown on all steps when reopening a correction-required invoice */}
      {correctionNote && (
        <div style={{
          background: '#FDECEA',
          border: '1.5px solid #D93025',
          borderRadius: '10px',
          padding: '14px 24px',
          margin: '0 0 16px',
          fontFamily: 'Outfit, sans-serif',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#D93025', marginBottom: '6px' }}>
            Correction required by billing manager
          </div>
          <p style={{ fontSize: '14px', color: '#18162F', margin: 0 }}>{correctionNote}</p>
        </div>
      )}

      {/* Step content */}
      <div className={step === 0 ? styles.cardWide : styles.card}>

        {/* ── Step 0: Select member — split layout ── */}
        {step === 0 && (
          <div className={styles.splitLayout}>
            {/* Left: search form */}
            <div className={styles.searchPanel}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>First name</label>
                <input type="text" className={styles.formInput} value={searchFirstName} onChange={(e) => setSearchFirstName(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Last name</label>
                <input type="text" className={styles.formInput} value={searchLastName} onChange={(e) => setSearchLastName(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Birth date</label>
                <input type="date" className={styles.formInput} value={searchDob} onChange={(e) => setSearchDob(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone number</label>
                <input type="tel" className={styles.formInput} placeholder="(555) 000-0000" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>State</label>
                <input type="text" className={styles.formInput} placeholder="e.g. CA" value={searchState} onChange={(e) => setSearchState(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Client</label>
                <input type="text" className={styles.formInput} placeholder="Client name" value={searchClient} onChange={(e) => setSearchClient(e.target.value)} />
              </div>

              <button
                className={styles.advancedToggle}
                onClick={() => setAdvancedOpen(!advancedOpen)}
                type="button"
              >
                Advanced search
                <span className={styles.advancedChevron}>{advancedOpen ? '▲' : '▼'}</span>
              </button>

              {advancedOpen && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Member UUID</label>
                    <input type="text" className={styles.formInput} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={searchMemberUuid} onChange={(e) => setSearchMemberUuid(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Case ID</label>
                    <input type="text" className={styles.formInput} value={searchCaseId} onChange={(e) => setSearchCaseId(e.target.value)} />
                  </div>
                </>
              )}

              <Button appearance="primary" onClick={() => { setSearchPerformed(true); setSelectedMember(null); }}>
                Search
              </Button>
            </div>

            {/* Right: results */}
            <div className={styles.resultsPanel}>
              {!searchPerformed ? (
                <div className={styles.resultsEmpty}>
                  Enter search criteria and click Search to find a member.
                </div>
              ) : (
                <>
                  <div className={styles.resultsHeader}>
                    <span className={styles.resultsCount}>3 results found</span>
                  </div>
                  <table className={styles.resultsTable}>
                    <thead>
                      <tr>
                        <th>Member name</th>
                        <th>Client</th>
                        <th>Dependent?</th>
                        <th>App?</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockMemberResults.map((m) => (
                        <tr key={m.id} className={selectedMember?.id === m.id ? styles.selectedRow : ''}>
                          <td>
                            <div className={styles.memberNameCell}>{m.name}</div>
                            <div className={styles.memberUuidCell}>{m.uuid}</div>
                          </td>
                          <td>{m.client}</td>
                          <td>
                            {m.dependent
                              ? <span className={styles.iconYes}>✓</span>
                              : <span className={styles.iconNo}>✕</span>}
                          </td>
                          <td>
                            {m.app
                              ? <span className={styles.iconYes}>✓</span>
                              : <span className={styles.iconNo}>✕</span>}
                          </td>
                          <td>
                            <button
                              className={styles.buildInvoiceLink}
                              onClick={() => { setSelectedMember(m); setStep(1); }}
                              type="button"
                            >
                              Build invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Step 1: Care experience selection ── */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Care experience selection</h3>
            <p className={styles.stepSubtitle}>Choose the invoice template type and care program for this member.</p>

            {/* Locked member banner — only shown when editing a correction-required invoice */}
            {isCorrection && existingInvoice?.memberName && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: '#F4F3FC',
                border: '1.5px solid #D6D5DF',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '24px',
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#5651BD',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '15px',
                  flexShrink: 0,
                }}>
                  {existingInvoice.memberName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#18162F' }}>{existingInvoice.memberName}</div>
                  {existingInvoice.client && (
                    <div style={{ fontSize: '13px', color: '#4C4A64' }}>{existingInvoice.client}</div>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#4C4A64',
                  background: '#E8E7F5',
                  borderRadius: '6px',
                  padding: '4px 10px',
                }}>
                  🔒 Member locked
                </div>
              </div>
            )}

            <div className={styles.fieldSection}>
              <p className={styles.fieldSectionLabel}>Invoice type <span className={styles.required}>*</span></p>
              <div className={styles.radioCards}>
                <button
                  className={`${styles.radioCard} ${invoiceType === 'cost_share' ? styles.radioCardSelected : ''}`}
                  onClick={() => setInvoiceType('cost_share')}
                >
                  <div className={styles.radioIndicator}>
                    <div className={`${styles.radioInner} ${invoiceType === 'cost_share' ? styles.radioInnerSelected : ''}`} />
                  </div>
                  <div>
                    <div className={styles.radioCardTitle}>Member cost share</div>
                    <div className={styles.radioCardDesc}>Invoice a member for their share of a covered service. Requires accumulator check.</div>
                  </div>
                </button>
                <button
                  className={`${styles.radioCard} ${invoiceType === 'recoupment' ? styles.radioCardSelected : ''}`}
                  onClick={() => setInvoiceType('recoupment')}
                >
                  <div className={styles.radioIndicator}>
                    <div className={`${styles.radioInner} ${invoiceType === 'recoupment' ? styles.radioInnerSelected : ''}`} />
                  </div>
                  <div>
                    <div className={styles.radioCardTitle}>Member recoupment</div>
                    <div className={styles.radioCardDesc}>Recoup an overpayment or incorrect disbursement. No accumulator check required.</div>
                  </div>
                </button>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Encounter type <span className={styles.required}>*</span></label>
                <select
                  className={styles.formSelect}
                  value={encounter}
                  onChange={(e) => setEncounter(e.target.value)}
                >
                  <option value="">Select encounter type…</option>
                  {ENCOUNTER_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date of service <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Invoice reference number</label>
              <input
                type="text"
                className={`${styles.formInput} ${styles.formInputReadOnly}`}
                value={refNumber}
                readOnly
              />
              <p className={styles.fieldHint}>Auto-generated. This will be stored with the encounter record.</p>
            </div>

            {invoiceType && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Invoice description</label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.formInputReadOnly}`}
                  value={invoiceType === 'cost_share' ? 'Member Cost Share' : 'Member Recoupment'}
                  readOnly
                />
                <p className={styles.fieldHint}>Pre-populated based on invoice type selected above.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Invoice details (Cost Share) ── */}
        {step === 2 && invoiceType === 'cost_share' && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Invoice details — Member cost share</h3>
            <p className={styles.stepSubtitle}>Enter invoice details and configure the billing type for this member.</p>

            {/* Cost share period */}
            {isPreconfigured ? (
              <div className={styles.csPeriodPill} onClick={() => setCsPeriodExpanded(v => !v)} role="button" tabIndex={0} onKeyDown={e => e.key === ' ' && setCsPeriodExpanded(v => !v)}>
                <div className={styles.csPeriodPillInner}>
                  <div>
                    <p className={styles.csPeriodLabel}>Viewing cost share period</p>
                    <p className={styles.csPeriodValue}>
                      {new Date(csPeriodStart + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                      {' – '}
                      {new Date(csPeriodEnd + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`${styles.csPeriodChevron} ${csPeriodExpanded ? styles.csPeriodChevronOpen : ''}`}>▾</span>
                </div>
                {csPeriodExpanded && (
                  <div className={styles.csPeriodEdit} onClick={e => e.stopPropagation()}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Period start</label>
                        <input type="date" className={styles.formInput} value={csPeriodStart} onChange={e => setCsPeriodStart(e.target.value)} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Period end</label>
                        <input type="date" className={styles.formInput} value={csPeriodEnd} onChange={e => setCsPeriodEnd(e.target.value)} />
                      </div>
                    </div>
                    <p className={styles.fieldHint}>Pulled from the cost share configuration. Edit only if this invoice falls outside the standard period.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.fieldSection}>
                <p className={styles.fieldSectionLabel}>Cost share period <span className={styles.required}>*</span></p>
                <p className={styles.fieldHint} style={{ marginTop: 0, marginBottom: 8 }}>No configuration found for this encounter type. Please confirm the applicable cost share period.</p>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Period start <span className={styles.required}>*</span></label>
                    <input type="date" className={styles.formInput} value={csPeriodStart} onChange={e => setCsPeriodStart(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Period end <span className={styles.required}>*</span></label>
                    <input type="date" className={styles.formInput} value={csPeriodEnd} onChange={e => setCsPeriodEnd(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Due date <span className={styles.required}>*</span></label>
              <input
                type="date"
                className={styles.formInput}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <p className={styles.fieldHint}>Defaults to 30 days from today.</p>
            </div>

            {/* Billing type section */}
            <div className={styles.fieldSection}>
              <p className={styles.fieldSectionLabel}>
                Billing type
                {isPreconfigured
                  ? <span className={styles.configBadge}>Configuration loaded</span>
                  : <span className={styles.required}> * Required — no configuration found for this encounter type</span>
                }
              </p>

              {isPreconfigured && (
                <div className={styles.infoBanner}>
                  <InfoIcon className={styles.infoBannerIcon} />
                  <span>
                    A cost share configuration exists for this encounter type.
                    The billing model has been pre-selected below.
                    You may change it if needed.
                  </span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Select billing type <span className={styles.required}>*</span></label>
                <select
                  className={styles.billingTypeSelect}
                  value={costShareType}
                  onChange={(e) => setCostShareType(e.target.value as any)}
                >
                  <option value="">Select billing type…</option>
                  {availableTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Waived */}
              {costShareType === 'waived' && (
                <div className={styles.waivedBanner}>
                  Cost-share is waived for this member. Invoice amount will be $0.00.
                </div>
              )}

              {/* IRS Minimum */}
              {costShareType === 'irs_minimum' && (
                <>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Deductible (individual) <span className={styles.optional}>(IRS 2026)</span></label>
                      <input type="text" className={`${styles.formInput} ${styles.formInputReadOnly}`} value="$1,700" readOnly />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Deductible (family) <span className={styles.optional}>(IRS 2026)</span></label>
                      <input type="text" className={`${styles.formInput} ${styles.formInputReadOnly}`} value="$3,400" readOnly />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>% charged after deductible</label>
                      <input type="number" className={styles.formInput} placeholder="0" value={csCoinsurance} onChange={e => setCsCoinsurance(e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.csStatusList}>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>✓</span>
                      Uses deductible status for cost share
                    </div>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>✓</span>
                      Uses out of pocket status for cost share
                    </div>
                  </div>
                </>
              )}

              {/* Insurance */}
              {costShareType === 'insurance' && (
                <>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Deductible (individual)</label>
                      <input type="text" className={`${styles.formInput} ${styles.formInputReadOnly}`} value="$1,000" readOnly />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Deductible (family)</label>
                      <input type="text" className={`${styles.formInput} ${styles.formInputReadOnly}`} value="$2,300" readOnly />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>OOP max (individual)</label>
                      <input type="text" className={`${styles.formInput} ${styles.formInputReadOnly}`} value="$1,300" readOnly />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>OOP max (family)</label>
                      <input type="text" className={`${styles.formInput} ${styles.formInputReadOnly}`} value="$2,300" readOnly />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Coinsurance % after deductible</label>
                      <input type="text" className={`${styles.formInput} ${styles.formInputReadOnly}`} value="0%" readOnly />
                    </div>
                  </div>
                  <div className={styles.csStatusList}>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>✓</span>
                      Uses deductible status for cost share
                    </div>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>✓</span>
                      Uses out of pocket status for cost share
                    </div>
                  </div>
                </>
              )}

              {/* Custom */}
              {costShareType === 'custom' && (
                <>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Deductible (indiv) ($)</label>
                      <input type="number" className={styles.formInput} placeholder="0.00" value={csIndDed} onChange={e => setCsIndDed(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Deductible (fam) ($)</label>
                      <input type="number" className={styles.formInput} placeholder="0.00" value={csFamDed} onChange={e => setCsFamDed(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Coinsurance % after deductible</label>
                      <input type="number" className={styles.formInput} placeholder="0" value={csCoinsurance} onChange={e => setCsCoinsurance(e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.csStatusList}>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>✓</span>
                      Uses deductible status for cost share
                    </div>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>✓</span>
                      Uses out of pocket status for cost share
                    </div>
                  </div>
                </>
              )}

              {/* Fixed Cost */}
              {costShareType === 'fixed_cost' && (
                <>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}># of initial free visits</label>
                      <input type="number" className={styles.formInput} placeholder="0" value={initialFreeVisits} onChange={e => setInitialFreeVisits(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Cost per visit <span className={styles.required}>*</span></label>
                      <div className={styles.inputWithPrefix}>
                        <span className={styles.inputPrefix}>$</span>
                        <input type="number" placeholder="0.00" value={csFixedAmount} onChange={e => setCsFixedAmount(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className={styles.csStatusList}>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusRed}`}>✕</span>
                      Does not use deductible status for cost share
                    </div>
                    <label className={styles.csStatusCheckbox}>
                      <input type="checkbox" checked={csFixedCountsOop} onChange={e => setCsFixedCountsOop(e.target.checked)} />
                      Uses out of pocket status for cost share
                    </label>
                  </div>
                </>
              )}

              {/* Traditional */}
              {costShareType === 'traditional' && (
                <>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}># of initial free visits</label>
                      <input type="number" className={styles.formInput} placeholder="0" value={initialFreeVisits} onChange={e => setInitialFreeVisits(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Cost before deductible</label>
                      <div className={styles.inputWithPrefix}>
                        <span className={styles.inputPrefix}>$</span>
                        <input type="number" placeholder="0.00" value={csCostBefore} onChange={e => setCsCostBefore(e.target.value)} />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>% charged after deductible</label>
                      <input type="number" className={styles.formInput} placeholder="0" value={csCostAfter} onChange={e => setCsCostAfter(e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.csStatusList}>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>✓</span>
                      Uses deductible status for cost share
                    </div>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>✓</span>
                      Uses out of pocket status for cost share
                    </div>
                  </div>
                </>
              )}
            </div>

            {isSurgery && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Case rate ($)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    placeholder="0.00"
                    value={caseRate}
                    onChange={(e) => setCaseRate(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Specialist copay ($) <span className={styles.optional}>(optional)</span></label>
                  <input
                    type="number"
                    className={styles.formInput}
                    placeholder="0.00"
                    value={csCopay}
                    onChange={(e) => setCsCopay(e.target.value)}
                  />
                  <p className={styles.fieldHint}>Leave blank if no copay applies.</p>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Case number</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. TC-100842"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                  />
                  <p className={styles.fieldHint}>Required if this needs to push to Netsuite.</p>
                </div>
              </div>
            )}

            {!isSurgery && (
              <div className={styles.formGrid}>
                {!isPreconfigured && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Specialist copay ($) <span className={styles.optional}>(optional)</span></label>
                    <input
                      type="number"
                      className={styles.formInput}
                      placeholder="0.00"
                      value={csCopay}
                      onChange={(e) => setCsCopay(e.target.value)}
                    />
                    <p className={styles.fieldHint}>Leave blank if no copay applies.</p>
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Case number <span className={styles.optional}>(situational)</span></label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Leave blank if not applicable"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className={styles.fieldSection}>
              <div className={styles.eobToggleRow}>
                <label className={styles.toggleLabel}>
                  <div
                    className={`${styles.toggle} ${eobOn ? styles.toggleOn : ''}`}
                    onClick={() => setEobOn(!eobOn)}
                    role="switch"
                    aria-checked={eobOn}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === ' ' && setEobOn(!eobOn)}
                  >
                    <div className={styles.toggleThumb} />
                  </div>
                  Include EOB fields
                </label>
                <p className={styles.fieldHint} style={{ marginTop: 0 }}>Enable to attach Explanation of Benefits information (required when EOB policy service flag is on).</p>
              </div>

              {eobOn && (
                <div className={styles.formGrid} style={{ marginTop: 12 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Facility name <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. St. Luke's Medical Center"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Service description <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Knee replacement surgery"
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Invoice details (Recoupment) ── */}
        {step === 2 && invoiceType === 'recoupment' && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Invoice details — Member recoupment</h3>
            <p className={styles.stepSubtitle}>Enter the repayment amount and due date for this recoupment invoice.</p>

            <div className={styles.infoBanner}>
              <InfoIcon className={styles.infoBannerIcon} />
              <span>No accumulator check is required for recoupment invoices. The member will be billed the fixed amount entered below.</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Member repayment amount ($) <span className={styles.required}>*</span></label>
                <input
                  type="number"
                  className={styles.formInput}
                  placeholder="0.00"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Due date <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <p className={styles.fieldHint}>Defaults to 30 days from today.</p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Case number <span className={styles.optional}>(situational)</span></label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Leave blank if not applicable"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Accumulator check (cost_share only) ── */}
        {step === 3 && invoiceType === 'cost_share' && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Accumulator status check</h3>
            <p className={styles.stepSubtitle}>
              Orbit accumulator data for {selectedMember?.name} — {availableTypes.find(t => t.value === costShareType)?.label ?? 'billing type not set'} — benefit year 2026.
            </p>

            {(costShareType === 'waived' || costShareType === 'fixed_cost') && (
              <div className={styles.infoBanner}>
                <InfoIcon className={styles.infoBannerIcon} />
                <span>No accumulator check required for {costShareType === 'waived' ? 'Waived' : 'Fixed Cost'} billing type.</span>
              </div>
            )}

            {costShareType !== '' && costShareType !== 'waived' && costShareType !== 'fixed_cost' && (
              <>
                <div className={styles.accumGrid}>
                  <div className={styles.accumCard}>
                    <div className={styles.accumLabel}>Deductible met</div>
                    <div className={styles.accumValue}>${deductibleMet.toLocaleString()} <span className={styles.accumOf}>/ ${deductibleMax.toLocaleString()}</span></div>
                    <div className={styles.accumBar}>
                      <div className={styles.accumFill} style={{ width: `${(deductibleMet / deductibleMax) * 100}%` }} />
                    </div>
                  </div>
                  <div className={styles.accumCard}>
                    <div className={styles.accumLabel}>Out-of-pocket met</div>
                    <div className={styles.accumValue}>${oopMet.toLocaleString()} <span className={styles.accumOf}>/ ${oopMax.toLocaleString()}</span></div>
                    <div className={styles.accumBar}>
                      <div className={styles.accumFill} style={{ width: `${(oopMet / oopMax) * 100}%` }} />
                    </div>
                  </div>
                  <div className={styles.accumCard}>
                    <div className={styles.accumLabel}>Coinsurance rate</div>
                    <div className={styles.accumValue}>{effectiveCoinsurancePct}%</div>
                  </div>
                  <div className={styles.accumCard}>
                    <div className={styles.accumLabel}>Specialist copay</div>
                    <div className={styles.accumValue}>${copay}</div>
                  </div>
                </div>

                <div className={styles.calcBreakdown}>
                  <div className={styles.calcBreakdownTitle}>How this was calculated</div>

                  {/* IRS Minimum */}
                  {costShareType === 'irs_minimum' && (() => {
                    const postDedAmount = rate > 0 ? Math.max(rate - dedRemaining, 0) * effectiveCoinsurance : 0;
                    const total = Math.min(dedRemaining + postDedAmount + copay, oopRemaining);
                    return (
                      <div className={styles.calcSteps}>
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>IRS deductible (individual)</span>
                          <span className={styles.calcStepValue}>${deductibleMax.toLocaleString()}</span>
                        </div>
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>Already met this year (from Orbit)</span>
                          <span className={styles.calcStepValue}>− ${deductibleMet.toLocaleString()}</span>
                        </div>
                        <div className={`${styles.calcStep} ${styles.calcStepSub}`}>
                          <span className={styles.calcStepLabel}>Remaining deductible member owes</span>
                          <span className={styles.calcStepValue}>${dedRemaining.toLocaleString()}</span>
                        </div>
                        {rate > 0 && dedRemaining < rate && (
                          <>
                            <div className={styles.calcStep} style={{ marginTop: 8 }}>
                              <span className={styles.calcStepLabel}>Case rate subject to coinsurance</span>
                              <span className={styles.calcStepValue}>${(rate - dedRemaining).toLocaleString()}</span>
                            </div>
                            <div className={styles.calcStep}>
                              <span className={styles.calcStepLabel}>× {effectiveCoinsurancePct}% coinsurance (entered in step 3)</span>
                              <span className={styles.calcStepValue}>${postDedAmount.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        {copay > 0 && (
                          <div className={styles.calcStep}>
                            <span className={styles.calcStepLabel}>+ Specialist copay (entered in step 3)</span>
                            <span className={styles.calcStepValue}>${copay.toFixed(2)}</span>
                          </div>
                        )}
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>OOP max remaining (cap)</span>
                          <span className={styles.calcStepValue}>${oopRemaining.toLocaleString()}</span>
                        </div>
                        <div className={`${styles.calcStep} ${styles.calcStepTotal}`}>
                          <span className={styles.calcStepLabel}>Member cost share due</span>
                          <span className={styles.calcStepValue}>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Insurance */}
                  {costShareType === 'insurance' && (() => {
                    const postDedAmount = rate > 0 ? Math.max(rate - dedRemaining, 0) * effectiveCoinsurance : 0;
                    const total = Math.min(dedRemaining + postDedAmount + copay, oopRemaining);
                    return (
                      <div className={styles.calcSteps}>
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>Insurance deductible (individual)</span>
                          <span className={styles.calcStepValue}>${deductibleMax.toLocaleString()}</span>
                        </div>
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>Already met this year (from Orbit)</span>
                          <span className={styles.calcStepValue}>− ${deductibleMet.toLocaleString()}</span>
                        </div>
                        <div className={`${styles.calcStep} ${styles.calcStepSub}`}>
                          <span className={styles.calcStepLabel}>Remaining deductible member owes</span>
                          <span className={styles.calcStepValue}>${dedRemaining.toLocaleString()}</span>
                        </div>
                        {rate > 0 && dedRemaining < rate && (
                          <>
                            <div className={styles.calcStep} style={{ marginTop: 8 }}>
                              <span className={styles.calcStepLabel}>Case rate subject to coinsurance</span>
                              <span className={styles.calcStepValue}>${(rate - dedRemaining).toLocaleString()}</span>
                            </div>
                            <div className={styles.calcStep}>
                              <span className={styles.calcStepLabel}>× {effectiveCoinsurancePct}% coinsurance (from insurance plan)</span>
                              <span className={styles.calcStepValue}>${postDedAmount.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        {copay > 0 && (
                          <div className={styles.calcStep}>
                            <span className={styles.calcStepLabel}>+ Specialist copay (entered in step 3)</span>
                            <span className={styles.calcStepValue}>${copay.toFixed(2)}</span>
                          </div>
                        )}
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>OOP max remaining (cap)</span>
                          <span className={styles.calcStepValue}>${oopRemaining.toLocaleString()}</span>
                        </div>
                        <div className={`${styles.calcStep} ${styles.calcStepTotal}`}>
                          <span className={styles.calcStepLabel}>Member cost share due</span>
                          <span className={styles.calcStepValue}>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Custom */}
                  {costShareType === 'custom' && (() => {
                    const customDed = parseFloat(csIndDed) || 0;
                    const dedMet = Math.min(deductibleMet, customDed);
                    const customDedRemaining = Math.max(customDed - dedMet, 0);
                    const postDedAmount = rate > 0 ? Math.max(rate - customDedRemaining, 0) * effectiveCoinsurance : 0;
                    const total = Math.min(customDedRemaining + postDedAmount + copay, oopRemaining);
                    return (
                      <div className={styles.calcSteps}>
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>Custom deductible (individual, from step 3)</span>
                          <span className={styles.calcStepValue}>${customDed.toLocaleString()}</span>
                        </div>
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>Already met this year (from Orbit)</span>
                          <span className={styles.calcStepValue}>− ${dedMet.toLocaleString()}</span>
                        </div>
                        <div className={`${styles.calcStep} ${styles.calcStepSub}`}>
                          <span className={styles.calcStepLabel}>Remaining deductible member owes</span>
                          <span className={styles.calcStepValue}>${customDedRemaining.toLocaleString()}</span>
                        </div>
                        {rate > 0 && customDedRemaining < rate && (
                          <>
                            <div className={styles.calcStep} style={{ marginTop: 8 }}>
                              <span className={styles.calcStepLabel}>Case rate subject to coinsurance</span>
                              <span className={styles.calcStepValue}>${(rate - customDedRemaining).toLocaleString()}</span>
                            </div>
                            <div className={styles.calcStep}>
                              <span className={styles.calcStepLabel}>× {effectiveCoinsurancePct}% coinsurance (entered in step 3)</span>
                              <span className={styles.calcStepValue}>${postDedAmount.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        {copay > 0 && (
                          <div className={styles.calcStep}>
                            <span className={styles.calcStepLabel}>+ Specialist copay (entered in step 3)</span>
                            <span className={styles.calcStepValue}>${copay.toFixed(2)}</span>
                          </div>
                        )}
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>OOP max remaining (cap)</span>
                          <span className={styles.calcStepValue}>${oopRemaining.toLocaleString()}</span>
                        </div>
                        <div className={`${styles.calcStep} ${styles.calcStepTotal}`}>
                          <span className={styles.calcStepLabel}>Member cost share due</span>
                          <span className={styles.calcStepValue}>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Traditional */}
                  {costShareType === 'traditional' && (() => {
                    const freeVisits = parseInt(initialFreeVisits) || 0;
                    const costBefore = parseFloat(csCostBefore) || 0;
                    const postDedAmount = Math.max(rate - dedRemaining, 0) * effectiveCoinsurance;
                    const preDedAmount = Math.min(rate, dedRemaining) > 0 ? costBefore : 0;
                    const total = Math.min(preDedAmount + postDedAmount + copay, oopRemaining);
                    return (
                      <div className={styles.calcSteps}>
                        {freeVisits > 0 && (
                          <div className={styles.calcStep}>
                            <span className={styles.calcStepLabel}>Initial free visits included</span>
                            <span className={styles.calcStepValue}>{freeVisits}</span>
                          </div>
                        )}
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>Cost before deductible (entered in step 3)</span>
                          <span className={styles.calcStepValue}>${costBefore.toFixed(2)}</span>
                        </div>
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>Deductible remaining (from Orbit)</span>
                          <span className={styles.calcStepValue}>${dedRemaining.toLocaleString()}</span>
                        </div>
                        {rate > dedRemaining && (
                          <>
                            <div className={styles.calcStep} style={{ marginTop: 8 }}>
                              <span className={styles.calcStepLabel}>Case rate subject to coinsurance</span>
                              <span className={styles.calcStepValue}>${(rate - dedRemaining).toLocaleString()}</span>
                            </div>
                            <div className={styles.calcStep}>
                              <span className={styles.calcStepLabel}>× {effectiveCoinsurancePct}% after deductible (entered in step 3)</span>
                              <span className={styles.calcStepValue}>${postDedAmount.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        {copay > 0 && (
                          <div className={styles.calcStep}>
                            <span className={styles.calcStepLabel}>+ Specialist copay (entered in step 3)</span>
                            <span className={styles.calcStepValue}>${copay.toFixed(2)}</span>
                          </div>
                        )}
                        <div className={styles.calcStep}>
                          <span className={styles.calcStepLabel}>OOP max remaining (cap)</span>
                          <span className={styles.calcStepValue}>${oopRemaining.toLocaleString()}</span>
                        </div>
                        <div className={`${styles.calcStep} ${styles.calcStepTotal}`}>
                          <span className={styles.calcStepLabel}>Member cost share due</span>
                          <span className={styles.calcStepValue}>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}

                </div>

                <button
                  className={styles.bypassToggle}
                  onClick={() => setBypassExpanded(!bypassExpanded)}
                  type="button"
                >
                  <span>Bypass accumulators</span>
                  <span className={styles.bypassToggleChevron}>{bypassExpanded ? '▲' : '▼'}</span>
                </button>

                {bypassExpanded && <div className={styles.fieldSection}>
                  <p className={styles.fieldSectionLabel}>Override fields <span className={styles.optional}>(use only if Orbit data is unavailable or incorrect)</span></p>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Bypass re-calculation reason</label>
                    <select
                      className={styles.formSelect}
                      value={bypassReason}
                      onChange={(e) => { setBypassReason(e.target.value); setManualOverride(e.target.value !== ''); }}
                    >
                      <option value="">Select a reason…</option>
                      <option value="orbit_unavailable">Orbit data unavailable</option>
                      <option value="carrier_confirmed">Accumulators confirmed via carrier call</option>
                      <option value="prior_year">Prior year billing (coverage ended)</option>
                      <option value="data_error">Data error / incorrect Orbit response</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {manualOverride && (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Override cost ($)</label>
                        <input
                          type="number"
                          className={styles.formInput}
                          placeholder="0.00"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                        />
                      </div>

                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Spent individual deductible ($)</label>
                          <input type="number" className={styles.formInput} placeholder="0.00" value={spentIndDed} onChange={(e) => setSpentIndDed(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Maximum individual deductible ($)</label>
                          <input type="number" className={styles.formInput} placeholder="0.00" value={maxIndDed} onChange={(e) => setMaxIndDed(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Spent family deductible ($)</label>
                          <input type="number" className={styles.formInput} placeholder="0.00" value={spentFamDed} onChange={(e) => setSpentFamDed(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Maximum family deductible ($)</label>
                          <input type="number" className={styles.formInput} placeholder="0.00" value={maxFamDed} onChange={(e) => setMaxFamDed(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Spent individual OOP ($)</label>
                          <input type="number" className={styles.formInput} placeholder="0.00" value={spentIndOop} onChange={(e) => setSpentIndOop(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Maximum individual OOP ($)</label>
                          <input type="number" className={styles.formInput} placeholder="0.00" value={maxIndOop} onChange={(e) => setMaxIndOop(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Spent family OOP ($)</label>
                          <input type="number" className={styles.formInput} placeholder="0.00" value={spentFamOop} onChange={(e) => setSpentFamOop(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Maximum family OOP ($)</label>
                          <input type="number" className={styles.formInput} placeholder="0.00" value={maxFamOop} onChange={(e) => setMaxFamOop(e.target.value)} />
                        </div>
                      </div>

                      <div className={styles.recalcRow}>
                        <Button appearance="primary" onClick={() => {}}>
                          Recalculate
                        </Button>
                      </div>
                    </>
                  )}
                </div>}
              </>
            )}
          </div>
        )}

        {/* ── Review & submit (last step) ── */}
        {((invoiceType === 'recoupment' && step === 3) || (invoiceType === 'cost_share' && step === 4) || (invoiceType === '' && step === 4)) && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Review & submit</h3>
            <p className={styles.stepSubtitle}>
              Review the full invoice details before submitting for approval.
              You cannot approve an invoice you submitted.
            </p>

            <div className={styles.reviewColumns}>
              {/* Left column: what was entered */}
              <div className={styles.reviewCol}>
                <h4 className={styles.reviewColHead}>Invoice inputs</h4>
                <div className={styles.reviewList}>
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>Member</span><span className={styles.reviewVal}>{selectedMember?.name}</span></div>
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>Member ID</span><span className={styles.reviewVal}>{selectedMember?.memberId}</span></div>
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>Client</span><span className={styles.reviewVal}>{selectedMember?.client}</span></div>
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>App registered?</span><span className={styles.reviewVal}>{selectedMember?.app ? 'Yes' : 'No'}</span></div>
                  <div className={styles.reviewDivider} />
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>Invoice type</span><span className={styles.reviewVal}>{invoiceType === 'cost_share' ? 'Member Cost Share' : 'Member Recoupment'}</span></div>
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>Encounter type</span><span className={styles.reviewVal}>{encounterLabel}</span></div>
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>Date of service</span><span className={styles.reviewVal}>{serviceDate}</span></div>
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>Reference #</span><span className={styles.reviewVal}>{refNumber}</span></div>
                  <div className={styles.reviewDivider} />
                  {invoiceType === 'recoupment' &&<div className={styles.reviewItem}><span className={styles.reviewKey}>Repayment amount</span><span className={styles.reviewVal}>${parseFloat(repaymentAmount||'0').toLocaleString('en-US',{minimumFractionDigits:2})}</span></div>}
                  {caseRate && <div className={styles.reviewItem}><span className={styles.reviewKey}>Case rate</span><span className={styles.reviewVal}>${parseFloat(caseRate).toLocaleString('en-US',{minimumFractionDigits:2})}</span></div>}
                  {caseNumber && <div className={styles.reviewItem}><span className={styles.reviewKey}>Case number</span><span className={styles.reviewVal}>{caseNumber}</span></div>}
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>Due date</span><span className={styles.reviewVal}>{dueDate}</span></div>
                  <div className={styles.reviewDivider} />
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>Submitted by</span><span className={styles.reviewVal}>Brandi Breshears</span></div>
                </div>
              </div>

              {/* Right column: what was calculated */}
              <div className={styles.reviewCol}>
                <h4 className={styles.reviewColHead}>Calculation result</h4>
                <div className={styles.reviewList}>
                  {invoiceType === 'cost_share' && costShareType && (
                    <>
                      <div className={styles.reviewItem}><span className={styles.reviewKey}>Cost share type</span><span className={`${styles.reviewVal} ${styles.reviewBadge}`}>{availableTypes.find(t => t.value === costShareType)?.label ?? costShareType}</span></div>
                      {costShareType !== 'waived' && costShareType !== 'fixed_cost' && (
                        <>
                          <div className={styles.reviewItem}><span className={styles.reviewKey}>Deductible met</span><span className={styles.reviewVal}>${deductibleMet.toLocaleString()} / ${deductibleMax.toLocaleString()}</span></div>
                          <div className={styles.reviewItem}><span className={styles.reviewKey}>OOP met</span><span className={styles.reviewVal}>${oopMet.toLocaleString()} / ${oopMax.toLocaleString()}</span></div>
                          <div className={styles.reviewItem}><span className={styles.reviewKey}>Coinsurance rate</span><span className={styles.reviewVal}>{effectiveCoinsurancePct}%</span></div>
                          <div className={styles.reviewItem}><span className={styles.reviewKey}>Specialist copay</span><span className={styles.reviewVal}>${copay}</span></div>
                        </>
                      )}
                      {costShareType === 'fixed_cost' && (
                        <div className={styles.reviewItem}><span className={styles.reviewKey}>Fixed amount</span><span className={styles.reviewVal}>${parseFloat(csFixedAmount||'0').toLocaleString('en-US',{minimumFractionDigits:2})}</span></div>
                      )}
                      {manualOverride && bypassReason && (
                        <div className={styles.reviewItem}><span className={styles.reviewKey}>Bypass reason</span><span className={styles.reviewVal}>{bypassReason}</span></div>
                      )}
                    </>
                  )}
                  {invoiceType === 'recoupment' && (
                    <div className={styles.reviewItem}><span className={styles.reviewKey}>Billing model</span><span className={styles.reviewVal}>Fixed recoupment — no accumulator check</span></div>
                  )}
                </div>

                <div className={styles.invoiceAmountBox}>
                  <div className={styles.invoiceAmountLabel}>Invoice amount</div>
                  <div className={styles.invoiceAmountValue}>
                    ${parseFloat(finalAmount||'0').toLocaleString('en-US',{minimumFractionDigits:2})}
                  </div>
                  {invoiceType === 'cost_share' && !manualOverride && costShareType !== 'waived' && (
                    <button className={styles.recalcLink} onClick={() => setStep(3)} type="button">
                      ← Recalculate
                    </button>
                  )}
                  {costShareType === 'waived' && (
                    <div className={styles.invoiceAmountNote}>Cost-share waived by client</div>
                  )}
                  {manualOverride && (
                    <div className={styles.invoiceAmountNote}>Manual override applied</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation + step bar */}
      <div className={styles.bottomBar}>
        {/* Step indicator */}
        <div className={styles.stepBarRow}>
          {effectiveSteps.map((label, i) => (
            <React.Fragment key={label}>
              <div className={styles.stepBarItem}>
                <div className={`${styles.stepBarCircle} ${(isCorrection && i === 0) || i < step ? styles.stepDone : i === step ? styles.stepActive : styles.stepFuture}`}>
                  {(isCorrection && i === 0) || i < step ? <CheckIcon className={styles.checkIcon} /> : i + 1}
                </div>
                <span className={`${styles.stepBarLabel} ${i === step ? styles.stepLabelActive : ''}`}>
                  {label.toUpperCase()}
                </span>
              </div>
              {i < effectiveSteps.length - 1 && (
                <div className={`${styles.stepConnector} ${i < step ? styles.stepConnectorDone : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Action buttons */}
        <div className={styles.wizardNav}>
          <div>
            {step > minStep && (
              <Button appearance="secondary" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <div className={styles.wizardNavRight}>
            <Button appearance="ghost" onClick={() => navigate('/billing')}>
              Discard
            </Button>
            {/* In a real implementation Save as Draft would persist wizard state */}
            <Button appearance="secondary" onClick={() => navigate('/billing')} disabled={step === 0}>
              Save as Draft
            </Button>
            {step === 0 ? null : step < totalSteps - 1 ? (
              <Button appearance="primary" onClick={handleNext} disabled={!canProceed}>
                Continue
              </Button>
            ) : (
              <Button appearance="primary" onClick={handleSubmit}>
                Submit for approval
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
