import React, { useState, useMemo } from 'react';
import styles from './Claims.module.css';
import { Card } from '../../components/ui/Card/Card';
import { Badge } from '../../components/ui/Badge/Badge';
import { Select } from '../../components/ui/Select/Select';
import { claims, getMemberById } from '../../store/mockData';

function claimStatusVariant(status: string): 'success' | 'error' | 'warning' | 'info' | 'neutral' {
  switch (status) {
    case 'Approved': return 'success';
    case 'Denied': return 'error';
    case 'Pending': return 'warning';
    case 'In Review': return 'info';
    default: return 'neutral';
  }
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Denied', label: 'Denied' },
  { value: 'In Review', label: 'In Review' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Pharmacy', label: 'Pharmacy' },
  { value: 'Dental', label: 'Dental' },
  { value: 'Vision', label: 'Vision' },
  { value: 'Mental Health', label: 'Mental Health' },
];

export default function Claims() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    return claims.filter((c) => {
      const matchStatus = !statusFilter || c.status === statusFilter;
      const matchType = !typeFilter || c.serviceType === typeFilter;
      return matchStatus && matchType;
    });
  }, [statusFilter, typeFilter]);

  const totalBilled = claims.reduce((sum, c) => sum + c.billedAmount, 0);
  const totalPlanPaid = claims.reduce((sum, c) => sum + c.planPaid, 0);
  const pendingCount = claims.filter((c) => c.status === 'Pending').length;
  const deniedCount = claims.filter((c) => c.status === 'Denied').length;

  return (
    <div className={styles.page}>
      <Card elevated>
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Billed</span>
            <span className={styles.statValue}>{formatCurrency(totalBilled)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Plan Paid</span>
            <span className={styles.statValue}>{formatCurrency(totalPlanPaid)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Pending</span>
            <span className={styles.statValue}>{pendingCount}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Denied</span>
            <span className={styles.statValue}>{deniedCount}</span>
          </div>
        </div>
      </Card>

      <div className={styles.filters}>
        <div className={styles.filterSelect}>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="claim-status"
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            options={typeOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            id="claim-type"
          />
        </div>
      </div>

      <Card elevated className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>Claim #</th>
              <th>Member</th>
              <th>Provider</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Billed</th>
              <th>Plan Paid</th>
              <th>Member Resp.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const member = getMemberById(c.memberId);
              return (
                <tr key={c.id}>
                  <td>{c.claimNumber}</td>
                  <td className={styles.memberName}>
                    {member ? `${member.firstName} ${member.lastName}` : '—'}
                  </td>
                  <td>{c.provider}</td>
                  <td>{c.serviceType}</td>
                  <td>{new Date(c.serviceDate).toLocaleDateString('en-US')}</td>
                  <td>
                    <Badge variant={claimStatusVariant(c.status)}>{c.status}</Badge>
                  </td>
                  <td>{formatCurrency(c.billedAmount)}</td>
                  <td>{formatCurrency(c.planPaid)}</td>
                  <td>{formatCurrency(c.memberResponsibility)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
