import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ClientSetupWizard.module.css';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { ToastContainer, useToast } from '../../components/ui/Toast';

// --- Types ---

interface BillingContact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  primary: boolean;
}

interface CaseRate {
  service: string;
  rate: string;
  unit: string;
}

interface UploadedDoc {
  name: string;
  type: 'MSA' | 'SOW' | 'Amendment' | 'W-9' | 'ACH Authorization' | 'Debit Authorization' | 'Performance Guarantee' | 'Other';
  size: string;
  uploadedAt: string;
}

interface SetupForm {
  // Step 1: Documents
  uploadedDocs: UploadedDoc[];
  aiScanned: boolean;

  // Step 2: Client & Contract Terms
  clientName: string;
  legalEntity: string;
  contractStart: string;
  contractEnd: string;
  autoRenews: boolean;
  renewalNoticeDays: string;
  renewalTermMonths: string;
  notes: string;

  // Step 3: Fee Structure
  implementationFee: string;
  implementationWaived: boolean;
  implementationTerms: string;
  pepmRate: string;
  pepmTerms: string;
  hdhpPct: string;
  enrolledMembers: string;
  caseRates: CaseRate[];
  // Travel pass-through
  travelPassThrough: boolean;
  travelPassThroughNotes: string;
  travelPassThroughCap: string;
  // Member incentives
  memberIncentivesIncluded: boolean;
  memberIncentiveAmount: string;
  memberIncentiveTypes: string;
  memberIncentiveCap: string;

  // Step 4: Billing Contacts
  billingContacts: BillingContact[];

  // Step 5: Payment Accounts
  w9OnFile: boolean;
  w9Date: string;
  w9Doc: UploadedDoc | null;
  achAccountName: string;
  achRoutingNumber: string;
  achAccountNumber: string;
  achBankName: string;
  achAuthDoc: UploadedDoc | null;
  debitAccountName: string;
  debitRoutingNumber: string;
  debitAccountNumber: string;
  debitBankName: string;
  debitAuthDoc: UploadedDoc | null;
  selfBilling: boolean;
  selfBillingContact: string;
  billingDocs: UploadedDoc[];
}

// Standard billable service types — organized by care category
// Derived from SOW contracts and WayFinding Plus product suite
export const SERVICE_TYPE_OPTIONS: { group: string; services: { label: string; defaultUnit: string }[] }[] = [
  {
    group: 'Surgery & MSK',
    services: [
      { label: 'Surgery at COE — Care Management Fee', defaultUnit: '% of case rate' },
      { label: 'Expert Opinion — Surgery/MSK', defaultUnit: 'Per written opinion' },
      { label: 'Orthopedic Consult', defaultUnit: 'Per diagnostic exam' },
      { label: 'Virtual Physical Therapy', defaultUnit: 'Per 12-month episode' },
    ],
  },
  {
    group: 'Cancer Care',
    services: [
      { label: 'Cancer Care at COE — Care Management Fee', defaultUnit: '% of case rate' },
      { label: 'Chemotherapy — Care Management Fee', defaultUnit: '% of case rate' },
      { label: 'Radiation Therapy — Care Management Fee', defaultUnit: '% of case rate' },
      { label: 'Expert Opinion — Oncology', defaultUnit: 'Per written opinion' },
    ],
  },
  {
    group: 'Weight Health',
    services: [
      { label: 'Weight Health Program — Bundled Rate', defaultUnit: 'Per episode' },
    ],
  },
  {
    group: 'Behavioral Health',
    services: [
      { label: 'Behavioral Health Case Management', defaultUnit: 'Per episode' },
      { label: 'Virtual Mental Health Therapy', defaultUnit: 'Per session' },
    ],
  },
  {
    group: 'Care Management & UM',
    services: [
      { label: 'Complex Case Management', defaultUnit: 'Per member per month' },
      { label: 'Utilization Management', defaultUnit: 'Per member per month' },
      { label: 'Member Services', defaultUnit: 'Per member per month' },
      { label: 'Provider Services', defaultUnit: 'Per member per month' },
    ],
  },
  {
    group: 'Standalone Products',
    services: [
      { label: '98point6 by Transcarent (Virtual Primary Care)', defaultUnit: 'Per member per month' },
      { label: 'Centers of Excellence (COE) — Standard Access', defaultUnit: 'Per episode' },
      { label: 'Pharmacy Care (PBM Add-On)', defaultUnit: 'Per member per month' },
    ],
  },
];

const ALL_SERVICE_LABELS = SERVICE_TYPE_OPTIONS.flatMap(g => g.services.map(s => s.label));

const DEFAULT_CASE_RATES: CaseRate[] = [
  { service: 'Surgery at COE — Care Management Fee', rate: '20', unit: '% of case rate' },
  { service: 'Expert Opinion — Surgery/MSK', rate: '', unit: 'Per written opinion' },
  { service: 'Orthopedic Consult', rate: '', unit: 'Per diagnostic exam' },
  { service: 'Virtual Physical Therapy', rate: '', unit: 'Per 12-month episode' },
];

const EMPTY_FORM: SetupForm = {
  uploadedDocs: [],
  aiScanned: false,
  clientName: '',
  legalEntity: '',
  contractStart: '',
  contractEnd: '',
  autoRenews: false,
  renewalNoticeDays: '90',
  renewalTermMonths: '12',
  notes: '',
  implementationFee: '',
  implementationWaived: false,
  implementationTerms: 'Net 30',
  pepmRate: '',
  pepmTerms: 'Net 30',
  hdhpPct: '',
  enrolledMembers: '',
  caseRates: DEFAULT_CASE_RATES,
  travelPassThrough: true,
  travelPassThroughNotes: 'Airfare, hotel, and ground transportation for member and one companion. Billed at cost with no markup.',
  travelPassThroughCap: '',
  memberIncentivesIncluded: false,
  memberIncentiveAmount: '',
  memberIncentiveTypes: '',
  memberIncentiveCap: '',
  billingContacts: [
    { id: '1', name: '', title: '', email: '', phone: '', primary: true },
  ],
  w9OnFile: false,
  w9Date: '',
  w9Doc: null,
  achAccountName: '',
  achRoutingNumber: '',
  achAccountNumber: '',
  achBankName: '',
  achAuthDoc: null,
  debitAccountName: '',
  debitRoutingNumber: '',
  debitAccountNumber: '',
  debitBankName: '',
  debitAuthDoc: null,
  selfBilling: false,
  selfBillingContact: '',
  billingDocs: [],
};

