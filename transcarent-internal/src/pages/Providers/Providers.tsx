import React, { useState, useMemo } from 'react';
import styles from './Providers.module.css';
import { Card } from '../../components/ui/Card/Card';
import { Badge } from '../../components/ui/Badge/Badge';
import { Select } from '../../components/ui/Select/Select';
import { providers } from '../../store/mockData';

function networkVariant(status: string): 'success' | 'neutral' {
  return status === 'In-Network' ? 'success' : 'neutral';
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}

export default function Providers() {
  const [networkFilter, setNetworkFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  const specialties = useMemo(() => {
    const set = new Set(providers.map((p) => p.specialty));
    return Array.from(set).sort();
  }, []);

  const networkOptions = [
    { value: '', label: 'All Networks' },
    { value: 'In-Network', label: 'In-Network' },
    { value: 'Out-of-Network', label: 'Out-of-Network' },
  ];

  const specialtyOptions = [
    { value: '', label: 'All Specialties' },
    ...specialties.map((s) => ({ value: s, label: s })),
  ];

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      const matchNetwork = !networkFilter || p.networkStatus === networkFilter;
      const matchSpecialty = !specialtyFilter || p.specialty === specialtyFilter;
      const matchAccepting = !acceptingOnly || p.acceptingPatients;
      return matchNetwork && matchSpecialty && matchAccepting;
    });
  }, [networkFilter, specialtyFilter, acceptingOnly]);

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <div className={styles.filterSelect}>
          <Select
            options={networkOptions}
            value={networkFilter}
            onChange={(e) => setNetworkFilter(e.target.value)}
            id="network-filter"
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            options={specialtyOptions}
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            id="specialty-filter"
          />
        </div>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={acceptingOnly}
            onChange={(e) => setAcceptingOnly(e.target.checked)}
          />
          Accepting patients only
        </label>
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <p className={styles.emptyState}>No providers match your filters.</p>
        ) : (
          filtered.map((p) => (
            <Card key={p.id} elevated className={styles.providerCard}>
              <div className={styles.providerHeader}>
                <h4 className={styles.providerName}>{p.name}</h4>
                <Badge variant={networkVariant(p.networkStatus)}>{p.networkStatus}</Badge>
              </div>
              <div className={styles.specialty}>{p.specialty}</div>
              <div className={styles.npi}>NPI: {p.npi}</div>
              <div className={styles.address}>
                {p.address}
                <br />
                {p.city}, {p.state}
              </div>
              <div className={styles.phone}>{p.phone}</div>
              <div className={styles.footer}>
                <span className={styles.stars} title={`${p.rating} out of 5`}>
                  {renderStars(p.rating)}
                </span>
                <div className={styles.accepting}>
                  <span className={`${styles.dot} ${p.acceptingPatients ? styles.dotGreen : styles.dotGray}`} />
                  <span className={p.acceptingPatients ? styles.acceptingText : styles.notAcceptingText}>
                    {p.acceptingPatients ? 'Accepting' : 'Not accepting'}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
