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

const AdminStaffPage: React.FC = () => {
  const { user } = useAuth();
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

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coachesData, centersData] = await Promise.all([
        api.getCoaches(),
        api.getCenters(),
      ]);
      setCoaches(coachesData);
      setCenters(centersData);
    } catch (err: any) {
      setError(err.message || "Failed to load staff data");
    } finally {
      setLoading(false);
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

  const filteredCoaches = coaches.filter((coach) =>
    coach.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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
        subtitle="Manage coaches and administrators"
      />

      {error && (
        <div
          style={{
            padding: spacing.md,
            marginBottom: spacing.md,
            background: colors.error.light,
            color: colors.error.main,
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
    </motion.div>
  );
};

export default AdminStaffPage;

