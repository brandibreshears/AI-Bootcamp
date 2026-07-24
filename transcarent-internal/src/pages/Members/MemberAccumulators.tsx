import React, { useState } from 'react';
import styles from './MemberAccumulators.module.css';

// ── Tier definitions ────────────────────────────────────────────────────────

const TIERS = ['EE Only', 'EE+Spouse', 'EE+Children', 'Family', 'E1', 'E2', 'E3'] as const;
type Tier = typeof TIERS[number];
type Structure = 'individual-only' | 'embedded' | 'aggregate';

const TIER_LABELS: Record<Tier, string> = {
  'EE Only':     'Individual Only',
  'EE+Spouse':   'Employee + Spouse',
  'EE+Children': 'Employee + Child(ren)',
  'Family':      'Family',
  'E1':          'Individual Only',
  'E2':          'Employee + 1 Dependent',
  'E3':          'Employee + 2 Dependents',
};

// Label used for the family/tier section sub-header and item labels
const FAM_SECTION_LABEL: Record<Tier, string> = {
  'EE Only':     '',
  'EE+Spouse':   'Employee + Spouse',
  'EE+Children': 'Employee + Child(ren)',
  'Family':      'Family',
  'E1':          'Individual Only Tier',
  'E2':          'Employee + 1 Dependent',
  'E3':          'Employee + 2 Dependents',
};

const NETWORK_LABEL: Record<'inn' | 'oon', string> = {
  inn: 'In-Network',
  oon: 'Out-of-Network',
};

const STRUCTURE_LABELS: Record<Structure, string> = {
  'individual-only': 'Individual only',
  'embedded':        'Embedded',
  'aggregate':       'Aggregate (non-embedded)',
};

// ── Health plan maximums ────────────────────────────────────────────────────

interface NetworkMaxes {
  iDed: number; fDed: number | null;
  iOop: number; fOop: number | null;
}

interface PlanConfig {
  structure: Structure;
  inn: NetworkMaxes;
  oon: NetworkMaxes;
}

const HP: Record<Tier, PlanConfig> = {
  'EE Only':     { structure: 'individual-only', inn: { iDed: 3000, fDed: null, iOop: 4500,  fOop: null  }, oon: { iDed: 5000, fDed: null, iOop: 9000,  fOop: null  } },
  'EE+Spouse':   { structure: 'embedded',        inn: { iDed: 2250, fDed: 4500, iOop: 3500,  fOop: 7000  }, oon: { iDed: 4000, fDed: 8000, iOop: 6000,  fOop: 12000 } },
  'EE+Children': { structure: 'embedded',        inn: { iDed: 2250, fDed: 4500, iOop: 3500,  fOop: 7000  }, oon: { iDed: 4000, fDed: 8000, iOop: 6000,  fOop: 12000 } },
  'Family':      { structure: 'aggregate',       inn: { iDed: 2500, fDed: 5000, iOop: 3750,  fOop: 7500  }, oon: { iDed: 4500, fDed: 9000, iOop: 6750,  fOop: 13500 } },
  'E1':          { structure: 'embedded',        inn: { iDed: 1250, fDed: 2500, iOop: 2500,  fOop: 5000  }, oon: { iDed: 2250, fDed: 4500, iOop: 4500,  fOop: 9000  } },
  'E2':          { structure: 'embedded',        inn: { iDed: 1750, fDed: 3500, iOop: 3250,  fOop: 6500  }, oon: { iDed: 3000, fDed: 6000, iOop: 5500,  fOop: 11000 } },
  'E3':          { structure: 'aggregate',       inn: { iDed: 2000, fDed: 4000, iOop: 4000,  fOop: 8000  }, oon: { iDed: 3500, fDed: 7000, iOop: 6250,  fOop: 12500 } },
};

// ── Orbit spend data ────────────────────────────────────────────────────────

interface NetworkSpend {
  iDedSpent: number; fDedSpent: number | null;
  iOopSpent: number; fOopSpent: number | null;
}

interface HraData { total: number; used: number; }

interface TierConfig {
  source: string;
  hasDiff: boolean;
  orbitDaysAgo: number;
  hra: HraData | null;
  inn: NetworkSpend;
  oon: NetworkSpend;
  discInn: string[];
  discOon: string[];
  copay: string;
  coins: string;
}

