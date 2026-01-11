import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/design-tokens";
import { pageVariants, cardVariants, primaryButtonWhileHover, primaryButtonWhileTap } from "../utils/motion";

const AdminManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"centers" | "students">("centers");
  const [centers, setCenters] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showCenterForm, setShowCenterForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect non-admin users
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // Center form state
  const [centerForm, setCenterForm] = useState({
    name: "",
    location: "",
    city: "",
    address: ""
  });

  // Student form state
  const [studentForm, setStudentForm] = useState({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    parentName: "",
    parentPhoneNumber: "",
    email: "",
    password: "",
    centerId: "",
    joiningDate: "",
    programType: "",
    monthlyFeeAmount: "",
    paymentFrequency: "1",
    status: "ACTIVE"
  });

  useEffect(() => {
    loadCenters();
    loadStudents();
  }, []);

  const loadCenters = async () => {
    try {
      const data = await api.getCenters();
      setCenters(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    if (!centerForm.name.trim()) {
      setError("❌ Center name is required");
      return;
    }
    
    try {
      await api.createCenter(centerForm);
      setSuccess("✅ Center created successfully! Coach now has access to this center.");
      setCenterForm({ name: "", location: "", city: "", address: "" });
      setShowCenterForm(false);
      loadCenters();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create center";
      setError(`❌ ${errorMessage}`);
      console.error("Create center error:", err);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    if (!studentForm.fullName.trim()) {
      setError("❌ Student name is required");
      return;
    }
    
    if (!studentForm.centerId) {
      setError("❌ Please select an academy");
      return;
    }
    
    if (!studentForm.monthlyFeeAmount || parseInt(studentForm.monthlyFeeAmount) <= 0) {
      setError("❌ Please enter a valid monthly fee amount");
      return;
    }
    
    // If email is provided, password should also be provided
    if (studentForm.email && !studentForm.password) {
      setError("❌ Password is required when email is provided (for student login)");
      return;
    }
    
    // If password is provided, email should also be provided
    if (studentForm.password && !studentForm.email) {
      setError("❌ Email is required when password is provided (for student login)");
      return;
    }
    
    try {
      const data: any = {
        ...studentForm,
        centerId: parseInt(studentForm.centerId),
        monthlyFeeAmount: parseInt(studentForm.monthlyFeeAmount),
        paymentFrequency: parseInt(studentForm.paymentFrequency),
        dateOfBirth: studentForm.dateOfBirth ? new Date(studentForm.dateOfBirth).toISOString() : undefined,
        joiningDate: studentForm.joiningDate ? new Date(studentForm.joiningDate).toISOString() : undefined,
        // Send password as-is, backend will hash it
        password: studentForm.password || undefined,
        // Send empty email as undefined (backend will convert to null)
        email: studentForm.email || undefined
      };
      
      await api.createStudent(data);
      setSuccess("✅ Student created successfully! Coaches will see this student in their dashboard.");
      setStudentForm({
        fullName: "",
        dateOfBirth: "",
        phoneNumber: "",
        parentName: "",
        parentPhoneNumber: "",
        email: "",
        password: "",
        centerId: "",
        joiningDate: "",
        programType: "",
        monthlyFeeAmount: "",
        paymentFrequency: "1",
        status: "ACTIVE"
      });
      setShowStudentForm(false);
      loadStudents();
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      let errorMessage = "Failed to create student";
      
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
      console.error("Create student error:", err);
    }
  };

  return (
    <motion.main
      className="rv-page rv-page--admin"
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
            <h1 className="rv-page-title">FCRB Admin Management</h1>
            <p className="rv-page-subtitle">Manage centers and students</p>
          </div>
        </header>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>
          <motion.button
            onClick={() => setActiveTab("centers")}
            style={{
              padding: "12px 24px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "centers" ? "3px solid rgba(0, 224, 255, 0.7)" : "none",
              color: activeTab === "centers" ? "var(--rv-text-secondary)" : "var(--rv-text-muted)",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 16,
              fontFamily: "Space Grotesk, sans-serif",
            }}
            whileHover={{ color: "var(--rv-text-secondary)" }}
            whileTap={{ scale: 0.98 }}
          >
            🏢 Centers ({centers.length})
          </motion.button>
          <motion.button
            onClick={() => setActiveTab("students")}
            style={{
              padding: "12px 24px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "students" ? "3px solid rgba(0, 224, 255, 0.7)" : "none",
              color: activeTab === "students" ? "var(--rv-text-secondary)" : "var(--rv-text-muted)",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 16,
              fontFamily: "Space Grotesk, sans-serif",
            }}
            whileHover={{ color: "var(--rv-text-secondary)" }}
            whileTap={{ scale: 0.98 }}
          >
            👥 Students ({students.length})
          </motion.button>
        </div>

      {/* Success/Error Messages */}
      {success && (
        <div style={{
          padding: 16,
          background: "#d4edda",
          color: "#155724",
          borderRadius: 8,
          marginBottom: 16
        }}>
          {success}
        </div>
      )}
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

      {/* Centers Tab */}
      {activeTab === "centers" && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setShowCenterForm(!showCenterForm)}
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
              {showCenterForm ? "Cancel" : "+ Add New Center"}
            </button>
          </div>

          {/* Center Form */}
          {showCenterForm && (
            <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Create New Center</h2>
              <form onSubmit={handleCreateCenter} style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Center Name *</label>
                  <input
                    required
                    value={centerForm.name}
                    onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                    placeholder="e.g., Elite Football Academy"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Location</label>
                    <input
                      value={centerForm.location}
                      onChange={(e) => setCenterForm({ ...centerForm, location: e.target.value })}
                      placeholder="e.g., Andheri West"
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>City</label>
                    <input
                      value={centerForm.city}
                      onChange={(e) => setCenterForm({ ...centerForm, city: e.target.value })}
                      placeholder="e.g., Mumbai"
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Full Address</label>
                  <textarea
                    value={centerForm.address}
                    onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                    placeholder="Complete address with pincode"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: "inherit"
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    background: "#27ae60",
                    color: "#000",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700
                  }}
                >
                  Create Center
                </button>
              </form>
            </Card>
          )}

          {/* Centers List */}
          <div style={{
            background: colors.surface.card,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Name</th>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Location</th>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>City</th>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Address</th>
                </tr>
              </thead>
              <tbody>
                {centers.map((center) => (
                  <tr key={center.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: 16 }}>
                      <Link
                        to={`/centers/${center.id}`}
                        style={{
                          fontWeight: 600,
                          color: "#667eea",
                          textDecoration: "none"
                        }}
                      >
                        {center.name}
                      </Link>
                    </td>
                    <td style={{ padding: 16 }}>{center.location || "-"}</td>
                    <td style={{ padding: 16 }}>{center.city || "-"}</td>
                    <td style={{ padding: 16, fontSize: 14, color: "#666" }}>{center.address || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {centers.length === 0 && (
              <div style={{ padding: 48, textAlign: "center", color: "#999" }}>
                No centers yet. Create your first center!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === "students" && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setShowStudentForm(!showStudentForm)}
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
              {showStudentForm ? "Cancel" : "+ Add New Student"}
            </button>
          </div>

          {/* Student Form */}
          {showStudentForm && (
            <div style={{
              background: colors.surface.card,
              padding: 32,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              marginBottom: 24
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Add New Student</h2>
              <form onSubmit={handleCreateStudent} style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Full Name *</label>
                    <input
                      required
                      value={studentForm.fullName}
                      onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                      placeholder="Student's full name"
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Date of Birth</label>
                    <input
                      type="date"
                      value={studentForm.dateOfBirth}
                      onChange={(e) => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Phone Number</label>
                    <input
                      value={studentForm.phoneNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, phoneNumber: e.target.value })}
                      placeholder="Student's phone"
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Email (for student login)</label>
                    <input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      placeholder="student@example.com"
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Password (for student login)</label>
                    <input
                      type="password"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      placeholder="Optional - for student portal access"
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "end", padding: "12px 0", fontSize: 13, color: "#666" }}>
                    💡 If email & password are set, student can login to view their fees
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Parent Name</label>
                    <input
                      value={studentForm.parentName}
                      onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                      placeholder="Parent/Guardian name"
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Parent Phone</label>
                    <input
                      value={studentForm.parentPhoneNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, parentPhoneNumber: e.target.value })}
                      placeholder="Parent's phone"
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Academy *</label>
                    <select
                      required
                      value={studentForm.centerId}
                      onChange={(e) => setStudentForm({ ...studentForm, centerId: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Select Academy</option>
                      {centers.map((center) => (
                        <option key={center.id} value={center.id}>
                          {center.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Program Type</label>
                    <select
                      value={studentForm.programType}
                      onChange={(e) => setStudentForm({ ...studentForm, programType: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Select Program</option>
                      <option value="EPP">Elite Pathway Program (EPP)</option>
                      <option value="SCP">Senior Competitive Program (SCP)</option>
                      <option value="WPP">Women's Performance Pathway (WPP)</option>
                      <option value="FYDP">Foundation & Youth Development Program (FYDP)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Joining Date</label>
                    <input
                      type="date"
                      value={studentForm.joiningDate}
                      onChange={(e) => setStudentForm({ ...studentForm, joiningDate: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Monthly Fee (₹) *</label>
                    <input
                      required
                      type="number"
                      value={studentForm.monthlyFeeAmount}
                      onChange={(e) => setStudentForm({ ...studentForm, monthlyFeeAmount: e.target.value })}
                      placeholder="e.g., 5000"
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Payment Frequency *</label>
                    <select
                      required
                      value={studentForm.paymentFrequency}
                      onChange={(e) => setStudentForm({ ...studentForm, paymentFrequency: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="1">Monthly (1 month)</option>
                      <option value="2">Bi-monthly (2 months)</option>
                      <option value="3">Quarterly (3 months)</option>
                      <option value="4">4 months</option>
                      <option value="5">5 months</option>
                      <option value="6">Half-yearly (6 months)</option>
                      <option value="7">7 months</option>
                      <option value="8">8 months</option>
                      <option value="9">9 months</option>
                      <option value="10">10 months</option>
                      <option value="11">11 months</option>
                      <option value="12">Yearly (12 months)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Status *</label>
                    <select
                      required
                      value={studentForm.status}
                      onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "16px 20px", // Increased padding: 16px vertical, 20px horizontal
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        fontSize: 16,
                        background: "#141F3A",
                        color: "#FFFFFF",
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="TRIAL">Trial</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    background: "#27ae60",
                    color: "#000",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700
                  }}
                >
                  Add Student
                </button>
              </form>
            </div>
          )}

          {/* Students List */}
          <div style={{
            background: colors.surface.card,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Name</th>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Program</th>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Monthly Fee</th>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Frequency</th>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: 16, fontWeight: 600 }}>{student.fullName}</td>
                    <td style={{ padding: 16 }}>{student.programType || "-"}</td>
                    <td style={{ padding: 16 }}>₹{student.monthlyFeeAmount.toLocaleString()}</td>
                    <td style={{ padding: 16 }}>
                      {student.paymentFrequency === 1 ? "Monthly" :
                       student.paymentFrequency === 3 ? "Quarterly" :
                       student.paymentFrequency === 6 ? "Half-yearly" :
                       student.paymentFrequency === 12 ? "Yearly" :
                       `${student.paymentFrequency} months`}
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        background: student.status === "ACTIVE" ? "#27ae6020" : student.status === "TRIAL" ? "#f39c1220" : "#95a5a620",
                        color: student.status === "ACTIVE" ? "#27ae60" : student.status === "TRIAL" ? "#f39c12" : "#95a5a6"
                      }}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && (
              <div style={{ padding: 48, textAlign: "center", color: "#999" }}>
                No students yet. Add your first student!
              </div>
            )}
          </div>
        </div>
      )}
      </section>
    </motion.main>
  );
};

export default AdminManagementPage;

