import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";

type CrmUserRow = {
  id: number;
  fullName: string;
  email: string;
  role: "AGENT";
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
};

const AdminStaffPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"coaches" | "crm-users">("coaches");
  
  // Coaches state
  const [coaches, setCoaches] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    centerIds: [] as number[],
  });

  // CRM Users state
  const [crmUsers, setCrmUsers] = useState<CrmUserRow[]>([]);
  const [crmLoading, setCrmLoading] = useState(false);
  const [crmError, setCrmError] = useState("");
  const [crmForm, setCrmForm] = useState({ 
    fullName: "", 
    email: "", 
    password: "", 
    role: "AGENT" as "AGENT"
  });
  const [resetPassword, setResetPassword] = useState<{ userId: number; password: string } | null>(null);

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadData();
    if (activeTab === "crm-users") {
      loadCrmUsers();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors
      const [coachesData, centersData] = await Promise.all([
        api.getCoaches().catch(err => {
          console.error("Failed to load coaches:", err);
          return [];
        }),
        api.getCenters().catch(err => {
          console.error("Failed to load centers:", err);
          return [];
        }),
      ]);
      setCoaches(Array.isArray(coachesData) ? coachesData : []);
      setCenters(Array.isArray(centersData) ? centersData : []);
    } catch (err: any) {
      console.error("Error loading staff data:", err);
      setError(err.message || "Failed to load staff data");
    } finally {
      setLoading(false);
    }
  };

  const loadCrmUsers = async () => {
    setCrmLoading(true);
    setCrmError("");
    try {
      const data = await api.crmListUsers();
      setCrmUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setCrmError(e.message || "Failed to load CRM users");
    } finally {
      setCrmLoading(false);
    }
  };

  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await api.createCoach(formData);
      setSuccess("Coach created successfully!");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
        centerIds: [],
      });
      setShowForm(false);
      loadData();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to create coach");
    }
  };

  const createCrmUser = async () => {
    try {
      setCrmError("");
      await api.adminCreateCrmUser(crmForm);
      setCrmForm({ fullName: "", email: "", password: "", role: "AGENT" });
      await loadCrmUsers();
      setSuccess("CRM user created successfully!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (e: any) {
      setCrmError(e.message || "Failed to create CRM user");
    }
  };

  const toggleCrmUserStatus = async (u: CrmUserRow) => {
    try {
      const next = u.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
      await api.adminSetCrmUserStatus(u.id, next);
      await loadCrmUsers();
      setSuccess(`CRM user ${next === "ACTIVE" ? "enabled" : "disabled"} successfully!`);
      setTimeout(() => setSuccess(""), 5000);
    } catch (e: any) {
      setCrmError(e.message || "Failed to update status");
    }
  };

  const doResetPassword = async () => {
    if (!resetPassword) return;
    try {
      await api.adminResetCrmUserPassword(resetPassword.userId, resetPassword.password);
      setResetPassword(null);
      setSuccess("Password reset successfully!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (e: any) {
      setCrmError(e.message || "Failed to reset password");
    }
  };

  const filteredCoaches = coaches.filter((coach) =>
    coach.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && activeTab === "coaches") {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <div style={{ ...typography.h3, color: colors.text.primary }}>Loading staff...</div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: spacing.md }}
    >
      <PageHeader
        title="Staff Management"
        subtitle="Manage coaches, administrators, and CRM users"
      />

      {error && (
        <div
          style={{
            padding: spacing.md,
            marginBottom: spacing.md,
            background: colors.danger.light,
            color: colors.danger.main,
            borderRadius: borderRadius.md,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: spacing.md,
            marginBottom: spacing.md,
            background: colors.success.light,
            color: colors.success.main,
            borderRadius: borderRadius.md,
          }}
        >
          {success}
        </div>
      )}

      {crmError && (
        <div
          style={{
            padding: spacing.md,
            marginBottom: spacing.md,
            background: colors.danger.light,
            color: colors.danger.main,
            borderRadius: borderRadius.md,
          }}
        >
          {crmError}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: spacing.sm,
          marginBottom: spacing.lg,
          borderBottom: `2px solid ${colors.surface.card}`,
        }}
      >
        <button
          onClick={() => setActiveTab("coaches")}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: "none",
            border: "none",
            borderBottom: activeTab === "coaches" ? `3px solid ${colors.accent.main}` : "none",
            color: activeTab === "coaches" ? colors.text.primary : colors.text.muted,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamily.primary,
            transition: "all 0.2s",
          }}
        >
          Coaches ({coaches.length})
        </button>
        <button
          onClick={() => setActiveTab("crm-users")}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: "none",
            border: "none",
            borderBottom: activeTab === "crm-users" ? `3px solid ${colors.accent.main}` : "none",
            color: activeTab === "crm-users" ? colors.text.primary : colors.text.muted,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamily.primary,
            transition: "all 0.2s",
          }}
        >
          CRM Users ({crmUsers.length})
        </button>
      </div>

      {/* Coaches Tab */}
      {activeTab === "coaches" && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            <div
              className="responsive-flex-row"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.sm,
                justifyContent: "space-between",
              }}
            >
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                }}
              />
              <Button
                variant="primary"
                onClick={() => setShowForm(!showForm)}
                style={{
                  width: "100%",
                }}
              >
                {showForm ? "Cancel" : "+ Add Coach"}
              </Button>
            </div>
          </div>

          {showForm && (
            <motion.div variants={cardVariants} style={{ marginBottom: spacing.md }}>
              <Card variant="default" padding="lg">
                <h3 style={{ ...typography.h3, marginBottom: spacing.md }}>Add New Coach</h3>
                <form onSubmit={handleCreateCoach}>
                  <div
                    className="responsive-grid-2"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: spacing.md,
                    }}
                  >
                    <Input
                      label="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <Input
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Input
                      label="Phone Number"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div style={{ marginTop: spacing.md }}>
                    <Button type="submit" variant="primary">
                      Create Coach
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          <motion.div variants={cardVariants}>
            <Card variant="default" padding="lg">
              <h3 style={{ ...typography.h3, marginBottom: spacing.md }}>
                Coaches ({filteredCoaches.length})
              </h3>
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "600px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${colors.surface.card}` }}>
                      <th
                        style={{
                          padding: spacing.md,
                          textAlign: "left",
                          ...typography.h4,
                          color: colors.text.secondary,
                        }}
                      >
                        Name
                      </th>
                      <th
                        style={{
                          padding: spacing.md,
                          textAlign: "left",
                          ...typography.h4,
                          color: colors.text.secondary,
                        }}
                      >
                        Email
                      </th>
                      <th
                        style={{
                          padding: spacing.md,
                          textAlign: "left",
                          ...typography.h4,
                          color: colors.text.secondary,
                        }}
                      >
                        Phone
                      </th>
                      <th
                        style={{
                          padding: spacing.md,
                          textAlign: "left",
                          ...typography.h4,
                          color: colors.text.secondary,
                        }}
                      >
                        Centers
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoaches.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            padding: spacing.xl,
                            textAlign: "center",
                            color: colors.text.muted,
                          }}
                        >
                          No coaches found
                        </td>
                      </tr>
                    ) : (
                      filteredCoaches.map((coach) => (
                        <tr
                          key={coach.id}
                          style={{
                            borderBottom: `1px solid ${colors.surface.card}`,
                          }}
                        >
                          <td style={{ padding: spacing.md, fontWeight: 600 }}>
                            {coach.fullName || "-"}
                          </td>
                          <td style={{ padding: spacing.md }}>{coach.email || "-"}</td>
                          <td style={{ padding: spacing.md }}>
                            {coach.phoneNumber || "-"}
                          </td>
                          <td style={{ padding: spacing.md }}>
                            {coach.centers?.length > 0
                              ? coach.centers.map((c: any) => c.center?.name || c.centerId).join(", ")
                              : "No centers assigned"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </>
      )}

      {/* CRM Users Tab */}
      {activeTab === "crm-users" && (
        <>
          <motion.div variants={cardVariants} style={{ marginBottom: spacing.md }}>
            <Card variant="default" padding="lg">
              <h3 style={{ ...typography.h3, marginBottom: spacing.md }}>Create CRM Login</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: spacing.md,
                }}
              >
                <Input
                  label="Full Name"
                  value={crmForm.fullName}
                  onChange={(e) => setCrmForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Full name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={crmForm.email}
                  onChange={(e) => setCrmForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email"
                />
                <Input
                  label="Temporary Password"
                  type="password"
                  value={crmForm.password}
                  onChange={(e) => setCrmForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Temporary password"
                />
                <div>
                  <label
                    style={{
                      ...typography.caption,
                      color: colors.text.secondary,
                      display: "block",
                      marginBottom: spacing.xs,
                    }}
                  >
                    Role
                  </label>
                  <select
                    value={crmForm.role}
                    onChange={(e) => setCrmForm((p) => ({ ...p, role: e.target.value as any }))}
                    style={{
                      width: "100%",
                      padding: spacing.sm,
                      background: colors.surface.card,
                      border: `1px solid rgba(255, 255, 255, 0.1)`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      fontFamily: typography.fontFamily.primary,
                    }}
                  >
                    <option value="AGENT">AGENT</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: spacing.md }}>
                <Button
                  variant="primary"
                  onClick={createCrmUser}
                  disabled={!crmForm.fullName || !crmForm.email || !crmForm.password}
                >
                  Create Login
                </Button>
              </div>
            </Card>
          </motion.div>

          <div
            style={{
              marginTop: spacing.lg,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            <h3 style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>
              CRM Accounts ({crmUsers.length})
            </h3>
            <Button variant="secondary" onClick={loadCrmUsers}>
              Refresh
            </Button>
          </div>

          <div style={{ display: "grid", gap: spacing.md }}>
            {crmLoading ? (
              <Card variant="default" padding="lg">
                <div style={{ ...typography.body, color: colors.text.muted }}>Loading…</div>
              </Card>
            ) : crmUsers.length === 0 ? (
              <Card variant="default" padding="lg">
                <div style={{ ...typography.body, color: colors.text.muted }}>No CRM users yet.</div>
              </Card>
            ) : (
              crmUsers.map((u) => (
                <motion.div key={u.id} variants={cardVariants}>
                  <Card variant="default" padding="lg">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: spacing.md,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            ...typography.body,
                            color: colors.text.primary,
                            fontWeight: typography.fontWeight.semibold,
                          }}
                        >
                          {u.fullName}{" "}
                          <span
                            style={{
                              ...typography.caption,
                              color: colors.text.muted,
                              fontWeight: typography.fontWeight.medium,
                            }}
                          >
                            ({u.role})
                          </span>
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 2 }}>
                          {u.email}
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 2 }}>
                          Status:{" "}
                          <span
                            style={{
                              color: u.status === "ACTIVE" ? colors.success.main : colors.danger.main,
                            }}
                          >
                            {u.status}
                          </span>
                          {" • "}Created: {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: spacing.sm, alignItems: "center" }}>
                        <Button variant="secondary" onClick={() => setResetPassword({ userId: u.id, password: "" })}>
                          Reset Password
                        </Button>
                        <Button
                          variant={u.status === "ACTIVE" ? "secondary" : "primary"}
                          onClick={() => toggleCrmUserStatus(u)}
                        >
                          {u.status === "ACTIVE" ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}

      {/* Reset Password Modal */}
      {resetPassword && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.lg,
            zIndex: 1000,
          }}
          onClick={() => setResetPassword(null)}
        >
          <Card
            variant="default"
            padding="lg"
            style={{ width: "100%", maxWidth: 520 }}
            onClick={(e: any) => e.stopPropagation()}
          >
            <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>
              Reset Password
            </div>
            <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.md }}>
              Set a new temporary password for CRM user ID: {resetPassword.userId}
            </div>
            <Input
              type="password"
              value={resetPassword.password}
              onChange={(e) => setResetPassword((p) => (p ? { ...p, password: e.target.value } : p))}
              placeholder="New password"
              style={{ marginBottom: spacing.md }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: spacing.sm }}>
              <Button variant="secondary" onClick={() => setResetPassword(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={doResetPassword} disabled={!resetPassword.password}>
                Reset
              </Button>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default AdminStaffPage;
