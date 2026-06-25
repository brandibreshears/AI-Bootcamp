import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { Card } from '../../components/ui/Card/Card';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { PeopleIcon, DocumentIcon, HeartIcon, HospitalIcon } from '../../components/ui/Icons';
import { members, claims, careEpisodes, providers, getMemberById } from '../../store/mockData';

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

export default function Dashboard() {
  const navigate = useNavigate();

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'Active').length;
  const activeClaims = claims.filter((c) => c.status === 'Pending' || c.status === 'In Review').length;
  const openCases = careEpisodes.filter((e) => e.status === 'Open' || e.status === 'In Progress' || e.status === 'Escalated').length;
  const inNetworkProviders = providers.filter((p) => p.networkStatus === 'In-Network').length;

  const recentClaims = [...claims]
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
    .slice(0, 5);

  return (
    <div className={styles.page}>
      <div className={styles.statsRow}>
        <Card elevated>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Total Members</span>
              <span className={styles.statIcon}><PeopleIcon /></span>
            </div>
            <div className={styles.statValue}>{totalMembers}</div>
            <div className={styles.statSubtext}>{activeMembers} active</div>
          </div>
        </Card>
        <Card elevated>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Active Claims</span>
              <span className={styles.statIcon}><DocumentIcon /></span>
            </div>
            <div className={styles.statValue}>{activeClaims}</div>
            <div className={styles.statSubtext}>Pending or in review</div>
          </div>
        </Card>
        <Card elevated>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Open Care Cases</span>
              <span className={styles.statIcon}><HeartIcon /></span>
            </div>
            <div className={styles.statValue}>{openCases}</div>
            <div className={styles.statSubtext}>Requires attention</div>
          </div>
        </Card>
        <Card elevated>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>In-Network Providers</span>
              <span className={styles.statIcon}><HospitalIcon /></span>
            </div>
            <div className={styles.statValue}>{inNetworkProviders}</div>
            <div className={styles.statSubtext}>of {providers.length} total</div>
          </div>
        </Card>
      </div>

      <div className={styles.twoCol}>
        <Card elevated>
          <h2 className={styles.sectionTitle}>Recent Claims</h2>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Claim #</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentClaims.map((claim) => {
                const member = getMemberById(claim.memberId);
                return (
                  <tr key={claim.id}>
                    <td className={styles.memberName}>
                      {member ? `${member.firstName} ${member.lastName}` : '—'}
                    </td>
                    <td>{claim.claimNumber}</td>
                    <td>{claim.serviceType}</td>
                    <td>
                      <Badge variant={claimStatusVariant(claim.status)}>{claim.status}</Badge>
                    </td>
                    <td>{formatCurrency(claim.billedAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card elevated>
          <h2 className={styles.quickActionsTitle}>Quick Actions</h2>
          <div className={styles.quickActions}>
            <Button
              appearance="primary"
              className={styles.quickActionBtn}
              onClick={() => navigate('/members')}
            >
              New Member
            </Button>
            <Button
              appearance="secondary"
              className={styles.quickActionBtn}
              onClick={() => navigate('/claims')}
            >
              Submit Claim
            </Button>
            <Button
              appearance="secondary"
              className={styles.quickActionBtn}
              onClick={() => navigate('/care')}
            >
              Start Care Case
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
