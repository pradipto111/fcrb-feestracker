import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";

interface Centre {
  id: number;
  name: string;
  shortName: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  displayOrder: number;
}

const OurCentresSection: React.FC = () => {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadCentres = async () => {
      try {
        setLoading(true);
        const data = await api.getPublicCentres();
        setCentres(data);
        if (data.length > 0) {
          setSelectedCentre(data[0]);
        }
      } catch (error: any) {
        console.error("Error loading centres:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCentres();
  }, []);

  // Generate Google Maps embed URL with center point
  // For interactive markers, we'll use clickable overlays on the map
  const getMapEmbedUrl = () => {
    if (centres.length === 0) return "";
    
    // Calculate center (average of all centres)
    const avgLat = centres.reduce((sum, c) => sum + (c.latitude || 0), 0) / centres.length;
    const avgLng = centres.reduce((sum, c) => sum + (c.longitude || 0), 0) / centres.length;
    
    // Use Google Maps embed with center point
    // Users can click on the map to interact, and we'll show markers via overlays
    return `https://www.google.com/maps?q=${avgLat},${avgLng}&z=11&output=embed`;
  };

  const handleCardClick = (centre: Centre) => {
    setSelectedCentre(centre);
    // Optionally scroll map to this centre (if using interactive map)
  };

  const handleOpenInMaps = (centre: Centre) => {
    if (centre.googleMapsUrl) {
      window.open(centre.googleMapsUrl, "_blank");
    } else if (centre.latitude && centre.longitude) {
      // Fallback: create Google Maps URL from coordinates
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${centre.latitude},${centre.longitude}`,
        "_blank"
      );
    }
  };

  const handleMarkerClick = (centre: Centre) => {
    handleOpenInMaps(centre);
  };

  if (loading) {
    return (
      <section
        id="centres"
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: `linear-gradient(135deg, #050B20 0%, #0A1633 100%)`,
        }}
      >
        <div style={{ textAlign: "center", color: colors.text.muted }}>
          Loading centres...
        </div>
      </section>
    );
  }

  if (centres.length === 0) {
    return null;
  }

  return (
    <section
      id="centres"
      style={{
        padding: `${spacing["2xl"]} ${spacing.xl}`,
        background: `linear-gradient(135deg, #050B20 0%, #0A1633 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "600px",
          height: "600px",
          background: `radial-gradient(circle, rgba(4, 61, 208, 0.1) 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Section Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: spacing["2xl"],
          }}
        >
          <h2
            style={{
              ...typography.h2,
              color: colors.text.primary,
              marginBottom: spacing.sm,
              fontSize: isMobile ? typography.fontSize["2xl"] : typography.fontSize["3xl"],
              fontWeight: typography.fontWeight.bold,
              letterSpacing: "-0.02em",
            }}
          >
            Our Centres
          </h2>
          <p
            style={{
              ...typography.body,
              color: colors.text.muted,
              fontSize: typography.fontSize.lg,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Explore our training hubs across Bengaluru
          </p>
        </div>

        {/* Main Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr",
            gap: spacing.xl,
            alignItems: "start",
          }}
        >
          {/* Map Section */}
          <div
            style={{
              width: "100%",
              height: isMobile ? "450px" : "650px",
              minHeight: isMobile ? "450px" : "650px",
              borderRadius: borderRadius.xl,
              overflow: "hidden",
              boxShadow: `0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
              background: colors.space.dark,
              position: "relative",
            }}
          >
            <iframe
              width="100%"
              height="100%"
              style={{
                border: 0,
                display: "block",
              }}
              loading="lazy"
              allowFullScreen
              src={getMapEmbedUrl()}
              title="FC Real Bengaluru Centres Map"
            />
          </div>

          {/* Centres List Panel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
              height: isMobile ? "auto" : "650px",
              overflowY: isMobile ? "visible" : "auto",
              paddingRight: isMobile ? 0 : spacing.sm,
            }}
          >
            {/* Scrollbar styling */}
            <style>
              {`
                div::-webkit-scrollbar {
                  width: 6px;
                }
                div::-webkit-scrollbar-track {
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb {
                  background: rgba(4, 61, 208, 0.5);
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: rgba(4, 61, 208, 0.7);
                }
              `}
            </style>

            {/* Centres Count Header */}
            <div
              style={{
                padding: spacing.md,
                background: `linear-gradient(135deg, rgba(4, 61, 208, 0.15) 0%, rgba(4, 61, 208, 0.05) 100%)`,
                borderRadius: borderRadius.lg,
                border: `1px solid rgba(4, 61, 208, 0.2)`,
                marginBottom: spacing.xs,
              }}
            >
              <div
                style={{
                  ...typography.body,
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                  fontSize: typography.fontSize.sm,
                }}
              >
                {centres.length} Training {centres.length === 1 ? "Centre" : "Centres"}
              </div>
            </div>

            {/* Centre Cards */}
            {centres.map((centre, idx) => {
              const isSelected = selectedCentre?.id === centre.id;
              return (
                <Card
                  key={centre.id}
                  variant="elevated"
                  padding="lg"
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    border: isSelected
                      ? `2px solid ${colors.primary.main}`
                      : `1px solid rgba(255, 255, 255, 0.1)`,
                    background: isSelected
                      ? `linear-gradient(135deg, rgba(4, 61, 208, 0.2) 0%, rgba(4, 61, 208, 0.1) 100%)`
                      : `linear-gradient(135deg, rgba(5, 11, 32, 0.6) 0%, rgba(10, 22, 51, 0.4) 100%)`,
                    backdropFilter: "blur(10px)",
                    width: "100%",
                    boxShadow: isSelected
                      ? `0 8px 24px rgba(4, 61, 208, 0.3), 0 0 0 1px rgba(4, 61, 208, 0.1)`
                      : `0 4px 12px rgba(0, 0, 0, 0.2)`,
                    transform: isSelected ? "translateX(4px)" : "translateX(0)",
                  }}
                  onClick={() => handleCardClick(centre)}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "translateX(4px) translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 8px 24px rgba(4, 61, 208, 0.2), 0 0 0 1px rgba(4, 61, 208, 0.2)`;
                      e.currentTarget.style.borderColor = `rgba(4, 61, 208, 0.4)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "translateX(0) translateY(0)";
                      e.currentTarget.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.2)`;
                      e.currentTarget.style.borderColor = `rgba(255, 255, 255, 0.1)`;
                    }
                  }}
                >
                  {/* Centre Number Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.sm,
                      marginBottom: spacing.sm,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: isSelected
                          ? colors.primary.main
                          : `linear-gradient(135deg, rgba(4, 61, 208, 0.3) 0%, rgba(4, 61, 208, 0.2) 100%)`,
                        border: `2px solid ${isSelected ? colors.text.onPrimary : colors.primary.main}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.text.onPrimary,
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <h3
                      style={{
                        ...typography.h4,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.semibold,
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {centre.name}
                    </h3>
                  </div>

                  {/* Location */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "start",
                      gap: spacing.xs,
                      marginBottom: spacing.sm,
                      paddingLeft: spacing.md + spacing.xs,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={colors.text.secondary}
                      strokeWidth="2"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.sm,
                        lineHeight: 1.5,
                      }}
                    >
                      {centre.locality}, {centre.city}
                    </div>
                  </div>

                  {/* Address */}
                  {centre.addressLine && (
                    <div
                      style={{
                        ...typography.caption,
                        color: colors.text.muted,
                        fontSize: typography.fontSize.xs,
                        marginBottom: spacing.md,
                        paddingLeft: spacing.md + spacing.xs,
                        lineHeight: 1.6,
                      }}
                    >
                      {centre.addressLine}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant={isSelected ? "primary" : "secondary"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInMaps(centre);
                    }}
                    style={{
                      width: "100%",
                      marginTop: spacing.xs,
                    }}
                  >
                    View on Google Maps →
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurCentresSection;
