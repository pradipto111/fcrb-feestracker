import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/design-tokens';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FormSection } from '../ui/FormSection';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { MetricPanel } from './MetricPanel';
import { PositionSuitabilityGrid } from './PositionSuitabilityGrid';

export type MetricSourceContext = 'MONTHLY_REVIEW' | 'TRAINING_BLOCK' | 'MATCH_BLOCK' | 'TRIAL';

interface SnapshotEditorProps {
  studentId: number;
  onSave?: (snapshotId: number) => void;
  onCancel?: () => void;
  initialContext?: MetricSourceContext;
}

interface MetricValue {
  metricKey: string;
  valueNumber: number;
  comment?: string;
  confidence?: number;
}

interface PositionValue {
  position: string;
  suitability: number;
  comment?: string;
}

interface TraitValue {
  traitKey: string;
  score: number;
  comment?: string;
}

const CONTEXT_OPTIONS: Array<{ value: MetricSourceContext; label: string; description: string }> = [
  { value: 'MONTHLY_REVIEW', label: 'Monthly Review', description: 'Full snapshot across all categories' },
  { value: 'TRAINING_BLOCK', label: 'Training Block Review', description: 'Update 6-10 relevant metrics after a training block' },
  { value: 'MATCH_BLOCK', label: 'Match Block Review', description: 'Update mental/tactical metrics after 2-4 matches' },
  { value: 'TRIAL', label: 'Trial / New Player Intake', description: 'First evaluation snapshot' },
];

