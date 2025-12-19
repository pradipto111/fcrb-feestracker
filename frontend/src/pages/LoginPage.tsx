import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { SpaceBackground } from "../components/ui/SpaceBackground";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { colors, typography, spacing, shadows } from "../theme/design-tokens";
import { realverseAssets, galleryAssets } from "../config/assets";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState<"STUDENT" | "COACH" | "ADMIN" | "FAN">("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use RealVerse login cover and gallery images
  const images = [
    realverseAssets.dashboards[0] || galleryAssets.actionShots[0]?.medium,
    galleryAssets.actionShots[0]?.medium,
    galleryAssets.actionShots[1]?.medium,
  ].filter(Boolean); // Filter out any undefined values

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, loginRole);
      navigate("/realverse");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: spacing.lg,
    }}>
      <SpaceBackground variant="full" style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }} />

      {/* Background Image Slideshow */}
      {images.map((image, index) => (
        <div
          key={`${image || "bg"}_${index}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: currentImageIndex === index ? 0.16 : 0,
            transition: "opacity 2s ease-in-out",
            filter: "brightness(0.32) contrast(1.15) saturate(1.05)",
            zIndex: 1,
          }}
        />
      ))}

      {/* Dark Overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, rgba(5, 11, 32, 0.92) 0%, rgba(10, 22, 51, 0.86) 50%, rgba(5, 11, 32, 0.94) 100%)`,
        opacity: 1,
        zIndex: 2,
      }} />

      {/* Brand Gradient Accent */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, rgba(4, 61, 208, 0.2) 0%, rgba(255, 169, 0, 0.1) 100%)`,
        zIndex: 3,
      }} />

      {/* Login Card */}
      <Card
        variant="glass"
        padding="xl"
        style={{
          width: "100%",
          maxWidth: "440px",
          position: "relative",
          zIndex: 10,
          background: "rgba(8, 12, 24, 0.62)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 26px 80px rgba(0,0,0,0.55)",
          overflow: "hidden",
        }}
      >
        {/* Strong overlay wash for text clarity (keeps flow consistent) */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.10) 0%, transparent 55%), radial-gradient(circle at 82% 18%, rgba(255,169,0,0.08) 0%, transparent 60%)", opacity: 0.9 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: spacing.xl }}>
          <div style={{
            position: 'relative',
            width: 120,
            height: 120,
            margin: `0 auto ${spacing.lg}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Animated glow rings */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `2px solid rgba(4, 61, 208, 0.4)`,
              animation: 'logoOrbit 8s linear infinite',
              opacity: 0.6,
            }} />
            <div style={{
              position: 'absolute',
              width: '85%',
              height: '85%',
              borderRadius: '50%',
              border: `1px solid rgba(255, 169, 0, 0.4)`,
              animation: 'logoOrbit 6s linear infinite reverse',
              opacity: 0.4,
            }} />
            <img 
              src="/fcrb-logo.png" 
              alt="FC Real Bengaluru" 
              className="logo-transparent-dark"
              style={{ 
                width: 100, 
                height: 100,
                objectFit: 'contain',
                position: 'relative',
                zIndex: 2,
              }} 
            />
          </div>
          <h1 style={{ 
            ...typography.h1,
            marginBottom: spacing.sm,
            background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.light} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 10px 50px rgba(0,0,0,0.55)",
          }}>
            RealVerse
          </h1>
          <p style={{ 
            ...typography.body,
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginBottom: spacing.xs,
            lineHeight: 1.6,
          }}>
            You're accessing RealVerse Academy – the FC Real Bengaluru player & parent portal.
          </p>
          <p style={{ 
            ...typography.caption,
            color: colors.text.muted,
            fontSize: typography.fontSize.xs,
            lineHeight: 1.6,
          }}>
            Your complete football academy management platform
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
          {/* Role Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
            <div style={{ ...typography.caption, color: colors.text.muted }}>Sign in as</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: spacing.sm,
              }}
            >
              {[
                { id: "STUDENT" as const, label: "Student" },
                { id: "COACH" as const, label: "Coach" },
                { id: "ADMIN" as const, label: "Admin" },
                { id: "FAN" as const, label: "Fan Club" },
              ].map((opt) => {
                const active = loginRole === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLoginRole(opt.id)}
                    style={{
                      padding: "12px 12px",
                      borderRadius: 14,
                      border: active ? `1px solid rgba(0, 224, 255, 0.45)` : "1px solid rgba(255, 255, 255, 0.12)",
                      background: active ? "rgba(0, 224, 255, 0.12)" : "rgba(255,255,255,0.04)",
                      color: active ? colors.text.primary : colors.text.secondary,
                      cursor: "pointer",
                      fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.medium,
                      textAlign: "left",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            style={{
              background: "rgba(0, 0, 0, 0.24)",
              borderColor: "rgba(255, 255, 255, 0.16)",
              color: colors.text.primary,
              caretColor: colors.accent.main,
            }}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            style={{
              background: "rgba(0, 0, 0, 0.24)",
              borderColor: "rgba(255, 255, 255, 0.16)",
              color: colors.text.primary,
              caretColor: colors.accent.main,
            }}
          />

          {error && (
            <div style={{
              padding: spacing.md,
              background: colors.danger.soft,
              color: colors.danger.main,
              borderRadius: "12px",
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              border: `1px solid ${colors.danger.dark}`,
            }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            size="lg"
            style={{
              background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.accent.dark} 100%)`,
              color: colors.text.onAccent,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
