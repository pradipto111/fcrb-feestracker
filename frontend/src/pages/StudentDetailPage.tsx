import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { KPICard } from "../components/ui/KPICard";
import PlayerMetricsView from "../components/PlayerMetricsView";
import CreateMetricSnapshotModal from "../components/CreateMetricSnapshotModal";
import { useAuth } from "../context/AuthContext";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";
import { 
  ArrowLeftIcon, 
  MoneyIcon, 
  BellIcon, 
  CalendarIcon, 
  ChartBarIcon 
} from "../components/icons/IconSet";

const StudentDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = Number(id);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [paymentDate, setPaymentDate] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [churnedDate, setChurnedDate] = useState("");
  const [updatingChurned, setUpdatingChurned] = useState(false);
  const [editingCredentials, setEditingCredentials] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [updatingCredentials, setUpdatingCredentials] = useState(false);
  
  // Check if user can create/edit metrics (COACH or ADMIN)
  const canEditMetrics = user?.role === "COACH" || user?.role === "ADMIN";
  
  // Function to refresh metrics view
  const handleMetricsRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const load = () => {
    api
      .getStudent(studentId)
      .then((studentData) => {
        if (studentData) {
          setData(studentData);
          setError(""); // Clear error on success
        }
      })
      .catch((err) => {
        console.error("Error loading student:", err);
        // Don't clear existing data on error
        if (!data) {
          setError(err.message || "Failed to load student data");
        }
      });
  };

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) {
        await load();
      }
    };
    
    loadData();
    
    // Refresh data when page becomes visible (with debounce)
    let refreshTimeout: NodeJS.Timeout;
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) {
        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(() => {
          if (mounted) {
            load();
          }
        }, 500);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mounted = false;
      clearTimeout(refreshTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [studentId]);

  useEffect(() => {
    // Set churned date from student data if available
    if (data?.student?.churnedDate) {
      const date = new Date(data.student.churnedDate);
      setChurnedDate(date.toISOString().split('T')[0]);
    } else {
      setChurnedDate("");
    }
    
    // Set email from student data
    if (data?.student?.email) {
      setStudentEmail(data.student.email);
    } else {
      setStudentEmail("");
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.createPayment({
        studentId,
        amount: Number(amount),
        paymentMode,
        paymentDate: paymentDate || undefined, // Send date if provided, otherwise undefined (backend will use system date)
        upiOrTxnReference: upiRef,
        notes
      });
      setAmount("");
      setPaymentDate("");
      setUpiRef("");
      setNotes("");
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChurnedUpdate = async () => {
    if (!churnedDate) {
      setError("Please select a churn date");
      return;
    }
    
    setUpdatingChurned(true);
    setError("");
    try {
      await api.updateStudent(studentId, {
        status: "INACTIVE",
        churnedDate: new Date(churnedDate).toISOString()
      });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdatingChurned(false);
    }
  };

  const handleUnchurn = async () => {
    setUpdatingChurned(true);
    setError("");
    try {
      await api.updateStudent(studentId, {
        status: "ACTIVE",
        churnedDate: null
      });
      setChurnedDate("");
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdatingChurned(false);
    }
  };

  const handleCredentialsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingCredentials(true);
    setError("");
    try {
      const updateData: any = {};
      
      // Always include email (even if empty, to allow clearing it)
      updateData.email = studentEmail.trim() || "";
      
      // Only include password if a new one is provided
      if (studentPassword.trim()) {
        updateData.password = studentPassword.trim();
      }
      
      await api.updateStudent(studentId, updateData);
      setStudentPassword(""); // Clear password field after update
      setEditingCredentials(false);
      setError(""); // Clear any previous errors
      setSuccess("Credentials updated successfully");
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch (err: any) {
      setError(err.message || "Failed to update credentials");
    } finally {
      setUpdatingCredentials(false);
    }
  };

  if (error && !data) {
    return (
      <div style={{ padding: spacing.xl }}>
        <Card variant="default" padding="lg" style={{ background: colors.danger.soft, border: `1px solid ${colors.danger.main}40` }}>
          <p style={{ margin: 0, color: colors.danger.main }}>Error: {error}</p>
        </Card>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <p style={{ color: colors.text.primary }}>Loading...</p>
      </div>
    );
  }

  const { student, payments, totalPaid, outstanding, walletBalance, creditBalance } = data;

  // Wallet-based calculations
  const hasOutstanding = outstanding > 0;
  const hasCredit = creditBalance > 0;
  
  // Calculate how many payment cycles are covered by current wallet balance
  const feePerCycle = student.monthlyFeeAmount * (student.paymentFrequency || 1);
  const cyclesCovered = walletBalance > 0 ? Math.floor(walletBalance / feePerCycle) : 0;

  // Check if student is churned
  const isChurned = student.status === "INACTIVE" && student.churnedDate;

  // Calculate next fee deduction date
  const calculateNextFeeDeduction = () => {
    // If churned, no future fee deductions
    if (isChurned) {
      return { dueDate: null, daysUntil: null, isOverdue: false, cyclesCovered: 0, isChurned: true };
    }

    if (!student.joiningDate) {
      return { dueDate: null, daysUntil: null, isOverdue: false, cyclesCovered: 0, isChurned: false };
    }

    const now = new Date();
    const joining = new Date(student.joiningDate);
    const paymentFrequency = student.paymentFrequency || 1;

    // Calculate months since joining (including current month)
    const monthsElapsed = Math.max(
      1,
      (now.getFullYear() - joining.getFullYear()) * 12 + 
      (now.getMonth() - joining.getMonth()) + 1
    );
    
    // Calculate payment cycles that have accrued (including current cycle)
    const cyclesAccrued = Math.ceil(monthsElapsed / paymentFrequency);
    
    // Calculate how many FUTURE cycles are covered by credit balance
    const cyclesAheadCovered = walletBalance > 0 ? Math.floor(walletBalance / feePerCycle) : 0;
    
    // Next deduction will be for cycle: cyclesAccrued + cyclesAheadCovered
    const nextCycleNumber = cyclesAccrued + cyclesAheadCovered;
    const monthsUntilNextCycle = nextCycleNumber * paymentFrequency;
    
    // Calculate next deduction date
    const nextDeductionDate = new Date(joining);
    nextDeductionDate.setMonth(joining.getMonth() + monthsUntilNextCycle);
    
    // Calculate days until next deduction
    const timeDiff = nextDeductionDate.getTime() - now.getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return {
      dueDate: nextDeductionDate,
      daysUntil,
      isOverdue: daysUntil < 0 && walletBalance < 0,  // Only overdue if negative balance
      cyclesCovered: cyclesAheadCovered,
      isChurned: false
    };
  };

  const nextFeeDeduction = calculateNextFeeDeduction();

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: spacing.md }}
    >
      {/* Back Button */}
      <motion.div variants={cardVariants} style={{ marginBottom: spacing.lg }}>
        <Button
          variant="utility"
          onClick={() => navigate("/realverse/admin/students")}
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: spacing.xs 
          }}
        >
          <ArrowLeftIcon size={16} />
          Back to Students
        </Button>
      </motion.div>

      {/* Wallet System Info Banner */}
      {hasOutstanding && (
        <motion.div variants={cardVariants} style={{ marginBottom: spacing.lg }}>
          <Card 
            variant="default" 
            padding="md" 
            style={{ 
              background: `linear-gradient(135deg, ${colors.danger.main}20 0%, ${colors.danger.dark}20 100%)`,
              border: `1px solid ${colors.danger.main}40`
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
              <BellIcon size={24} color={colors.danger.main} />
              <div>
                <p style={{ 
                  ...typography.body, 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.danger.main,
                  margin: 0,
                  marginBottom: spacing.xs 
                }}>
                  Outstanding Balance: ₹{outstanding.toLocaleString()}
                </p>
                <p style={{ 
                  ...typography.caption, 
                  color: colors.text.muted,
                  margin: 0 
                }}>
                  The wallet balance is negative. Please add payment to cover outstanding fees.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Student Info Card */}
      <motion.div variants={cardVariants} style={{ marginBottom: spacing.xl }}>
        <Card variant="default" padding="lg">
          <h1 style={{ 
            ...typography.h1, 
            marginBottom: spacing.lg,
            color: colors.text.primary,
          }}>
            {student.fullName}
          </h1>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: spacing.md, 
            marginBottom: spacing.lg 
          }}>
            <div>
              <div style={{ 
                ...typography.caption, 
                color: colors.text.muted, 
                marginBottom: spacing.xs 
              }}>
                Programme
              </div>
              <div style={{ 
                ...typography.body, 
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}>
                {student.programType || "-"}
              </div>
            </div>
            <div>
              <div style={{ 
                ...typography.caption, 
                color: colors.text.muted, 
                marginBottom: spacing.xs 
              }}>
                Monthly Fee
              </div>
              <div style={{ 
                ...typography.body, 
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}>
                ₹ {student.monthlyFeeAmount.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ 
                ...typography.caption, 
                color: colors.text.muted, 
                marginBottom: spacing.xs 
              }}>
                Status
              </div>
              <div style={{ 
                ...typography.body, 
                fontWeight: typography.fontWeight.semibold,
                color: student.status === "ACTIVE" ? colors.success.main : 
                       student.status === "INACTIVE" ? colors.danger.main :
                       colors.text.primary,
              }}>
                {student.status}
                {student.churnedDate && (
                  <span style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    marginLeft: spacing.xs,
                    fontSize: typography.fontSize.sm
                  }}>
                    (Churned: {new Date(student.churnedDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })})
                  </span>
                )}
              </div>
            </div>
            {student.churnedDate && (
              <div>
                <div style={{ 
                  ...typography.caption, 
                  color: colors.text.muted, 
                  marginBottom: spacing.xs 
                }}>
                  Churned Date
                </div>
                <div style={{ 
                  ...typography.body, 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.danger.main,
                }}>
                  {new Date(student.churnedDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            )}
            <div>
              <div style={{ 
                ...typography.caption, 
                color: colors.text.muted, 
                marginBottom: spacing.xs 
              }}>
                Phone
              </div>
              <div style={{ 
                ...typography.body, 
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}>
                {student.phoneNumber || "-"}
              </div>
            </div>
            <div>
              <div style={{ 
                ...typography.caption, 
                color: colors.text.muted, 
                marginBottom: spacing.xs 
              }}>
                Date of Joining
              </div>
              <div style={{ 
                ...typography.body, 
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}>
                {student.joiningDate ? new Date(student.joiningDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }) : "-"}
              </div>
            </div>
            <div>
              <div style={{ 
                ...typography.caption, 
                color: colors.text.muted, 
                marginBottom: spacing.xs 
              }}>
                Payment Frequency
              </div>
              <div style={{ 
                ...typography.body, 
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}>
                {student.paymentFrequency === 1 ? "Monthly" : 
                 student.paymentFrequency === 2 ? "Bi-Monthly" : 
                 student.paymentFrequency === 3 ? "Quarterly" : 
                 `Every ${student.paymentFrequency} months`}
              </div>
            </div>
          </div>
          
          {/* Wallet & Payment KPIs */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: spacing.md, 
            marginTop: spacing.lg 
          }}>
            <KPICard
              title="Fees Due"
              value={hasOutstanding ? `₹${outstanding.toLocaleString()}` : "₹0"}
              subtitle={
                hasOutstanding
                  ? "Payment required" 
                  : "All fees paid"
              }
              icon={<MoneyIcon size={40} style={{ opacity: 0.3 }} />}
              variant={
                hasOutstanding 
                  ? "danger" 
                  : "success"
              }
            />
            <KPICard
              title="Credit Balance"
              value={`₹${creditBalance.toLocaleString()}`}
              subtitle={
                cyclesCovered > 0 
                  ? `${cyclesCovered} cycle${cyclesCovered !== 1 ? 's' : ''} covered`
                  : "No credit"
              }
              icon={<MoneyIcon size={40} style={{ opacity: 0.3 }} />}
              variant={hasCredit ? "success" : "info"}
            />
            <KPICard
              title="Next Fee Deduction"
              value={
                isChurned
                  ? "Churned"
                  : nextFeeDeduction.daysUntil !== null 
                    ? nextFeeDeduction.daysUntil > 0
                      ? `In ${nextFeeDeduction.daysUntil} days`
                      : nextFeeDeduction.isOverdue
                        ? "Overdue"
                        : "Today"
                    : "N/A"
              }
              subtitle={
                isChurned
                  ? `Churned on ${new Date(student.churnedDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })} - No fees due`
                  : nextFeeDeduction.dueDate 
                    ? `${new Date(nextFeeDeduction.dueDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })} - ₹${feePerCycle.toLocaleString()}`
                    : "No joining date"
              }
              icon={<CalendarIcon size={40} style={{ opacity: 0.3 }} />}
              variant={
                isChurned
                  ? "info"
                  : nextFeeDeduction.isOverdue 
                    ? "danger"
                    : nextFeeDeduction.daysUntil !== null && nextFeeDeduction.daysUntil <= 7 
                      ? "warning" 
                      : "primary"
              }
            />
            <KPICard
              title="Total Paid"
              value={`₹${totalPaid.toLocaleString()}`}
              subtitle={`${payments.length} transaction${payments.length !== 1 ? 's' : ''}`}
              icon={<ChartBarIcon size={40} style={{ opacity: 0.3 }} />}
              variant="info"
            />
          </div>
        </Card>
      </motion.div>

      {/* Add Payment Form */}
      <motion.div variants={cardVariants} style={{ marginBottom: spacing.xl }}>
        <Card variant="default" padding="lg">
          <div style={{ marginBottom: spacing.lg }}>
            <h2 style={{ 
              ...typography.h2, 
              marginBottom: spacing.xs,
              color: colors.text.primary,
            }}>
              Add Payment to Wallet
            </h2>
            <p style={{
              ...typography.body,
              color: colors.text.muted,
              margin: 0
            }}>
              Payments are added to the student's wallet. Fees are automatically deducted every {
                student.paymentFrequency === 1 ? "month" : 
                student.paymentFrequency === 2 ? "2 months" : 
                student.paymentFrequency === 3 ? "3 months" : 
                `${student.paymentFrequency} months`
              } (₹{(student.monthlyFeeAmount * (student.paymentFrequency || 1)).toLocaleString()} per cycle).
            </p>
          </div>
          <form onSubmit={handleSubmit} style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: spacing.md 
          }}>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>
                Amount (₹)
              </label>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `2px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>
                Payment Mode
              </label>
              <select 
                value={paymentMode} 
                onChange={(e) => setPaymentMode(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `2px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `2px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  outline: "none",
                }}
              />
              <p style={{
                ...typography.caption,
                color: colors.text.muted,
                marginTop: spacing.xs,
                marginBottom: 0,
                fontSize: typography.fontSize.sm
              }}>
                Optional - Leave blank to use today's date. Use for entering past payments.
              </p>
            </div>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>
                UPI ID / Txn Ref
              </label>
              <input
                placeholder="Optional"
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `2px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>
                Notes
              </label>
              <input
                placeholder="Optional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `2px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gridColumn: "1 / -1" }}>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                size="lg"
              >
                {submitting ? "Saving..." : "Save Payment"}
              </Button>
            </div>
          </form>
          {error && (
            <div style={{ 
              marginTop: spacing.md,
              padding: spacing.md,
              background: colors.danger.soft,
              border: `1px solid ${colors.danger.main}40`,
              borderRadius: borderRadius.md,
            }}>
              <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
            </div>
          )}
          {success && (
            <div style={{ 
              marginTop: spacing.md,
              padding: spacing.md,
              background: colors.success.soft,
              border: `1px solid ${colors.success.main}40`,
              borderRadius: borderRadius.md,
            }}>
              <p style={{ margin: 0, color: colors.success.main }}>{success}</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Churned Status Section */}
      {(user?.role === "ADMIN" || user?.role === "COACH") && (
        <motion.div variants={cardVariants} style={{ marginBottom: spacing.xl }}>
          <Card variant="default" padding="lg">
            <div style={{ marginBottom: spacing.lg }}>
              <h2 style={{ 
                ...typography.h2, 
                marginBottom: spacing.xs,
                color: colors.text.primary,
              }}>
                Churned Status
              </h2>
              <p style={{
                ...typography.body,
                color: colors.text.muted,
                margin: 0
              }}>
                Mark student as churned to stop fee tracking. Once churned, no further fees will be calculated.
              </p>
            </div>
            
            {student.status === "INACTIVE" && student.churnedDate ? (
              <div style={{
                padding: spacing.md,
                background: colors.danger.soft,
                border: `1px solid ${colors.danger.main}40`,
                borderRadius: borderRadius.md,
                marginBottom: spacing.md
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ 
                      margin: 0, 
                      color: colors.danger.main,
                      fontWeight: typography.fontWeight.semibold,
                      marginBottom: spacing.xs
                    }}>
                      Student is Churned
                    </p>
                    <p style={{ 
                      margin: 0, 
                      color: colors.text.muted,
                      fontSize: typography.fontSize.sm
                    }}>
                      Churned on: {new Date(student.churnedDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleUnchurn}
                    disabled={updatingChurned}
                  >
                    {updatingChurned ? "Updating..." : "Mark as Active"}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleChurnedUpdate(); }} style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr auto", 
                gap: spacing.md,
                alignItems: "flex-end"
              }}>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: spacing.sm, 
                    ...typography.caption,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                  }}>
                    Churned Date
                  </label>
                  <input
                    type="date"
                    value={churnedDate}
                    onChange={(e) => setChurnedDate(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: `${spacing.sm} ${spacing.md}`,
                      border: `2px solid ${colors.surface.card}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.card,
                      color: colors.text.primary,
                      outline: "none",
                    }}
                  />
                  <p style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    marginTop: spacing.xs,
                    marginBottom: 0,
                    fontSize: typography.fontSize.sm
                  }}>
                    Select the date when the student was churned. Fee tracking will stop from this date.
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={updatingChurned || !churnedDate}
                  size="lg"
                >
                  {updatingChurned ? "Marking..." : "Mark as Churned"}
                </Button>
              </form>
            )}
          </Card>
        </motion.div>
      )}

      {/* Student Credentials Section */}
      {(user?.role === "ADMIN" || user?.role === "COACH") && (
        <motion.div variants={cardVariants} style={{ marginBottom: spacing.xl }}>
          <Card variant="default" padding="lg">
            <div style={{ marginBottom: spacing.lg }}>
              <h2 style={{ 
                ...typography.h2, 
                marginBottom: spacing.xs,
                color: colors.text.primary,
              }}>
                Login Credentials
              </h2>
              <p style={{
                ...typography.body,
                color: colors.text.muted,
                margin: 0,
                fontSize: typography.fontSize.sm
              }}>
                View and update student login email and password. Changes will be saved immediately.
              </p>
            </div>
            
            {!editingCredentials ? (
              <div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: spacing.md,
                  marginBottom: spacing.md
                }}>
                  <div>
                    <div style={{ 
                      ...typography.caption, 
                      color: colors.text.muted, 
                      marginBottom: spacing.xs 
                    }}>
                      Email
                    </div>
                    <div style={{ 
                      ...typography.body, 
                      fontWeight: typography.fontWeight.semibold,
                      color: student.email ? colors.text.primary : colors.text.muted,
                      padding: spacing.sm,
                      background: colors.surface.soft,
                      borderRadius: borderRadius.md,
                      wordBreak: "break-all"
                    }}>
                      {student.email || "Not set"}
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      ...typography.caption, 
                      color: colors.text.muted, 
                      marginBottom: spacing.xs 
                    }}>
                      Password
                    </div>
                    <div style={{ 
                      ...typography.body, 
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.muted,
                      padding: spacing.sm,
                      background: colors.surface.soft,
                      borderRadius: borderRadius.md
                    }}>
                      {student.passwordHash ? "••••••••" : "Not set"}
                    </div>
                    <p style={{
                      ...typography.caption,
                      color: colors.text.muted,
                      marginTop: spacing.xs,
                      marginBottom: 0,
                      fontSize: typography.fontSize.xs
                    }}>
                      Password is encrypted and cannot be displayed
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingCredentials(true);
                    setStudentEmail(student.email || "");
                    setStudentPassword("");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Edit Credentials
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCredentialsUpdate}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: spacing.md,
                  marginBottom: spacing.md
                }}>
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: spacing.sm, 
                      ...typography.caption,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.secondary,
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="student@realverse.com"
                      style={{
                        width: "100%",
                        padding: `${spacing.sm} ${spacing.md}`,
                        border: `2px solid ${colors.surface.card}`,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.base,
                        background: colors.surface.card,
                        color: colors.text.primary,
                        outline: "none",
                      }}
                    />
                    <p style={{
                      ...typography.caption,
                      color: colors.text.muted,
                      marginTop: spacing.xs,
                      marginBottom: 0,
                      fontSize: typography.fontSize.sm
                    }}>
                      Enter email address or leave empty to remove it
                    </p>
                  </div>
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: spacing.sm, 
                      ...typography.caption,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.secondary,
                    }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Leave empty to keep current password"
                      style={{
                        width: "100%",
                        padding: `${spacing.sm} ${spacing.md}`,
                        border: `2px solid ${colors.surface.card}`,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.base,
                        background: colors.surface.card,
                        color: colors.text.primary,
                        outline: "none",
                      }}
                    />
                    <p style={{
                      ...typography.caption,
                      color: colors.text.muted,
                      marginTop: spacing.xs,
                      marginBottom: 0,
                      fontSize: typography.fontSize.sm
                    }}>
                      Leave empty to keep current password. Enter new password to change it.
                    </p>
                  </div>
                </div>
                <div style={{ 
                  display: "flex", 
                  gap: spacing.md, 
                  justifyContent: "flex-end" 
                }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingCredentials(false);
                      setStudentEmail(student.email || "");
                      setStudentPassword("");
                      setError("");
                      setSuccess("");
                    }}
                    disabled={updatingCredentials}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={updatingCredentials}
                  >
                    {updatingCredentials ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
                {error && (
                  <div style={{ 
                    marginTop: spacing.md,
                    padding: spacing.md,
                    background: colors.danger.soft,
                    border: `1px solid ${colors.danger.main}40`,
                    borderRadius: borderRadius.md,
                  }}>
                    <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
                  </div>
                )}
                {success && (
                  <div style={{ 
                    marginTop: spacing.md,
                    padding: spacing.md,
                    background: colors.success.soft,
                    border: `1px solid ${colors.success.main}40`,
                    borderRadius: borderRadius.md,
                  }}>
                    <p style={{ margin: 0, color: colors.success.main }}>{success}</p>
                  </div>
                )}
              </form>
            )}
          </Card>
        </motion.div>
      )}

      {/* Player Analytics Section */}
      <motion.div variants={cardVariants} style={{ marginBottom: spacing.xl }}>
        <Card variant="default" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
            <h2 style={{ ...typography.h2, color: colors.text.primary }}>
              Player Analytics
            </h2>
            {canEditMetrics && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="primary" onClick={() => setShowMetricModal(true)}>
                  + Create Assessment
                </Button>
              </motion.div>
            )}
          </div>
          <PlayerMetricsView key={refreshKey} studentId={studentId} isOwnView={false} />
        </Card>
      </motion.div>

      {/* Create Metric Snapshot Modal */}
      {canEditMetrics && data?.student && (
        <CreateMetricSnapshotModal
          studentId={studentId}
          studentName={data.student.fullName}
          isOpen={showMetricModal}
          onClose={() => setShowMetricModal(false)}
          onSuccess={handleMetricsRefresh}
        />
      )}

      {/* Payment History Table */}
      <motion.div variants={cardVariants}>
        <Card variant="default" padding="lg">
          <h2 style={{ 
            ...typography.h2, 
            marginBottom: spacing.lg,
            color: colors.text.primary,
          }}>
            Payment History
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ 
                  background: "rgba(255, 255, 255, 0.05)", 
                  borderBottom: `2px solid rgba(255, 255, 255, 0.1)` 
                }}>
                  <th style={{ 
                    padding: spacing.md, 
                    textAlign: "left", 
                    ...typography.caption,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                  }}>
                    Date
                  </th>
                  <th style={{ 
                    padding: spacing.md, 
                    textAlign: "right", 
                    ...typography.caption,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                  }}>
                    Amount
                  </th>
                  <th style={{ 
                    padding: spacing.md, 
                    textAlign: "left", 
                    ...typography.caption,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                  }}>
                    Mode
                  </th>
                  <th style={{ 
                    padding: spacing.md, 
                    textAlign: "left", 
                    ...typography.caption,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                  }}>
                    UPI / Ref
                  </th>
                  <th style={{ 
                    padding: spacing.md, 
                    textAlign: "left", 
                    ...typography.caption,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                  }}>
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr 
                    key={p.id} 
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
                    <td style={{ 
                      padding: spacing.md,
                      color: colors.text.primary,
                    }}>
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                    <td style={{ 
                      padding: spacing.md, 
                      textAlign: "right", 
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.success.main,
                    }}>
                      ₹ {p.amount.toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: spacing.md,
                      color: colors.text.primary,
                    }}>
                      {p.paymentMode}
                    </td>
                    <td style={{ 
                      padding: spacing.md,
                      color: colors.text.muted,
                    }}>
                      {p.upiOrTxnReference || "-"}
                    </td>
                    <td style={{ 
                      padding: spacing.md,
                      color: colors.text.muted,
                    }}>
                      {p.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
              <div style={{ 
                padding: spacing['3xl'], 
                textAlign: "center", 
                color: colors.text.muted,
                ...typography.body,
              }}>
                No payments yet
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StudentDetailPage;


