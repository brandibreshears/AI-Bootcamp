import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ApprovalQueue.module.css';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { WarningIcon } from '../../components/ui/Icons';

type ApprovalStatus = 'Pending' | 'Correction required' | 'Approved' | 'Discarded';

interface ApprovalRow {
  id: string;
  memberName: string;
  client: string;
  type: 'Cost share' | 'Recoupment';
  encounter: string;
  encounterDate: string;
  amount: number;
  submittedBy: string;
  submittedDate: string;
  status: ApprovalStatus;
}

const mockRows: ApprovalRow[] = [
  {
    id: 'a1',
    memberName: 'Sarah Mitchell',
    client: 'Apex Industries',
    type: 'Cost share',
    encounter: 'Surgery',
    encounterDate: '2026-01-15',
    amount: 1250,
    submittedBy: 'J. Rodriguez',
    submittedDate: '2026-06-10',
    status: 'Pending',
  },
  {
    id: 'a2',
    memberName: 'Marcus Webb',
    client: 'BrightPath Co',
    type: 'Recoupment',
    encounter: 'Office visit',
    encounterDate: '2026-02-03',
    amount: 875,
    submittedBy: 'T. Chen',
    submittedDate: '2026-06-12',
    status: 'Pending',
  },
  {
    id: 'a3',
    memberName: 'Elena Vasquez',
    client: 'Delta Health',
    type: 'Cost share',
    encounter: 'Lab / Diagnostics',
    encounterDate: '2026-03-10',
    amount: 2100,
    submittedBy: 'J. Rodriguez',
    submittedDate: '2026-06-15',
    status: 'Correction required',
  },
];

const filterChips = ['All types', 'Cost share', 'Recoupment', 'By submitter'];

function statusVariant(status: ApprovalStatus): 'success' | 'error' | 'warning' | 'info' | 'neutral' {
  switch (status) {
    case 'Pending': return 'warning';
    case 'Correction required': return 'error';
    case 'Approved': return 'success';
    case 'Discarded': return 'neutral';
    default: return 'neutral';
  }
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export default function ApprovalQueue() {
  const navigate = useNavigate();
  const [activeChip, setActiveChip] = useState('All types');
  const [rows, setRows] = useState(mockRows);

  function handleApprove(id: string) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Approved' } : r));
  }

  function handleAdjustment(id: string) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Correction required' } : r));
  }

  function handleDiscard(id: string) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Discarded' } : r));
  }

  const filtered = rows.filter((r) => {
    if (activeChip === 'All types') return true;
    if (activeChip === 'Cost share') return r.type === 'Cost share';
    if (activeChip === 'Recoupment') return r.type === 'Recoupment';
    return true;
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <button className={styles.backLink} onClick={() => navigate('/billing')}>
            ← Back to Member payments
          </button>
          <h2 className={styles.pageTitle}>Approval queue</h2>
        </div>
      </div>

      {/* Read-only banner */}
      <div className={styles.readOnlyBanner}>
        <WarningIcon className={styles.bannerIcon} />
        <span>
          <strong>You have read-only access.</strong> Only billing managers can approve invoices.
        </span>
      </div>

      {/* Filter chips */}
      <div className={styles.filterChips}>
        {filterChips.map((chip) => (
          <button
            key={chip}
            className={`${styles.chip} ${activeChip === chip ? styles.chipActive : ''}`}
            onClick={() => setActiveChip(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Member</th>
              <th className={styles.th}>Type</th>
              <th className={styles.th}>Encounter</th>
              <th className={styles.th}>Amount</th>
              <th className={styles.th}>Submitted by</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.memberName}>{row.memberName}</div>
                  <div className={styles.memberClient}>{row.client}</div>
                </td>
                <td className={styles.td}>{row.type}</td>
                <td className={styles.td}>
                  <div>{row.encounter}</div>
                  <div className={styles.encounterDate}>{row.encounterDate}</div>
                </td>
                <td className={styles.td}>
                  <span className={styles.amount}>{formatCurrency(row.amount)}</span>
                </td>
                <td className={styles.td}>{row.submittedBy}</td>
                <td className={styles.td}>{row.submittedDate}</td>
                <td className={styles.td}>
                  <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                </td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    <Button
                      appearance="primary"
                      size="small"
                      disabled={row.status === 'Approved' || row.status === 'Discarded'}
                      onClick={() => handleApprove(row.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      appearance="secondary"
                      size="small"
                      disabled={row.status === 'Approved' || row.status === 'Discarded'}
                      onClick={() => handleAdjustment(row.id)}
                    >
                      Adjustment required
                    </Button>
                    <Button
                      appearance="negative"
                      size="small"
                      disabled={row.status === 'Approved' || row.status === 'Discarded'}
                      onClick={() => handleDiscard(row.id)}
                    >
                      Discard
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
