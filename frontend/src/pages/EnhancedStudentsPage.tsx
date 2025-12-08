import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Table } from "../components/ui/Table";
import { StatusChip } from "../components/ui/StatusChip";
import { pageVariants, cardVariants, primaryButtonWhileHover, primaryButtonWhileTap } from "../utils/motion";

const EnhancedStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [centerFilter, setCenterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [error, setError] = useState("");
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, centerFilter, statusFilter, programFilter]);

  const loadData = async () => {
    try {
      const [studentsData, centersData] = await Promise.all([
        api.getStudents(),
        api.getCenters()
      ]);
      
      // Enrich students with center info
      const enrichedStudents = studentsData.map((s: any) => ({
        ...s,
        centerName: centersData.find((c: any) => c.id === s.centerId)?.name || "Unknown"
      }));
      
      setStudents(enrichedStudents);
      setCenters(centersData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.fullName.toLowerCase().includes(term) ||
        s.centerName.toLowerCase().includes(term) ||
        (s.programType && s.programType.toLowerCase().includes(term)) ||
        s.status.toLowerCase().includes(term)
      );
    }

    // Center filter
    if (centerFilter) {
      filtered = filtered.filter(s => s.centerId === parseInt(centerFilter));
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Program filter
    if (programFilter) {
      filtered = filtered.filter(s => s.programType === programFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleEditClick = (student: any) => {
    setEditingStudent({
      ...student,
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : "",
      joiningDate: student.joiningDate ? new Date(student.joiningDate).toISOString().split('T')[0] : ""
    });
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!editingStudent.fullName?.trim()) {
      setError("❌ Student name is required");
      return;
    }
    
    if (!editingStudent.centerId) {
      setError("❌ Please select an academy");
      return;
    }
    
    if (!editingStudent.monthlyFeeAmount || parseInt(editingStudent.monthlyFeeAmount) <= 0) {
      setError("❌ Please enter a valid monthly fee amount");
      return;
    }
    
    // If email is provided and password is being changed
    if (editingStudent.email && editingStudent.newPassword && !editingStudent.email.trim()) {
      setError("❌ Email cannot be empty when setting a password");
      return;
    }
    
    try {
      const data: any = {
        ...editingStudent,
        centerId: parseInt(editingStudent.centerId),
        monthlyFeeAmount: parseInt(editingStudent.monthlyFeeAmount),
        paymentFrequency: parseInt(editingStudent.paymentFrequency),
        dateOfBirth: editingStudent.dateOfBirth ? new Date(editingStudent.dateOfBirth).toISOString() : null,
        joiningDate: editingStudent.joiningDate ? new Date(editingStudent.joiningDate).toISOString() : null,
        // Send new password if provided, backend will hash it
        password: editingStudent.newPassword || undefined,
        // Send empty email as undefined (backend will convert to null)
        email: editingStudent.email || undefined
      };
      
      delete data.newPassword; // Remove temporary field
      delete data.passwordHash; // Remove old hash
      delete data.centerName; // Remove enriched field
      
      await api.updateStudent(editingStudent.id, data);
      setShowEditModal(false);
      setEditingStudent(null);
      setError("");
      loadData();
    } catch (err: any) {
      let errorMessage = "Failed to update student";
      
      // Parse error message from backend
      if (err.message) {
        try {
          const parsed = JSON.parse(err.message);
          errorMessage = parsed.message || errorMessage;
        } catch {
          errorMessage = err.message;
        }
      }
      
      // Check for specific error types
      if (errorMessage.includes("email already exists") || errorMessage.includes("Unique constraint")) {
        errorMessage = "A student with this email already exists. Please use a different email.";
      }
      
      setError(`❌ ${errorMessage}`);
      console.error("Update student error:", err);
    }
  };

  const programs = ["U10", "U13", "U15", "U17", "U19"];
  const statuses = ["ACTIVE", "TRIAL", "INACTIVE"];

  return (
    <motion.main
      className="rv-page rv-page--players"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Floating Stars Background */}
      <div className="rv-page-stars" aria-hidden="true">
        <span className="rv-star" />
        <span className="rv-star rv-star--delay1" />
        <span className="rv-star rv-star--delay2" />
        <span className="rv-star rv-star--delay3" />
        <span className="rv-star rv-star--delay4" />
      </div>

      <section className="rv-section-surface">
        {/* Header */}
        <header className="rv-section-header">
          <div>
            <h1 className="rv-page-title">👥 Players</h1>
            <p className="rv-page-subtitle">Manage and view all academy players</p>
          </div>
          <motion.button
            className="rv-btn rv-btn-secondary"
            whileHover={{ scale: 1.02, boxShadow: "0 0 12px rgba(0, 224, 255, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={loadData}
          >
            🔄 Refresh
          </motion.button>
        </header>

        {/* Filters */}
        <div className="rv-filter-bar">
          <div className="rv-filter-field">
            <label>🔍 Search</label>
            <Input
              type="text"
              placeholder="Search by name, center, program, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.7rem",
                border: "1px solid var(--rv-border-subtle)",
                borderRadius: "var(--rv-radius-sm)",
                background: "rgba(3, 9, 28, 0.9)",
                color: "var(--rv-text-body)",
                fontSize: "0.86rem",
              }}
            />
          </div>

          <div className="rv-filter-field">
            <label>🏢 Center</label>
            <select
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
            >
              <option value="">All Centers</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="rv-filter-field">
            <label>📊 Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="rv-filter-field">
            <label style={{ 
              display: "block", 
              marginBottom: spacing.sm, 
              ...typography.caption,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.secondary,
            }}>
              🎯 Program
            </label>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              style={{
                width: "100%",
                padding: `${spacing.sm} ${spacing.md}`,
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.sm,
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.1)",
                color: colors.text.primary,
                fontFamily: typography.fontFamily.primary,
              }}
            >
              <option value="">All Programs</option>
              {programs.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || centerFilter || statusFilter || programFilter) && (
          <div style={{ marginTop: spacing.md, display: "flex", gap: spacing.sm, alignItems: "center" }}>
            <span style={{ ...typography.caption, color: colors.text.muted }}>
              Showing {filteredStudents.length} of {students.length} players
            </span>
            <Button
              variant="utility"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setCenterFilter("");
                setStatusFilter("");
                setProgramFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {error && (
        <Card variant="default" padding="md" style={{ 
          marginBottom: spacing.md,
          background: colors.danger.soft,
          border: `1px solid ${colors.danger.main}40`,
        }}>
          <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
        </Card>
      )}

      {/* Students Table */}
      <Card variant="default" padding="none" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ 
              background: "rgba(255, 255, 255, 0.05)", 
              borderBottom: `1px solid rgba(255, 255, 255, 0.1)` 
            }}>
              <th style={{ 
                padding: spacing.md, 
                textAlign: "left", 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>Name</th>
              <th style={{ 
                padding: spacing.md, 
                textAlign: "left", 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>Center</th>
              <th style={{ 
                padding: spacing.md, 
                textAlign: "left", 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>Program</th>
              <th style={{ 
                padding: spacing.md, 
                textAlign: "left", 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>Status</th>
              <th style={{ 
                padding: spacing.md, 
                textAlign: "right", 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>Monthly Fee</th>
              <th style={{ 
                padding: spacing.md, 
                textAlign: "center", 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr 
                key={student.id} 
                style={{ 
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <td style={{ padding: spacing.md }}>
                  <Link
                    to={`/students/${student.id}`}
                    style={{
                      ...typography.body,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.primary.light,
                      textDecoration: "none",
                    }}
                  >
                    {student.fullName}
                  </Link>
                </td>
                <td style={{ padding: spacing.md, color: colors.text.muted }}>
                  {student.centerName}
                </td>
                <td style={{ padding: spacing.md, color: colors.text.primary }}>
                  {student.programType || "-"}
                </td>
                <td style={{ padding: spacing.md }}>
                  <StatusChip 
                    status={student.status === "ACTIVE" ? "success" : 
                           student.status === "TRIAL" ? "warning" : "muted"}
                  >
                    {student.status}
                  </StatusChip>
                </td>
                <td style={{ 
                  padding: spacing.md, 
                  textAlign: "right", 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                }}>
                  ₹{student.monthlyFeeAmount.toLocaleString()}
                </td>
                <td style={{ padding: spacing.md, textAlign: "center" }}>
                  <Button
                    variant="utility"
                    size="sm"
                    onClick={() => handleEditClick(student)}
                  >
                    ✏️ Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div style={{ 
            padding: spacing['3xl'], 
            textAlign: "center", 
            color: colors.text.muted,
            ...typography.body,
          }}>
            {students.length === 0 ? "No players yet" : "No players match the filters"}
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      {showEditModal && editingStudent && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 24
        }}>
          <Card variant="elevated" padding="xl" style={{
            maxWidth: 800,
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <h2 style={{ 
              ...typography.h2,
              marginBottom: spacing.lg,
              color: colors.text.primary,
            }}>Edit Player</h2>
            
            <form onSubmit={handleUpdateStudent} style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Full Name *</label>
                  <input
                    required
                    value={editingStudent.fullName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Date of Birth</label>
                  <input
                    type="date"
                    value={editingStudent.dateOfBirth}
                    onChange={(e) => setEditingStudent({ ...editingStudent, dateOfBirth: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Email</label>
                  <input
                    type="email"
                    value={editingStudent.email || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>New Password (optional)</label>
                  <input
                    type="password"
                    value={editingStudent.newPassword || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, newPassword: e.target.value })}
                    placeholder="Leave blank to keep current"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Center *</label>
                  <select
                    required
                    value={editingStudent.centerId}
                    onChange={(e) => setEditingStudent({ ...editingStudent, centerId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  >
                    {centers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Program</label>
                  <select
                    value={editingStudent.programType || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, programType: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  >
                    <option value="">Select Program</option>
                    {programs.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Status *</label>
                  <select
                    required
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Monthly Fee (₹) *</label>
                  <input
                    required
                    type="number"
                    value={editingStudent.monthlyFeeAmount}
                    onChange={(e) => setEditingStudent({ ...editingStudent, monthlyFeeAmount: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Payment Frequency *</label>
                  <select
                    required
                    value={editingStudent.paymentFrequency}
                    onChange={(e) => setEditingStudent({ ...editingStudent, paymentFrequency: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                      <option key={n} value={n}>
                        {n === 1 ? "Monthly (1 month)" :
                         n === 3 ? "Quarterly (3 months)" :
                         n === 6 ? "Half-yearly (6 months)" :
                         n === 12 ? "Yearly (12 months)" :
                         `${n} months`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background: "#27ae60",
                    color: "#000",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background: "#95a5a6",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
      </section>
    </motion.main>
  );
};

export default EnhancedStudentsPage;

