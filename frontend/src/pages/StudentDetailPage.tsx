import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { KPICard } from "../components/ui/KPICard";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";

const StudentDetailPage: React.FC = () => {
  const { id } = useParams();
  const studentId = Number(id);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [upiRef, setUpiRef] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .getStudent(studentId)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.createPayment({
        studentId,
        amount: Number(amount),
        paymentMode,
        upiOrTxnReference: upiRef,
        notes
      });
      setAmount("");
      setUpiRef("");
      setNotes("");
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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

  const { student, payments, totalPaid, outstanding } = data;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: spacing.md }}
    >
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
                Program
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
                color: colors.text.primary,
              }}>
                {student.status}
              </div>
            </div>
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
          </div>
          
          {/* Payment KPIs */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: spacing.md, 
            marginTop: spacing.lg 
          }}>
            <KPICard
              label="Total Paid"
              value={`₹${totalPaid.toLocaleString()}`}
              trend="up"
              icon="💰"
            />
            <KPICard
              label="Outstanding"
              value={`₹${outstanding.toLocaleString()}`}
              trend={outstanding > 0 ? "down" : "neutral"}
              icon="⏳"
            />
            <KPICard
              label="Payments Made"
              value={payments.length.toString()}
              icon="📊"
            />
          </div>
        </Card>
      </motion.div>

      {/* Add Payment Form */}
      <motion.div variants={cardVariants} style={{ marginBottom: spacing.xl }}>
        <Card variant="default" padding="lg">
          <h2 style={{ 
            ...typography.h2, 
            marginBottom: spacing.lg,
            color: colors.text.primary,
          }}>
            Add Payment
          </h2>
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
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                style={{ width: "100%" }}
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
        </Card>
      </motion.div>

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


