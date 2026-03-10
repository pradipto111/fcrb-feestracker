import React, { useState, useEffect, useRef } from "react";
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

const ADMIN_STAFF_CACHE_PREFIX = "rv-admin-staff";
const ADMIN_STAFF_CACHE_VERSION = 1;
const ADMIN_STAFF_COACHES_CACHE_KEY = `${ADMIN_STAFF_CACHE_PREFIX}:coaches-centers`;

type AdminStaffCoachesCacheEntry = {
  coaches: any[];
  centers: any[];
  cachedAt: number;
  cacheVersion: number;
};

function readAdminStaffCoachesCache(): AdminStaffCoachesCacheEntry | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_STAFF_COACHES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminStaffCoachesCacheEntry;
    if (
      parsed.cacheVersion !== ADMIN_STAFF_CACHE_VERSION ||
      !Array.isArray(parsed.coaches) ||
      !Array.isArray(parsed.centers)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeAdminStaffCoachesCache(payload: Omit<AdminStaffCoachesCacheEntry, "cacheVersion">): void {
  try {
    sessionStorage.setItem(
      ADMIN_STAFF_COACHES_CACHE_KEY,
      JSON.stringify({
        ...payload,
        cacheVersion: ADMIN_STAFF_CACHE_VERSION,
      })
    );
  } catch {
    // Ignore storage write failures.
  }
}

const AdminStaffPage: React.FC = () => {
  const { user } = useAuth();
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const isMobile = viewportWidth <= 768;
  const initialCoachesCacheRef = useRef<AdminStaffCoachesCacheEntry | null>(readAdminStaffCoachesCache());
  
  // Coaches state
  const [coaches, setCoaches] = useState<any[]>(() => initialCoachesCacheRef.current?.coaches ?? []);
  const [centers, setCenters] = useState<any[]>(() => initialCoachesCacheRef.current?.centers ?? []);
  const [loading, setLoading] = useState(!initialCoachesCacheRef.current);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coachesLastUpdated, setCoachesLastUpdated] = useState<number | null>(
    initialCoachesCacheRef.current?.cachedAt ?? null
  );
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

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadData = async (options?: { force?: boolean }) => {
    const force = options?.force === true;
    if (!force) {
      const cached = readAdminStaffCoachesCache();
      if (cached) {
        setCoaches(cached.coaches);
        setCenters(cached.centers);
        setCoachesLastUpdated(cached.cachedAt);
        setLoading(false);
        return;
      }
    }

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
      const nextCoaches = Array.isArray(coachesData) ? coachesData : [];
      const nextCenters = Array.isArray(centersData) ? centersData : [];
      setCoaches(nextCoaches);
      setCenters(nextCenters);
      const now = Date.now();
      setCoachesLastUpdated(now);
      writeAdminStaffCoachesCache({
        coaches: nextCoaches,
        centers: nextCenters,
        cachedAt: now,
      });
    } catch (err: any) {
      console.error("Error loading staff data:", err);
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
    if (centers.length > 0 && formData.centerIds.length === 0) {
      setError("Please select at least one centre for this coach");
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
      await loadData({ force: true });
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to create coach");
    }
  };

  const filteredCoaches = coaches.filter((coach) =>
    coach.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatUpdatedAt = (value: number | null): string => {
    if (!value) return "Not fetched yet";
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
              <Button
                variant="secondary"
                onClick={() => loadData({ force: true })}
                style={{
                  width: "100%",
                }}
              >
                Fetch Latest
              </Button>
            </div>
            <div style={{ ...typography.caption, color: colors.text.muted }}>
              Last updated: {formatUpdatedAt(coachesLastUpdated)}
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
                  {centers.length > 0 && (
                    <div style={{ marginTop: spacing.md }}>
                      <label
                        style={{
                          ...typography.caption,
                          color: colors.text.secondary,
                          display: "block",
                          marginBottom: spacing.sm,
                          fontWeight: 600,
                        }}
                      >
                        Centre(s) *
                      </label>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: spacing.sm,
                          alignItems: "center",
                        }}
                      >
                        {centers.map((c) => (
                          <label
                            key={c.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: spacing.xs,
                              cursor: "pointer",
                              ...typography.body,
                              color: colors.text.primary,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.centerIds.includes(c.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, centerIds: [...formData.centerIds, c.id] });
                                } else {
                                  setFormData({ ...formData, centerIds: formData.centerIds.filter((id) => id !== c.id) });
                                }
                              }}
                              style={{ accentColor: colors.accent.main }}
                            />
                            {c.name}
                          </label>
                        ))}
                      </div>
                      {formData.centerIds.length === 0 && (
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                          Select at least one centre for this coach.
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ marginTop: spacing.md }}>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={centers.length > 0 && formData.centerIds.length === 0}
                    >
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
              {isMobile ? (
                <div style={{ display: "grid", gap: spacing.sm }}>
                  {filteredCoaches.length === 0 ? (
                    <div style={{ padding: spacing.xl, textAlign: "center", color: colors.text.muted }}>
                      No coaches found
                    </div>
                  ) : (
                    filteredCoaches.map((coach) => (
                      <Card key={coach.id} variant="default" padding="md">
                        <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                          {coach.fullName || "-"}
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                          {coach.email || "-"}
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                          {coach.phoneNumber || "-"}
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.secondary, marginTop: spacing.sm }}>
                          {coach.centers?.length > 0
                            ? coach.centers.map((c: any) => c.center?.name || c.centerId).join(", ")
                            : "No centers assigned"}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                <div className="rv-table-wrap">
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
              )}
            </Card>
          </motion.div>
      </>
    </motion.div>
  );
};

export default AdminStaffPage;
