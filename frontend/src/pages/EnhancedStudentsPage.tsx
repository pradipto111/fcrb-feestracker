import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTableCard } from "../components/ui/DataTableCard";
import { Section } from "../components/ui/Section";
import { FormSection } from "../components/ui/FormSection";
import { FormField } from "../components/ui/FormField";
import { useAuth } from "../context/AuthContext";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Table } from "../components/ui/Table";
import { StatusChip } from "../components/ui/StatusChip";
import { pageVariants, cardVariants, primaryButtonWhileHover, primaryButtonWhileTap } from "../utils/motion";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { adminAssets, academyAssets, galleryAssets } from "../config/assets";
import { PlusIcon, CloseIcon, ErrorIcon, SuccessIcon, SearchIcon, BuildingIcon, ChartBarIcon, ChartLineIcon, EditIcon } from "../components/icons/IconSet";

const EnhancedStudentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [studentPayments, setStudentPayments] = useState<{ [key: number]: { totalPaid: number; outstanding: number } }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [centerFilter, setCenterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
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
    loadData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, centerFilter, statusFilter, programFilter]);

  // Calculate outstanding amount for a student
  const calculateOutstanding = (student: any, totalPaid: number): number => {
    if (!student.joiningDate) {
      return Math.max(0, student.monthlyFeeAmount - totalPaid);
    }

    const now = new Date();
    const joining = new Date(student.joiningDate);
    
    // Calculate months including the current month
    const monthsElapsed = Math.max(
      1,
      (now.getFullYear() - joining.getFullYear()) * 12 + 
      (now.getMonth() - joining.getMonth()) + 1
    );
    
    // Calculate how many COMPLETE payment cycles have passed
    const paymentFrequency = student.paymentFrequency || 1;
    const cyclesCompleted = Math.floor(monthsElapsed / paymentFrequency);
    
    // Expected amount = completed cycles * (monthly fee * frequency)
    const expectedAmount = cyclesCompleted * (student.monthlyFeeAmount * paymentFrequency);
    
    return Math.max(0, expectedAmount - totalPaid);
  };

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

      // Fetch payment data for each student
      const paymentsMap: { [key: number]: { totalPaid: number; outstanding: number } } = {};
      
      // Fetch student details which include payment summaries
      await Promise.all(
        enrichedStudents.map(async (student: any) => {
          try {
            const studentDetail = await api.getStudent(student.id);
            const totalPaid = studentDetail.totalPaid || 0;
            const outstanding = calculateOutstanding(student, totalPaid);
            paymentsMap[student.id] = { totalPaid, outstanding };
          } catch (err) {
            // If fetching fails, calculate from student data only
            const outstanding = calculateOutstanding(student, 0);
            paymentsMap[student.id] = { totalPaid: 0, outstanding };
          }
        })
      );
      
      setStudentPayments(paymentsMap);
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

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    if (!newStudent.fullName?.trim()) {
      setError("Student name is required");
      return;
    }
    
    if (!newStudent.centerId) {
      setError("Please select a center");
      return;
    }
    
    if (!newStudent.monthlyFeeAmount || parseInt(newStudent.monthlyFeeAmount) <= 0) {
      setError("Please enter a valid monthly fee amount");
      return;
    }

    // Email validation (if provided)
    if (newStudent.email && newStudent.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newStudent.email.trim())) {
        setError("Please enter a valid email address");
        return;
      }
    }
    
    // If email is provided, password should also be provided
    if (newStudent.email && !newStudent.password) {
      setError("Password is required when email is provided (for student login)");
      return;
    }
    
    // If password is provided, email should also be provided
    if (newStudent.password && !newStudent.email) {
      setError("Email is required when password is provided (for student login)");
      return;
    }
    
    try {
      const data: any = {
        ...newStudent,
        centerId: parseInt(newStudent.centerId),
        monthlyFeeAmount: parseInt(newStudent.monthlyFeeAmount),
        paymentFrequency: parseInt(newStudent.paymentFrequency),
        dateOfBirth: newStudent.dateOfBirth ? new Date(newStudent.dateOfBirth).toISOString() : undefined,
        joiningDate: newStudent.joiningDate ? new Date(newStudent.joiningDate).toISOString() : undefined,
        password: newStudent.password || undefined,
        email: newStudent.email || undefined
      };
      
      await api.createStudent(data);
      setSuccess("Student created successfully!");
      setNewStudent({
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
      setShowCreateModal(false);
      setError("");
      loadData();
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
      
      if (errorMessage.includes("Forbidden") || errorMessage.includes("403")) {
        errorMessage = "You don't have permission to create students. Only admins can create students.";
      }
      
      setError(errorMessage);
      console.error("Create student error:", err);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!editingStudent.fullName?.trim()) {
      setError("Student name is required");
      return;
    }
    
    if (!editingStudent.centerId) {
      setError("Please select an academy");
      return;
    }
    
    if (!editingStudent.monthlyFeeAmount || parseInt(editingStudent.monthlyFeeAmount) <= 0) {
      setError("Please enter a valid monthly fee amount");
      return;
    }
    
    // If email is provided and password is being changed
    if (editingStudent.email && editingStudent.newPassword && !editingStudent.email.trim()) {
      setError("Email cannot be empty when setting a password");
      return;
    }

    // Email validation (if provided)
    if (editingStudent.email && editingStudent.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editingStudent.email.trim())) {
        setError("Please enter a valid email address");
        return;
      }
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
      
      setError(errorMessage);
      console.error("Update student error:", err);
    }
  };

  const programs = ["U10", "U13", "U15", "U17", "U19"];
  const statuses = ["ACTIVE", "TRIAL", "INACTIVE"];

  const {
    sectionVariants,
    headingVariants,
    getStaggeredCard,
  } = useHomepageAnimation();

  // Calculate KPIs - use filteredStudents safely
  const activePlayers = (filteredStudents || []).filter(s => s.status === "ACTIVE").length;
  const trialPlayers = (filteredStudents || []).filter(s => s.status === "TRIAL").length;
  const totalPlayers = (filteredStudents || []).length;
  const newThisMonth = (filteredStudents || []).filter(s => {
    if (!s.joiningDate) return false;
    const joining = new Date(s.joiningDate);
    const now = new Date();
    return joining.getMonth() === now.getMonth() && joining.getFullYear() === now.getFullYear();
  }).length;

  return (
    <motion.main
      className="rv-page rv-page--players"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        background: colors.surface.bg,
        minHeight: '100%',
      }}
    >
      {/* Floating Stars Background */}
      <div className="rv-page-stars" aria-hidden="true">
        <span className="rv-star" />
        <span className="rv-star rv-star--delay1" />
        <span className="rv-star rv-star--delay2" />
        <span className="rv-star rv-star--delay3" />
        <span className="rv-star rv-star--delay4" />
      </div>

      {/* BANNER SECTION */}
      <motion.section
        style={{
          position: "relative",
          overflow: "hidden",
          marginBottom: spacing["2xl"],
          borderRadius: borderRadius.xl,
        }}
        variants={sectionVariants}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.4 }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${adminAssets.dashboardBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2,
            filter: "blur(10px)",
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, rgba(4, 61, 208, 0.7) 0%, rgba(255, 169, 0, 0.5) 100%)`,
          }}
        />
        {/* Banner content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: spacing["2xl"],
            display: "flex",
            flexDirection: "column",
            gap: spacing.lg,
          }}
        >
          <motion.p
            style={{
              ...typography.overline,
              color: colors.accent.main,
              letterSpacing: "0.1em",
            }}
            variants={headingVariants}
          >
            RealVerse • Players Management
          </motion.p>
          <motion.h1
            style={{
              ...typography.h1,
              color: colors.text.onPrimary,
              margin: 0,
            }}
            variants={headingVariants}
          >
            All Academy Players
            <span style={{ display: "block", color: colors.accent.main, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.normal, marginTop: spacing.xs }}>
              Manage and track players across all centres
            </span>
          </motion.h1>
          
          {/* KPI Cards Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
              marginTop: spacing.md,
            }}
          >
            {[
              { label: "Active Players", value: activePlayers, subLabel: "All centres" },
              { label: "Trial Players", value: trialPlayers, subLabel: "Evaluation" },
              { label: "Total Players", value: totalPlayers, subLabel: "All statuses" },
              { label: "New This Month", value: newThisMonth, subLabel: "Recent joins" },
            ].map((kpi, index) => (
              <motion.div
                key={kpi.label}
                {...getStaggeredCard(index)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <p style={{ ...typography.caption, color: colors.text.onPrimary, opacity: 0.8, marginBottom: spacing.xs }}>
                  {kpi.label}
                </p>
                <p style={{ ...typography.h2, color: colors.text.onPrimary, margin: 0 }}>
                  {kpi.value}
                </p>
                {kpi.subLabel && (
                  <p style={{ ...typography.caption, color: colors.text.onPrimary, opacity: 0.6, marginTop: spacing.xs, margin: 0 }}>
                    {kpi.subLabel}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <Section
        title="Players"
        description="Manage and view all academy players"
        variant="default"
        style={{ marginBottom: spacing.xl }}
      >
        {/* Filters - Collapsible for Hick's Law */}
        <div className="rv-filter-bar" style={{ marginBottom: spacing.lg }}>
          <div className="rv-filter-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <SearchIcon size={16} />
              Search
            </label>
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
            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <BuildingIcon size={16} />
              Center
            </label>
            <select
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
              style={{
                width: "100%",
                padding: `${spacing.md} ${spacing.lg}`,
                border: "1px solid var(--rv-border-subtle)",
                borderRadius: "var(--rv-radius-sm)",
                background: "rgba(3, 9, 28, 0.9)",
                color: "var(--rv-text-body)",
                fontSize: "0.86rem",
                cursor: "pointer",
                boxSizing: 'border-box',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: `right ${spacing.md} center`,
                paddingRight: spacing.xl,
              }}
            >
              <option value="">All Centers</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="rv-filter-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <ChartBarIcon size={16} />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: `${spacing.md} ${spacing.lg}`,
                border: "1px solid var(--rv-border-subtle)",
                borderRadius: "var(--rv-radius-sm)",
                background: "rgba(3, 9, 28, 0.9)",
                color: "var(--rv-text-body)",
                fontSize: "0.86rem",
                cursor: "pointer",
                boxSizing: 'border-box',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: `right ${spacing.md} center`,
                paddingRight: spacing.xl,
              }}
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
                padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                cursor: "pointer",
                background: colors.surface.card,
                color: colors.text.primary,
                fontFamily: typography.fontFamily.primary,
                boxSizing: 'border-box',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: `right ${spacing.md} center`,
                paddingRight: spacing.xl,
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
          <div style={{ marginBottom: spacing.md, display: "flex", gap: spacing.sm, alignItems: "center" }}>
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

        {success && (
          <Card variant="default" padding="md" style={{ 
            marginBottom: spacing.md,
            background: colors.success.soft,
            border: `1px solid ${colors.success.main}40`,
          }}>
            <p style={{ margin: 0, color: colors.success.main }}>{success}</p>
          </Card>
        )}

        {/* Player Profile & Batch Review CTA Banner */}
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <Card
            variant="elevated"
            padding="lg"
            style={{
              background: `linear-gradient(135deg, ${colors.primary.main}15 0%, ${colors.accent.main}15 100%)`,
              border: `2px solid ${colors.primary.main}40`,
              marginBottom: spacing.xl,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: spacing.lg }}>
                <div style={{ flex: 1, minWidth: "300px" }}>
                  <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.sm }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                      <ChartBarIcon size={24} />
                      Player Profiles & Batch Review
                    </span>
                  </h3>
                  <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
                    Access detailed player profiles with metrics, readiness scores, and development timelines. Use batch review to efficiently assess multiple players.
                  </p>
                  <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate("/realverse/admin/batch-review")}
                    >
                      Start Batch Review →
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        if (filteredStudents.length > 0) {
                          navigate(`/realverse/admin/players/${filteredStudents[0].id}/profile`);
                        }
                      }}
                      disabled={filteredStudents.length === 0}
                    >
                      View First Player Profile →
                    </Button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                  <ChartLineIcon size={64} color={colors.primary.main} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Students Table - Wrapped in DataTableCard for consistent structure */}
        <DataTableCard
          title="All Players"
          description={`${filteredStudents.length} player${filteredStudents.length !== 1 ? 's' : ''} found`}
          filters={
            <div style={{ display: "flex", gap: spacing.sm, alignItems: "center" }}>
              {(searchTerm || centerFilter || statusFilter || programFilter) && (
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
              )}
            </div>
          }
          actions={
            <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
              {(user?.role === "ADMIN" || user?.role === "COACH") && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowCreateModal(true)}
                >
                  <PlusIcon size={14} style={{ marginRight: spacing.xs }} /> Add New Student
                </Button>
              )}
              <Button
                variant="secondary"
                size="md"
                onClick={loadData}
              >
                🔄 Refresh
              </Button>
            </div>
          }
          isEmpty={filteredStudents.length === 0}
          emptyState={
            <div style={{ 
              padding: spacing['2xl'], 
              textAlign: "center", 
              color: colors.text.muted,
            }}>
              <p style={{ ...typography.body, marginBottom: spacing.sm }}>
                {students.length === 0 ? "No players yet" : "No players match the filters"}
              </p>
              {students.length === 0 && (user?.role === "ADMIN" || user?.role === "COACH") && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowCreateModal(true)}
                >
                  Add First Player
                </Button>
              )}
            </div>
          }
        >
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
                textAlign: "left", 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>Fee Status</th>
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
                           student.status === "TRIAL" ? "warning" : "inactive"}
                    label={student.status}
                  />
                </td>
                <td style={{ 
                  padding: spacing.md, 
                  textAlign: "right", 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                }}>
                  ₹{student.monthlyFeeAmount.toLocaleString()}
                </td>
                <td style={{ padding: spacing.md }}>
                  {(() => {
                    const paymentInfo = studentPayments[student.id];
                    if (!paymentInfo) {
                      return (
                        <span style={{ color: colors.text.muted, ...typography.caption }}>
                          Loading...
                        </span>
                      );
                    }
                    const { outstanding } = paymentInfo;
                    if (outstanding === 0) {
                      return (
                        <StatusChip status="success" label="✓ Paid" />
                      );
                    } else {
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
                          <StatusChip status="danger" label="Due" />
                          <span style={{ 
                            color: colors.danger.main, 
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                          }}>
                            ₹{outstanding.toLocaleString()}
                          </span>
                        </div>
                      );
                    }
                  })()}
                </td>
                <td style={{ padding: spacing.md, textAlign: "center" }}>
                  <div style={{ display: "flex", gap: spacing.xs, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                    <Link to={`/realverse/admin/players/${student.id}/profile`} style={{ textDecoration: "none" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        style={{ 
                          minWidth: "120px",
                          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                          boxShadow: `0 2px 8px ${colors.primary.main}40`,
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                          <ChartBarIcon size={16} />
                          View Profile
                        </span>
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/realverse/admin/season-planning/load-dashboard/${student.id}`)}
                      style={{ minWidth: "120px" }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        <ChartLineIcon size={16} />
                        Load Dashboard
                      </span>
                    </Button>
                    <Button
                      variant="utility"
                      size="sm"
                      onClick={() => handleEditClick(student)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        <EditIcon size={16} />
                        Edit
                      </span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </DataTableCard>
      </Section>

      {/* Create Modal */}
      {showCreateModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: spacing.lg,
            overflow: "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
              setError("");
            }
          }}
        >
          <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Card variant="elevated" padding="lg" style={{
              maxWidth: 900,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              background: colors.surface.card,
              border: `1px solid rgba(255, 255, 255, 0.1)`,
            }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
                <h2 style={{ 
                  ...typography.h2,
                  margin: 0,
                  color: colors.text.primary,
                }}>Add New Player</h2>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewStudent({
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
                  setError("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: colors.text.muted,
                  fontSize: typography.fontSize.xl,
                  cursor: "pointer",
                  padding: spacing.xs,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            
            {error && (
              <Card variant="default" padding="md" style={{ 
                marginBottom: spacing.md,
                background: colors.danger.soft,
                border: `1px solid ${colors.danger.main}40`,
              }}>
                <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
              </Card>
            )}

            {success && (
              <Card variant="default" padding="md" style={{ 
                marginBottom: spacing.md,
                background: colors.success.soft,
                border: `1px solid ${colors.success.main}40`,
              }}>
                <p style={{ margin: 0, color: colors.success.main }}>{success}</p>
              </Card>
            )}
            
            <form onSubmit={handleCreateStudent} style={{ display: "grid", gap: 16 }}>
              {error && (
                <Card variant="default" padding="md" style={{ 
                  marginBottom: spacing.md,
                  background: colors.danger.soft,
                  border: `1px solid ${colors.danger.main}40`,
                }}>
                  <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
                </Card>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Full Name *</label>
                  <input
                    required
                    value={newStudent.fullName}
                    onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Date of Birth</label>
                  <input
                    type="date"
                    value={newStudent.dateOfBirth}
                    onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Phone Number</label>
                  <input
                    value={newStudent.phoneNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, phoneNumber: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Parent Name</label>
                  <input
                    value={newStudent.parentName}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Parent Phone Number</label>
                  <input
                    value={newStudent.parentPhoneNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, parentPhoneNumber: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Joining Date</label>
                  <input
                    type="date"
                    value={newStudent.joiningDate}
                    onChange={(e) => setNewStudent({ ...newStudent, joiningDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Email (for login)</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="Optional - for student portal access"
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Password (if email provided)</label>
                  <input
                    type="password"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                    placeholder="Required if email is provided"
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Center *</label>
                  <select
                    required
                    value={newStudent.centerId}
                    onChange={(e) => setNewStudent({ ...newStudent, centerId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  >
                    <option value="">Select Center</option>
                    {centers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Program</label>
                  <select
                    value={newStudent.programType}
                    onChange={(e) => setNewStudent({ ...newStudent, programType: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  >
                    <option value="">Select Program</option>
                    {programs.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Status *</label>
                  <select
                    required
                    value={newStudent.status}
                    onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
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
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Monthly Fee (₹) *</label>
                  <input
                    required
                    type="number"
                    value={newStudent.monthlyFeeAmount}
                    onChange={(e) => setNewStudent({ ...newStudent, monthlyFeeAmount: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Payment Frequency *</label>
                  <select
                    required
                    value={newStudent.paymentFrequency}
                    onChange={(e) => setNewStudent({ ...newStudent, paymentFrequency: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
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
                    background: colors.success.main,
                    color: colors.text.onPrimary,
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  <PlusIcon size={14} style={{ marginRight: spacing.xs }} /> Create Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewStudent({
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
                    setError("");
                  }}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      background: colors.surface.card,
                      color: colors.text.primary,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      cursor: "pointer",
                      fontWeight: typography.fontWeight.semibold,
                      fontSize: typography.fontSize.base,
                    }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingStudent && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: spacing.lg,
            overflow: "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setEditingStudent(null);
              setError("");
            }
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
          <Card variant="elevated" padding="lg" style={{
            maxWidth: 900,
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            background: colors.surface.card,
            border: `1px solid rgba(255, 255, 255, 0.1)`,
          }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
              <h2 style={{ 
                ...typography.h2,
                margin: 0,
                color: colors.text.primary,
              }}>Edit Player</h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                  setError("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: colors.text.muted,
                  fontSize: typography.fontSize.xl,
                  cursor: "pointer",
                  padding: spacing.xs,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {error && (
              <Card variant="default" padding="md" style={{ 
                marginBottom: spacing.md,
                background: colors.danger.soft,
                border: `1px solid ${colors.danger.main}40`,
              }}>
                <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
              </Card>
            )}
            
            <form onSubmit={handleUpdateStudent} style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Full Name *</label>
                  <input
                    required
                    value={editingStudent.fullName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Date of Birth</label>
                  <input
                    type="date"
                    value={editingStudent.dateOfBirth}
                    onChange={(e) => setEditingStudent({ ...editingStudent, dateOfBirth: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Phone Number</label>
                  <input
                    value={editingStudent.phoneNumber || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phoneNumber: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Parent Name</label>
                  <input
                    value={editingStudent.parentName || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Parent Phone Number</label>
                  <input
                    value={editingStudent.parentPhoneNumber || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentPhoneNumber: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Joining Date</label>
                  <input
                    type="date"
                    value={editingStudent.joiningDate}
                    onChange={(e) => setEditingStudent({ ...editingStudent, joiningDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Email (for login)</label>
                  <input
                    type="email"
                    value={editingStudent.email || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    placeholder="Optional - for student portal access"
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>New Password (optional)</label>
                  <input
                    type="password"
                    value={editingStudent.newPassword || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, newPassword: e.target.value })}
                    placeholder="Leave blank to keep current"
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Center *</label>
                  <select
                    required
                    value={editingStudent.centerId}
                    onChange={(e) => setEditingStudent({ ...editingStudent, centerId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      cursor: "pointer",
                      background: colors.surface.card,
                      color: colors.text.primary,
                      fontFamily: typography.fontFamily.primary,
                      boxSizing: 'border-box',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: `right ${spacing.md} center`,
                      paddingRight: spacing.xl,
                    }}
                  >
                    {centers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Program</label>
                  <select
                    value={editingStudent.programType || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, programType: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      cursor: "pointer",
                      background: colors.surface.card,
                      color: colors.text.primary,
                      fontFamily: typography.fontFamily.primary,
                      boxSizing: 'border-box',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: `right ${spacing.md} center`,
                      paddingRight: spacing.xl,
                    }}
                  >
                    <option value="">Select Program</option>
                    {programs.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Status *</label>
                  <select
                    required
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      cursor: "pointer",
                      background: colors.surface.card,
                      color: colors.text.primary,
                      fontFamily: typography.fontFamily.primary,
                      boxSizing: 'border-box',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: `right ${spacing.md} center`,
                      paddingRight: spacing.xl,
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
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Monthly Fee (₹) *</label>
                  <input
                    required
                    type="number"
                    value={editingStudent.monthlyFeeAmount}
                    onChange={(e) => setEditingStudent({ ...editingStudent, monthlyFeeAmount: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      boxSizing: 'border-box',
                      lineHeight: typography.lineHeight.normal,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: colors.text.primary }}>Payment Frequency *</label>
                  <select
                    required
                    value={editingStudent.paymentFrequency}
                    onChange={(e) => setEditingStudent({ ...editingStudent, paymentFrequency: e.target.value })}
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      cursor: "pointer",
                      background: colors.surface.card,
                      color: colors.text.primary,
                      fontFamily: typography.fontFamily.primary,
                      boxSizing: 'border-box',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: `right ${spacing.md} center`,
                      paddingRight: spacing.xl,
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
                    background: colors.success.main,
                    color: colors.text.onPrimary,
                    border: "none",
                    borderRadius: borderRadius.md,
                    cursor: "pointer",
                    fontWeight: typography.fontWeight.semibold,
                    fontSize: typography.fontSize.base,
                  }}
                >
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                    setError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background: colors.surface.card,
                    color: colors.text.primary,
                    border: `1px solid rgba(255, 255, 255, 0.2)`,
                    borderRadius: borderRadius.md,
                    cursor: "pointer",
                    fontWeight: typography.fontWeight.semibold,
                    fontSize: typography.fontSize.base,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
            </Card>
          </div>
        </div>
      )}
    </motion.main>
  );
};

export default EnhancedStudentsPage;

