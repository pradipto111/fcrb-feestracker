import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTableCard } from "../../components/ui/DataTableCard";
import { Section } from "../../components/ui/Section";
import { useAuth } from "../../context/AuthContext";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";
import { pageVariants, cardVariants } from "../../utils/motion";
import { SearchIcon, ChartBarIcon, FilterIcon } from "../../components/icons/IconSet";

const PaymentLogsPage: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  
  // Filters
  const [actorTypeFilter, setActorTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadLogs();
  }, [pagination.page, actorTypeFilter, dateFrom, dateTo]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (actorTypeFilter) {
        params.actorType = actorTypeFilter;
      }
      
      if (dateFrom) {
        params.dateFrom = dateFrom;
      }
      
      if (dateTo) {
        params.dateTo = dateTo;
      }
      
      const data = await api.getPaymentLogs(params);
      setLogs(data.logs || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }));
    } catch (err: any) {
      console.error("Error loading payment logs:", err);
      setError(err.message || "Failed to load payment logs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null || amount === undefined) return "-";
    return `₹${amount.toLocaleString()}`;
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "PAYMENT_CREATED":
        return "Payment Created";
      case "PAYMENT_STATUS_UPDATED":
        return "Payment Status Updated";
      case "FEES_UPDATED":
        return "Fees Updated";
      default:
        return action;
    }
  };

  const getActorTypeLabel = (actorType: string) => {
    switch (actorType) {
      case "ADMIN":
        return "Admin";
      case "COACH":
        return "Coach";
      case "CRM":
        return "CRM";
      default:
        return actorType;
    }
  };

  return (
    <motion.main
      className="rv-page rv-page--payment-logs"
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
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
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
            variants={cardVariants}
          >
            RealVerse • Payment Logs
          </motion.p>
          <motion.h1
            style={{
              ...typography.h1,
              color: colors.text.onPrimary,
              margin: 0,
            }}
            variants={cardVariants}
          >
            Payment Activity Logs
            <span style={{ display: "block", color: colors.accent.main, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.normal, marginTop: spacing.xs }}>
              Track all payment & revenue updates by Admin, Coach, and CRM users
            </span>
          </motion.h1>
        </div>
      </motion.section>

      <Section
        title="Filters"
        description="Filter payment logs by actor type and date range"
        variant="default"
        style={{ marginBottom: spacing.xl }}
      >
        <div className="rv-filter-bar" style={{ marginBottom: spacing.lg }}>
          <div className="rv-filter-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <FilterIcon size={16} />
              Actor Type
            </label>
            <select
              value={actorTypeFilter}
              onChange={(e) => {
                setActorTypeFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
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
              <option value="">All Actors</option>
              <option value="ADMIN">Admin</option>
              <option value="COACH">Coach</option>
              <option value="CRM">CRM</option>
            </select>
          </div>

          <div className="rv-filter-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <ChartBarIcon size={16} />
              Date From
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
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
              <ChartBarIcon size={16} />
              Date To
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
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

          <div className="rv-filter-field" style={{ display: "flex", alignItems: "flex-end" }}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setActorTypeFilter("");
                setDateFrom("");
                setDateTo("");
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Section>

      {error && (
        <Card variant="default" padding="md" style={{ 
          marginBottom: spacing.md,
          background: colors.danger.soft,
          border: `1px solid ${colors.danger.main}40`,
        }}>
          <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
        </Card>
      )}

      <DataTableCard
        title="Payment Activity Logs"
        description={`Showing ${logs.length} of ${pagination.total} log entries`}
        isEmpty={logs.length === 0 && !loading}
        emptyState={
          <div style={{ 
            padding: spacing['2xl'], 
            textAlign: "center", 
            color: colors.text.muted,
          }}>
            <p style={{ ...typography.body, marginBottom: spacing.sm }}>
              {loading ? "Loading payment logs..." : "No payment logs found"}
            </p>
          </div>
        }
      >
        {loading ? (
          <div style={{ padding: spacing.xl, textAlign: "center", color: colors.text.muted }}>
            Loading...
          </div>
        ) : (
          <>
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
                  }}>Date/Time</th>
                  <th style={{ 
                    padding: spacing.md, 
                    textAlign: "left", 
                    ...typography.caption,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                  }}>Actor</th>
                  <th style={{ 
                    padding: spacing.md, 
                    textAlign: "left", 
                    ...typography.caption,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                  }}>Action</th>
                  <th style={{ 
                    padding: spacing.md, 
                    textAlign: "left", 
                    ...typography.caption,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                  }}>Student</th>
                  <th style={{ 
                    padding: spacing.md, 
                    textAlign: "right", 
                    ...typography.caption,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                  }}>Amount</th>
                  <th style={{ 
                    padding: spacing.md, 
                    textAlign: "left", 
                    ...typography.caption,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                  }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
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
                    <td style={{ padding: spacing.md, color: colors.text.muted, fontSize: typography.fontSize.sm }}>
                      {formatDate(log.timestamp)}
                    </td>
                    <td style={{ padding: spacing.md }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
                        <span style={{ color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                          {log.actorName || "Unknown"}
                        </span>
                        <span style={{ color: colors.text.muted, fontSize: typography.fontSize.sm }}>
                          {getActorTypeLabel(log.actorType)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: spacing.md, color: colors.text.primary }}>
                      {getActionLabel(log.action)}
                    </td>
                    <td style={{ padding: spacing.md, color: colors.text.primary }}>
                      {log.studentName || "-"}
                    </td>
                    <td style={{ 
                      padding: spacing.md, 
                      textAlign: "right", 
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}>
                      {formatAmount(log.amount)}
                    </td>
                    <td style={{ padding: spacing.md }}>
                      {log.before || log.after ? (
                        <details style={{ cursor: "pointer" }}>
                          <summary style={{ 
                            color: colors.primary.light, 
                            fontSize: typography.fontSize.sm,
                            cursor: "pointer"
                          }}>
                            View Details
                          </summary>
                          <div style={{ 
                            marginTop: spacing.sm, 
                            padding: spacing.sm, 
                            background: colors.surface.soft,
                            borderRadius: borderRadius.sm,
                            fontSize: typography.fontSize.sm,
                            color: colors.text.muted,
                            fontFamily: "monospace"
                          }}>
                            {log.before && (
                              <div style={{ marginBottom: spacing.xs }}>
                                <strong>Before:</strong> {JSON.stringify(log.before, null, 2)}
                              </div>
                            )}
                            {log.after && (
                              <div>
                                <strong>After:</strong> {JSON.stringify(log.after, null, 2)}
                              </div>
                            )}
                          </div>
                        </details>
                      ) : (
                        <span style={{ color: colors.text.muted, fontSize: typography.fontSize.sm }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: spacing.lg,
                padding: spacing.md,
                background: colors.surface.soft,
                borderRadius: borderRadius.md,
                flexWrap: "wrap",
                gap: spacing.md
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                  color: colors.text.muted,
                  ...typography.body,
                  fontSize: typography.fontSize.sm
                }}>
                  <span>Page {pagination.page} of {pagination.totalPages}</span>
                  <span>•</span>
                  <span>{pagination.total} total entries</span>
                </div>
                
                <div style={{
                  display: "flex",
                  gap: spacing.xs,
                  alignItems: "center"
                }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  
                  <div style={{
                    display: "flex",
                    gap: spacing.xs,
                    alignItems: "center"
                  }}>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? "primary" : "secondary"}
                          size="sm"
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          style={{
                            minWidth: "40px"
                          }}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DataTableCard>
    </motion.main>
  );
};

export default PaymentLogsPage;
