/**
 * Trial Event Detail Page
 * 
 * Manage trial event: roster, staff, and access trial board
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';
import { ArrowLeftIcon, ArrowRightIcon } from '../components/icons/IconSet';

const TrialEventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [event, setEvent] = useState<any>(null);
  const [showAddTrialist, setShowAddTrialist] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [availableTrialists, setAvailableTrialists] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);

  useEffect(() => {
    if (eventId) {
      loadEvent();
      loadAvailableTrialists();
      loadCoaches();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getTrialEvent(Number(eventId));
      setEvent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTrialists = async () => {
    try {
      const response = await api.getTrialists();
      setAvailableTrialists(response.trialists || []);
    } catch (err) {
      console.error('Failed to load trialists:', err);
    }
  };

  const loadCoaches = async () => {
    try {
      const data = await api.getCoaches();
      setCoaches(data || []);
    } catch (err) {
      console.error('Failed to load coaches:', err);
    }
  };

  const handleAddTrialist = async (trialistId: number) => {
    try {
      await api.addTrialistToEvent(Number(eventId), { trialistId });
      setShowAddTrialist(false);
      loadEvent();
    } catch (err: any) {
      setError(err.message || 'Failed to add trialist');
    }
  };

  const handleRemoveTrialist = async (trialistId: number) => {
    try {
      await api.removeTrialistFromEvent(Number(eventId), trialistId);
      loadEvent();
    } catch (err: any) {
      setError(err.message || 'Failed to remove trialist');
    }
  };

  const handleAddStaff = async (coachId: number, role?: string) => {
    try {
      await api.addStaffToEvent(Number(eventId), { coachId, role });
      setShowAddStaff(false);
      loadEvent();
    } catch (err: any) {
      setError(err.message || 'Failed to add staff');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: spacing['2xl'], textAlign: 'center', color: colors.text.muted }}>
        Loading event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ padding: spacing['2xl'] }}>
        <Card variant="default" padding="lg">
          <div style={{ color: colors.danger.main }}>{error || 'Event not found'}</div>
          <Button variant="secondary" onClick={() => navigate('/realverse/trials/events')}>
            ← Back to Events
          </Button>
        </Card>
      </div>
    );
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
        <div style={{ marginBottom: spacing.xl }}>
          <Button variant="secondary" size="sm" onClick={() => navigate('/realverse/trials/events')} style={{ marginBottom: spacing.lg }}>
            <ArrowLeftIcon size={14} style={{ marginRight: spacing.xs }} /> Back to Events
          </Button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
                {event.title}
              </h1>
              <div style={{ ...typography.body, color: colors.text.muted }}>
                {event.center.name} • {new Date(event.startDateTime).toLocaleDateString()} - {new Date(event.endDateTime).toLocaleDateString()}
              </div>
            </div>
            <Button variant="primary" size="md" onClick={() => navigate(`/realverse/trials/board?eventId=${event.id}`)}>
              Open Trial Board <ArrowRightIcon size={14} style={{ marginLeft: spacing.xs }} />
            </Button>
          </div>
        </div>

        {/* Event Info */}
        <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
          <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
            Event Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md }}>
            <div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Status</div>
              <div style={{ ...typography.body, color: colors.text.primary }}>{event.status}</div>
            </div>
            <div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Age Groups</div>
              <div style={{ ...typography.body, color: colors.text.primary }}>{event.ageGroups.join(', ') || 'N/A'}</div>
            </div>
            <div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Positions Needed</div>
              <div style={{ ...typography.body, color: colors.text.primary }}>{event.positionsNeeded.join(', ') || 'N/A'}</div>
            </div>
            <div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Format</div>
              <div style={{ ...typography.body, color: colors.text.primary }}>{event.format || 'N/A'}</div>
            </div>
          </div>
        </Card>

        {/* Staff */}
        <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <h3 style={{ ...typography.h4, color: colors.text.primary }}>Staff Assigned</h3>
            <Button variant="secondary" size="sm" onClick={() => setShowAddStaff(true)}>
              + Add Staff
            </Button>
          </div>
          {event.staffAssigned && event.staffAssigned.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              {event.staffAssigned.map((staff: any) => (
                <div key={staff.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: spacing.sm, background: colors.surface.elevated, borderRadius: borderRadius.md }}>
                  <div>
                    <div style={{ ...typography.body, color: colors.text.primary }}>{staff.coach.fullName}</div>
                    {staff.role && <div style={{ ...typography.caption, color: colors.text.muted }}>{staff.role}</div>}
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => api.removeStaffFromEvent(Number(eventId), staff.coachId).then(() => loadEvent())}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: colors.text.muted, textAlign: 'center', padding: spacing.md }}>
              No staff assigned yet
            </div>
          )}
        </Card>

        {/* Trialists Roster */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <h3 style={{ ...typography.h4, color: colors.text.primary }}>
              Trialists Roster ({event.trialists?.length || 0})
            </h3>
            <Button variant="primary" size="sm" onClick={() => setShowAddTrialist(true)}>
              + Add Trialist
            </Button>
          </div>
          {event.trialists && event.trialists.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              {event.trialists.map((link: any) => (
                <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, background: colors.surface.elevated, borderRadius: borderRadius.md }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs }}>
                      {link.trialist.fullName}
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>
                      {link.trialist.primaryPosition || 'N/A'} • {link.trialist.dateOfBirth ? `Age ${new Date().getFullYear() - new Date(link.trialist.dateOfBirth).getFullYear()}` : 'N/A'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: spacing.sm }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/realverse/trials/trialists/${link.trialist.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/realverse/trials/reports/new?eventId=${event.id}&trialistId=${link.trialist.id}`)}
                    >
                      Create Report
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemoveTrialist(link.trialist.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: colors.text.muted, textAlign: 'center', padding: spacing.md }}>
              No trialists registered yet. Add trialists to get started.
            </div>
          )}
        </Card>

        {/* Modals */}
        {showAddTrialist && (
          <AddTrialistModal
            availableTrialists={availableTrialists}
            onClose={() => setShowAddTrialist(false)}
            onSelect={handleAddTrialist}
          />
        )}

        {showAddStaff && (
          <AddStaffModal
            coaches={coaches}
            onClose={() => setShowAddStaff(false)}
            onSelect={handleAddStaff}
          />
        )}
      </Section>
    </motion.main>
  );
};

const AddTrialistModal: React.FC<{ availableTrialists: any[]; onClose: () => void; onSelect: (id: number) => void }> = ({ availableTrialists, onClose, onSelect }) => {
  const [search, setSearch] = useState('');

  const filtered = availableTrialists.filter(t =>
    t.fullName.toLowerCase().includes(search.toLowerCase()) ||
    t.phone?.includes(search) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

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
        style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
        onClick={(e) => e?.stopPropagation()}
      >
        <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>
          Add Trialist
        </h3>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email..."
          style={{
            width: '100%',
            padding: spacing.sm,
            marginBottom: spacing.md,
            background: colors.surface.elevated,
            border: `1px solid ${colors.border.medium}`,
            borderRadius: borderRadius.md,
            color: colors.text.primary,
            fontSize: typography.fontSize.sm,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, maxHeight: '400px', overflowY: 'auto' }}>
          {filtered.map((trialist) => (
            <div
              key={trialist.id}
              onClick={() => onSelect(trialist.id)}
              style={{
                padding: spacing.md,
                background: colors.surface.elevated,
                borderRadius: borderRadius.md,
                cursor: 'pointer',
              }}
            >
              <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                {trialist.fullName}
              </div>
              <div style={{ ...typography.caption, color: colors.text.muted }}>
                {trialist.primaryPosition || 'N/A'} • {trialist.phone || 'No phone'}
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="md" onClick={onClose} style={{ marginTop: spacing.md }}>
          Cancel
        </Button>
      </Card>
    </div>
  );
};

const AddStaffModal: React.FC<{ coaches: any[]; onClose: () => void; onSelect: (coachId: number, role?: string) => void }> = ({ coaches, onClose, onSelect }) => {
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [role, setRole] = useState('');

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
        style={{ maxWidth: '400px', width: '100%' }}
        onClick={(e) => e?.stopPropagation()}
      >
        <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>
          Add Staff
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <div>
            <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
              Coach
            </label>
            <select
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
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
              <option value="">Select coach...</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
              Role (Optional)
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Lead Evaluator"
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
        <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg }}>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (selectedCoachId) {
                onSelect(Number(selectedCoachId), role || undefined);
              }
            }}
            disabled={!selectedCoachId}
          >
            Add
          </Button>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TrialEventDetailPage;

