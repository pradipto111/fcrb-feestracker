import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/design-tokens';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';

export interface CoachNote {
  id: number;
  createdAt: string;
  createdBy: {
    fullName: string;
  };
  content: string;
  tags?: string[];
  isVisibleToPlayer?: boolean;
  snapshotId?: number;
}

export interface CoachNotesPanelProps {
  studentId: number;
  isOwnView?: boolean;
  canEdit?: boolean;
}

export const CoachNotesPanel: React.FC<CoachNotesPanelProps> = ({
  studentId,
  isOwnView = false,
  canEdit = false,
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({
    content: '',
    tags: [] as string[],
    isVisibleToPlayer: true,
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadNotes();
  }, [studentId, isOwnView]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const notesData = isOwnView
        ? await api.getMyCoachNotes(50)
        : await api.getStudentCoachNotes?.(studentId) || { notes: [] };
      
      setNotes(notesData.notes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newNote.tags.includes(tagInput.trim())) {
      setNewNote(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.content.trim()) {
      setError('Please enter note content');
      return;
    }

    try {
      await api.createCoachNote?.({
        studentId,
        content: newNote.content,
        tags: newNote.tags,
        isVisibleToPlayer: newNote.isVisibleToPlayer,
      });
      
      setNewNote({ content: '', tags: [], isVisibleToPlayer: true });
      setShowAddForm(false);
      loadNotes();
    } catch (err: any) {
      setError(err.message || 'Failed to create note');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card variant="default" padding="lg">
        <div style={{ textAlign: 'center', color: colors.text.muted }}>
          Loading notes...
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <div>
          <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
            Coach Notes & Feedback
          </h3>
          <p style={{ ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm }}>
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            + Add Note
          </Button>
        )}
      </div>

      {error && (
        <Card variant="outlined" padding="md" style={{ marginBottom: spacing.md, background: colors.danger.soft, borderColor: colors.danger.main }}>
          <div style={{ color: colors.danger.main }}>{error}</div>
        </Card>
      )}

      {/* Add Note Form */}
      <AnimatePresence>
        {showAddForm && canEdit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: spacing.lg, overflow: 'hidden' }}
          >
            <Card variant="outlined" padding="lg">
              <form onSubmit={handleSubmitNote}>
                <FormField label="Note Content *">
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Add your note here..."
                    rows={4}
                    required
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      background: colors.surface.soft,
                      border: `1px solid ${colors.surface.card}`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.base,
                      fontFamily: typography.fontFamily.primary,
                      resize: 'vertical',
                    }}
                  />
                </FormField>

                <FormField label="Tags (Optional)">
                  <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.sm }}>
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tag and press Enter"
                    />
                    <Button type="button" variant="utility" size="sm" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  {newNote.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                      {newNote.tags.map((tag) => (
                        <div
                          key={tag}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing.xs,
                            padding: `${spacing.xs} ${spacing.sm}`,
                            background: colors.primary.soft,
                            borderRadius: borderRadius.md,
                            ...typography.caption,
                            color: colors.primary.main,
                          }}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: colors.primary.main,
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: typography.fontSize.xs,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </FormField>

                <FormField label="Visibility">
                  <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newNote.isVisibleToPlayer}
                      onChange={(e) => setNewNote(prev => ({ ...prev, isVisibleToPlayer: e.target.checked }))}
                    />
                    <span style={{ ...typography.body, fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                      Visible to player
                    </span>
                  </label>
                </FormField>

                <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.md }}>
                  <Button type="submit" variant="primary" size="sm">
                    Save Note
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewNote({ content: '', tags: [], isVisibleToPlayer: true });
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', color: colors.text.muted, padding: spacing.xl }}>
            <div style={{ fontSize: '3rem', marginBottom: spacing.md }}>📝</div>
            <div style={{ ...typography.body, marginBottom: spacing.sm }}>No notes yet</div>
            <div style={{ ...typography.caption, color: colors.text.muted }}>
              {canEdit ? 'Add your first note to start tracking feedback' : 'Your coach will add notes here'}
            </div>
          </div>
        ) : (
          notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: spacing.md,
                background: colors.surface.soft,
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.surface.card}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                <div>
                  <div style={{ ...typography.body, fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing.xs }}>
                    {formatDate(note.createdAt)} • {note.createdBy.fullName}
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xs }}>
                      {note.tags.map((tag) => (
                        <div
                          key={tag}
                          style={{
                            padding: `${spacing.xs / 2} ${spacing.xs}`,
                            background: colors.accent.soft,
                            borderRadius: borderRadius.sm,
                            ...typography.caption,
                            color: colors.accent.main,
                            fontSize: typography.fontSize.xs,
                          }}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {note.isVisibleToPlayer && (
                  <div
                    style={{
                      padding: `${spacing.xs / 2} ${spacing.xs}`,
                      background: colors.success.soft,
                      borderRadius: borderRadius.sm,
                      ...typography.caption,
                      color: colors.success.main,
                      fontSize: typography.fontSize.xs,
                    }}
                  >
                    Visible
                  </div>
                )}
              </div>
              <div style={{ ...typography.body, color: colors.text.primary, lineHeight: 1.6 }}>
                {note.content}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
};


