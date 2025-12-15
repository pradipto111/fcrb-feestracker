/**
 * Scouting Board Page
 * 
 * Decision workspace for coaches/admins to manage shortlists and make scouting decisions
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

interface ScoutingPlayer {
  id: number;
  fullName: string;
  center?: string;
  ageGroup?: string;
  snapshotId?: number;
  snapshotDate?: string;
  readiness?: {
    overall: number;
    technical: number;
    physical: number;
    mental: number;
    attitude: number;
    tacticalFit: number;
    statusBand: string;
  };
  positionalSuitability: Array<{
    position: string;
    suitability: number;
  }>;
  keyMetrics: Array<{
    key: string;
    displayName: string;
    value: number;
  }>;
}

interface ScoutingBoard {
  id: number;
  name: string;
  description?: string;
  type: 'CENTRE_VIEW' | 'CLUB_WIDE' | 'CUSTOM';
  centerId?: number;
  center?: { name: string };
  _count?: {
    players: number;
    decisions: number;
  };
}

const ScoutingBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [boards, setBoards] = useState<ScoutingBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<ScoutingBoard | null>(null);
  const [boardPlayers, setBoardPlayers] = useState<ScoutingPlayer[]>([]);
  const [allPlayers, setAllPlayers] = useState<ScoutingPlayer[]>([]);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [filters, setFilters] = useState({
    centerId: undefined as number | undefined,
    position: '',
    ageGroup: '',
    readinessMin: undefined as number | undefined,
    readinessMax: undefined as number | undefined,
    sortBy: 'readiness',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  // Only allow COACH/ADMIN
  useEffect(() => {
    if (user && user.role !== 'COACH' && user.role !== 'ADMIN') {
      navigate('/realverse');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      loadBoards();
      loadPlayers();
    }
  }, [user, filters]);

  useEffect(() => {
    if (selectedBoard) {
      loadBoardPlayers();
    }
  }, [selectedBoard]);

  const loadBoards = async () => {
    try {
      const response = await api.getScoutingBoards();
      setBoards(response.boards || []);
    } catch (err: any) {
      console.error('Failed to load boards:', err);
    }
  };

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const response = await api.getPlayersForScouting({
        centerId: filters.centerId,
        position: filters.position || undefined,
        ageGroup: filters.ageGroup || undefined,
        readinessMin: filters.readinessMin,
        readinessMax: filters.readinessMax,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: 100,
      });
      setAllPlayers(response.players || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const loadBoardPlayers = async () => {
    if (!selectedBoard) return;
    try {
      const response = await api.getBoardPlayers(selectedBoard.id);
      setBoardPlayers(response.players?.map((p: any) => ({
        id: p.student.id,
        fullName: p.student.fullName,
        center: p.student.center?.name,
        ageGroup: p.student.programType,
        snapshotId: p.student.metricSnapshots[0]?.id,
        readiness: p.student.metricSnapshots[0]?.readiness ? {
          overall: p.student.metricSnapshots[0].readiness.overall,
          technical: p.student.metricSnapshots[0].readiness.technical,
          physical: p.student.metricSnapshots[0].readiness.physical,
          mental: p.student.metricSnapshots[0].readiness.mental,
          attitude: p.student.metricSnapshots[0].readiness.attitude,
          tacticalFit: p.student.metricSnapshots[0].readiness.tacticalFit,
          statusBand: getStatusBand(p.student.metricSnapshots[0].readiness.overall),
        } : undefined,
        positionalSuitability: p.student.metricSnapshots[0]?.positional || [],
        keyMetrics: [],
      })) || []);
    } catch (err: any) {
      console.error('Failed to load board players:', err);
    }
  };

  const getStatusBand = (overall: number): string => {
    if (overall >= 85) return 'Ready';
    if (overall >= 75) return 'Advanced';
    if (overall >= 60) return 'Competitive';
    if (overall >= 40) return 'Developing';
    return 'Foundation';
  };

  const getStatusBandColor = (band: string) => {
    switch (band) {
      case 'Ready': return colors.success.main;
      case 'Advanced': return colors.primary.main;
      case 'Competitive': return colors.warning.main;
      case 'Developing': return colors.info.main;
      default: return colors.text.muted;
    }
  };

  const handleCreateBoard = async (data: { name: string; description?: string; type: string; centerId?: number }) => {
    try {
      await api.createScoutingBoard(data);
      setShowCreateBoard(false);
      loadBoards();
    } catch (err: any) {
      setError(err.message || 'Failed to create board');
    }
  };

  const handleAddPlayer = async (studentId: number) => {
    if (!selectedBoard) return;
    try {
      await api.addPlayerToBoard(selectedBoard.id, { studentId });
      loadBoardPlayers();
      loadPlayers();
    } catch (err: any) {
      setError(err.message || 'Failed to add player');
    }
  };

  const handleRemovePlayer = async (studentId: number) => {
    if (!selectedBoard) return;
    try {
      await api.removePlayerFromBoard(selectedBoard.id, studentId);
      loadBoardPlayers();
    } catch (err: any) {
      setError(err.message || 'Failed to remove player');
    }
  };

  const handleCompare = (playerIds: number[]) => {
    if (playerIds.length < 2) {
      setError('Select at least 2 players to compare');
      return;
    }
    navigate(`/realverse/scouting/compare?playerIds=${playerIds.join(',')}&position=${filters.position || 'CM'}`);
  };

  if (!user || (user.role !== 'COACH' && user.role !== 'ADMIN')) {
    return null;
  }

  const displayPlayers = selectedBoard ? boardPlayers : allPlayers;

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
          <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.md }}>
            Scouting Board
          </h1>
          <p style={{ ...typography.body, color: colors.text.muted }}>
            Decision workspace for player evaluation and shortlist management
          </p>
        </div>

        {error && (
          <Card variant="default" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
            <div style={{ color: colors.danger.main }}>{error}</div>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: spacing.xl }}>
          {/* Sidebar - Boards & Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {/* Boards List */}
            <Card variant="default" padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                <h3 style={{ ...typography.h4, color: colors.text.primary }}>Boards</h3>
                <Button variant="primary" size="sm" onClick={() => setShowCreateBoard(true)}>
                  + New
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
                <button
                  onClick={() => setSelectedBoard(null)}
                  style={{
                    padding: spacing.sm,
                    background: selectedBoard === null ? colors.primary.soft : 'transparent',
                    border: 'none',
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  All Players
                </button>
                {boards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => setSelectedBoard(board)}
                    style={{
                      padding: spacing.sm,
                      background: selectedBoard?.id === board.id ? colors.primary.soft : 'transparent',
                      border: 'none',
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    <div style={{ fontWeight: typography.fontWeight.semibold }}>{board.name}</div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>
                      {board._count?.players || 0} players
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Filters */}
            <Card variant="default" padding="lg">
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Filters</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Position
                  </label>
                  <select
                    value={filters.position}
                    onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                    style={{
                      width: '100%',
                      padding: spacing.sm,
                      background: colors.surface.elevated,
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    <option value="">All Positions</option>
                    <option value="GK">GK</option>
                    <option value="CB">CB</option>
                    <option value="FB">FB</option>
                    <option value="WB">WB</option>
                    <option value="DM">DM</option>
                    <option value="CM">CM</option>
                    <option value="AM">AM</option>
                    <option value="W">W</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Age Group
                  </label>
                  <input
                    type="text"
                    value={filters.ageGroup}
                    onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
                    placeholder="U13, U15, etc."
                    style={{
                      width: '100%',
                      padding: spacing.sm,
                      background: colors.surface.elevated,
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.sm,
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.xs }}>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Min Readiness
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.readinessMin || ''}
                      onChange={(e) => setFilters({ ...filters, readinessMin: e.target.value ? Number(e.target.value) : undefined })}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        background: colors.surface.elevated,
                        border: `1px solid ${colors.border.default}`,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Max Readiness
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.readinessMax || ''}
                      onChange={(e) => setFilters({ ...filters, readinessMax: e.target.value ? Number(e.target.value) : undefined })}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        background: colors.surface.elevated,
                        border: `1px solid ${colors.border.default}`,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Players Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
              <h2 style={{ ...typography.h2, color: colors.text.primary }}>
                {selectedBoard ? selectedBoard.name : 'All Players'} ({displayPlayers.length})
              </h2>
              {selectedBoard && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    const ids = boardPlayers.map(p => p.id);
                    if (ids.length >= 2) {
                      handleCompare(ids);
                    }
                  }}
                >
                  Compare Selected
                </Button>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
                Loading players...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: spacing.md }}>
                {displayPlayers.map((player) => (
                  <Card key={player.id} variant="default" padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing.sm }}>
                      <div>
                        <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs }}>
                          {player.fullName}
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted }}>
                          {player.center} • {player.ageGroup}
                        </div>
                      </div>
                      {selectedBoard && (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleRemovePlayer(player.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    {player.readiness && (
                      <div style={{ marginBottom: spacing.sm }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
                          <span style={{ ...typography.caption, color: colors.text.muted }}>Readiness</span>
                          <span
                            style={{
                              ...typography.body,
                              fontWeight: typography.fontWeight.bold,
                              color: getStatusBandColor(player.readiness.statusBand),
                            }}
                          >
                            {player.readiness.overall}
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            background: colors.surface.elevated,
                            borderRadius: borderRadius.sm,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${player.readiness.overall}%`,
                              height: '100%',
                              background: getStatusBandColor(player.readiness.statusBand),
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: spacing.xs, marginTop: spacing.sm }}>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => navigate(`/realverse/player/${player.id}`)}
                      >
                        View Profile
                      </Button>
                      {!selectedBoard && (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => {
                            // TODO: Show board selection modal
                            if (boards.length > 0) {
                              handleAddPlayer(player.id);
                            }
                          }}
                        >
                          Add to Board
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Board Modal */}
        {showCreateBoard && (
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
            }}
            onClick={() => setShowCreateBoard(false)}
          >
            <Card
              variant="default"
              padding="lg"
              style={{ maxWidth: '500px', width: '90%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
                Create Scouting Board
              </h3>
              <CreateBoardForm
                onSubmit={(data) => {
                  handleCreateBoard(data);
                }}
                onCancel={() => setShowCreateBoard(false)}
              />
            </Card>
          </div>
        )}
      </Section>
    </motion.main>
  );
};

const CreateBoardForm: React.FC<{ onSubmit: (data: any) => void; onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'CENTRE_VIEW' | 'CLUB_WIDE' | 'CUSTOM'>('CUSTOM');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      <div>
        <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
          Board Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., U17 CM – Promotion Candidates"
          style={{
            width: '100%',
            padding: spacing.sm,
            background: colors.surface.elevated,
            border: `1px solid ${colors.border.default}`,
            borderRadius: borderRadius.md,
            color: colors.text.primary,
            fontSize: typography.fontSize.sm,
          }}
        />
      </div>
      <div>
        <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: spacing.sm,
            background: colors.surface.elevated,
            border: `1px solid ${colors.border.default}`,
            borderRadius: borderRadius.md,
            color: colors.text.primary,
            fontSize: typography.fontSize.sm,
            resize: 'vertical',
          }}
        />
      </div>
      <div>
        <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
          Board Type *
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          style={{
            width: '100%',
            padding: spacing.sm,
            background: colors.surface.elevated,
            border: `1px solid ${colors.border.default}`,
            borderRadius: borderRadius.md,
            color: colors.text.primary,
            fontSize: typography.fontSize.sm,
          }}
        >
          <option value="CUSTOM">Custom Shortlist</option>
          <option value="CENTRE_VIEW">Centre View</option>
          <option value="CLUB_WIDE">Club-Wide</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.md }}>
        <Button variant="primary" size="md" onClick={() => onSubmit({ name, description, type })} disabled={!name}>
          Create
        </Button>
        <Button variant="secondary" size="md" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ScoutingBoardPage;