// AI-extracted mock data (simulates what scanning a Vincit-style SOW would return)
const AI_EXTRACTED: Partial<SetupForm> = {
  clientName: 'Vincit Group',
  legalEntity: 'Vincit Group, Inc.',
  contractStart: '2025-01-01',
  contractEnd: '2025-12-31',
  autoRenews: true,
  renewalNoticeDays: '90',
  renewalTermMonths: '12',
  implementationFee: '10000',
  implementationWaived: false,
  implementationTerms: 'Net 30',
  pepmRate: '8.00',
  pepmTerms: 'Net 30',
  hdhpPct: '69',
  enrolledMembers: '974',
  caseRates: [
    { service: 'Surgery at COE — Care Management Fee', rate: '20', unit: '% of case rate' },
    { service: 'Expert Opinion — Surgery/MSK', rate: '1800', unit: 'Per written opinion' },
    { service: 'Orthopedic Consult', rate: '285', unit: 'Per diagnostic exam' },
    { service: 'Virtual Physical Therapy', rate: '', unit: 'Per 12-month episode' },
  ],
  travelPassThrough: true,
  memberIncentivesIncluded: false,
  billingContacts: [
    { id: '1', name: 'Candace Wiley', title: 'Accounts Payable Manager', email: 'candace.wiley@vincitgroup.com', phone: '', primary: true },
    { id: '2', name: 'Lakeisha Scotton', title: 'Finance Director', email: 'lakeisha.scotton@vincitgroup.com', phone: '', primary: false },
  ],
};

const STEPS = [
  { number: 1, label: 'Contract Documents' },
  { number: 2, label: 'Client & Contract Terms' },
  { number: 3, label: 'Fee Structure' },
  { number: 4, label: 'Billing Contacts' },
  { number: 5, label: 'Payment Accounts' },
  { number: 6, label: 'Review & Save' },
];

