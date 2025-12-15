/**
 * Trial Template Editor Page (Admin)
 * 
 * Create and edit trial metric templates
 * - Template metadata (name, scope, description)
 * - Dynamic metric items with full configuration
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';
import { Input } from '../components/ui/Input';
import { PageShell } from '../components/ui/PageShell';
import { CloseIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '../components/icons/IconSet';

interface MetricItem {
  id?: number;
  metricKey: string;
  displayName: string;
  category: string;
  description: string;
  anchors: Record<string, string>;
  weight: number;
  required: boolean;
  displayOrder: number;
}

const TrialTemplateEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const { user } = useAuth();
  const isEditMode = !!templateId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    positionScope: 'ANY' as string,
    specificPositions: [] as string[],
    ageScope: [] as string[],
    description: '',
    isDefault: false,
  });

  const [metricItems, setMetricItems] = useState<MetricItem[]>([]);
  const [editingMetricIndex, setEditingMetricIndex] = useState<number | null>(null);
  const [metricForm, setMetricForm] = useState<MetricItem>({
    metricKey: '',
    displayName: '',
    category: 'TECHNICAL',
    description: '',
    anchors: {},
    weight: 1.0,
    required: false,
    displayOrder: 0,
  });

  const [anchorInputs, setAnchorInputs] = useState<{ value: string; label: string }[]>([]);

  const categories = ['TECHNICAL', 'PHYSICAL', 'MENTAL', 'ATTITUDE', 'TACTICAL', 'ROLE_FIT'];
  const positionScopes = ['ANY', 'OUTFIELD', 'GK'];
  const positions = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];
  const ageGroups = ['U13', 'U15', 'U17', 'U19', 'Senior'];

  useEffect(() => {
    loadTemplates();
    if (isEditMode && templateId) {
      loadTemplate(Number(templateId));
    }
  }, [templateId, isEditMode]);

  useEffect(() => {
    if (editingMetricIndex !== null && metricItems[editingMetricIndex]) {
      const item = metricItems[editingMetricIndex];
      setMetricForm(item);
      // Convert anchors object to array for editing
      const anchorArray = Object.entries(item.anchors || {}).map(([value, label]) => ({
        value,
        label,
      }));
      setAnchorInputs(anchorArray.length > 0 ? anchorArray : [{ value: '', label: '' }]);
    }
  }, [editingMetricIndex]);

  const loadTemplates = async () => {
    try {
      const response = await api.getTrialTemplates({});
      setTemplates(response.templates || []);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
    }
  };

  const loadTemplate = async (id: number) => {
    try {
      setLoading(true);
      const template = await api.getTrialTemplate(id);
      setSelectedTemplate(template);
      setFormData({
        name: template.name || '',
        positionScope: template.positionScope || 'ANY',
        specificPositions: template.specificPositions || [],
        ageScope: template.ageScope || [],
        description: template.description || '',
        isDefault: template.isDefault || false,
      });

      // Load metric items
      const items = (template.items || []).map((item: any) => ({
        id: item.id,
        metricKey: item.metricKey || '',
        displayName: item.displayName || '',
        category: item.category || 'TECHNICAL',
        description: item.description || '',
        anchors: item.anchors || {},
        weight: item.weight || 1.0,
        required: item.required || false,
        displayOrder: item.displayOrder || 0,
      }));
      setMetricItems(items.sort((a: MetricItem, b: MetricItem) => a.displayOrder - b.displayOrder));
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = () => {
    setEditingMetricIndex(null);
    setMetricForm({
      metricKey: '',
      displayName: '',
      category: 'TECHNICAL',
      description: '',
      anchors: {},
      weight: 1.0,
      required: false,
      displayOrder: metricItems.length,
    });
    setAnchorInputs([{ value: '', label: '' }]);
  };

  const handleEditMetric = (index: number) => {
    setEditingMetricIndex(index);
  };

  const handleSaveMetric = () => {
    if (!metricForm.metricKey || !metricForm.displayName) {
      setError('Metric key and display name are required');
      return;
    }

    // Convert anchor inputs to object
    const anchors: Record<string, string> = {};
    anchorInputs.forEach((input) => {
      if (input.value && input.label) {
        anchors[input.value] = input.label;
      }
    });

    const newItem: MetricItem = {
      ...metricForm,
      anchors,
      displayOrder: editingMetricIndex !== null ? metricForm.displayOrder : metricItems.length,
    };

    if (editingMetricIndex !== null) {
      // Update existing
      const updated = [...metricItems];
      updated[editingMetricIndex] = newItem;
      setMetricItems(updated);
      setEditingMetricIndex(null);
    } else {
      // Add new
      setMetricItems([...metricItems, newItem]);
    }

    // Reset form
    setMetricForm({
      metricKey: '',
      displayName: '',
      category: 'TECHNICAL',
      description: '',
      anchors: {},
      weight: 1.0,
      required: false,
      displayOrder: metricItems.length + 1,
      scaleMin: 0,
      scaleMax: 100,
    });
    setAnchorInputs([{ value: '', label: '' }]);
  };

  const handleRemoveMetric = (index: number) => {
    const updated = metricItems.filter((_, i) => i !== index);
    // Reorder
    updated.forEach((item, i) => {
      item.displayOrder = i;
    });
    setMetricItems(updated);
  };

  const handleMoveMetric = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === metricItems.length - 1) return;

    const updated = [...metricItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated[index].displayOrder = index;
    updated[newIndex].displayOrder = newIndex;
    setMetricItems(updated);
  };

  const handleAddAnchor = () => {
    setAnchorInputs([...anchorInputs, { value: '', label: '' }]);
  };

  const handleRemoveAnchor = (index: number) => {
    setAnchorInputs(anchorInputs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.positionScope) {
      setError('Name and position scope are required');
      return;
    }

    if (metricItems.length === 0) {
      setError('At least one metric item is required');
      return;
    }

    try {
      setSaving(true);

      const items = metricItems.map((item) => ({
        metricKey: item.metricKey,
        displayName: item.displayName,
        category: item.category,
        description: item.description || undefined,
        anchors: Object.keys(item.anchors).length > 0 ? item.anchors : undefined,
        weight: item.weight,
        required: item.required,
        displayOrder: item.displayOrder,
      }));

      const payload = {
        name: formData.name,
        positionScope: formData.positionScope,
        specificPositions: formData.positionScope !== 'ANY' ? formData.specificPositions : undefined,
        ageScope: formData.ageScope.length > 0 ? formData.ageScope : undefined,
        description: formData.description || undefined,
        isDefault: formData.isDefault,
        items,
      };

      if (isEditMode && templateId) {
        await api.updateTrialTemplate(Number(templateId), payload);
      } else {
        await api.createTrialTemplate(payload);
      }

      navigate('/realverse/trials/templates');
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
          Loading template...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: colors.surface.bg,
          minHeight: '100vh',
          padding: spacing.xl,
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <Section>
          <div style={{ marginBottom: spacing.lg }}>
            <Button variant="secondary" size="sm" onClick={() => navigate('/realverse/trials/templates')} style={{ marginBottom: spacing.md }}>
              ← Back to Templates
            </Button>
            <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
              {isEditMode ? 'Edit Template' : 'Create Template'}
            </h1>
            <div style={{ ...typography.body, color: colors.text.muted }}>
              Configure metric templates for trial evaluations
            </div>
          </div>

          {error && (
            <Card variant="default" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
              <div style={{ color: colors.danger.main }}>{error}</div>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
              {/* Template Metadata */}
              <Card variant="default" padding="lg">
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Template Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Template Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., FCRB Standard Trial – Outfield"
                      fullWidth
                      required
                    />
                  </div>

                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Position Scope *
                    </label>
                    <select
                      value={formData.positionScope}
                      onChange={(e) => setFormData({ ...formData, positionScope: e.target.value, specificPositions: [] })}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        background: colors.surface.elevated,
                        border: `1px solid ${colors.border.medium}`,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                      }}
                      required
                    >
                      {positionScopes.map((scope) => (
                        <option key={scope} value={scope}>
                          {scope}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.positionScope !== 'ANY' && (
                    <div>
                      <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                        Specific Positions
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                        {positions.map((pos) => (
                          <label
                            key={pos}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing.xs,
                              padding: `${spacing.xs} ${spacing.sm}`,
                              background: formData.specificPositions.includes(pos) ? colors.primary.soft : colors.surface.elevated,
                              borderRadius: borderRadius.md,
                              cursor: 'pointer',
                              ...typography.body,
                              fontSize: typography.fontSize.sm,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.specificPositions.includes(pos)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    specificPositions: [...formData.specificPositions, pos],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    specificPositions: formData.specificPositions.filter((p) => p !== pos),
                                  });
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            {pos}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Age Scope (Optional)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                      {ageGroups.map((age) => (
                        <label
                          key={age}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing.xs,
                            padding: `${spacing.xs} ${spacing.sm}`,
                            background: formData.ageScope.includes(age) ? colors.primary.soft : colors.surface.elevated,
                            borderRadius: borderRadius.md,
                            cursor: 'pointer',
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.ageScope.includes(age)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  ageScope: [...formData.ageScope, age],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  ageScope: formData.ageScope.filter((a) => a !== age),
                                });
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                          {age}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        background: colors.surface.elevated,
                        border: `1px solid ${colors.border.medium}`,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                        fontFamily: typography.fontFamily.primary,
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ ...typography.body, color: colors.text.primary }}>Set as default template</span>
                    </label>
                  </div>
                </div>
              </Card>

              {/* Metric Items */}
              <Card variant="default" padding="lg">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                  <h3 style={{ ...typography.h4, color: colors.text.primary }}>Metric Items ({metricItems.length})</h3>
                  <Button type="button" variant="primary" size="sm" onClick={handleAddMetric}>
                    <PlusIcon size={14} style={{ marginRight: spacing.xs }} /> Add Metric
                  </Button>
                </div>

                {metricItems.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, marginBottom: spacing.lg }}>
                    {metricItems.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          padding: spacing.md,
                          background: colors.surface.elevated,
                          borderRadius: borderRadius.md,
                          border: `1px solid ${colors.border.medium}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing.sm }}>
                          <div>
                            <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                              {item.displayName} ({item.metricKey})
                            </div>
                            <div style={{ ...typography.caption, color: colors.text.muted }}>
                              {item.category} • Order: {item.displayOrder} • Weight: {item.weight}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: spacing.xs }}>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => handleMoveMetric(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUpIcon size={14} />
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => handleMoveMetric(index, 'down')}
                              disabled={index === metricItems.length - 1}
                            >
                              <ArrowDownIcon size={14} />
                            </Button>
                            <Button type="button" variant="secondary" size="sm" onClick={() => handleEditMetric(index)}>
                              Edit
                            </Button>
                            <Button type="button" variant="secondary" size="sm" onClick={() => handleRemoveMetric(index)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Metric Form */}
                {(editingMetricIndex !== null || metricItems.length === 0) && (
                  <Card variant="elevated" padding="lg" style={{ border: `2px solid ${colors.primary.main}` }}>
                    <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.md }}>
                      {editingMetricIndex !== null ? 'Edit Metric' : 'Add New Metric'}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                        <div>
                          <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                            Metric Key *
                          </label>
                          <Input
                            value={metricForm.metricKey}
                            onChange={(e) => setMetricForm({ ...metricForm, metricKey: e.target.value })}
                            placeholder="e.g., acceleration"
                            fullWidth
                            required
                          />
                        </div>
                        <div>
                          <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                            Display Name *
                          </label>
                          <Input
                            value={metricForm.displayName}
                            onChange={(e) => setMetricForm({ ...metricForm, displayName: e.target.value })}
                            placeholder="e.g., Acceleration"
                            fullWidth
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                          Category *
                        </label>
                        <select
                          value={metricForm.category}
                          onChange={(e) => setMetricForm({ ...metricForm, category: e.target.value })}
                          style={{
                            width: '100%',
                            padding: spacing.sm,
                            background: colors.surface.elevated,
                            border: `1px solid ${colors.border.medium}`,
                            borderRadius: borderRadius.md,
                            color: colors.text.primary,
                            fontSize: typography.fontSize.sm,
                          }}
                          required
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                          Description
                        </label>
                        <textarea
                          value={metricForm.description}
                          onChange={(e) => setMetricForm({ ...metricForm, description: e.target.value })}
                          rows={2}
                          style={{
                            width: '100%',
                            padding: spacing.sm,
                            background: colors.surface.elevated,
                            border: `1px solid ${colors.border.medium}`,
                            borderRadius: borderRadius.md,
                            color: colors.text.primary,
                            fontSize: typography.fontSize.sm,
                            fontFamily: typography.fontFamily.primary,
                            resize: 'vertical',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                          Anchors (Value: Label pairs)
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
                          {anchorInputs.map((input, index) => (
                            <div key={index} style={{ display: 'flex', gap: spacing.xs }}>
                              <Input
                                type="number"
                                value={input.value}
                                onChange={(e) => {
                                  const updated = [...anchorInputs];
                                  updated[index].value = e.target.value;
                                  setAnchorInputs(updated);
                                }}
                                placeholder="Value (e.g., 40)"
                                style={{ flex: 1 }}
                              />
                              <Input
                                value={input.label}
                                onChange={(e) => {
                                  const updated = [...anchorInputs];
                                  updated[index].label = e.target.value;
                                  setAnchorInputs(updated);
                                }}
                                placeholder="Label (e.g., Needs work)"
                                style={{ flex: 2 }}
                              />
                              {anchorInputs.length > 1 && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleRemoveAnchor(index)}
                                >
                                  <CloseIcon size={14} />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button type="button" variant="secondary" size="sm" onClick={handleAddAnchor}>
                            <PlusIcon size={14} style={{ marginRight: spacing.xs }} /> Add Anchor
                          </Button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                        <div>
                          <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                            Weight
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            value={metricForm.weight}
                            onChange={(e) => setMetricForm({ ...metricForm, weight: Number(e.target.value) })}
                            fullWidth
                          />
                        </div>
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer', marginTop: spacing.md + spacing.xs }}>
                            <input
                              type="checkbox"
                              checked={metricForm.required}
                              onChange={(e) => setMetricForm({ ...metricForm, required: e.target.checked })}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ ...typography.body, color: colors.text.primary }}>Required</span>
                          </label>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: spacing.md }}>
                        <Button type="button" variant="primary" size="md" onClick={handleSaveMetric}>
                          {editingMetricIndex !== null ? 'Update Metric' : 'Add Metric'}
                        </Button>
                        {editingMetricIndex !== null && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => {
                              setEditingMetricIndex(null);
                              setMetricForm({
                                metricKey: '',
                                displayName: '',
                                category: 'TECHNICAL',
                                description: '',
                                anchors: {},
                                weight: 1.0,
                                required: false,
                                displayOrder: metricItems.length,
                                scaleMin: 0,
                                scaleMax: 100,
                              });
                              setAnchorInputs([{ value: '', label: '' }]);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </Card>

              {/* Submit */}
              <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg }}>
                <Button type="button" variant="secondary" size="md" onClick={() => navigate('/realverse/trials/templates')} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={saving || metricItems.length === 0} style={{ flex: 1 }}>
                  {saving ? 'Saving...' : isEditMode ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </div>
          </form>
        </Section>
      </motion.main>
    </PageShell>
  );
};

export default TrialTemplateEditorPage;

