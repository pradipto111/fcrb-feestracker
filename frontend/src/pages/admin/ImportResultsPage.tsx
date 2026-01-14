import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { colors, typography, spacing } from "../../theme/design-tokens";

const ImportResultsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await api.getStudents();
      // Filter to show only recently imported students (those with @realverse.com email)
      const importedStudents = data.filter((s: any) => 
        s.email && s.email.includes('@realverse.com')
      );
      setStudents(importedStudents);
    } catch (err: any) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s: any) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.text.primary }}>
        Loading students...
      </div>
    );
  }

  return (
    <motion.main
      className="rv-page rv-page--admin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        padding: spacing.xl,
        maxWidth: 1600,
        margin: '0 auto'
      }}
    >
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{
          ...typography.h1,
          color: colors.text.primary,
          marginBottom: spacing.md
        }}>
          Imported Students ({students.length})
        </h1>
        <p style={{
          ...typography.body,
          color: colors.text.secondary,
          marginBottom: spacing.lg
        }}>
          All students imported from the CSV file. These students have @realverse.com email addresses and can log in to their dashboards.
        </p>
      </div>

      <div style={{ marginBottom: spacing.lg }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: spacing.md,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: colors.text.primary,
            fontSize: 16
          }}
        />
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: spacing.lg,
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
            }}>
              <th style={{ padding: spacing.md, textAlign: 'left', ...typography.label }}>Name</th>
              <th style={{ padding: spacing.md, textAlign: 'left', ...typography.label }}>Email</th>
              <th style={{ padding: spacing.md, textAlign: 'left', ...typography.label }}>Phone</th>
              <th style={{ padding: spacing.md, textAlign: 'left', ...typography.label }}>Program</th>
              <th style={{ padding: spacing.md, textAlign: 'left', ...typography.label }}>Status</th>
              <th style={{ padding: spacing.md, textAlign: 'left', ...typography.label }}>Monthly Fee</th>
              <th style={{ padding: spacing.md, textAlign: 'left', ...typography.label }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student: any) => (
              <tr key={student.id} style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <td style={{ padding: spacing.md }}>{student.fullName}</td>
                <td style={{ padding: spacing.md, fontFamily: 'monospace', fontSize: 12 }}>
                  {student.email}
                </td>
                <td style={{ padding: spacing.md }}>{student.phoneNumber || '-'}</td>
                <td style={{ padding: spacing.md }}>
                  <span style={{
                    padding: '4px 8px',
                    background: student.programType === 'EPP' ? 'rgba(59, 130, 246, 0.2)' :
                               student.programType === 'SCP' ? 'rgba(16, 185, 129, 0.2)' :
                               student.programType === 'FYDP' ? 'rgba(251, 191, 36, 0.2)' :
                               'rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {student.programType || 'N/A'}
                  </span>
                </td>
                <td style={{ padding: spacing.md }}>
                  <span style={{
                    padding: '4px 8px',
                    background: student.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.2)' :
                               student.status === 'INACTIVE' ? 'rgba(239, 68, 68, 0.2)' :
                               'rgba(156, 163, 175, 0.2)',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: student.status === 'ACTIVE' ? '#22c55e' :
                           student.status === 'INACTIVE' ? '#ef4444' :
                           '#9ca3af'
                  }}>
                    {student.status}
                  </span>
                </td>
                <td style={{ padding: spacing.md }}>
                  ₹{student.monthlyFeeAmount?.toLocaleString() || '0'}
                </td>
                <td style={{ padding: spacing.md }}>
                  <button
                    onClick={() => navigate(`/realverse/admin/players/${student.id}/profile`)}
                    style={{
                      padding: `${spacing.xs} ${spacing.sm}`,
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div style={{
            padding: spacing.xl,
            textAlign: 'center',
            color: colors.text.secondary
          }}>
            {searchTerm ? 'No students found matching your search.' : 'No imported students found.'}
          </div>
        )}
      </div>

      <div style={{ marginTop: spacing.lg, display: 'flex', gap: spacing.md }}>
        <button
          onClick={() => navigate('/realverse/admin/students')}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: 'transparent',
            color: colors.text.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 16
          }}
        >
          Back to All Students
        </button>
        <button
          onClick={() => navigate('/realverse/admin/students/bulk-import')}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 16
          }}
        >
          Import More Students
        </button>
      </div>
    </motion.main>
  );
};

export default ImportResultsPage;
