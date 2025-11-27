import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

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
    <div style={{
      minHeight: "100vh",
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/photo2.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1E40AF" }}>FCRB Students</h1>
        <button
          onClick={loadData}
          style={{
            padding: "12px 24px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              🔍 Search
            </label>
            <input
              type="text"
              placeholder="Search by name, center, program, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              🏢 Center
            </label>
            <select
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14
              }}
            >
              <option value="">All Centers</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              📊 Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14
              }}
            >
              <option value="">All Statuses</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              🎯 Program
            </label>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14
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
          <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#666" }}>
              Showing {filteredStudents.length} of {students.length} students
            </span>
            <button
              onClick={() => {
                setSearchTerm("");
                setCenterFilter("");
                setStatusFilter("");
                setProgramFilter("");
              }}
              style={{
                padding: "6px 12px",
                background: "#f0f0f0",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          padding: 16,
          background: "#f8d7da",
          color: "#721c24",
          borderRadius: 8,
          marginBottom: 16
        }}>
          {error}
        </div>
      )}

      {/* Students Table */}
      <div style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
              <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Name</th>
              <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Center</th>
              <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Program</th>
              <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Status</th>
              <th style={{ padding: 16, textAlign: "right", fontWeight: 600 }}>Monthly Fee</th>
              <th style={{ padding: 16, textAlign: "center", fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 16 }}>
                  <Link
                    to={`/students/${student.id}`}
                    style={{
                      fontWeight: 600,
                      color: "#667eea",
                      textDecoration: "none"
                    }}
                  >
                    {student.fullName}
                  </Link>
                </td>
                <td style={{ padding: 16, color: "#666" }}>{student.centerName}</td>
                <td style={{ padding: 16 }}>{student.programType || "-"}</td>
                <td style={{ padding: 16 }}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: student.status === "ACTIVE" ? "#27ae6020" :
                               student.status === "TRIAL" ? "#f39c1220" : "#95a5a620",
                    color: student.status === "ACTIVE" ? "#27ae60" :
                          student.status === "TRIAL" ? "#f39c12" : "#95a5a6"
                  }}>
                    {student.status}
                  </span>
                </td>
                <td style={{ padding: 16, textAlign: "right", fontWeight: 600 }}>
                  ₹{student.monthlyFeeAmount.toLocaleString()}
                </td>
                <td style={{ padding: 16, textAlign: "center" }}>
                  <button
                    onClick={() => handleEditClick(student)}
                    style={{
                      padding: "6px 16px",
                      background: "#667eea",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "#999" }}>
            {students.length === 0 ? "No students yet" : "No students match the filters"}
          </div>
        )}
      </div>

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
          <div style={{
            background: "white",
            borderRadius: 12,
            padding: 32,
            maxWidth: 800,
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Edit Student</h2>
            
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
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedStudentsPage;