const TD: Record<Tier, TierConfig> = {
  'EE Only':     { source: 'Orbit + Elig File',  hasDiff: true,  orbitDaysAgo: 0,  hra: { total: 1500, used: 250  }, inn: { iDedSpent: 250,  fDedSpent: null, iOopSpent: 250,  fOopSpent: null }, oon: { iDedSpent: 250,  fDedSpent: null, iOopSpent: 250,  fOopSpent: null }, discInn: [],                                                                                 discOon: ['familyOutOfNetworkDeductible', 'individualOutOfNetworkOutOfPocketMax'],   copay: '$30', coins: '20%' },
  'EE+Spouse':   { source: 'Elig File',           hasDiff: false, orbitDaysAgo: 0,  hra: { total: 2000, used: 500  }, inn: { iDedSpent: 500,  fDedSpent: 900,  iOopSpent: 500,  fOopSpent: 900  }, oon: { iDedSpent: 0,    fDedSpent: 0,    iOopSpent: 0,    fOopSpent: 0    }, discInn: ['spouseInNetworkDeductible', 'spouseInNetworkOutOfPocketMax'],               discOon: ['spouseOutOfNetworkDeductible'],                                            copay: '$30', coins: '20%' },
  'EE+Children': { source: 'Orbit + Elig File',  hasDiff: true,  orbitDaysAgo: 1,  hra: { total: 1500, used: 750  }, inn: { iDedSpent: 750,  fDedSpent: 1200, iOopSpent: 750,  fOopSpent: 1200 }, oon: { iDedSpent: 750,  fDedSpent: 1200, iOopSpent: 750,  fOopSpent: 1200 }, discInn: ['childrenInNetworkDeductible'],                                               discOon: [],                                                                         copay: '$30', coins: '20%' },
  'Family':      { source: 'Orbit + Elig File',  hasDiff: false, orbitDaysAgo: 1,  hra: { total: 3000, used: 500  }, inn: { iDedSpent: 250,  fDedSpent: 500,  iOopSpent: 250,  fOopSpent: 500  }, oon: { iDedSpent: 250,  fDedSpent: 500,  iOopSpent: 250,  fOopSpent: 500  }, discInn: ['familyInNetworkDeductible', 'individualInNetworkDeductible'],               discOon: ['familyOutOfNetworkOutOfPocketMax'],                                        copay: '$30', coins: '20%' },
  'E1':          { source: 'Orbit Only',          hasDiff: true,  orbitDaysAgo: 0,  hra: null,                        inn: { iDedSpent: 0,    fDedSpent: 0,    iOopSpent: 0,    fOopSpent: 0    }, oon: { iDedSpent: 0,    fDedSpent: 0,    iOopSpent: 0,    fOopSpent: 0    }, discInn: [],                                                                                 discOon: [],                                                                         copay: '$20', coins: '10%' },
  'E2':          { source: 'Elig File',           hasDiff: false, orbitDaysAgo: 0,  hra: null,                        inn: { iDedSpent: 1200, fDedSpent: 2100, iOopSpent: 1200, fOopSpent: 2100 }, oon: { iDedSpent: 600,  fDedSpent: 1000, iOopSpent: 600,  fOopSpent: 1000 }, discInn: [],                                                                                 discOon: ['e2OutOfNetworkDeductible'],                                               copay: '$40', coins: '30%' },
  'E3':          { source: 'Orbit Only',          hasDiff: true,  orbitDaysAgo: 1,  hra: { total: 2000, used: 2000 }, inn: { iDedSpent: 2000, fDedSpent: 2000, iOopSpent: 2000, fOopSpent: 2000 }, oon: { iDedSpent: 1500, fDedSpent: 1500, iOopSpent: 1500, fOopSpent: 1500 }, discInn: ['e3InNetworkDeductible'],                                                       discOon: [],                                                                         copay: '$35', coins: '25%' },
};

// ── Formatters ──────────────────────────────────────────────────────────────

const fmtD = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtS = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ── Sub-components ──────────────────────────────────────────────────────────

