import React, { useState, useMemo } from 'react';
import styles from './Care.module.css';
import { Card } from '../../components/ui/Card/Card';
import { Badge } from '../../components/ui/Badge/Badge';
import { Select } from '../../components/ui/Select/Select';
import { careEpisodes, getMemberById } from '../../store/mockData';

type EpisodeStatus = 'Open' | 'In Progress' | 'Resolved' | 'Escalated';

function priorityVariant(priority: string): 'error' | 'warning' | 'info' | 'neutral' {
  switch (priority) {
    case 'Critical': return 'error';
    case 'High': return 'warning';
    case 'Medium': return 'info';
    default: return 'neutral';
  }
}

const columns: EpisodeStatus[] = ['Open', 'In Progress', 'Resolved', 'Escalated'];

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Surgery', label: 'Surgery' },
  { value: 'Chronic', label: 'Chronic' },
  { value: 'Mental Health', label: 'Mental Health' },
  { value: 'Maternity', label: 'Maternity' },
  { value: 'Cancer', label: 'Cancer' },
  { value: 'General', label: 'General' },
];

export default function Care() {
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filtered = useMemo(() => {
    return careEpisodes.filter((ep) => {
      const matchPriority = !priorityFilter || ep.priority === priorityFilter;
      const matchCategory = !categoryFilter || ep.category === categoryFilter;
      return matchPriority && matchCategory;
    });
  }, [priorityFilter, categoryFilter]);

  const byStatus = (status: EpisodeStatus) => filtered.filter((ep) => ep.status === status);

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <div className={styles.filterSelect}>
          <Select
            options={priorityOptions}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            id="priority-filter"
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            id="category-filter"
          />
        </div>
      </div>

      <div className={styles.board}>
        {columns.map((col) => {
          const episodes = byStatus(col);
          return (
            <div key={col} className={styles.column}>
              <div className={styles.columnHeader}>
                <span className={styles.columnTitle}>{col}</span>
                <span className={styles.columnCount}>{episodes.length}</span>
              </div>
              {episodes.length === 0 ? (
                <p className={styles.emptyColumn}>No episodes</p>
              ) : (
                episodes.map((ep) => {
                  const member = getMemberById(ep.memberId);
                  return (
                    <Card key={ep.id} className={styles.episodeCard}>
                      <h4 className={styles.episodeTitle}>{ep.title}</h4>
                      <div className={styles.episodeBadges}>
                        <Badge variant={priorityVariant(ep.priority)}>{ep.priority}</Badge>
                        <Badge variant="neutral">{ep.category}</Badge>
                      </div>
                      <div className={styles.episodeMeta}>
                        {member && (
                          <span className={styles.metaRow}>
                            {member.firstName} {member.lastName}
                          </span>
                        )}
                        <span className={styles.metaRow}>
                          Navigator: {ep.assignedNavigator}
                        </span>
                        <span className={styles.metaRow}>
                          Updated: {new Date(ep.lastUpdated).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
