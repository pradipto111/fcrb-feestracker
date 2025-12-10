import React, { useState } from "react";
import { api } from "../../../api/client";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../../../theme/design-tokens";

interface FinanceDataModalProps {
  centreId: number;
  onClose: () => void;
  onSave: () => void;
}

const FinanceDataModal: React.FC<FinanceDataModalProps> = ({
  centreId,
  onClose,
  onSave,
}) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    totalPlayers: "",
    activePlayers: "",
    churnedPlayers: "",
    residential: "",
    nonResidential: "",
    totalRevenue: "",
    additionalRevenue: "",
    netRentalCharges: "",
    coachingCosts: "",
    otherExpenses: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data: any = {
        year,
        month,
      };

      // Convert form values to numbers (multiply revenue/costs by 100 for paise)
      if (formData.totalPlayers) data.totalPlayers = Number(formData.totalPlayers);
      if (formData.activePlayers) data.activePlayers = Number(formData.activePlayers);
      if (formData.churnedPlayers) data.churnedPlayers = Number(formData.churnedPlayers);
      if (formData.residential) data.residential = Number(formData.residential);
      if (formData.nonResidential) data.nonResidential = Number(formData.nonResidential);
      if (formData.totalRevenue) data.totalRevenue = Math.round(Number(formData.totalRevenue) * 100);
      if (formData.additionalRevenue) data.additionalRevenue = Math.round(Number(formData.additionalRevenue) * 100);
      if (formData.netRentalCharges) data.netRentalCharges = Math.round(Number(formData.netRentalCharges) * 100);
      if (formData.coachingCosts) data.coachingCosts = Math.round(Number(formData.coachingCosts) * 100);
      if (formData.otherExpenses) data.otherExpenses = Math.round(Number(formData.otherExpenses) * 100);

      await api.saveCentreMetrics(centreId, data);
      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to save finance data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: spacing.lg,
      }}
      onClick={onClose}
    >
      <Card
        variant="elevated"
        padding="xl"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.lg,
          }}
        >
          <h2 style={{ ...typography.h2, color: colors.text.primary }}>
            Update Finance Data
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: colors.text.muted,
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: spacing.md,
              background: colors.danger.soft,
              color: colors.danger.main,
              borderRadius: borderRadius.md,
              marginBottom: spacing.md,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                }}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleDateString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3
            style={{
              ...typography.h3,
              marginTop: spacing.lg,
              marginBottom: spacing.md,
              color: colors.text.primary,
            }}
          >
            Player Metrics
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                }}
              >
                Total Players
              </label>
              <input
                type="number"
                value={formData.totalPlayers}
                onChange={(e) =>
                  setFormData({ ...formData, totalPlayers: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                }}
              >
                Active Players
              </label>
              <input
                type="number"
                value={formData.activePlayers}
                onChange={(e) =>
                  setFormData({ ...formData, activePlayers: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                }}
              >
                Churned Players
              </label>
              <input
                type="number"
                value={formData.churnedPlayers}
                onChange={(e) =>
                  setFormData({ ...formData, churnedPlayers: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                }}
              >
                Residential
              </label>
              <input
                type="number"
                value={formData.residential}
                onChange={(e) =>
                  setFormData({ ...formData, residential: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                }}
              >
                Non-Residential
              </label>
              <input
                type="number"
                value={formData.nonResidential}
                onChange={(e) =>
                  setFormData({ ...formData, nonResidential: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <h3
            style={{
              ...typography.h3,
              marginTop: spacing.lg,
              marginBottom: spacing.md,
              color: colors.text.primary,
            }}
          >
            Finance Metrics (₹)
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                }}
              >
                Total Revenue
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.totalRevenue}
                onChange={(e) =>
                  setFormData({ ...formData, totalRevenue: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                }}
              >
                Additional Revenue
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.additionalRevenue}
                onChange={(e) =>
                  setFormData({ ...formData, additionalRevenue: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                }}
              >
                Net Rental Charges
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.netRentalCharges}
                onChange={(e) =>
                  setFormData({ ...formData, netRentalCharges: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                }}
              >
                Coaching Costs
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.coachingCosts}
                onChange={(e) =>
                  setFormData({ ...formData, coachingCosts: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.xs,
                  ...typography.body,
                }}
              >
                Other Expenses
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.otherExpenses}
                onChange={(e) =>
                  setFormData({ ...formData, otherExpenses: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: spacing.md,
              justifyContent: "flex-end",
              marginTop: spacing.xl,
            }}
          >
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FinanceDataModal;

