import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { SpaceBackground } from "../components/ui/SpaceBackground";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { colors, typography, spacing, shadows } from "../theme/design-tokens";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = ["/photo1.png", "/photo2.png", "/photo3.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
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
          key={image}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: currentImageIndex === index ? 0.15 : 0,
            transition: "opacity 2s ease-in-out",
            filter: "brightness(0.3) contrast(1.2)",
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
        background: `linear-gradient(135deg, ${colors.space.deep} 0%, ${colors.space.dark} 100%)`,
        opacity: 0.8,
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
          background: "rgba(31, 31, 31, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: shadows.glassDark,
        }}
      >
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
                animation: 'logoGlow 4s ease-in-out infinite, logoFloat 6s ease-in-out infinite',
                filter: 'brightness(1.3) contrast(1.2) saturate(1.1) drop-shadow(0 0 12px rgba(4, 61, 208, 0.8)) drop-shadow(0 0 24px rgba(255, 169, 0, 0.6)) drop-shadow(0 0 36px rgba(4, 61, 208, 0.4))',
                mixBlendMode: 'screen',
                backgroundColor: 'transparent',
              }} 
            />
          </div>
          <h1 style={{ 
            ...typography.h1,
            marginBottom: spacing.sm,
            background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.light} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            RealVerse
          </h1>
          <p style={{ 
            ...typography.body,
            color: colors.text.muted,
            marginBottom: spacing.xs,
          }}>
            FC Real Bengaluru Universe
          </p>
          <p style={{ 
            ...typography.caption,
            color: colors.text.muted,
            fontSize: typography.fontSize.xs,
          }}>
            Your complete football academy management platform
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: colors.text.inverted,
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
              background: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: colors.text.inverted,
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
              border: `1px solid ${colors.danger.outline}`,
            }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="accent"
            fullWidth
            disabled={loading}
            size="lg"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
