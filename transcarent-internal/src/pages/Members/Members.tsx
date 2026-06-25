import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Members.module.css';
import { Card } from '../../components/ui/Card/Card';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';
import { members, Member } from '../../store/mockData';

function planVariant(plan: string): 'success' | 'info' | 'neutral' {
  switch (plan) {
    case 'Premium': return 'success';
    case 'Plus': return 'info';
    default: return 'neutral';
  }
}

function statusVariant(status: string): 'success' | 'warning' | 'neutral' {
  switch (status) {
    case 'Active': return 'success';
    case 'Pending': return 'warning';
    default: return 'neutral';
  }
}

const planOptions = [
  { value: '', label: 'All Plans' },
  { value: 'Core', label: 'Core' },
  { value: 'Plus', label: 'Plus' },
  { value: 'Premium', label: 'Premium' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Pending', label: 'Pending' },
];

export default function Members() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter((m: Member) => {
      const matchSearch =
        !q ||
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.memberId.toLowerCase().includes(q) ||
        m.employer.toLowerCase().includes(q);
      const matchPlan = !planFilter || m.plan === planFilter;
      const matchStatus = !statusFilter || m.status === statusFilter;
      return matchSearch && matchPlan && matchStatus;
    });
  }, [search, planFilter, statusFilter]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Members</h1>
        <Button appearance="primary">Add Member</Button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterSearch}>
          <Input
            placeholder="Search by name or member ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="member-search"
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            options={planOptions}
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            id="plan-filter"
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="status-filter"
          />
        </div>
      </div>

      <Card elevated className={styles.tableCard}>
        {filtered.length === 0 ? (
          <p className={styles.emptyState}>No members match your filters.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Member ID</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Employer</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className={styles.memberName}>
                      {m.firstName} {m.lastName}
                    </span>
                  </td>
                  <td className={styles.memberId}>{m.memberId}</td>
                  <td>
                    <Badge variant={planVariant(m.plan)}>{m.plan}</Badge>
                  </td>
                  <td>
                    <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
                  </td>
                  <td>{m.employer}</td>
                  <td>{new Date(m.enrolledDate).toLocaleDateString('en-US')}</td>
                  <td>
                    <Button
                      appearance="secondary"
                      size="small"
                      onClick={() => navigate(`/members/${m.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
