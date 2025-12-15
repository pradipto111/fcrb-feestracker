/**
 * Manage Parent Reports Page
 * 
 * Coach/Admin interface for generating and managing parent development reports
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

interface Report {
  id: number;
  student: {
    fullName: string;
    programType?: string;
  };
  snapshot: {
    createdAt: string;
  };
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
  publishedAt?: string;
  visibleToParent: boolean;
  contentJson: any;
}

const ManageParentReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentId: studentIdParam } = useParams<{ studentId?: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    studentIdParam ? Number(studentIdParam) : null
  );
  const [students, setStudents] = useState<any[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [reportingPeriodStart, setReportingPeriodStart] = useState('');
  const [reportingPeriodEnd, setReportingPeriodEnd] = useState('');
  const [coachNote, setCoachNote] = useState('');
  const [previewContent, setPreviewContent] = useState<any>(null);

  // Only allow COACH/ADMIN
  useEffect(() => {
    if (user && user.role !== 'COACH' && user.role !== 'ADMIN') {
      navigate('/realverse');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      loadStudents();
      if (selectedStudentId) {
        loadReports();
        loadSnapshots();
      }
    }
  }, [user, selectedStudentId]);

  const loadStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data || []);
    } catch (err: any) {
      console.error('Failed to load students:', err);
    }
  };

  const loadReports = async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    try {
      const response = await api.getStudentReports(selectedStudentId, true); // Include drafts
      setReports(response.reports || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadSnapshots = async () => {
    if (!selectedStudentId) return;
    try {
      const response = await api.getStudentSnapshots(selectedStudentId, { limit: 20 });
      setSnapshots(response.snapshots || []);
    } catch (err: any) {
      console.error('Failed to load snapshots:', err);
    }
  };

  const handleGeneratePreview = async () => {
    if (!selectedStudentId || !selectedSnapshotId) {
      setError('Please select a student and snapshot');
      return;
    }

    try {
      const content = await api.generateReportContent({
        studentId: selectedStudentId,
        snapshotId: selectedSnapshotId,
        reportingPeriodStart: reportingPeriodStart || undefined,
        reportingPeriodEnd: reportingPeriodEnd || undefined,
        coachNote: coachNote || undefined,
      });
      setPreviewContent(content.content);
    } catch (err: any) {
      setError(err.message || 'Failed to generate preview');
    }
  };

  const handleCreateReport = async () => {
    if (!selectedStudentId || !selectedSnapshotId) {
      setError('Please select a student and snapshot');
      return;
    }

    try {
      await api.createParentReport({
        studentId: selectedStudentId,
        snapshotId: selectedSnapshotId,
        reportingPeriodStart: reportingPeriodStart || undefined,
        reportingPeriodEnd: reportingPeriodEnd || undefined,
        coachNote: coachNote || undefined,
      });
      setShowGenerateModal(false);
      setPreviewContent(null);
      setCoachNote('');
      setReportingPeriodStart('');
      setReportingPeriodEnd('');
      loadReports();
    } catch (err: any) {
      setError(err.message || 'Failed to create report');
    }
  };

  const handlePublish = async (reportId: number) => {
    try {
      await api.publishReport(reportId, true);
      loadReports();
    } catch (err: any) {
      setError(err.message || 'Failed to publish report');
    }
  };

  const handleDelete = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.deleteReport(reportId);
      loadReports();
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
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
        <div style={{ marginBottom: spacing.xl }}>
          <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.md }}>
            Parent Development Reports
          </h1>
          <p style={{ ...typography.body, color: colors.text.muted }}>
            Generate and manage parent-friendly development reports
          </p>
        </div>

        {error && (
          <Card variant="default" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
            <div style={{ color: colors.danger.main }}>{error}</div>
          </Card>
        )}

        {/* Student Selection */}
        <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
          <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
            Select Student
          </h3>
          <select
            value={selectedStudentId || ''}
            onChange={(e) => setSelectedStudentId(e.target.value ? Number(e.target.value) : null)}
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
            <option value="">Select a student...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName} {student.programType ? `(${student.programType})` : ''}
              </option>
            ))}
          </select>
        </Card>

        {selectedStudentId && (
          <>
            {/* Generate Report Button */}
            <div style={{ marginBottom: spacing.lg }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowGenerateModal(true)}
              >
                + Generate New Report
              </Button>
            </div>

            {/* Reports List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
                Loading reports...
              </div>
            ) : reports.length === 0 ? (
              <Card variant="default" padding="lg">
                <div style={{ textAlign: 'center', color: colors.text.muted }}>
                  No reports yet. Generate your first report to get started.
                </div>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                {reports.map((report) => (
                  <Card key={report.id} variant="default" padding="lg">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing.md }}>
                      <div>
                        <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs }}>
                          {report.student.fullName}
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted }}>
                          Snapshot: {new Date(report.snapshot.createdAt).toLocaleDateString()}
                          {report.reportingPeriodStart && ` • Period: ${new Date(report.reportingPeriodStart).toLocaleDateString()} - ${report.reportingPeriodEnd ? new Date(report.reportingPeriodEnd).toLocaleDateString() : 'Ongoing'}`}
                        </div>
                        <div style={{ ...typography.caption, color: report.visibleToParent ? colors.success.main : colors.warning.main, marginTop: spacing.xs }}>
                          {report.visibleToParent ? '✓ Published' : 'Draft'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: spacing.sm }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/realverse/parent-reports/${report.id}`)}
                        >
                          View
                        </Button>
                        {!report.visibleToParent && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handlePublish(report.id)}
                          >
                            Publish
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDelete(report.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Generate Report Modal */}
        {showGenerateModal && selectedStudentId && (
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
            onClick={(e: React.MouseEvent) => {
              if (e.target === e.currentTarget) {
                setShowGenerateModal(false);
                setPreviewContent(null);
              }
            }}
          >
            <div
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
            <Card
              variant="default"
              padding="lg"
              style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
                Generate Development Report
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, marginBottom: spacing.lg }}>
                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Select Snapshot *
                  </label>
                  <select
                    value={selectedSnapshotId || ''}
                    onChange={(e) => setSelectedSnapshotId(e.target.value ? Number(e.target.value) : null)}
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
                    <option value="">Select a snapshot...</option>
                    {snapshots.map((snapshot) => (
                      <option key={snapshot.id} value={snapshot.id}>
                        {new Date(snapshot.createdAt).toLocaleDateString()} - {snapshot.sourceContext}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Reporting Period Start
                    </label>
                    <input
                      type="date"
                      value={reportingPeriodStart}
                      onChange={(e) => setReportingPeriodStart(e.target.value)}
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
                      Reporting Period End
                    </label>
                    <input
                      type="date"
                      value={reportingPeriodEnd}
                      onChange={(e) => setReportingPeriodEnd(e.target.value)}
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
                    Custom Coach Note (Optional)
                  </label>
                  <textarea
                    value={coachNote}
                    onChange={(e) => setCoachNote(e.target.value)}
                    rows={4}
                    placeholder="Add a personalized note for the parent..."
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

              <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg }}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleGeneratePreview}
                  disabled={!selectedSnapshotId}
                >
                  Preview Report
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCreateReport}
                  disabled={!selectedSnapshotId}
                >
                  Create Report
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setShowGenerateModal(false);
                    setPreviewContent(null);
                  }}
                >
                  Cancel
                </Button>
              </div>

              {previewContent && (
                <Card variant="default" padding="lg" style={{ background: colors.surface.elevated, marginTop: spacing.lg }}>
                  <h4 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                    Preview
                  </h4>
                  <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.8 }}>
                    <div style={{ marginBottom: spacing.md, fontWeight: typography.fontWeight.semibold }}>
                      {previewContent.headline}
                    </div>
                    <div style={{ marginBottom: spacing.md }}>
                      <strong>Strengths:</strong> {previewContent.strengths.join(', ')}
                    </div>
                    <div style={{ marginBottom: spacing.md }}>
                      <strong>Focus Areas:</strong> {previewContent.focusAreas.join(', ')}
                    </div>
                    <div style={{ whiteSpace: 'pre-line' }}>
                      <strong>Coach Note:</strong><br />
                      {previewContent.coachNote}
                    </div>
                  </div>
                </Card>
              )}
            </Card>
            </div>
          </div>
        )}
      </Section>
    </motion.main>
  );
};

export default ManageParentReportsPage;