export const SnapshotEditor: React.FC<SnapshotEditorProps> = ({
  studentId,
  onSave,
  onCancel,
  initialContext,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form state
  const [context, setContext] = useState<MetricSourceContext>(initialContext || 'MONTHLY_REVIEW');
  const [notes, setNotes] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [metricValues, setMetricValues] = useState<Record<string, MetricValue>>({});
  const [positionValues, setPositionValues] = useState<Record<string, PositionValue>>({});
  const [traitValues, setTraitValues] = useState<Record<string, TraitValue>>({});
  const [metricDefinitions, setMetricDefinitions] = useState<any[]>([]);
  const [previousSnapshot, setPreviousSnapshot] = useState<any>(null);
  const [calibrationHints, setCalibrationHints] = useState<Record<string, any>>({});
  const [studentInfo, setStudentInfo] = useState<any>(null);

  const totalSteps = 4;

  useEffect(() => {
    loadDefinitions();
    loadPreviousSnapshot();
    loadStudentInfo();
  }, [studentId]);

  // Load calibration hints when metric value changes
  useEffect(() => {
    const loadHintsForMetrics = async () => {
      const hints: Record<string, any> = {};
      for (const [key, val] of Object.entries(metricValues)) {
        if (val.valueNumber > 0 && studentInfo) {
          try {
            const hint = await api.getCalibrationHints({
              metricKey: key,
              value: val.valueNumber,
              studentId,
              centerId: studentInfo.centerId,
              position: studentInfo.primaryPosition,
            });
            hints[key] = hint;
          } catch (err) {
            // Silently fail - hints are optional
          }
        }
      }
      setCalibrationHints(hints);
    };

    // Debounce hint loading
    const timer = setTimeout(loadHintsForMetrics, 500);
    return () => clearTimeout(timer);
  }, [metricValues, studentInfo, studentId]);

  const loadDefinitions = async () => {
    try {
      const response = await api.getMetricDefinitions();
      // Handle both array response and object with definitions property
      const definitions = Array.isArray(response) 
        ? response 
        : (response?.definitions || response?.data || []);
      
      if (!Array.isArray(definitions)) {
        console.error('Expected array but got:', typeof definitions, definitions);
        setError('Invalid response format from server');
        return;
      }
      
      setMetricDefinitions(definitions);
      
      // Initialize metric values from definitions
      // Only initialize if we don't already have values (e.g., from previous snapshot)
      setMetricValues(prev => {
        const initialValues: Record<string, MetricValue> = { ...prev };
        definitions.forEach((def: any) => {
          // Only set default if not already set
          if (!initialValues[def.key] || initialValues[def.key].valueNumber === undefined) {
            initialValues[def.key] = {
              metricKey: def.key,
              valueNumber: 50, // Default value
              confidence: 60,
            };
          }
        });
        return initialValues;
      });
    } catch (err: any) {
      console.error('Error loading definitions:', err);
      setError(err.message || 'Failed to load metric definitions');
    }
  };

  const loadStudentInfo = async () => {
    try {
      const student = await api.getStudent(studentId);
      // Handle both response formats
      const studentData = student?.student || student;
      setStudentInfo(studentData);
    } catch (err) {
      console.error('Failed to load student info:', err);
    }
  };

  const loadPreviousSnapshot = async () => {
    try {
      const snapshotData = await api.getStudentMetricSnapshot(studentId);
      if (snapshotData?.snapshot) {
        setPreviousSnapshot(snapshotData.snapshot);
        
        // Pre-fill values from previous snapshot
        const prevValues: Record<string, MetricValue> = {};
        snapshotData.snapshot.values?.forEach((val: any) => {
          if (val && val.metricDefinition && typeof val.valueNumber === 'number' && !isNaN(val.valueNumber)) {
            prevValues[val.metricDefinition.key] = {
              metricKey: val.metricDefinition.key,
              valueNumber: val.valueNumber,
              comment: val.comment || undefined,
              confidence: val.confidence || 60,
            };
          }
        });
        setMetricValues(prev => ({ ...prev, ...prevValues }));

        // Pre-fill positional values
        const prevPositions: Record<string, PositionValue> = {};
        snapshotData.snapshot.positional?.forEach((pos: any) => {
          prevPositions[pos.position] = {
            position: pos.position,
            suitability: pos.suitability,
            comment: pos.comment,
          };
        });
        setPositionValues(prevPositions);
      }
    } catch (err: any) {
      // No previous snapshot is fine
      console.log('No previous snapshot:', err.message);
    }
  };

  const handleMetricChange = (metricKey: string, value: number) => {
    setMetricValues(prev => ({
      ...prev,
      [metricKey]: {
        ...prev[metricKey],
        metricKey,
        valueNumber: value,
      },
    }));
  };

  const handlePositionChange = (position: string, suitability: number) => {
    setPositionValues(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        position,
        suitability,
      },
    }));
  };

  const calculateChanges = () => {
    if (!previousSnapshot) return { changed: 0, increases: [], decreases: [] };

    const changes: Array<{ key: string; old: number; new: number; delta: number }> = [];
    
    Object.entries(metricValues).forEach(([key, val]) => {
      const prevVal = previousSnapshot.values?.find((v: any) => v.metricDefinition.key === key);
      if (prevVal && prevVal.valueNumber !== val.valueNumber) {
        changes.push({
          key,
          old: prevVal.valueNumber,
          new: val.valueNumber,
          delta: val.valueNumber - prevVal.valueNumber,
        });
      }
    });

    const increases = changes.filter(c => c.delta > 0).sort((a, b) => b.delta - a.delta);
    const decreases = changes.filter(c => c.delta < 0).sort((a, b) => a.delta - b.delta);

    return {
      changed: changes.length,
      increases: increases.slice(0, 5),
      decreases: decreases.slice(0, 5),
    };
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!context) {
        setError('Please select a context');
        return false;
      }
    }
    if (step === 2) {
      // Check if at least some metrics are filled
      const filledMetrics = Object.values(metricValues).filter(v => v.valueNumber > 0).length;
      if (filledMetrics === 0) {
        setError('Please fill at least some metrics');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError('');
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!validateStep(currentStep)) return;

    setSaving(true);
    setError('');

    try {
      const changes = calculateChanges();
      
      // Check if large changes require comments
      const largeChanges = Object.entries(metricValues).filter(([key, val]) => {
        const prevVal = previousSnapshot?.values?.find((v: any) => v.metricDefinition.key === key);
        if (!prevVal) return false;
        return Math.abs(val.valueNumber - prevVal.valueNumber) > 12;
      });

      if (largeChanges.length > 0 && !notes) {
        setError(`Please add a comment explaining the ${largeChanges.length} significant changes (>12 points)`);
        setSaving(false);
        return;
      }

      // Filter out undefined/null values and ensure all required fields are present
      const validMetricValues = Object.values(metricValues)
        .filter(v => v && v.metricKey && typeof v.valueNumber === 'number' && !isNaN(v.valueNumber))
        .map(v => ({
          metricKey: v.metricKey,
          valueNumber: v.valueNumber,
          comment: v.comment || undefined,
          confidence: v.confidence || undefined,
        }));

      const validPositionValues = Object.values(positionValues)
        .filter(p => p && p.position && typeof p.suitability === 'number' && !isNaN(p.suitability))
        .map(p => ({
          position: p.position,
          suitability: p.suitability,
          comment: p.comment || undefined,
        }));

      const validTraitValues = Object.values(traitValues)
        .filter(t => t && t.traitKey && typeof t.score === 'number' && !isNaN(t.score))
        .map(t => ({
          traitKey: t.traitKey,
          score: t.score,
          comment: t.comment || undefined,
        }));

      if (validMetricValues.length === 0) {
        setError('Please fill at least one metric value');
        setSaving(false);
        return;
      }

      const payload = {
        studentId,
        sourceContext: context,
        notes: notes || undefined,
        seasonId: seasonId || undefined,
        values: validMetricValues,
        positional: validPositionValues,
        traits: validTraitValues,
      };

      const result = await api.createPlayerMetricSnapshot(payload);
      onSave?.(result.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create snapshot');
    } finally {
      setSaving(false);
    }
  };

  const groupMetricsByCategory = () => {
    const groups: Record<string, any[]> = {};
    metricDefinitions.forEach((def) => {
      if (!groups[def.category]) groups[def.category] = [];
      groups[def.category].push({
        id: def.key,
        name: def.displayName,
        value: metricValues[def.key]?.valueNumber || 50,
        definition: def.definition,
        category: def.category,
        delta: previousSnapshot?.values?.find((v: any) => v.metricDefinition.key === def.key)
          ? metricValues[def.key]?.valueNumber - (previousSnapshot.values.find((v: any) => v.metricDefinition.key === def.key)?.valueNumber || 50)
          : undefined,
      });
    });
    return groups;
  };

  const changes = calculateChanges();

  return (
    <Card variant="elevated" padding="lg" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Stepper Header */}
      <div style={{ marginBottom: spacing.xl }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <h2 style={{ ...typography.h2, color: colors.text.primary, margin: 0 }}>
            Create New Snapshot
          </h2>
          {onCancel && (
            <Button variant="utility" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.lg }}>
          {[1, 2, 3, 4].map((step) => (
            <div key={step} style={{ flex: 1, position: 'relative' }}>
              <div
                style={{
                  height: '4px',
                  background: step <= currentStep ? colors.primary.main : colors.surface.soft,
                  borderRadius: borderRadius.full,
                  marginBottom: spacing.xs,
                }}
              />
              <div
                style={{
                  ...typography.caption,
                  color: step <= currentStep ? colors.primary.main : colors.text.muted,
                  textAlign: 'center',
                }}
              >
                {step === 1 && 'Context'}
                {step === 2 && 'Attributes'}
                {step === 3 && 'Positions'}
                {step === 4 && 'Review'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <Card variant="outlined" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft, borderColor: colors.danger.main }}>
          <div style={{ color: colors.danger.main }}>{error}</div>
        </Card>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FormSection title="Snapshot Context" description="Select the context for this snapshot">
              <FormField label="Context *">
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value as MetricSourceContext)}
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    background: colors.surface.soft,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.base,
                    fontFamily: typography.fontFamily.primary,
                  }}
                >
                  {CONTEXT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} - {opt.description}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Season ID (Optional)">
                <Input
                  value={seasonId}
                  onChange={(e) => setSeasonId(e.target.value)}
                  placeholder="e.g., 2024-25"
                />
              </FormField>

              <FormField label="General Notes (Optional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any general notes about this snapshot..."
                  rows={4}
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
            </FormSection>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ marginBottom: spacing.lg }}>
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.sm }}>
                Edit Metrics
              </h3>
              <p style={{ ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm }}>
                Update metric values. Changes will be compared to the previous snapshot.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
              {Object.entries(groupMetricsByCategory()).map(([category, metrics]) => (
                <MetricPanel
                  key={category}
                  title={category}
                  metrics={metrics}
                  showDelta={true}
                  editable={true}
                  searchable={true}
                  onMetricChange={handleMetricChange}
                  calibrationHints={calibrationHints}
                />
              ))}
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ marginBottom: spacing.lg }}>
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.sm }}>
                Positional Suitability
              </h3>
              <p style={{ ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm }}>
                Rate the player's suitability for each position.
              </p>
            </div>

            <PositionSuitabilityGrid
              positions={Object.values(positionValues)}
              editable={true}
              onPositionChange={handlePositionChange}
            />
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ marginBottom: spacing.lg }}>
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.sm }}>
                Review Changes
              </h3>
              <p style={{ ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm }}>
                Review the changes before saving. A new snapshot will be created.
              </p>
            </div>

            <Card variant="outlined" padding="lg" style={{ marginBottom: spacing.lg }}>
              <div style={{ ...typography.body, color: colors.text.primary, marginBottom: spacing.md }}>
                You are updating <strong>{changes.changed}</strong> metrics
              </div>

              {changes.increases.length > 0 && (
                <div style={{ marginBottom: spacing.md }}>
                  <div style={{ ...typography.body, color: colors.success.main, marginBottom: spacing.sm, fontWeight: typography.fontWeight.semibold }}>
                    Biggest Increases:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
                    {changes.increases.map((change) => {
                      const def = metricDefinitions.find(d => d.key === change.key);
                      return (
                        <div key={change.key} style={{ display: 'flex', justifyContent: 'space-between', color: colors.text.secondary }}>
                          <span>{def?.displayName || change.key}</span>
                          <span style={{ color: colors.success.main }}>+{change.delta}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {changes.decreases.length > 0 && (
                <div>
                  <div style={{ ...typography.body, color: colors.danger.main, marginBottom: spacing.sm, fontWeight: typography.fontWeight.semibold }}>
                    Biggest Decreases:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
                    {changes.decreases.map((change) => {
                      const def = metricDefinitions.find(d => d.key === change.key);
                      return (
                        <div key={change.key} style={{ display: 'flex', justifyContent: 'space-between', color: colors.text.secondary }}>
                          <span>{def?.displayName || change.key}</span>
                          <span style={{ color: colors.danger.main }}>{change.delta}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {changes.changed > 0 && !notes && (
              <Card variant="outlined" padding="md" style={{ marginBottom: spacing.lg, background: colors.warning.soft, borderColor: colors.warning.main }}>
                <div style={{ color: colors.warning.main, ...typography.body, fontSize: typography.fontSize.sm }}>
                  ⚠️ Consider adding notes explaining significant changes
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing.xl, paddingTop: spacing.lg, borderTop: `1px solid rgba(255, 255, 255, 0.1)` }}>
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          ← Back
        </Button>

        {currentStep < totalSteps ? (
          <Button
            variant="primary"
            onClick={handleNext}
          >
            Next →
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Snapshot'}
          </Button>
        )}
      </div>
    </Card>
  );
};

