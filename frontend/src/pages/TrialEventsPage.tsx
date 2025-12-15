/**
 * Trial Events Page
 * 
 * List and manage trial events
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';

interface TrialEvent {
  id: number;
  title: string;
  center: { name: string };
  startDateTime: string;
  endDateTime: string;
  ageGroups: string[];
  positionsNeeded: string[];
  status: string;
  _count: {
    trialists: number;
    reports: number;
    staffAssigned: number;
  };
}

const TrialEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState<TrialEvent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getTrialEvents({
        coachId: user?.role === 'COACH' ? user.id : undefined,
      });
      setEvents(response.events || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return colors.success.main;
      case 'CLOSED': return colors.text.muted;
      case 'ARCHIVED': return colors.text.disabled;
      default: return colors.info.main;
    }
  };

  if (!user || (user.role !== 'COACH' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: colors.surface.bg,
        minHeight: '100vh',
        padding: spacing.xl,
      }}
    >
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing.xl }}>
          <div>
            <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.md }}>
              Trial Events
            </h1>
            <p style={{ ...typography.body, color: colors.text.muted }}>
              Manage trial sessions and evaluate external players
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
            + New Trial Event
          </Button>
        </div>

        {error && (
          <Card variant="default" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
            <div style={{ color: colors.danger.main }}>{error}</div>
          </Card>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <Card variant="default" padding="lg">
            <div style={{ textAlign: 'center', color: colors.text.muted }}>
              <div style={{ marginBottom: spacing.md, fontSize: typography.fontSize.lg }}>
                No trial events yet
              </div>
              <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
                Create Your First Trial Event
              </Button>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: spacing.lg }}>
            {events.map((event) => (
              <Card
                key={event.id}
                variant="default"
                padding="lg"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/realverse/trials/events/${event.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing.md }}>
                  <h3 style={{ ...typography.h4, color: colors.text.primary, flex: 1 }}>
                    {event.title}
                  </h3>
                  <div
                    style={{
                      padding: `${spacing.xs} ${spacing.sm}`,
                      background: getStatusColor(event.status) + '20',
                      color: getStatusColor(event.status),
                      borderRadius: borderRadius.sm,
                      ...typography.caption,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    {event.status}
                  </div>
                </div>

                <div style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.sm }}>
                  {event.center.name}
                </div>

                <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.md }}>
                  {new Date(event.startDateTime).toLocaleDateString()} - {new Date(event.endDateTime).toLocaleDateString()}
                </div>

                <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.md, ...typography.caption, color: colors.text.muted }}>
                  <span>{event._count.trialists} trialists</span>
                  <span>•</span>
                  <span>{event._count.reports} reports</span>
                  <span>•</span>
                  <span>{event._count.staffAssigned} staff</span>
                </div>

                <div style={{ marginTop: spacing.md, display: 'flex', gap: spacing.sm }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/realverse/trials/events/${event.id}`);
                    }}
                  >
                    View Event
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/realverse/trials/board?eventId=${event.id}`);
                    }}
                  >
                    Trial Board
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <CreateTrialEventModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadEvents();
            }}
          />
        )}
      </Section>
    </motion.main>
  );
};

const CreateTrialEventModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [centers, setCenters] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    centerId: '',
    startDateTime: '',
    endDateTime: '',
    ageGroups: [] as string[],
    positionsNeeded: [] as string[],
    format: '',
    notes: '',
  });

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      const data = await api.getCenters();
      setCenters(data || []);
    } catch (err) {
      console.error('Failed to load centers:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.centerId || !formData.startDateTime || !formData.endDateTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.createTrialEvent({
        title: formData.title,
        centerId: Number(formData.centerId),
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        ageGroups: formData.ageGroups,
        positionsNeeded: formData.positionsNeeded,
        format: formData.format || undefined,
        notes: formData.notes || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const toggleAgeGroup = (ageGroup: string) => {
    setFormData(prev => ({
      ...prev,
      ageGroups: prev.ageGroups.includes(ageGroup)
        ? prev.ageGroups.filter(g => g !== ageGroup)
        : [...prev.ageGroups, ageGroup],
    }));
  };

  const togglePosition = (position: string) => {
    setFormData(prev => ({
      ...prev,
      positionsNeeded: prev.positionsNeeded.includes(position)
        ? prev.positionsNeeded.filter(p => p !== position)
        : [...prev.positionsNeeded, position],
    }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: spacing.xl,
      }}
      onClick={onClose}
    >
      <Card
        variant="default"
        padding="lg"
        style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
          Create Trial Event
        </h3>

        {error && (
          <div style={{ padding: spacing.md, background: colors.danger.soft, borderRadius: borderRadius.md, marginBottom: spacing.md, color: colors.danger.main }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <div>
              <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., U17 Trials – Jan 2026 – Centre 3lok"
                required
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  background: colors.surface.elevated,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                }}
              />
            </div>

            <div>
              <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                Centre *
              </label>
              <select
                value={formData.centerId}
                onChange={(e) => setFormData({ ...formData, centerId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  background: colors.surface.elevated,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                }}
              >
                <option value="">Select centre...</option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              <div>
                <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    background: colors.surface.elevated,
                    border: `1px solid ${colors.border.medium}`,
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>
              <div>
                <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDateTime}
                  onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    background: colors.surface.elevated,
                    border: `1px solid ${colors.border.medium}`,
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                Age Groups *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
                {['U13', 'U15', 'U17', 'U19', 'Senior'].map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => toggleAgeGroup(age)}
                    style={{
                      padding: `${spacing.xs} ${spacing.sm}`,
                      background: formData.ageGroups.includes(age) ? colors.primary.main : colors.surface.elevated,
                      color: formData.ageGroups.includes(age) ? colors.surface.bg : colors.text.primary,
                      border: `1px solid ${colors.border.medium}`,
                      borderRadius: borderRadius.md,
                      cursor: 'pointer',
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                Positions Needed *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
                {['GK', 'CB', 'FB', 'WB', 'DM', 'CM', 'AM', 'W', 'ST'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => togglePosition(pos)}
                    style={{
                      padding: `${spacing.xs} ${spacing.sm}`,
                      background: formData.positionsNeeded.includes(pos) ? colors.primary.main : colors.surface.elevated,
                      color: formData.positionsNeeded.includes(pos) ? colors.surface.bg : colors.text.primary,
                      border: `1px solid ${colors.border.medium}`,
                      borderRadius: borderRadius.md,
                      cursor: 'pointer',
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  background: colors.surface.elevated,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                }}
              >
                <option value="">Select format...</option>
                <option value="small-sided">Small-Sided</option>
                <option value="full match">Full Match</option>
                <option value="drills + match">Drills + Match</option>
              </select>
            </div>

            <div>
              <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  background: colors.surface.elevated,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg }}>
            <Button variant="primary" size="md" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
            <Button variant="secondary" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TrialEventsPage;

