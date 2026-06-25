import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberById, getClaimsByMemberId, getCareEpisodesByMemberId } from '../../store/mockData';
import { Card } from '../../components/ui/Card/Card';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { Avatar } from '../../components/ui/Avatar/Avatar';
import styles from './MemberDetail.module.css';

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

function claimStatusVariant(status: string): 'success' | 'error' | 'warning' | 'info' | 'neutral' {
  switch (status) {
    case 'Approved': return 'success';
    case 'Denied': return 'error';
    case 'Pending': return 'warning';
    case 'In Review': return 'info';
    default: return 'neutral';
  }
}

function priorityVariant(priority: string): 'error' | 'warning' | 'info' | 'neutral' {
  switch (priority) {
    case 'Critical': return 'error';
    case 'High': return 'warning';
    case 'Medium': return 'info';
    default: return 'neutral';
  }
}

function episodeStatusVariant(status: string): 'success' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'Resolved': return 'success';
    case 'Escalated': return 'error';
    case 'In Progress': return 'info';
    default: return 'neutral';
  }
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

type Tab = 'overview' | 'claims' | 'care';

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const member = id ? getMemberById(id) : undefined;

  if (!member) {
    return (
      <div className={styles.notFound}>
        <p>Member not found.</p>
        <Button appearance="secondary" onClick={() => navigate('/members')}>
          Back to Members
        </Button>
      </div>
    );
  }

  const memberClaims = getClaimsByMemberId(member.id);
  const memberEpisodes = getCareEpisodesByMemberId(member.id);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button appearance="tertiary" size="small" onClick={() => navigate('/members')}>
          ← Back
        </Button>
        <div className={styles.memberInfo}>
          <Avatar name={`${member.firstName} ${member.lastName}`} size="lg" />
          <div>
            <h1 className={styles.memberName}>
              {member.firstName} {member.lastName}
            </h1>
            <div className={styles.badges}>
              <Badge variant={planVariant(member.plan)}>{member.plan}</Badge>
              <Badge variant={statusVariant(member.status)}>{member.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {(['overview', 'claims', 'care'] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'claims' && ` (${memberClaims.length})`}
            {tab === 'care' && ` (${memberEpisodes.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <Card elevated>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date of Birth</span>
              <span className={styles.infoValue}>
                {new Date(member.dateOfBirth).toLocaleDateString('en-US')}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Member ID</span>
              <span className={styles.infoValue}>{member.memberId}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Employer</span>
              <span className={styles.infoValue}>{member.employer}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Primary Care Physician</span>
              <span className={styles.infoValue}>{member.primaryCarePhysician ?? '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{member.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>{member.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Enrolled Date</span>
              <span className={styles.infoValue}>
                {new Date(member.enrolledDate).toLocaleDateString('en-US')}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Plan</span>
              <span className={styles.infoValue}>{member.plan}</span>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'claims' && (
        <Card elevated>
          {memberClaims.length === 0 ? (
            <p className={styles.empty}>No claims found for this member.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Claim #</th>
                  <th>Date</th>
                  <th>Provider</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Billed</th>
                  <th>Plan Paid</th>
                </tr>
              </thead>
              <tbody>
                {memberClaims.map((c) => (
                  <tr key={c.id}>
                    <td>{c.claimNumber}</td>
                    <td>{new Date(c.serviceDate).toLocaleDateString('en-US')}</td>
                    <td>{c.provider}</td>
                    <td>{c.serviceType}</td>
                    <td>
                      <Badge variant={claimStatusVariant(c.status)}>{c.status}</Badge>
                    </td>
                    <td>{formatCurrency(c.billedAmount)}</td>
                    <td>{formatCurrency(c.planPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {activeTab === 'care' && (
        <div className={styles.episodeList}>
          {memberEpisodes.length === 0 ? (
            <Card>
              <p className={styles.empty}>No care episodes found for this member.</p>
            </Card>
          ) : (
            memberEpisodes.map((ep) => (
              <Card key={ep.id} elevated>
                <div className={styles.episodeHeader}>
                  <h3 className={styles.episodeTitle}>{ep.title}</h3>
                  <div className={styles.episodeBadges}>
                    <Badge variant={episodeStatusVariant(ep.status)}>{ep.status}</Badge>
                    <Badge variant={priorityVariant(ep.priority)}>{ep.priority}</Badge>
                  </div>
                </div>
                <div className={styles.episodeMeta}>
                  <span className={styles.metaItem}>
                    <strong>Category:</strong> {ep.category}
                  </span>
                  <span className={styles.metaItem}>
                    <strong>Navigator:</strong> {ep.assignedNavigator}
                  </span>
                  <span className={styles.metaItem}>
                    <strong>Created:</strong>{' '}
                    {new Date(ep.createdDate).toLocaleDateString('en-US')}
                  </span>
                  <span className={styles.metaItem}>
                    <strong>Updated:</strong>{' '}
                    {new Date(ep.lastUpdated).toLocaleDateString('en-US')}
                  </span>
                </div>
                <p className={styles.episodeNotes}>{ep.notes}</p>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
