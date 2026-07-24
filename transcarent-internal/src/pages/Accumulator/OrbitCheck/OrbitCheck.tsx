import React, { useState, useMemo } from 'react';
import styles from './OrbitCheck.module.css';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import {
  MOCK_CLIENTS,
  MOCK_SAMPLES,
  ELIGIBILITY_TIERS,
  NETWORK_TIERS,
  ELIGIBILITY_TIER_LABELS,
  NETWORK_TIER_LABELS,
} from './mock-data';
import type {
  ClientOrbitRecord,
  DataAvailability,
  TierMatrix,
  SampleMemberRow,
} from './mock-data';

type BadgeVariant = 'success' | 'warning' | 'error';

const AVAIL_VARIANT: Record<DataAvailability, BadgeVariant> = {
  available: 'success',
  partial: 'warning',
  unavailable: 'error',
};

const AVAIL_LABEL: Record<DataAvailability, string> = {
  available: 'Available',
  partial: 'Partial',
  unavailable: 'Unavailable',
};

function AvailBadge({ status }: { status: DataAvailability }) {
  return <Badge variant={AVAIL_VARIANT[status]}>{AVAIL_LABEL[status]}</Badge>;
}

function computeOverall(matrix: TierMatrix): DataAvailability {
  let hasUnavail = false;
  let hasAvail = false;
  for (const elig of ELIGIBILITY_TIERS) {
    for (const net of NETWORK_TIERS) {
      const cell = matrix[elig][net];
      for (const v of [cell.indDeductible, cell.famDeductible, cell.indOopMax, cell.famOopMax] as DataAvailability[]) {
        if (v === 'unavailable') hasUnavail = true;
        if (v === 'available') hasAvail = true;
        if (v === 'partial') { hasUnavail = true; hasAvail = true; }
      }
    }
  }
  if (hasUnavail && hasAvail) return 'partial';
  if (hasUnavail) return 'unavailable';
  return 'available';
}

const OVERALL_LABEL: Record<DataAvailability, string> = {
  available: 'Full data',
  partial: 'Partial data',
  unavailable: 'No data',
};

