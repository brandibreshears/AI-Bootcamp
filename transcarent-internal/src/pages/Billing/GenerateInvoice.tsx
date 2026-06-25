import React, { useState, useEffect } from 'react';
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

// Maps billingType display strings stored on Invoice â†’ costShareType option values
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

function addBusinessDays(startDate: string, days: number): string {
  if (!startDate) return '';
  const date = new Date(startDate);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return date.toISOString().split('T')[0];
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
      operationDate?: string;
      invoiceType?: 'cost_share' | 'recoupment';
      operationCostInCents?: number;
      salesforceCaseNumber?: string;
      deductibleMet?: number;
      deductibleMax?: number;
      oopMet?: number;
      oopMax?: number;
      coinsurancePct?: number;
      copay?: number;
      billingType?: string;
      innDedAmount?: number;
      innOopAmount?: number;
      caseId?: string;
      salesforceInvoiceId?: string;
      invoiceTitle?: string;
      invoiceDescription?: string;
      serviceDescription?: string;
      facilityName?: string;
    }
  } | null)?.invoice;
  const correctionNote = existingInvoice?.correctionNote;
  const isCorrection = !!existingInvoice;

  // Start at step 1 when editing a correction-required invoice (skip member selection)
  const [step, setStep] = useState(isCorrection ? 1 : 0);
  const [selectedMember, setSelectedMember] = useState<typeof mockMemberResults[0] | null>(null);

  // Step 0 â€” Member search
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

  // Step 1 â€” Care experience selection
  const [invoiceType, setInvoiceType] = useState<'cost_share' | 'recoupment' | ''>(existingInvoice?.invoiceType ?? '');
  // Encounter type is locked to surgery in current release
  const encounter = 'surgery';
  const [operationDate, setOperationDate] = useState(existingInvoice?.operationDate ?? '');
  const [refNumber] = useState(generateRefNumber());
  const [salesforceCaseId, setSalesforceCaseId] = useState(existingInvoice?.caseId ?? '');
  const [salesforceInvoiceId, setSalesforceInvoiceId] = useState(existingInvoice?.salesforceInvoiceId ?? '');
  const [invoiceTitle, setInvoiceTitle] = useState(existingInvoice?.invoiceTitle ?? '');
  const [invoiceDescription, setInvoiceDescription] = useState(existingInvoice?.invoiceDescription ?? '');
  const [serviceDescription, setServiceDescription] = useState(existingInvoice?.serviceDescription ?? '');
  const [facilityName, setFacilityName] = useState(existingInvoice?.facilityName ?? '');
  const [dueDate, setDueDate] = useState('');

  // Auto-calculate due date as 30 business days from operationDate
  useEffect(() => {
    if (operationDate) {
      setDueDate(addBusinessDays(operationDate, 30));
    }
  }, [operationDate]);

  // Step 2 â€” Invoice details (fields differ by invoice type)
  // Cost Share fields
  const [csPeriodStart, setCsPeriodStart] = useState('2026-01-01');
  const [csPeriodEnd, setCsPeriodEnd] = useState('2026-12-31');
  const [csPeriodExpanded, setCsPeriodExpanded] = useState(false);
  const [csCopay, setCsCopay] = useState(existingInvoice?.copay != null ? String(existingInvoice.copay) : '');
  // maxMemberCost reserved for future OOP cap override
  const [operationCostInCents, setOperationCostInCents] = useState(existingInvoice?.operationCostInCents != null ? String(existingInvoice.operationCostInCents) : '');
  const [salesforceCaseNumber, setSalesforceCaseNumber] = useState(existingInvoice?.salesforceCaseNumber ?? '');
  // EOB fields (conditionally shown)
  const [eobOn, setEobOn] = useState(false);
  // Recoupment fields
  const [repaymentAmount, setRepaymentAmount] = useState('');

  // Step 3 â€” Cost share type & accumulator (cost_share only)
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


  const [submitting, setSubmitting] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState(0);
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

  // Accumulator override section (step 3)
  const [showOverrides, setShowOverrides] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideDetails, setOverrideDetails] = useState('');

  // Orbit mock accumulators — prefer values from existing invoice when editing (all in cents)
  const deductibleMet = existingInvoice?.deductibleMet ?? 150000;
  const deductibleMax = existingInvoice?.deductibleMax ?? 300000;
  const oopMet = existingInvoice?.oopMet ?? 280000;
  const oopMax = existingInvoice?.oopMax ?? 600000;

  // Coinsurance % derives from Step 3 billing type configuration
  const coinsurancePct =
    costShareType === 'irs_minimums' ? (parseFloat(csCoinsurance) || 0)
    : costShareType === 'same_as_insurance' ? 0   // read-only from insurance plan (shown as 0%)
    : costShareType === 'custom' ? (parseFloat(csCoinsurance) || 0)
    : costShareType === 'traditional' ? (parseFloat(csCostAfter) || 0)
    : 0;
  const effectiveCoinsurancePct = coinsurancePct;
  const effectiveCoinsurance = effectiveCoinsurancePct / 100;

  // Copay comes from Step 3 input â€” defaults to 0 if not entered
  const copay = parseFloat(csCopay) || 0;

  const rate = parseFloat(operationCostInCents) || 0;
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
    { value: 'waived', label: 'Waived', desc: 'Client has waived cost-share â€” no member fee regardless of accumulator status.' },
    { value: 'irs_minimum', label: 'IRS Minimum', desc: 'Minimum cost required for HDHPs per IRS rules. Deductible values are pulled from IRS tables.' },
    { value: 'insurance', label: 'Insurance', desc: 'Charges based on the member\'s regular insurance plan rules. Values are read-only from the insurance plan.' },
    { value: 'custom', label: 'Custom', desc: 'Custom deductibles and coinsurance set by the client, independent of the regular insurance plan.' },
  ];

  const otherModelTypes = [
    { value: 'waived', label: 'Waived', desc: 'Client has waived cost-share â€” no member fee regardless of accumulator status.' },
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
    ? !!(costShareType !== '' && dueDate && operationDate && encounter)
    : !!(repaymentAmount && dueDate && operationDate && encounter);

  const minStep = isCorrection ? 1 : 0;

  const canProceed =
    (step === 0 && (isCorrection || (searchPerformed && selectedMember !== null))) ||
    (step === 1 && invoiceType !== '' && encounter && operationDate) ||
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

  const handleCalculate = async () => {
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    // Mock: calculate cost from operationCostInCents using coinsurance
    const coinsurance = coinsurancePct / 100;
    const mock = Math.round(rate * coinsurance);
    setCalculatedCost(mock > 0 ? mock : rate);
    setSubmitting(false);
    setCalculated(true);
  };

  const encounterLabel = 'Surgery';

  return (
    <div className={step === 0 ? styles.pageWide : styles.page}>
      <div className={styles.header}>
        <button className={styles.backLink} onClick={() => navigate('/billing')}>
          â† Back to Member payments
        </button>
        <h2 className={styles.pageTitle}>Generate invoice by member</h2>
      </div>

      {/* Correction note banner â€” shown on all steps when reopening a correction-required invoice */}
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

        {/* â”€â”€ Step 0: Select member â€” split layout â”€â”€ */}
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
                <span className={styles.advancedChevron}>{advancedOpen ? 'â–²' : 'â–¼'}</span>
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
                              ? <span className={styles.iconYes}>âœ“</span>
                              : <span className={styles.iconNo}>âœ•</span>}
                          </td>
                          <td>
                            {m.app
                              ? <span className={styles.iconYes}>âœ“</span>
                              : <span className={styles.iconNo}>âœ•</span>}
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

        {/* â”€â”€ Step 1: Care experience selection â”€â”€ */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Care experience selection</h3>
            <p className={styles.stepSubtitle}>Choose the invoice template type and care program for this member.</p>

            {/* Locked member banner â€” only shown when editing a correction-required invoice */}
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
                  ðŸ”’ Member locked
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
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#4C4A64', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    Encounter Type
                  </label>
                  <div style={{ padding: '10px 14px', background: '#EEEDF5', borderRadius: '8px', fontSize: '14px', color: '#18162F', border: '1px solid #D6D5DF' }}>
                    Surgery
                    <span style={{ fontSize: '11px', color: '#4C4A64', marginLeft: '8px' }}>(current release: surgery only)</span>
                  </div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date of service <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={operationDate}
                  onChange={(e) => setOperationDate(e.target.value)}
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4C4A64', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Invoice Title <span style={{ color: '#C62828' }}>*</span>
              </label>
              <input
                type="text"
                value={invoiceTitle}
                onChange={e => setInvoiceTitle(e.target.value)}
                placeholder="e.g. Surgery Cost Share â€” Knee Replacement"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D5DF', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4C4A64', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Service Description <span style={{ color: '#C62828' }}>*</span>
              </label>
              <input
                type="text"
                value={serviceDescription}
                onChange={e => setServiceDescription(e.target.value)}
                placeholder="e.g. Total knee replacement at Cancer COE"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D5DF', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4C4A64', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Facility Name <span style={{ color: '#C62828' }}>*</span>
              </label>
              <input
                type="text"
                value={facilityName}
                onChange={e => setFacilityName(e.target.value)}
                placeholder="e.g. Texas Medical Center"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D5DF', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4C4A64', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Salesforce Case ID <span style={{ color: '#C62828' }}>*</span>
              </label>
              <input
                type="text"
                value={salesforceCaseId}
                onChange={e => setSalesforceCaseId(e.target.value)}
                placeholder="Salesforce Case ID"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D5DF', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4C4A64', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Salesforce Invoice ID <span style={{ color: '#C62828' }}>*</span>
              </label>
              <input
                type="text"
                value={salesforceInvoiceId}
                onChange={e => setSalesforceInvoiceId(e.target.value)}
                placeholder="Salesforce Invoice ID"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D5DF', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}

        {/* â”€â”€ Step 2: Invoice details (Cost Share) â”€â”€ */}
        {step === 2 && invoiceType === 'cost_share' && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Invoice details â€” Member cost share</h3>
            <p className={styles.stepSubtitle}>Enter invoice details and configure the billing type for this member.</p>

            {/* Cost share period */}
            {isPreconfigured ? (
              <div className={styles.csPeriodPill} onClick={() => setCsPeriodExpanded(v => !v)} role="button" tabIndex={0} onKeyDown={e => e.key === ' ' && setCsPeriodExpanded(v => !v)}>
                <div className={styles.csPeriodPillInner}>
                  <div>
                    <p className={styles.csPeriodLabel}>Viewing cost share period</p>
                    <p className={styles.csPeriodValue}>
                      {new Date(csPeriodStart + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                      {' â€“ '}
                      {new Date(csPeriodEnd + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`${styles.csPeriodChevron} ${csPeriodExpanded ? styles.csPeriodChevronOpen : ''}`}>â–¾</span>
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4C4A64', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Due Date <span style={{ color: '#C62828' }}>*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D5DF', fontSize: '14px', boxSizing: 'border-box' }}
              />
              <div style={{ fontSize: '11px', color: '#4C4A64', marginTop: '4px' }}>Auto-set to 30 business days from surgery date. Adjust if needed.</div>
            </div>

            {/* Billing type section */}
            <div className={styles.fieldSection}>
              <p className={styles.fieldSectionLabel}>
                Billing type
                {isPreconfigured
                  ? <span className={styles.configBadge}>Configuration loaded</span>
                  : <span className={styles.required}> * Required â€” no configuration found for this encounter type</span>
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
                  <option value="">Select billing typeâ€¦</option>
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
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>âœ“</span>
                      Uses deductible status for cost share
                    </div>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>âœ“</span>
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
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>âœ“</span>
                      Uses deductible status for cost share
                    </div>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>âœ“</span>
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
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>âœ“</span>
                      Uses deductible status for cost share
                    </div>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>âœ“</span>
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
                      <span className={`${styles.csStatusIcon} ${styles.csStatusRed}`}>âœ•</span>
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
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>âœ“</span>
                      Uses deductible status for cost share
                    </div>
                    <div className={styles.csStatus}>
                      <span className={`${styles.csStatusIcon} ${styles.csStatusGreen}`}>âœ“</span>
                      Uses out of pocket status for cost share
                    </div>
                  </div>
                </>
              )}
            </div>

            {isSurgery && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Operation cost (Â¢)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    placeholder="0"
                    value={operationCostInCents}
                    onChange={(e) => setOperationCostInCents(e.target.value)}
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
                  <label className={styles.formLabel}>Salesforce case number</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. TC-100842"
                    value={salesforceCaseNumber}
                    onChange={(e) => setSalesforceCaseNumber(e.target.value)}
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
                  <label className={styles.formLabel}>Salesforce case number <span className={styles.optional}>(situational)</span></label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Leave blank if not applicable"
                    value={salesforceCaseNumber}
                    onChange={(e) => setSalesforceCaseNumber(e.target.value)}
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

        {/* â”€â”€ Step 2: Invoice details (Recoupment) â”€â”€ */}
        {step === 2 && invoiceType === 'recoupment' && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Invoice details â€” Member recoupment</h3>
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
                <p className={styles.fieldHint}>Auto-set to 30 business days from surgery date. Adjust if needed.</p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Salesforce case number <span className={styles.optional}>(situational)</span></label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Leave blank if not applicable"
                value={salesforceCaseNumber}
                onChange={(e) => setSalesforceCaseNumber(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* â”€â”€ Step 3: Accumulator check (cost_share only) â”€â”€ */}
        {step === 3 && invoiceType === 'cost_share' && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Accumulator status check</h3>
            <p className={styles.stepSubtitle}>
              Orbit accumulator data for {selectedMember?.name} â€” {availableTypes.find(t => t.value === costShareType)?.label ?? 'billing type not set'} â€” benefit year 2026.
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
                          <span className={styles.calcStepValue}>âˆ’ ${deductibleMet.toLocaleString()}</span>
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
                              <span className={styles.calcStepLabel}>Ã— {effectiveCoinsurancePct}% coinsurance (entered in step 3)</span>
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
                          <span className={styles.calcStepValue}>âˆ’ ${deductibleMet.toLocaleString()}</span>
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
                              <span className={styles.calcStepLabel}>Ã— {effectiveCoinsurancePct}% coinsurance (from insurance plan)</span>
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
                          <span className={styles.calcStepValue}>âˆ’ ${dedMet.toLocaleString()}</span>
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
                              <span className={styles.calcStepLabel}>Ã— {effectiveCoinsurancePct}% coinsurance (entered in step 3)</span>
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
                              <span className={styles.calcStepLabel}>Ã— {effectiveCoinsurancePct}% after deductible (entered in step 3)</span>
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
                  <span className={styles.bypassToggleChevron}>{bypassExpanded ? 'â–²' : 'â–¼'}</span>
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
                      <option value="">Select a reasonâ€¦</option>
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

                {/* Override accumulator values section */}
                <div style={{ marginTop: '16px', borderTop: '1px solid #D6D5DF', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowOverrides(!showOverrides)}
                    style={{ background: 'none', border: 'none', color: '#5651BD', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    {showOverrides ? 'â–¾' : 'â–¸'} Override accumulator values (Orbit unavailable)
                  </button>
                  {showOverrides && (
                    <div style={{ marginTop: '12px', background: '#FFF3CD', border: '1.5px solid #F9A825', borderRadius: '10px', padding: '14px 24px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#7A4F00', marginBottom: '10px' }}>Manual accumulator override</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        {[
                          { label: 'Spent Individual Deductible', key: 'spentIndDed' },
                          { label: 'Max Individual Deductible', key: 'maxIndDed' },
                          { label: 'Spent Family Deductible', key: 'spentFamDed' },
                          { label: 'Max Family Deductible', key: 'maxFamDed' },
                          { label: 'Spent Individual OOP', key: 'spentIndOop' },
                          { label: 'Max Individual OOP', key: 'maxIndOop' },
                          { label: 'Spent Family OOP', key: 'spentFamOop' },
                          { label: 'Max Family OOP', key: 'maxFamOop' },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#7A4F00', display: 'block', marginBottom: '4px' }}>{f.label} (Â¢)</label>
                            <input type="number" min="0" placeholder="0" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #F9A825', fontSize: '13px', boxSizing: 'border-box' }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#7A4F00', display: 'block', marginBottom: '4px' }}>Override reason *</label>
                        <select value={overrideReason} onChange={e => setOverrideReason(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #F9A825', fontSize: '13px' }}>
                          <option value="">Select reasonâ€¦</option>
                          <option value="EligibilityTiering">Eligibility Tiering</option>
                          <option value="NonEmbeddedPlanIndividualCoverage">Non-Embedded Plan with individual coverage</option>
                          <option value="NoMemberIdAvailable">No Member ID available</option>
                          <option value="InvalidHealthPlanPlaceholderOrPriorYear">Invalid Health Plan (placeholder or prior year)</option>
                          <option value="HealthPlanConfigurationIssue">Health Plan Configuration Issue</option>
                          <option value="CostShareConfigurationIssue">Cost Share Configuration Issue</option>
                          <option value="NoAccumulatorDataViaOrbit">No Accumulator data available via Orbit</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      {overrideReason === 'Other' && (
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 600, color: '#7A4F00', display: 'block', marginBottom: '4px' }}>Additional details *</label>
                          <textarea value={overrideDetails} onChange={e => setOverrideDetails(e.target.value)} rows={2} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #F9A825', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* â”€â”€ Review & submit (last step) â”€â”€ */}
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
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>Date of service</span><span className={styles.reviewVal}>{operationDate}</span></div>
                  <div className={styles.reviewItem}><span className={styles.reviewKey}>Reference #</span><span className={styles.reviewVal}>{refNumber}</span></div>
                  <div className={styles.reviewDivider} />
                  {invoiceType === 'recoupment' &&<div className={styles.reviewItem}><span className={styles.reviewKey}>Repayment amount</span><span className={styles.reviewVal}>{formatCents(Math.round(parseFloat(repaymentAmount||'0') * 100))}</span></div>}
                  {operationCostInCents && <div className={styles.reviewItem}><span className={styles.reviewKey}>Operation cost</span><span className={styles.reviewVal}>{formatCents(Math.round(parseFloat(operationCostInCents)))}</span></div>}
                  {salesforceCaseNumber && <div className={styles.reviewItem}><span className={styles.reviewKey}>Salesforce case number</span><span className={styles.reviewVal}>{salesforceCaseNumber}</span></div>}
                  {salesforceCaseId && <div className={styles.reviewItem}><span className={styles.reviewKey}>Salesforce case ID</span><span className={styles.reviewVal}>{salesforceCaseId}</span></div>}
                  {salesforceInvoiceId && <div className={styles.reviewItem}><span className={styles.reviewKey}>Salesforce invoice ID</span><span className={styles.reviewVal}>{salesforceInvoiceId}</span></div>}
                  {invoiceTitle && <div className={styles.reviewItem}><span className={styles.reviewKey}>Invoice title</span><span className={styles.reviewVal}>{invoiceTitle}</span></div>}
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
                    <div className={styles.reviewItem}><span className={styles.reviewKey}>Billing model</span><span className={styles.reviewVal}>Fixed recoupment â€” no accumulator check</span></div>
                  )}
                </div>

                <div className={styles.invoiceAmountBox}>
                  <div className={styles.invoiceAmountLabel}>Invoice amount</div>
                  <div className={styles.invoiceAmountValue}>
                    ${parseFloat(finalAmount||'0').toLocaleString('en-US',{minimumFractionDigits:2})}
                  </div>
                  {invoiceType === 'cost_share' && !manualOverride && costShareType !== 'waived' && (
                    <button className={styles.recalcLink} onClick={() => setStep(3)} type="button">
                      â† Recalculate
                    </button>
                  )}
                  {costShareType === 'waived' && (
                    <div className={styles.invoiceAmountNote}>Cost-share waived by client</div>
                  )}
                  {manualOverride && (
                    <div className={styles.invoiceAmountNote}>Manual override applied</div>
                  )}
                </div>

                {/* Calculate â†’ Review â†’ Approve two-phase flow */}
                <div style={{ marginTop: '20px' }}>
                  {!calculated ? (
                    <div>
                      <div style={{ background: '#E8F4FD', border: '1.5px solid #1565C0', borderRadius: '10px', padding: '14px 24px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#1565C0', marginBottom: '6px' }}>Ready to calculate</div>
                        <p style={{ fontSize: '14px', color: '#18162F', margin: 0 }}>
                          Click Calculate to run the cost share calculation. You'll review the result before the invoice is issued.
                        </p>
                      </div>
                      <Button appearance="primary" onClick={handleCalculate} disabled={submitting}>
                        {submitting ? 'Calculatingâ€¦' : 'Calculate invoice'}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ background: '#EAF3DE', border: '1.5px solid #2E7D32', borderRadius: '10px', padding: '14px 24px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#2E7D32', marginBottom: '6px' }}>Calculation complete</div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#18162F', marginBottom: '4px' }}>{formatCents(calculatedCost)}</div>
                        <p style={{ fontSize: '13px', color: '#4C4A64', margin: 0 }}>Member cost share â€” review then approve to issue the invoice.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Button appearance="primary" onClick={handleSubmit} disabled={submitting}>
                          {submitting ? 'Processingâ€¦' : isCorrection ? 'Resubmit invoice' : 'Approve & issue invoice'}
                        </Button>
                        <Button appearance="secondary" onClick={() => setCalculated(false)}>
                          Recalculate
                        </Button>
                      </div>
                    </div>
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