function fmt(v: string) {
  const n = parseFloat(v);
  if (isNaN(n)) return v || '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// --- Main Component ---

export default function ClientSetupWizard() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SetupForm>({ ...EMPTY_FORM });
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const w9InputRef = useRef<HTMLInputElement>(null);
  const achInputRef = useRef<HTMLInputElement>(null);
  const debitInputRef = useRef<HTMLInputElement>(null);
  const billingDocsInputRef = useRef<HTMLInputElement>(null);

  const fileToDoc = (f: File, type: UploadedDoc['type']): UploadedDoc => ({
    name: f.name,
    type,
    size: f.size < 1024 * 1024
      ? `${(f.size / 1024).toFixed(0)} KB`
      : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  });

  const set = (field: keyof SetupForm, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // --- Document scanning simulation ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newDocs: UploadedDoc[] = files.map(f => ({
      name: f.name,
      type: f.name.toLowerCase().includes('msa') ? 'MSA'
        : f.name.toLowerCase().includes('sow') || f.name.toLowerCase().includes('amendment') ? 'SOW'
        : 'Other',
      size: `${(f.size / 1024).toFixed(0)} KB`,
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));
    set('uploadedDocs', [...form.uploadedDocs, ...newDocs]);
    if (e.target) e.target.value = '';
  };

  const handleAIScan = () => {
    setScanning(true);
    setScanProgress(0);
    setScanComplete(false);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          setScanComplete(true);
          setForm(prev => ({ ...prev, ...AI_EXTRACTED, aiScanned: true }));
          return 100;
        }
        return prev + Math.random() * 18;
      });
    }, 220);
  };

  // --- Billing contacts ---
  const addContact = () => {
    set('billingContacts', [
      ...form.billingContacts,
      { id: Date.now().toString(), name: '', title: '', email: '', phone: '', primary: false },
    ]);
  };

  const removeContact = (id: string) => {
    set('billingContacts', form.billingContacts.filter(c => c.id !== id));
  };

  const updateContact = (id: string, field: keyof BillingContact, value: string | boolean) => {
    set('billingContacts', form.billingContacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const setPrimaryContact = (id: string) => {
    set('billingContacts', form.billingContacts.map(c => ({ ...c, primary: c.id === id })));
  };

  // --- Case rates ---
  const updateCaseRate = (i: number, field: keyof CaseRate, value: string) => {
    const updated = [...form.caseRates];
    updated[i] = { ...updated[i], [field]: value };
    set('caseRates', updated);
  };

  const addCaseRate = () => {
    set('caseRates', [...form.caseRates, { service: '', rate: '', unit: '' }]);
  };

  const removeCaseRate = (i: number) => {
    set('caseRates', form.caseRates.filter((_, idx) => idx !== i));
  };

  const handleSave = () => {
    addToast('success', `Client setup for ${form.clientName || 'new client'} saved successfully.`);
    setTimeout(() => navigate('/billing/client-invoicing'), 1200);
  };

  const canProceed = () => {
    if (step === 2) return form.clientName.trim() !== '';
    return true;
  };

  // --- Compliance status (drives bar on every step) ---
  const compliance = {
    contractDates: !!(form.contractStart && form.contractEnd),
    feeStructure: !!(form.pepmRate || form.caseRates.some(cr => cr.rate)),
    billingContact: form.billingContacts.some(c => c.name && c.email),
    w9: form.w9OnFile,
    achAccount: !!(form.achRoutingNumber && form.achAccountNumber) || form.selfBilling,
  };
  const complianceItems = [
    { label: 'Contract Dates', ok: compliance.contractDates },
    { label: 'Fee Structure', ok: compliance.feeStructure },
    { label: 'Billing Contact', ok: compliance.billingContact },
    { label: 'W-9 on File', ok: compliance.w9 },
    { label: 'Payment Account', ok: compliance.achAccount },
  ];
  const readyToInvoice = Object.values(compliance).every(Boolean);

  // --- Render steps ---

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <button className={styles.backLink} onClick={() => navigate('/billing/client-invoicing')}>
            ← Client Billing
          </button>
          <h1 className={styles.pageTitle}>Client Finance Setup</h1>
          <p className={styles.pageSubtitle}>Complete all steps to configure invoicing, billing contacts, and payment accounts for a new client.</p>
        </div>
      </div>

      {/* Step progress */}
      <div className={styles.stepBar}>
        {STEPS.map((s) => (
          <button
            key={s.number}
            className={`${styles.stepItem} ${step === s.number ? styles.stepActive : ''} ${step > s.number ? styles.stepDone : ''}`}
            onClick={() => setStep(s.number)}
          >
            <span className={styles.stepCircle}>
              {step > s.number ? '✓' : s.number}
            </span>
            <span className={styles.stepLabel}>{s.label}</span>
          </button>
        ))}
        <div className={styles.stepLine} style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
      </div>

      {/* Compliance status bar */}
      <div className={styles.complianceBar}>
        <div className={styles.complianceBarItems}>
          {complianceItems.map(item => (
            <div key={item.label} className={`${styles.complianceBarItem} ${item.ok ? styles.complianceBarItemOk : styles.complianceBarItemMissing}`}>
              <span className={styles.complianceBarIcon}>{item.ok ? '✓' : '○'}</span>
              {item.label}
            </div>
          ))}
        </div>
        <div className={`${styles.complianceBarStatus} ${readyToInvoice ? styles.complianceBarStatusReady : styles.complianceBarStatusPending}`}>
          {readyToInvoice ? '✓ Ready to Invoice' : `${complianceItems.filter(i => i.ok).length} / ${complianceItems.length} complete`}
        </div>
      </div>

      {/* Step content */}
      <div className={styles.stepContent}>

        {/* ── Step 1: Contract Documents ── */}
        {step === 1 && (
          <Card elevated>
            <div className={styles.stepCard}>
              <div className={styles.stepCardHeader}>
                <h2 className={styles.stepTitle}>Contract Documents</h2>
                <p className={styles.stepDesc}>
                  Upload the client's MSA and SOW. Use AI Scan to automatically extract billing terms, fee rates, contacts, and contract dates directly from the documents.
                </p>
              </div>

              {/* Upload area */}
              <div
                className={styles.dropZone}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const dt = e.dataTransfer;
                  if (dt.files.length) {
                    const synth = { target: { files: dt.files, value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleFileUpload(synth);
                  }
                }}
              >
                <div className={styles.dropIcon}>📄</div>
                <p className={styles.dropText}>Drag &amp; drop PDFs here, or <span className={styles.dropLink}>browse files</span></p>
                <p className={styles.dropHint}>Supports PDF, DOCX — MSA, SOW, Amendments</p>
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.doc" style={{ display: 'none' }} onChange={handleFileUpload} />
              </div>

              {/* Uploaded files list */}
              {form.uploadedDocs.length > 0 && (
                <div className={styles.docList}>
                  {form.uploadedDocs.map((doc, i) => (
                    <div key={i} className={styles.docItem}>
                      <span className={styles.docIcon}>📋</span>
                      <div className={styles.docInfo}>
                        <span className={styles.docName}>{doc.name}</span>
                        <span className={styles.docMeta}>{doc.type} · {doc.size} · {doc.uploadedAt}</span>
                      </div>
                      <select
                        className={styles.docTypeSelect}
                        value={doc.type}
                        onChange={e => {
                          const updated = [...form.uploadedDocs];
                          updated[i] = { ...updated[i], type: e.target.value as UploadedDoc['type'] };
                          set('uploadedDocs', updated);
                        }}
                      >
                        <option>MSA</option>
                        <option>SOW</option>
                        <option>Amendment</option>
                        <option>Other</option>
                      </select>
                      <button className={styles.docRemove} onClick={() => set('uploadedDocs', form.uploadedDocs.filter((_, idx) => idx !== i))}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Scan */}
              <div className={styles.aiScanPanel}>
                <div className={styles.aiScanHeader}>
                  <div className={styles.aiIcon}>✦</div>
                  <div>
                    <div className={styles.aiTitle}>AI Contract Scan</div>
                    <div className={styles.aiSubtitle}>
                      Automatically extract PEPM rates, case rates, billing contacts, contract dates, and payment terms from uploaded documents.
                    </div>
                  </div>
                  <Button
                    appearance="primary"
                    onClick={handleAIScan}
                    disabled={form.uploadedDocs.length === 0 || scanning}
                    loading={scanning}
                  >
                    {scanning ? 'Scanning…' : scanComplete ? 'Re-scan' : 'Scan Documents'}
                  </Button>
                </div>

                {scanning && (
                  <div className={styles.scanProgress}>
                    <div className={styles.scanProgressBar}>
                      <div className={styles.scanProgressFill} style={{ width: `${Math.min(scanProgress, 100)}%` }} />
                    </div>
                    <span className={styles.scanProgressLabel}>
                      {scanProgress < 30 ? 'Reading document structure…'
                        : scanProgress < 55 ? 'Extracting fee schedules and case rates…'
                        : scanProgress < 75 ? 'Identifying billing contacts and payment terms…'
                        : 'Finalizing extraction…'}
                    </span>
                  </div>
                )}

                {scanComplete && !scanning && (
                  <div className={styles.scanResult}>
                    <span className={styles.scanResultIcon}>✓</span>
                    <div>
                      <div className={styles.scanResultTitle}>Extraction complete — review and confirm each step</div>
                      <div className={styles.scanResultFields}>
                        Client name · Contract dates · PEPM rate · 4 case rates · 2 billing contacts · Payment terms extracted
                      </div>
                    </div>
                  </div>
                )}

                {form.uploadedDocs.length === 0 && (
                  <p className={styles.aiDisabledHint}>Upload at least one document to enable AI scanning. You can also skip this and enter all data manually.</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* ── Step 2: Client & Contract Terms ── */}
        {step === 2 && (
          <Card elevated>
            <div className={styles.stepCard}>
              <div className={styles.stepCardHeader}>
                <h2 className={styles.stepTitle}>Client &amp; Contract Terms</h2>
                <p className={styles.stepDesc}>Legal entity name, contract dates, auto-renewal terms, and any special notes.</p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Client Name *</label>
                  <input className={styles.fieldInput} value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g. Apex Industries" />
                </div>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Legal Entity Name</label>
                  <input className={styles.fieldInput} value={form.legalEntity} onChange={e => set('legalEntity', e.target.value)} placeholder="e.g. Apex Industries, LLC" />
                </div>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Contract Start Date</label>
                  <input className={styles.fieldInput} type="date" value={form.contractStart} onChange={e => set('contractStart', e.target.value)} />
                </div>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Contract Expiration Date</label>
                  <input className={styles.fieldInput} type="date" value={form.contractEnd} onChange={e => set('contractEnd', e.target.value)} />
                </div>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Renewal Notice Period (days)</label>
                  <input className={styles.fieldInput} type="number" value={form.renewalNoticeDays} onChange={e => set('renewalNoticeDays', e.target.value)} placeholder="90" />
                </div>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Renewal Term Length (months)</label>
                  <input className={styles.fieldInput} type="number" value={form.renewalTermMonths} onChange={e => set('renewalTermMonths', e.target.value)} placeholder="12" />
                </div>
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleTitle}>Auto-Renews</div>
                  <div className={styles.toggleDesc}>Contract automatically renews unless notice is given within the notice period</div>
                </div>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={form.autoRenews} onChange={e => set('autoRenews', e.target.checked)} />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              {form.contractEnd && (
                <div className={styles.contractAlert}>
                  <span>📅</span>
                  <span>
                    Contract expires <strong>{new Date(form.contractEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
                    {form.autoRenews && form.renewalNoticeDays
                      ? ` Notice deadline to prevent auto-renewal: ${new Date(new Date(form.contractEnd).getTime() - parseInt(form.renewalNoticeDays) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
                      : ''}
                  </span>
                </div>
              )}

              <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.fieldLabel}>Notes / Special Terms</label>
                <textarea className={styles.fieldTextarea} rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any special contract terms, exceptions, or notes for the Finance team…" />
              </div>
            </div>
          </Card>
        )}

        {/* ── Step 3: Fee Structure ── */}
        {step === 3 && (
          <Card elevated>
            <div className={styles.stepCard}>
              <div className={styles.stepCardHeader}>
                <h2 className={styles.stepTitle}>Fee Structure</h2>
                <p className={styles.stepDesc}>Set the contracted rate schedule — PEPM, implementation fee, and case rates by service type. These rates drive automated invoice line items.</p>
              </div>

              {/* Implementation fee */}
              <div className={styles.feeSection}>
                <div className={styles.feeSectionTitle}>Implementation Fee</div>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Amount</label>
                    <input
                      className={styles.fieldInput}
                      type="number"
                      value={form.implementationFee}
                      onChange={e => set('implementationFee', e.target.value)}
                      placeholder="e.g. 10000"
                      disabled={form.implementationWaived}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Payment Terms</label>
                    <select className={styles.fieldSelect} value={form.implementationTerms} onChange={e => set('implementationTerms', e.target.value)} disabled={form.implementationWaived}>
                      <option>Net 30</option>
                      <option>Net 15</option>
                      <option>Upon signature</option>
                    </select>
                  </div>
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleTitle}>Fee Waived</div>
                    <div className={styles.toggleDesc}>Implementation fee is waived for this client</div>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={form.implementationWaived} onChange={e => set('implementationWaived', e.target.checked)} />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
              </div>

              {/* PEPM */}
              <div className={styles.feeSection}>
                <div className={styles.feeSectionTitle}>PEPM (Program Access Fee)</div>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>PEPM Rate ($/employee/month)</label>
                    <input className={styles.fieldInput} type="number" step="0.01" value={form.pepmRate} onChange={e => set('pepmRate', e.target.value)} placeholder="e.g. 8.00" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Payment Terms</label>
                    <select className={styles.fieldSelect} value={form.pepmTerms} onChange={e => set('pepmTerms', e.target.value)}>
                      <option>Net 30</option>
                      <option>Net 15</option>
                      <option>Self-bill</option>
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Enrolled Members (current)</label>
                    <input className={styles.fieldInput} type="number" value={form.enrolledMembers} onChange={e => set('enrolledMembers', e.target.value)} placeholder="e.g. 974" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>HDHP Enrollment %</label>
                    <input className={styles.fieldInput} type="number" value={form.hdhpPct} onChange={e => set('hdhpPct', e.target.value)} placeholder="e.g. 69" />
                  </div>
                </div>
                {form.pepmRate && form.enrolledMembers && (
                  <div className={styles.calcPreview}>
                    Monthly PEPM: <strong>{(parseFloat(form.pepmRate) * parseInt(form.enrolledMembers)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</strong>
                    &nbsp;({parseInt(form.enrolledMembers).toLocaleString()} employees × ${parseFloat(form.pepmRate).toFixed(2)})
                  </div>
                )}
              </div>

              {/* Case Rates */}
              <div className={styles.feeSection}>
                <div className={styles.feeSectionTitleRow}>
                  <div className={styles.feeSectionTitle}>Case Rate Schedule</div>
                  <Button appearance="secondary" size="small" onClick={addCaseRate}>+ Add Service</Button>
                </div>
                <p className={styles.feeSectionDesc}>Case rates are billed upon invoice delivery. Leave rate blank if not applicable for this client.</p>
                <div className={styles.caseRateTable}>
                  <div className={styles.caseRateHeader}>
                    <span>Service / Encounter Type</span>
                    <span>Rate</span>
                    <span>Unit</span>
                    <span></span>
                  </div>
                  {form.caseRates.map((cr, i) => (
                    <div key={i} className={styles.caseRateRow}>
                      <select
                        className={styles.fieldSelect}
                        value={cr.service}
                        onChange={e => {
                          const selected = e.target.value;
                          const match = SERVICE_TYPE_OPTIONS.flatMap(g => g.services).find(s => s.label === selected);
                          const updated = [...form.caseRates];
                          updated[i] = { ...updated[i], service: selected, unit: match ? match.defaultUnit : updated[i].unit };
                          set('caseRates', updated);
                        }}
                      >
                        <option value="">— Select service type —</option>
                        {SERVICE_TYPE_OPTIONS.map(group => (
                          <optgroup key={group.group} label={group.group}>
                            {group.services.map(s => (
                              <option key={s.label} value={s.label}>{s.label}</option>
                            ))}
                          </optgroup>
                        ))}
                        {cr.service && !ALL_SERVICE_LABELS.includes(cr.service) && (
                          <option value={cr.service}>{cr.service}</option>
                        )}
                      </select>
                      <input
                        className={styles.fieldInput}
                        value={cr.rate}
                        onChange={e => updateCaseRate(i, 'rate', e.target.value)}
                        placeholder="e.g. 20 or 1800"
                      />
                      <input
                        className={styles.fieldInput}
                        value={cr.unit}
                        onChange={e => updateCaseRate(i, 'unit', e.target.value)}
                        placeholder="e.g. % of case rate"
                      />
                      <button className={styles.removeBtn} onClick={() => removeCaseRate(i)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live invoice preview */}
              {(form.pepmRate || form.caseRates.some(cr => cr.rate)) && (() => {
                const monthlyPepm = (parseFloat(form.pepmRate) || 0) * (parseInt(form.enrolledMembers) || 0);
                const contractedRates = form.caseRates.filter(cr => cr.service && cr.rate);
                return (
                  <div className={styles.invoicePreview}>
                    <div className={styles.invoicePreviewTitle}>Estimated Monthly Invoice Structure</div>
                    <p className={styles.invoicePreviewNote}>Based on contracted rates — actual case rate totals will vary by utilization each month.</p>
                    <div className={styles.invoicePreviewLines}>
                      {monthlyPepm > 0 && (
                        <div className={styles.invoicePreviewRow}>
                          <span>Program Access Fee (PEPM)</span>
                          <span>{(parseInt(form.enrolledMembers) || 0).toLocaleString()} members × ${parseFloat(form.pepmRate).toFixed(2)}</span>
                          <span className={styles.invoicePreviewAmt}>${monthlyPepm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {contractedRates.map((cr, i) => (
                        <div key={i} className={styles.invoicePreviewRow}>
                          <span>{cr.service}</span>
                          <span>{cr.unit === '% of case rate' ? `${cr.rate}% of provider case rate` : `$${parseFloat(cr.rate).toLocaleString()} / ${cr.unit}`}</span>
                          <span className={styles.invoicePreviewAmt}>
                            {cr.unit === '% of case rate' ? 'Variable' : `$${parseFloat(cr.rate).toLocaleString()}`}
                          </span>
                        </div>
                      ))}
                      {form.travelPassThrough && (
                        <div className={styles.invoicePreviewRow}>
                          <span>Travel &amp; Pass-Through Expenses</span>
                          <span>At cost, no markup</span>
                          <span className={styles.invoicePreviewAmt}>Variable</span>
                        </div>
                      )}
                    </div>
                    {monthlyPepm > 0 && (
                      <div className={styles.invoicePreviewTotal}>
                        <span>Fixed monthly minimum (PEPM only)</span>
                        <span>${monthlyPepm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Travel pass-through */}
              <div className={styles.feeSection}>
                <div className={styles.feeSectionTitleRow}>
                  <div className={styles.feeSectionTitle}>Travel &amp; Pass-Through Expenses</div>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={form.travelPassThrough} onChange={e => set('travelPassThrough', e.target.checked)} />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
                <p className={styles.feeSectionDesc}>
                  Billed at cost with no markup. Not a case rate — invoiced as a separate pass-through line item. Configure what is covered and any per-episode cap.
                </p>
                {form.travelPassThrough && (
                  <div className={styles.formGrid}>
                    <div className={`${styles.formField} ${styles.formFieldFull}`}>
                      <label className={styles.fieldLabel}>What's Covered</label>
                      <textarea
                        className={styles.fieldTextarea}
                        rows={2}
                        value={form.travelPassThroughNotes}
                        onChange={e => set('travelPassThroughNotes', e.target.value)}
                        placeholder="e.g. Airfare, hotel, and ground transportation for member and one companion. Billed at cost, no markup."
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.fieldLabel}>Per-Episode Cap ($) — optional</label>
                      <input
                        className={styles.fieldInput}
                        type="number"
                        value={form.travelPassThroughCap}
                        onChange={e => set('travelPassThroughCap', e.target.value)}
                        placeholder="Leave blank for no cap"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Member incentives */}
              <div className={styles.feeSection}>
                <div className={styles.feeSectionTitleRow}>
                  <div className={styles.feeSectionTitle}>Member Incentives</div>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={form.memberIncentivesIncluded} onChange={e => set('memberIncentivesIncluded', e.target.checked)} />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
                <p className={styles.feeSectionDesc}>
                  Incentive payments made to members (e.g. for completing health assessments, care milestones) are billed back to the client as a pass-through. Not a case rate — invoiced as a separate line item.
                </p>
                {form.memberIncentivesIncluded && (
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label className={styles.fieldLabel}>Amount per Incentive ($)</label>
                      <input
                        className={styles.fieldInput}
                        type="number"
                        value={form.memberIncentiveAmount}
                        onChange={e => set('memberIncentiveAmount', e.target.value)}
                        placeholder="e.g. 50"
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.fieldLabel}>Annual Cap per Member ($) — optional</label>
                      <input
                        className={styles.fieldInput}
                        type="number"
                        value={form.memberIncentiveCap}
                        onChange={e => set('memberIncentiveCap', e.target.value)}
                        placeholder="Leave blank for no cap"
                      />
                    </div>
                    <div className={`${styles.formField} ${styles.formFieldFull}`}>
                      <label className={styles.fieldLabel}>Qualifying Incentive Types</label>
                      <textarea
                        className={styles.fieldTextarea}
                        rows={2}
                        value={form.memberIncentiveTypes}
                        onChange={e => set('memberIncentiveTypes', e.target.value)}
                        placeholder="e.g. Health risk assessment completion, care milestone gift cards, biometric screening participation…"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* ── Step 4: Billing Contacts ── */}
        {step === 4 && (
          <Card elevated>
            <div className={styles.stepCard}>
              <div className={styles.stepCardHeader}>
                <h2 className={styles.stepTitle}>Billing Contacts</h2>
                <p className={styles.stepDesc}>Invoices are sent to all contacts listed here. At least one primary contact is required. Add multiple contacts for billing teams with shared responsibility.</p>
              </div>

              <div className={styles.contactList}>
                {form.billingContacts.map((contact) => (
                  <div key={contact.id} className={`${styles.contactCard} ${contact.primary ? styles.contactCardPrimary : ''}`}>
                    <div className={styles.contactCardHeader}>
                      <span className={styles.contactPrimaryBadge}>{contact.primary ? '★ Primary' : 'Additional'}</span>
                      <div className={styles.contactActions}>
                        {!contact.primary && (
                          <button className={styles.setAsPrimaryBtn} onClick={() => setPrimaryContact(contact.id)}>Set as primary</button>
                        )}
                        {form.billingContacts.length > 1 && (
                          <button className={styles.removeBtn} onClick={() => removeContact(contact.id)}>✕ Remove</button>
                        )}
                      </div>
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Full Name</label>
                        <input className={styles.fieldInput} value={contact.name} onChange={e => updateContact(contact.id, 'name', e.target.value)} placeholder="e.g. Candace Wiley" />
                      </div>
                      <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Title / Role</label>
                        <input className={styles.fieldInput} value={contact.title} onChange={e => updateContact(contact.id, 'title', e.target.value)} placeholder="e.g. Accounts Payable Manager" />
                      </div>
                      <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Email Address</label>
                        <input className={styles.fieldInput} type="email" value={contact.email} onChange={e => updateContact(contact.id, 'email', e.target.value)} placeholder="name@company.com" />
                      </div>
                      <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Phone (optional)</label>
                        <input className={styles.fieldInput} type="tel" value={contact.phone} onChange={e => updateContact(contact.id, 'phone', e.target.value)} placeholder="(555) 000-0000" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button appearance="secondary" onClick={addContact}>+ Add Billing Contact</Button>
            </div>
          </Card>
        )}

        {/* ── Step 5: Payment Accounts ── */}
        {step === 5 && (
          <Card elevated>
            <div className={styles.stepCard}>
              <div className={styles.stepCardHeader}>
                <h2 className={styles.stepTitle}>Payment Accounts &amp; Billing Documents</h2>
                <p className={styles.stepDesc}>
                  Upload required documents and configure payment accounts. W-9 must be on file before invoicing begins. ACH authorization covers PEPM (Net 30); the pre-authorized debit form covers case rate direct debits upon delivery.
                </p>
              </div>

              {/* W-9 */}
              <div className={styles.feeSection}>
                <div className={styles.feeSectionTitle}>W-9 &amp; Tax Documentation</div>
                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleTitle}>W-9 on File</div>
                    <div className={styles.toggleDesc}>Transcarent has a signed W-9 on file for this client</div>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={form.w9OnFile} onChange={e => set('w9OnFile', e.target.checked)} />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
                {form.w9OnFile && (
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label className={styles.fieldLabel}>W-9 Date Received</label>
                      <input className={styles.fieldInput} type="date" value={form.w9Date} onChange={e => set('w9Date', e.target.value)} />
                    </div>
                  </div>
                )}
                <DocUploadSlot
                  label="W-9 Document"
                  hint="Upload the signed W-9 form (PDF)"
                  doc={form.w9Doc}
                  inputRef={w9InputRef}
                  onUpload={f => set('w9Doc', fileToDoc(f, 'W-9'))}
                  onRemove={() => set('w9Doc', null)}
                />
                {!form.w9OnFile && !form.w9Doc && (
                  <div className={styles.warningBanner}>
                    ⚠ W-9 required before invoice generation. Contact client to obtain prior to first billing cycle.
                  </div>
                )}
              </div>

              {/* ACH Account (PEPM) */}
              <div className={styles.feeSection}>
                <div className={styles.feeSectionTitle}>ACH Account — PEPM Payments (Net 30)</div>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Account Holder Name</label>
                    <input className={styles.fieldInput} value={form.achAccountName} onChange={e => set('achAccountName', e.target.value)} placeholder="Legal entity on account" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Bank Name</label>
                    <input className={styles.fieldInput} value={form.achBankName} onChange={e => set('achBankName', e.target.value)} placeholder="e.g. Chase, Bank of America" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Routing Number</label>
                    <input className={styles.fieldInput} value={form.achRoutingNumber} onChange={e => set('achRoutingNumber', e.target.value)} placeholder="9 digits" maxLength={9} />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Account Number</label>
                    <input className={styles.fieldInput} value={form.achAccountNumber} onChange={e => set('achAccountNumber', e.target.value)} placeholder="Account number" type="password" />
                  </div>
                </div>
                <DocUploadSlot
                  label="ACH Authorization Form"
                  hint="Upload the signed ACH authorization agreement (PDF)"
                  doc={form.achAuthDoc}
                  inputRef={achInputRef}
                  onUpload={f => set('achAuthDoc', fileToDoc(f, 'ACH Authorization'))}
                  onRemove={() => set('achAuthDoc', null)}
                />
              </div>

              {/* Debit Account (Case Rates) */}
              <div className={styles.feeSection}>
                <div className={styles.feeSectionTitle}>Pre-Authorized Debit Account — Case Rates (Upon Delivery)</div>
                <p className={styles.feeSectionDesc}>Client signs a pre-authorization allowing Transcarent to direct debit case rate invoices upon delivery. Keep this separate from the PEPM ACH account.</p>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Account Holder Name</label>
                    <input className={styles.fieldInput} value={form.debitAccountName} onChange={e => set('debitAccountName', e.target.value)} placeholder="Legal entity on account" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Bank Name</label>
                    <input className={styles.fieldInput} value={form.debitBankName} onChange={e => set('debitBankName', e.target.value)} placeholder="e.g. Chase, Bank of America" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Routing Number</label>
                    <input className={styles.fieldInput} value={form.debitRoutingNumber} onChange={e => set('debitRoutingNumber', e.target.value)} placeholder="9 digits" maxLength={9} />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Account Number</label>
                    <input className={styles.fieldInput} value={form.debitAccountNumber} onChange={e => set('debitAccountNumber', e.target.value)} placeholder="Account number" type="password" />
                  </div>
                </div>
                <DocUploadSlot
                  label="Pre-Authorization / Debit Agreement"
                  hint="Upload the signed debit authorization form (PDF)"
                  doc={form.debitAuthDoc}
                  inputRef={debitInputRef}
                  onUpload={f => set('debitAuthDoc', fileToDoc(f, 'Debit Authorization'))}
                  onRemove={() => set('debitAuthDoc', null)}
                />
              </div>

              {/* Self-billing */}
              <div className={styles.feeSection}>
                <div className={styles.feeSectionTitle}>Self-Billing Election</div>
                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleTitle}>Client Self-Bills for PEPM</div>
                    <div className={styles.toggleDesc}>Client generates and submits their own PEPM payment without a Transcarent invoice</div>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={form.selfBilling} onChange={e => set('selfBilling', e.target.checked)} />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
                {form.selfBilling && (
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Self-Billing Contact</label>
                    <input className={styles.fieldInput} value={form.selfBillingContact} onChange={e => set('selfBillingContact', e.target.value)} placeholder="Contact name or email responsible for self-billing" />
                  </div>
                )}
              </div>

              {/* Additional billing documents */}
              <div className={styles.feeSection}>
                <div className={styles.feeSectionTitleRow}>
                  <div className={styles.feeSectionTitle}>Additional Billing Documents</div>
                </div>
                <p className={styles.feeSectionDesc}>
                  Upload any other documents required for billing — performance guarantees, executed contracts, correspondence, insurance certificates, or Finance team reference materials.
                </p>

                {/* Uploaded list */}
                {form.billingDocs.length > 0 && (
                  <div className={styles.docList}>
                    {form.billingDocs.map((doc, i) => (
                      <div key={i} className={styles.docItem}>
                        <span className={styles.docIcon}>{docIcon(doc.type)}</span>
                        <div className={styles.docInfo}>
                          <span className={styles.docName}>{doc.name}</span>
                          <span className={styles.docMeta}>{doc.type} · {doc.size} · {doc.uploadedAt}</span>
                        </div>
                        <select
                          className={styles.docTypeSelect}
                          value={doc.type}
                          onChange={e => {
                            const updated = [...form.billingDocs];
                            updated[i] = { ...updated[i], type: e.target.value as UploadedDoc['type'] };
                            set('billingDocs', updated);
                          }}
                        >
                          {(['W-9','ACH Authorization','Debit Authorization','Performance Guarantee','MSA','SOW','Amendment','Other'] as UploadedDoc['type'][]).map(t => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                        <button className={styles.docRemove} onClick={() => set('billingDocs', form.billingDocs.filter((_, idx) => idx !== i))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className={styles.uploadTriggerBtn}
                  onClick={() => billingDocsInputRef.current?.click()}
                >
                  + Upload Document
                </button>
                <input
                  ref={billingDocsInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.xlsx,.png,.jpg"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    const newDocs = files.map(f => fileToDoc(f, 'Other'));
                    set('billingDocs', [...form.billingDocs, ...newDocs]);
                    if (e.target) e.target.value = '';
                  }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* ── Step 6: Review & Save ── */}
        {step === 6 && (
          <div className={styles.reviewGrid}>
            <Card elevated>
              <div className={styles.reviewSection}>
                <div className={styles.reviewSectionTitle}>Client &amp; Contract</div>
                <ReviewRow label="Client" value={form.clientName} />
                <ReviewRow label="Legal Entity" value={form.legalEntity} />
                <ReviewRow label="Contract Dates" value={form.contractStart && form.contractEnd ? `${form.contractStart} → ${form.contractEnd}` : ''} />
                <ReviewRow label="Auto-Renews" value={form.autoRenews ? `Yes — ${form.renewalNoticeDays}d notice, ${form.renewalTermMonths}mo term` : 'No'} />
                {form.notes && <ReviewRow label="Notes" value={form.notes} />}
              </div>
            </Card>

            <Card elevated>
              <div className={styles.reviewSection}>
                <div className={styles.reviewSectionTitle}>Fee Structure</div>
                <ReviewRow label="Implementation Fee" value={form.implementationWaived ? 'Waived' : fmt(form.implementationFee)} />
                <ReviewRow label="PEPM Rate" value={form.pepmRate ? `$${parseFloat(form.pepmRate).toFixed(2)}/employee/month` : ''} />
                <ReviewRow label="PEPM Terms" value={form.pepmTerms} />
                <ReviewRow label="Enrolled Members" value={form.enrolledMembers ? parseInt(form.enrolledMembers).toLocaleString() : ''} />
                <ReviewRow label="HDHP %" value={form.hdhpPct ? `${form.hdhpPct}%` : ''} />
                {form.pepmRate && form.enrolledMembers && (
                  <ReviewRow
                    label="Est. Monthly PEPM"
                    value={(parseFloat(form.pepmRate) * parseInt(form.enrolledMembers)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    highlight
                  />
                )}
              </div>
            </Card>

            <Card elevated>
              <div className={styles.reviewSection}>
                <div className={styles.reviewSectionTitle}>Case Rate Schedule</div>
                {form.caseRates.filter(cr => cr.service).map((cr, i) => {
                  const numRate = parseFloat(cr.rate);
                  const rateDisplay = cr.unit === '% of case rate'
                    ? `${cr.rate || '—'}% of case rate`
                    : !isNaN(numRate) ? `$${numRate.toLocaleString()} / ${cr.unit}` : cr.rate || '—';
                  return <ReviewRow key={i} label={cr.service} value={rateDisplay} />;
                })}
                <ReviewRow label="Travel Pass-Through" value={form.travelPassThrough ? 'Yes (at cost)' : 'No'} />
                <ReviewRow label="Member Incentives" value={form.memberIncentivesIncluded ? 'Included' : 'Not included'} />
              </div>
            </Card>

            <Card elevated>
              <div className={styles.reviewSection}>
                <div className={styles.reviewSectionTitle}>Billing Contacts</div>
                {form.billingContacts.map(c => (
                  <div key={c.id} className={styles.reviewContactRow}>
                    <div className={styles.reviewContactName}>{c.name || '—'} {c.primary && <span className={styles.reviewPrimaryTag}>Primary</span>}</div>
                    <div className={styles.reviewContactDetail}>{c.email}</div>
                    {c.title && <div className={styles.reviewContactDetail}>{c.title}</div>}
                  </div>
                ))}
              </div>
            </Card>

            <Card elevated>
              <div className={styles.reviewSection}>
                <div className={styles.reviewSectionTitle}>Payment &amp; Compliance</div>
                <ReviewRow
                  label="W-9 on File"
                  value={form.w9OnFile ? `Yes${form.w9Date ? ` (received ${form.w9Date})` : ''}${form.w9Doc ? ` — ${form.w9Doc.name}` : ''}` : 'No — required before invoicing'}
                  alert={!form.w9OnFile && !form.w9Doc}
                />
                <ReviewRow
                  label="ACH Auth Form"
                  value={form.achAuthDoc ? form.achAuthDoc.name : 'Not uploaded'}
                  alert={!form.achAuthDoc && !!form.achBankName}
                />
                <ReviewRow label="ACH Account (PEPM)" value={form.achBankName ? `${form.achBankName}${form.achAccountNumber ? ` ···${form.achAccountNumber.slice(-4)}` : ''}` : 'Not configured'} alert={!form.achBankName} />
                <ReviewRow
                  label="Debit Auth Form"
                  value={form.debitAuthDoc ? form.debitAuthDoc.name : 'Not uploaded'}
                  alert={!form.debitAuthDoc && !!form.debitBankName}
                />
                <ReviewRow label="Debit Account (Case Rates)" value={form.debitBankName ? `${form.debitBankName}${form.debitAccountNumber ? ` ···${form.debitAccountNumber.slice(-4)}` : ''}` : 'Not configured'} />
                <ReviewRow label="Self-Billing" value={form.selfBilling ? `Yes — ${form.selfBillingContact}` : 'No'} />
              </div>
            </Card>

            <Card elevated>
              <div className={styles.reviewSection}>
                <div className={styles.reviewSectionTitle}>All Stored Documents</div>
                {[...form.uploadedDocs, ...(form.w9Doc ? [form.w9Doc] : []), ...(form.achAuthDoc ? [form.achAuthDoc] : []), ...(form.debitAuthDoc ? [form.debitAuthDoc] : []), ...form.billingDocs].length === 0 && (
                  <span className={styles.reviewEmpty}>No documents uploaded</span>
                )}
                {[...form.uploadedDocs, ...(form.w9Doc ? [form.w9Doc] : []), ...(form.achAuthDoc ? [form.achAuthDoc] : []), ...(form.debitAuthDoc ? [form.debitAuthDoc] : []), ...form.billingDocs].map((doc, i) => (
                  <div key={i} className={styles.reviewDocRow}>
                    <span>{docIcon(doc.type)} {doc.name}</span>
                    <span className={styles.reviewDocType}>{doc.type}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={styles.navBar}>
        <Button appearance="secondary" onClick={() => step > 1 ? setStep(step - 1) : navigate('/billing/client-invoicing')}>
          {step === 1 ? '← Cancel' : '← Back'}
        </Button>
        <div className={styles.stepIndicator}>{step} of {STEPS.length}</div>
        {step < STEPS.length ? (
          <Button appearance="primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Continue →
          </Button>
        ) : (
          <Button appearance="primary" onClick={handleSave}>
            Save Client Setup
          </Button>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

function docIcon(type: UploadedDoc['type']): string {
  switch (type) {
    case 'W-9': return '🪪';
    case 'ACH Authorization': return '🏦';
    case 'Debit Authorization': return '🏦';
    case 'Performance Guarantee': return '📊';
    case 'MSA': return '📄';
    case 'SOW': return '📋';
    case 'Amendment': return '✏️';
    default: return '📎';
  }
}

interface DocUploadSlotProps {
  label: string;
  hint: string;
  doc: UploadedDoc | null;
  inputRef: React.RefObject<HTMLInputElement>;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

function DocUploadSlot({ label, hint, doc, inputRef, onUpload, onRemove }: DocUploadSlotProps) {
  return (
    <div className={styles.docSlot}>
      <div className={styles.docSlotLabel}>{label}</div>
      {doc ? (
        <div className={styles.docSlotFilled}>
          <span className={styles.docSlotIcon}>{docIcon(doc.type)}</span>
          <div className={styles.docSlotInfo}>
            <span className={styles.docSlotName}>{doc.name}</span>
            <span className={styles.docSlotMeta}>{doc.size} · {doc.uploadedAt}</span>
          </div>
          <button className={styles.docSlotReplace} onClick={() => inputRef.current?.click()}>Replace</button>
          <button className={styles.docRemove} onClick={onRemove}>✕</button>
        </div>
      ) : (
        <button className={styles.docSlotEmpty} onClick={() => inputRef.current?.click()}>
          <span className={styles.docSlotUploadIcon}>↑</span>
          <span>{hint}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          if (e.target) e.target.value = '';
        }}
      />
    </div>
  );
}

function ReviewRow({ label, value, highlight, alert }: { label: string; value: string; highlight?: boolean; alert?: boolean }) {
  return (
    <div className={styles.reviewRow}>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={`${styles.reviewValue} ${highlight ? styles.reviewValueHighlight : ''} ${alert ? styles.reviewValueAlert : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}