function TierMatrix({ client }: { client: ClientOrbitRecord }) {
  return (
    <div className={styles.matrixWrap}>
      <table className={styles.matrixTable}>
        <thead>
          <tr>
            <th>Eligibility Tier</th>
            <th>Network Tier</th>
            <th>Ind. Deductible</th>
            <th>Fam. Deductible</th>
            <th>Ind. OOP Max</th>
            <th>Fam. OOP Max</th>
          </tr>
        </thead>
        <tbody>
          {ELIGIBILITY_TIERS.map((elig) =>
            NETWORK_TIERS.map((net, ni) => {
              const cell = client.tierMatrix[elig][net];
              return (
                <tr key={`${elig}-${net}`}>
                  {ni === 0 && (
                    <td
                      rowSpan={NETWORK_TIERS.length}
                      className={styles.eligCell}
                      style={{ fontWeight: 700, borderTop: '1px solid #D6D5DF', background: '#F5F4FC', verticalAlign: 'middle' }}
                    >
                      <div style={{ fontWeight: 700, color: '#18162F' }}>{elig}</div>
                      <div style={{ fontSize: 11, color: '#4C4A64', marginTop: 2 }}>{ELIGIBILITY_TIER_LABELS[elig]}</div>
                    </td>
                  )}
                  <td className={styles.networkCell}>{NETWORK_TIER_LABELS[net]}</td>
                  <td><AvailBadge status={cell.indDeductible} /></td>
                  <td><AvailBadge status={cell.famDeductible} /></td>
                  <td><AvailBadge status={cell.indOopMax} /></td>
                  <td><AvailBadge status={cell.famOopMax} /></td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function ClientRow({ client }: { client: ClientOrbitRecord }) {
  const [open, setOpen] = useState(false);
  const overall = useMemo(() => computeOverall(client.tierMatrix), [client]);

  return (
    <div className={styles.clientCard}>
      <div className={styles.clientHeader} onClick={() => setOpen((v) => !v)}>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>▶</span>
        <div className={styles.clientInfo}>
          <p className={styles.clientName}>{client.clientName}</p>
          <p className={styles.clientMeta}>{client.carrierName} · Orbit ID: {client.orbitPayerId}</p>
        </div>
        <span className={styles.clientStat}>{client.memberCount.toLocaleString()} members</span>
        <span className={styles.clientStat}>Checked {client.lastChecked}</span>
        <Badge variant={AVAIL_VARIANT[overall]}>{OVERALL_LABEL[overall]}</Badge>
      </div>
      {open && <TierMatrix client={client} />}
    </div>
  );
}

function ClientSummaryTab() {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () => MOCK_CLIENTS.filter((c) =>
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.carrierName.toLowerCase().includes(search.toLowerCase()) ||
      c.orbitPayerId.toLowerCase().includes(search.toLowerCase())
    ),
    [search],
  );

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="#4C4A64" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="#4C4A64" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            className={styles.searchInput}
            placeholder="Search by client, carrier, or Orbit ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className={styles.resultCount}>{filtered.length} of {MOCK_CLIENTS.length} clients</span>
      </div>
      <div className={styles.clientList}>
        {filtered.map((c) => <ClientRow key={c.id} client={c} />)}
        {filtered.length === 0 && (
          <p className={styles.emptyState}>No clients match your search.</p>
        )}
      </div>
    </>
  );
}

function RawSamplesTab() {
  const [showIds, setShowIds] = useState(false);
  const clientMap = useMemo(
    () => Object.fromEntries(MOCK_CLIENTS.map((c) => [c.id, c.clientName])),
    [],
  );

  return (
    <>
      <div className={styles.samplesToolbar}>
        <p className={styles.samplesNote}>
          De-identified member samples — {MOCK_SAMPLES.length} records across {MOCK_CLIENTS.length} clients
        </p>
        <Button variant="secondary" size="sm" onClick={() => setShowIds((v) => !v)}>
          {showIds ? 'Hide member IDs' : 'Show member IDs'}
        </Button>
      </div>
      <table className={styles.samplesTable}>
        <thead>
          <tr>
            <th>Member ID</th>
            <th>Client</th>
            <th>Eligibility Tier</th>
            <th>Ind. Deductible</th>
            <th>Fam. Deductible</th>
            <th>Ind. OOP Max</th>
            <th>Fam. OOP Max</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_SAMPLES.map((s: SampleMemberRow, i: number) => (
            <tr key={i}>
              <td className={styles.maskedId}>{showIds ? s.maskedId : '•••-•••-••••'}</td>
              <td>{clientMap[s.clientId] ?? s.clientId}</td>
              <td>{s.eligibilityTier} – {ELIGIBILITY_TIER_LABELS[s.eligibilityTier]}</td>
              <td><Badge variant={s.indDeductibleAvailable ? 'success' : 'error'}>{s.indDeductibleAvailable ? 'Available' : 'Unavailable'}</Badge></td>
              <td><Badge variant={s.famDeductibleAvailable ? 'success' : 'error'}>{s.famDeductibleAvailable ? 'Available' : 'Unavailable'}</Badge></td>
              <td><Badge variant={s.indOopAvailable ? 'success' : 'error'}>{s.indOopAvailable ? 'Available' : 'Unavailable'}</Badge></td>
              <td><Badge variant={s.famOopAvailable ? 'success' : 'error'}>{s.famOopAvailable ? 'Available' : 'Unavailable'}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function OrbitCheck() {
  const [activeTab, setActiveTab] = useState<'summary' | 'samples'>('summary');

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Orbit Accumulator Data Check</h1>
        <p className={styles.pageSubtitle}>
          Review data availability by client, carrier, eligibility tier, and network tier from Orbit.
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'summary' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Client Summary
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'samples' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('samples')}
        >
          Raw Samples
        </button>
      </div>

      {activeTab === 'summary' ? <ClientSummaryTab /> : <RawSamplesTab />}
    </div>
  );
}
