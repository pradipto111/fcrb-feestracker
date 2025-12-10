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
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
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
              marginBottom: spacing.md,
            }}
          >
            Our Centres
          </h2>
          <p
            style={{
              ...typography.body,
              color: colors.text.muted,
              fontSize: typography.fontSize.lg,
            }}
          >
            Explore our training hubs across Bengaluru
          </p>
        </div>

        {/* Map and Cards Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "60% 40%",
            gap: spacing.xl,
            marginBottom: spacing.xl,
          }}
        >
          {/* Map Section */}
          <div
            style={{
              width: "100%",
              height: isMobile ? "400px" : "600px",
              borderRadius: borderRadius.lg,
              overflow: "hidden",
              boxShadow: shadows.glassDark,
              background: colors.space.dark,
              position: "relative",
            }}
          >
            <iframe
              width="100%"
              height="100%"
              style={{
                border: 0,
                borderRadius: borderRadius.lg,
              }}
              loading="lazy"
              allowFullScreen
              src={getMapEmbedUrl()}
              title="FC Real Bengaluru Centres Map"
            />
            
            {/* Clickable Marker Overlays */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
              }}
            >
              {centres.map((centre, idx) => {
                if (!centre.latitude || !centre.longitude) return null;
                
                // Calculate approximate pixel positions (this is a simplified approach)
                // For a proper implementation, you'd need to convert lat/lng to pixel coordinates
                // For now, we'll show markers in a grid overlay
                const row = Math.floor(idx / 2);
                const col = idx % 2;
                const topPercent = 20 + row * 30;
                const leftPercent = 20 + col * 40;
                
                return (
                  <div
                    key={centre.id}
                    onClick={() => handleMarkerClick(centre)}
                    style={{
                      position: "absolute",
                      top: `${topPercent}%`,
                      left: `${leftPercent}%`,
                      pointerEvents: "auto",
                      cursor: "pointer",
                      transform: "translate(-50%, -50%)",
                      zIndex: 10,
                    }}
                    title={`${centre.name} - Click to open in Google Maps`}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: colors.primary.main,
                        border: `3px solid ${colors.text.onPrimary}`,
                        boxShadow: `0 2px 8px rgba(0, 0, 0, 0.3)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.text.onPrimary,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.2)";
                        e.currentTarget.style.boxShadow = `0 4px 12px rgba(4, 61, 208, 0.5)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = `0 2px 8px rgba(0, 0, 0, 0.3)`;
                      }}
                    >
                      {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div
              style={{
                position: "absolute",
                bottom: spacing.md,
                left: spacing.md,
                background: `linear-gradient(135deg, rgba(5, 11, 32, 0.95) 0%, rgba(10, 22, 51, 0.95) 100%)`,
                backdropFilter: "blur(10px)",
                padding: spacing.md,
                borderRadius: borderRadius.md,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                maxWidth: "250px",
              }}
            >
              <div
                style={{
                  ...typography.caption,
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing.xs,
                }}
              >
                Our Centres ({centres.length})
              </div>
              {centres.map((centre, idx) => (
                <div
                  key={centre.id}
                  onClick={() => handleMarkerClick(centre)}
                  style={{
                    ...typography.caption,
                    fontSize: typography.fontSize.xs,
                    color: colors.text.secondary,
                    marginBottom: spacing.xs,
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.xs,
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.primary.light;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.text.secondary;
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: colors.primary.main,
                      border: `2px solid ${colors.text.onPrimary}`,
                      textAlign: "center",
                      lineHeight: "12px",
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.onPrimary,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ flex: 1 }}>{centre.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Centres Cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
              maxHeight: isMobile ? "none" : "600px",
              overflowY: isMobile ? "visible" : "auto",
            }}
          >
            {centres.map((centre) => (
              <Card
                key={centre.id}
                variant="elevated"
                padding="lg"
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border:
                    selectedCentre?.id === centre.id
                      ? `2px solid ${colors.primary.main}`
                      : `1px solid rgba(255, 255, 255, 0.1)`,
                  background:
                    selectedCentre?.id === centre.id
                      ? `linear-gradient(135deg, rgba(4, 61, 208, 0.1) 0%, rgba(4, 61, 208, 0.05) 100%)`
                      : `linear-gradient(135deg, rgba(5, 11, 32, 0.8) 0%, rgba(10, 22, 51, 0.8) 100%)`,
                }}
                onClick={() => handleCardClick(centre)}
                onMouseEnter={(e) => {
                  if (selectedCentre?.id !== centre.id) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = shadows.lg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCentre?.id !== centre.id) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = shadows.md;
                  }
                }}
              >
                <h3
                  style={{
                    ...typography.h3,
                    color: colors.text.primary,
                    marginBottom: spacing.xs,
                    fontSize: typography.fontSize.lg,
                  }}
                >
                  {centre.name}
                </h3>
                <div
                  style={{
                    ...typography.body,
                    color: colors.text.secondary,
                    fontSize: typography.fontSize.sm,
                    marginBottom: spacing.sm,
                  }}
                >
                  {centre.locality}, {centre.city}
                </div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    fontSize: typography.fontSize.xs,
                    marginBottom: spacing.md,
                    lineHeight: 1.5,
                  }}
                >
                  {centre.addressLine}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenInMaps(centre);
                  }}
                  style={{
                    width: "100%",
                  }}
                >
                  View on Google Maps →
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurCentresSection;
