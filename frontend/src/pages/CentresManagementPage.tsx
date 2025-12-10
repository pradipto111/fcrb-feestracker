import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";

interface Centre {
  id: number;
  name: string;
  shortName: string;
  locality: string;
  city: string;
  isActive: boolean;
  displayOrder: number;
}

const CentresManagementPage: React.FC = () => {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadCentres();
  }, []);

  const loadCentres = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.getCenters();
      setCentres(data.sort((a: Centre, b: Centre) => a.displayOrder - b.displayOrder));
    } catch (err: any) {
      setError(err.message || "Failed to load centres");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    // Prevent multiple clicks
    if (updatingIds.has(id)) return;
    
    try {
      setUpdatingIds(prev => new Set(prev).add(id));
      setError("");
      
      const newStatus = !currentStatus;
      console.log(`[Frontend] Toggling centre ${id} from ${currentStatus} to ${newStatus}`);
      
      // Optimistically update UI
      setCentres(prevCentres => 
        prevCentres.map(c => 
          c.id === id ? { ...c, isActive: newStatus } : c
        )
      );
      
      // Send explicit boolean value
      const result = await api.updateCenter(id, { isActive: newStatus });
      console.log("[Frontend] Update result:", result);
      
      // Reload centres to get updated state from server
      await loadCentres();
    } catch (err: any) {
      console.error("[Frontend] Error toggling centre:", err);
      const errorMessage = err.message || "Failed to update centre";
      
      // Revert optimistic update on error
      await loadCentres();
      
      // Show user-friendly message if migration is needed
      if (errorMessage.includes("migration required") || 
          errorMessage.includes("isActive") || 
          errorMessage.includes("Unknown argument") ||
          errorMessage.includes("displayOrder") ||
          err.requiresMigration) {
        setError("⚠️ Database migration required! Please run: cd backend && npx prisma migrate dev --name add_centre_fields && npx prisma generate");
        alert("⚠️ Database migration required!\n\nTo enable activate/deactivate functionality, please run:\n\ncd backend\nnpx prisma migrate dev --name add_centre_fields\nnpx prisma generate\n\nThen restart the backend server.");
      } else {
        setError(`Failed to ${currentStatus ? "deactivate" : "activate"} centre: ${errorMessage}`);
        alert(`Failed to ${currentStatus ? "deactivate" : "activate"} centre: ${errorMessage}`);
      }
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this centre? This will deactivate it if it has students.")) {
      return;
    }
    try {
      await api.deleteCenter(id);
      await loadCentres();
    } catch (err: any) {
      setError(err.message || "Failed to delete centre");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, color: colors.text.primary }}>
        Loading centres...
      </div>
    );
  }

  return (
    <div style={{ padding: spacing.xl }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.xl,
        }}
      >
        <div>
          <h1
            style={{
              ...typography.h1,
              color: colors.text.primary,
              marginBottom: spacing.xs,
            }}
          >
            Centres Management
          </h1>
          <p style={{ ...typography.body, color: colors.text.muted }}>
            Manage training centres and locations
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate("/realverse/admin/centres/new")}
        >
          + Add New Centre
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card
          variant="default"
          padding="md"
          style={{
            marginBottom: spacing.md,
            background: colors.danger.soft,
            border: `1px solid ${colors.danger.main}40`,
          }}
        >
          <p style={{ margin: 0, color: colors.danger.main }}>Error: {error}</p>
        </Card>
      )}

      {/* Centres List */}
      {centres.length === 0 ? (
        <Card variant="elevated" padding="xl" style={{ textAlign: "center" }}>
          <p style={{ color: colors.text.muted, marginBottom: spacing.md }}>
            No centres found. Create your first centre to get started.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate("/realverse/admin/centres/new")}
          >
            Create Centre
          </Button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
          {centres.map((centre) => (
            <Card
              key={centre.id}
              variant="elevated"
              padding="lg"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: spacing.md,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => navigate(`/realverse/admin/centres/${centre.id}/analytics`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = shadows.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = shadows.md;
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.md,
                    marginBottom: spacing.xs,
                  }}
                >
                  <h3
                    style={{
                      ...typography.h3,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {centre.name}
                  </h3>
                  <span
                    style={{
                      ...typography.caption,
                      padding: `${spacing.xs} ${spacing.sm}`,
                      background: centre.isActive
                        ? colors.success.soft
                        : colors.danger.soft,
                      color: centre.isActive
                        ? colors.success.main
                        : colors.danger.main,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    {centre.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  {centre.locality}, {centre.city} • Order: {centre.displayOrder}
                </div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    fontSize: typography.fontSize.xs,
                    marginTop: spacing.xs,
                  }}
                >
                  Short Name: {centre.shortName}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: spacing.sm,
                  alignItems: "center",
                }}
              >
                {!centre.isActive && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleActive(centre.id, centre.isActive);
                    }}
                    disabled={updatingIds.has(centre.id)}
                  >
                    {updatingIds.has(centre.id) ? "Updating..." : "Activate"}
                  </Button>
                )}
                {centre.isActive && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleActive(centre.id, centre.isActive);
                    }}
                    disabled={updatingIds.has(centre.id)}
                  >
                    {updatingIds.has(centre.id) ? "Updating..." : "Deactivate"}
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/realverse/admin/centres/${centre.id}/analytics`);
                  }}
                >
                  View Analytics
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/realverse/admin/centres/${centre.id}/edit`);
                  }}
                >
                  Edit
                </Button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(centre.id);
                  }}
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    background: colors.danger.soft,
                    color: colors.danger.main,
                    border: "none",
                    borderRadius: borderRadius.md,
                    cursor: "pointer",
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CentresManagementPage;