function FreshnessBadge({ days }: { days: number }) {
  if (days === 0) return (
    <div className={`${styles.freshness} ${styles.freshnessOk}`}>
      <span className={`${styles.freshDot} ${styles.dotOk}`} />
      Orbit data: current (today)
    </div>
  );
  return (
    <div className={`${styles.freshness} ${styles.freshnessWarn}`}>
      <span className={`${styles.freshDot} ${styles.dotWarn}`} />
      Orbit data: refreshed yesterday — verify before advising
    </div>
  );
}

function AccumItem({ label, spent, max }: { label: string; spent: number; max: number }) {
  const pct = max > 0 ? Math.min((spent / max) * 100, 100) : 0;
  const remaining = max - spent;
  const met = spent >= max;
  return (
    <div className={styles.accumItem}>
      <div className={styles.accumItemHeader}>
        <span className={styles.accumItemLabel}>{label}</span>
        <span className={`${styles.metBadge} ${met ? styles.metYes : styles.metNo}`}>
          {met ? 'Met' : 'Not met'}
        </span>
      </div>
      <div className={styles.barAmounts}>
        <span className={styles.spentAmount}>{fmtD(spent)} spent</span>
        <span className={styles.maxAmount}>of {fmtS(max)} max</span>
      </div>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${pct.toFixed(1)}%` }} />
      </div>
      <div className={styles.barMeta}>
        {met ? 'Maximum reached' : `${fmtD(remaining)} remaining`}
      </div>
    </div>
  );
}

function NetworkSection({ tier, network }: { tier: Tier; network: 'inn' | 'oon' }) {
  const td = TD[tier];
  const hp = HP[tier];
  const maxes = hp[network];
  const spent = td[network];
  const { structure } = hp;
  const net = NETWORK_LABEL[network];
  const famLabel = FAM_SECTION_LABEL[tier];

  if (structure === 'individual-only') {
    return (
      <div className={styles.accumGrid}>
        <AccumItem label={`Individual ${net} Deductible`}        spent={spent.iDedSpent} max={maxes.iDed} />
        <AccumItem label={`Individual ${net} Out-of-Pocket Max`} spent={spent.iOopSpent} max={maxes.iOop} />
      </div>
    );
  }

  return (
    <>
      <div className={styles.accumSection}>
        <div className={styles.accumSectionHeader}>Individual</div>
        <div className={styles.accumGrid}>
          <AccumItem label={`Individual ${net} Deductible`}        spent={spent.iDedSpent} max={maxes.iDed} />
          <AccumItem label={`Individual ${net} Out-of-Pocket Max`} spent={spent.iOopSpent} max={maxes.iOop} />
        </div>
      </div>

      {structure === 'aggregate' && (
        <div className={styles.structNote}>
          This plan uses an aggregate (shared) deductible. All covered members contribute to one pool.
        </div>
      )}

      <div className={styles.accumSection}>
        <div className={styles.accumSectionHeader}>
          {famLabel}
          {structure === 'embedded' && <em className={styles.accumSectionNote}> — individual limit applies first</em>}
        </div>
        <div className={styles.accumGrid}>
          <AccumItem label={`${famLabel} ${net} Deductible`}        spent={spent.fDedSpent!} max={maxes.fDed!} />
          <AccumItem label={`${famLabel} ${net} Out-of-Pocket Max`} spent={spent.fOopSpent!} max={maxes.fOop!} />
        </div>
      </div>
    </>
  );
}

function OtherTiersExpand({ activeTier, network }: { activeTier: Tier; network: 'inn' | 'oon' }) {
  const [open, setOpen] = useState(false);
  const others = TIERS.filter(t => t !== activeTier);
  return (
    <div className={styles.otherTiersRow}>
      <button className={styles.expandBtn} onClick={() => setOpen(o => !o)}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          <path d="M2 4l4 4 4-4" stroke="#5651bd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Other plan tiers (maximums only — no spend data)
      </button>
      {open && (
        <div className={styles.expandContent}>
          <div className={styles.expandNote}>
            These tiers do not apply to this Member. Amounts are health plan configured maximums — no spend data tracked for non-applicable tiers.
          </div>
          <table className={styles.tierTable}>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Structure</th>
                <th style={{ textAlign: 'right' }}>Individual deductible</th>
                <th style={{ textAlign: 'right' }}>Individual OOP max</th>
                <th style={{ textAlign: 'right' }}>Family/tier deductible</th>
                <th style={{ textAlign: 'right' }}>Family/tier OOP max</th>
              </tr>
            </thead>
            <tbody>
              {others.map(t => {
                const m = HP[t][network];
                return (
                  <tr key={t}>
                    <td>{TIER_LABELS[t]}</td>
                    <td>{STRUCTURE_LABELS[HP[t].structure]}</td>
                    <td className={styles.amtCell}>{fmtS(m.iDed)}</td>
                    <td className={styles.amtCell}>{fmtS(m.iOop)}</td>
                    <td className={styles.amtCell}>{m.fDed != null ? fmtS(m.fDed) : '—'}</td>
                    <td className={styles.amtCell}>{m.fOop != null ? fmtS(m.fOop) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HraCard({ hra, source }: { hra: HraData; source: string }) {
  const remaining = hra.total - hra.used;
  const pct = Math.min((hra.used / hra.total) * 100, 100);
  const exhausted = remaining <= 0;
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>Health reimbursement account (HRA)</span>
        <span className={styles.sourceTag}>Source: {source}</span>
      </div>
      <div className={styles.hraBody}>
        <div className={styles.hraStats}>
          <div className={styles.hraStat}>
            <div className={styles.hraStatLabel}>Employer contribution</div>
            <div className={styles.hraStatVal}>{fmtS(hra.total)}</div>
            <div className={styles.hraStatSub}>Plan year total</div>
          </div>
          <div className={styles.hraStat}>
            <div className={styles.hraStatLabel}>Used to date</div>
            <div className={styles.hraStatVal}>{fmtD(hra.used)}</div>
            <div className={styles.hraStatSub}>{fmtD(hra.used)} spent of {fmtS(hra.total)}</div>
          </div>
          <div className={styles.hraStat}>
            <div className={styles.hraStatLabel}>Remaining balance</div>
            <div className={`${styles.hraStatVal} ${exhausted ? '' : styles.hraStatValGreen}`}>
              {exhausted ? '$0.00' : fmtD(remaining)}
            </div>
            <div className={styles.hraStatSub}>{exhausted ? 'Balance exhausted' : 'Available for Member cost share'}</div>
          </div>
        </div>
        <div className={styles.hraBarRow}>
          <div className={styles.hraBarLabels}>
            <span>{fmtD(hra.used)} spent</span>
            <span>{exhausted ? 'Balance exhausted' : `${fmtD(remaining)} remaining`}</span>
          </div>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${pct.toFixed(1)}%` }} />
          </div>
        </div>
        <div className={styles.hraNote}>
          HRA funds are applied toward Member cost share before out-of-pocket expenses begin.{' '}
          {exhausted
            ? "This Member's HRA balance is fully exhausted — cost share now comes directly from the Member."
            : <>This Member has <strong>{fmtD(remaining)}</strong> in HRA funds available. Direct cost share questions to <em>Product availability and benefits</em> for amounts by care experience.</>
          }
        </div>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function MemberAccumulators() {
  const [activeTier, setActiveTier] = useState<Tier>('EE Only');
  const td = TD[activeTier];
  const hp = HP[activeTier];
  const hasInnDisc = td.discInn.length > 0;
  const hasOonDisc = td.discOon.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>Member accumulators</div>
        <div className={styles.pageSub}>View accumulator data by eligibility tier · Prototype: select a tier scenario below</div>
      </div>

      {/* Tier selector */}
      <div className={styles.protoStrip}>
        <span className={styles.protoLabel}>Tier scenario</span>
        <div className={styles.tierPills}>
          {TIERS.map(t => (
            <button
              key={t}
              className={`${styles.tierPill} ${activeTier === t ? styles.tierPillActive : ''}`}
              onClick={() => setActiveTier(t)}
            >
              {TIER_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Mock member header */}
      <div className={styles.memberCard}>
        <div className={styles.memberName}>Sarah M. Johnson</div>
        <div className={styles.memberMeta}>
          <div className={styles.metaItem}><span className={styles.metaLabel}>Member UUID</span><span className={styles.metaValAccent}>a3f8c2d1-9b4e-47f0-8c12-e5d3a7b60f91</span></div>
          <div className={styles.metaItem}><span className={styles.metaLabel}>Plan sponsor</span><span className={styles.metaVal}>Meridian Health Partners</span></div>
          <div className={styles.metaItem}><span className={styles.metaLabel}>Plan year</span><span className={styles.metaVal}>Jan 1 – Dec 31, 2026</span></div>
          <div className={styles.metaItem}><span className={styles.metaLabel}>Date of birth</span><span className={styles.metaVal}>Aug 14, 1984</span></div>
        </div>
      </div>

      {/* Section header row */}
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionLeft}>
          <div className={styles.sectionTitle}>Accumulator detail</div>
          <div className={styles.tierBadge}>
            Member tier: <strong style={{ marginLeft: 3 }}>{TIER_LABELS[activeTier]}</strong>
            <span className={styles.tierBadgeSource}>&nbsp;· {td.source} · {STRUCTURE_LABELS[hp.structure]}</span>
          </div>
        </div>
        <div className={styles.sectionRight}>
          <div className={styles.insRow}>
            <span className={styles.insLabel}>Member insurance ID</span>
            <span className={styles.insVal}>MHP-2026-38847291</span>
          </div>
          <button className={styles.refreshBtn}>Refresh accumulators</button>
          <FreshnessBadge days={td.orbitDaysAgo} />
        </div>
      </div>

      {/* Discrepancy warning */}
      {(hasInnDisc || hasOonDisc) && (
        <div className={styles.warnBanner}>
          <div className={styles.warnIcon}>!</div>
          <div className={styles.warnBody}>
            <div className={styles.warnTitle}>Data discrepancy with health plan records</div>
            <div className={styles.warnDesc}>These fields do not match between Orbit and the health plan. Review with the plan sponsor before advising the Member.</div>
            {hasInnDisc && (
              <div className={styles.warnGroup}>
                <div className={styles.warnGroupLabel}>In-network discrepancy</div>
                <div className={styles.warnFields}>{td.discInn.map(f => <span key={f} className={styles.warnField}>{f}</span>)}</div>
              </div>
            )}
            {hasOonDisc && (
              <div className={styles.warnGroup} style={{ marginTop: hasInnDisc ? 6 : 0 }}>
                <div className={styles.warnGroupLabel}>Out-of-network discrepancy</div>
                <div className={styles.warnFields}>{td.discOon.map(f => <span key={f} className={styles.warnField}>{f}</span>)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-Network */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>In-Network</span>
          <span className={styles.structureBadge}>{STRUCTURE_LABELS[hp.structure]}</span>
        </div>
        <div className={styles.cardBody}>
          {td.hasDiff && (
            <div className={styles.diffBanner}>
              <span className={styles.diffIcon}>ℹ</span>
              <div className={styles.diffBody}>
                <strong>Differential deductible applies — In-Network only.</strong> This Member's Transcarent cost share for one or more care experiences may be lower than their health plan deductible maximum.{' '}
                <button className={styles.diffLink}>View product availability and benefits</button> for cost estimates by product.
              </div>
            </div>
          )}
          <NetworkSection tier={activeTier} network="inn" />
          <OtherTiersExpand activeTier={activeTier} network="inn" />
        </div>
      </div>

      {/* Out-of-Network */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Out-of-Network</span>
          <span className={styles.structureBadge}>{STRUCTURE_LABELS[hp.structure]}</span>
        </div>
        <div className={styles.cardBody}>
          <NetworkSection tier={activeTier} network="oon" />
          <OtherTiersExpand activeTier={activeTier} network="oon" />
        </div>
      </div>

      {/* HRA (only when Orbit returns HRA data) */}
      {td.hra && <HraCard hra={td.hra} source={td.source} />}

      {/* Primary care summary */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Primary care summary</span>
        </div>
        <div className={styles.primaryGrid}>
          <div className={styles.primaryItem}>
            <div className={styles.primaryItemLabel}>Primary care copay</div>
            <div className={styles.primaryItemVal}>{td.copay}</div>
            <div className={styles.primaryItemSub}>Per visit (In-Network)</div>
          </div>
          <div className={styles.primaryItem}>
            <div className={styles.primaryItemLabel}>Specialist coinsurance</div>
            <div className={styles.primaryItemVal}>{td.coins}</div>
            <div className={styles.primaryItemSub}>After deductible (In-Network)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
