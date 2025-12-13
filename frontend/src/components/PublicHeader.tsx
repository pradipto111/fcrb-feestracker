import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { useCart } from "../context/CartContext";

const PublicHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount } = useCart();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
        setHomeDropdownOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Home sections that are on the landing page
  const homeSections = [
    { id: "stats", label: "Club Snapshot" },
    { id: "pyramid", label: "Football Pyramid" },
    { id: "matches", label: "Match Centre" },
    { id: "teams", label: "Teams" },
    { id: "philosophy", label: "Club Philosophy" },
    { id: "academy", label: "Academy" },
    { id: "centres", label: "Our Centres" },
    { id: "realverse", label: "RealVerse" },
    { id: "shop", label: "Shop" },
    { id: "news", label: "News" },
  ];

  // Handle navigation to home sections - works from any route
  const handleHomeSectionClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    setHomeDropdownOpen(false);
    
    if (location.pathname !== "/") {
      // Navigate to home with hash, landing page will handle scroll
      navigate(`/#${sectionId}`);
    } else {
      // Already on home, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // Update URL hash
      window.history.pushState(null, "", `#${sectionId}`);
    }
  };

  const handleHomeClick = () => {
    setIsMobileMenuOpen(false);
    setHomeDropdownOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: isScrolled
          ? `linear-gradient(135deg, rgba(5, 11, 32, 0.98) 0%, rgba(10, 22, 51, 0.98) 100%)`
          : "transparent",
        backdropFilter: isScrolled ? "blur(20px)" : "none",
        borderBottom: isScrolled ? `1px solid rgba(255, 255, 255, 0.1)` : "none",
        transition: "all 0.3s ease",
        boxShadow: isScrolled ? shadows.glassDark : "none",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: `${spacing.md} ${spacing.xl}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing.lg,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={handleHomeClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing.md,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img
            src="/fcrb-logo.png"
            alt="FC Real Bengaluru"
            className="logo-transparent-dark"
            style={{
              width: 48,
              height: 48,
              objectFit: "contain",
            }}
          />
          <div>
            <div
              style={{
                ...typography.h4,
                fontFamily: typography.fontFamily.heading,
                color: colors.text.primary,
                lineHeight: 1.2,
              }}
            >
              FC Real Bengaluru
            </div>
            <div
              style={{
                ...typography.caption,
                fontSize: typography.fontSize.xs,
                color: colors.text.muted,
              }}
            >
              Chase Your Legacy
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: !isMobile ? "flex" : "none",
            alignItems: "center",
            gap: spacing.md,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Home with Dropdown */}
          <div
            style={{
              position: "relative",
            }}
            onMouseEnter={() => setHomeDropdownOpen(true)}
            onMouseLeave={() => setHomeDropdownOpen(false)}
          >
            <button
              onClick={handleHomeClick}
              style={{
                ...typography.body,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                background: "transparent",
                border: "none",
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: borderRadius.md,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: spacing.xs,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.text.primary;
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onMouseLeave={(e) => {
                if (!homeDropdownOpen) {
                  e.currentTarget.style.color = colors.text.secondary;
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              Home
              <span style={{ fontSize: typography.fontSize.xs }}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {homeDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: spacing.xs,
                  background: `linear-gradient(135deg, rgba(5, 11, 32, 0.98) 0%, rgba(10, 22, 51, 0.98) 100%)`,
                  backdropFilter: "blur(20px)",
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  borderRadius: borderRadius.lg,
                  padding: spacing.sm,
                  minWidth: "200px",
                  boxShadow: shadows.glassDark,
                }}
              >
                {homeSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleHomeSectionClick(section.id)}
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.secondary,
                      background: "transparent",
                      border: "none",
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: borderRadius.md,
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.text.primary;
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.text.secondary;
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Club */}
          <button
            onClick={() => handleHomeSectionClick("philosophy")}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              background: "transparent",
              border: "none",
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text.primary;
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.secondary;
              e.currentTarget.style.background = "transparent";
            }}
          >
            Club
          </button>

          {/* Teams */}
          <button
            onClick={() => handleHomeSectionClick("teams")}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              background: "transparent",
              border: "none",
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text.primary;
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.secondary;
              e.currentTarget.style.background = "transparent";
            }}
          >
            Teams
          </button>

          {/* Matches */}
          <button
            onClick={() => handleHomeSectionClick("matches")}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              background: "transparent",
              border: "none",
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text.primary;
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.secondary;
              e.currentTarget.style.background = "transparent";
            }}
          >
            Matches
          </button>

          {/* Academy */}
          <button
            onClick={() => handleHomeSectionClick("academy")}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              background: "transparent",
              border: "none",
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text.primary;
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.secondary;
              e.currentTarget.style.background = "transparent";
            }}
          >
            Academy
          </button>

          {/* RealVerse */}
          <Link
            to="/realverse/login"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: location.pathname.startsWith("/realverse") ? colors.text.primary : colors.text.secondary,
              textDecoration: "none",
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              transition: "all 0.2s ease",
              background: location.pathname.startsWith("/realverse") ? "rgba(255, 255, 255, 0.05)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith("/realverse")) {
                e.currentTarget.style.color = colors.text.primary;
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith("/realverse")) {
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            RealVerse
          </Link>

          {/* Shop */}
          <Link
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: location.pathname === "/shop" ? colors.text.primary : colors.text.secondary,
              textDecoration: "none",
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              transition: "all 0.2s ease",
              background: location.pathname === "/shop" ? "rgba(255, 255, 255, 0.05)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== "/shop") {
                e.currentTarget.style.color = colors.text.primary;
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== "/shop") {
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            Shop
          </Link>
        </nav>

        {/* CTAs - Ordered by importance: Secondary actions → Primary action */}
        <div
          style={{
            display: !isMobile ? "flex" : "none",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          {/* Cart Icon - Utility action */}
          <Link
            to="/cart"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: borderRadius.md,
              textDecoration: "none",
              color: colors.text.muted,
              fontSize: "16px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.color = colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.color = colors.text.muted;
            }}
          >
            🛒
            {getItemCount() > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: colors.accent.main,
                  color: colors.charcoal,
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: typography.fontWeight.bold,
                }}
              >
                {getItemCount() > 9 ? "9+" : getItemCount()}
              </span>
            )}
          </Link>

          {/* Vertical Divider */}
          <div style={{ 
            width: 1, 
            height: 24, 
            background: "rgba(255, 255, 255, 0.15)",
            margin: `0 ${spacing.xs}`,
          }} />

          {/* Our Brochure - Tertiary/Text link */}
          <Link
            to="/brochure"
            style={{
              ...typography.body,
              fontSize: "13px",
              fontWeight: typography.fontWeight.medium,
              padding: `6px 12px`,
              color: colors.text.muted,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.muted;
            }}
          >
            Our Brochure
          </Link>

          {/* Login - Secondary action */}
          <Link
            to="/login"
            style={{
              ...typography.body,
              fontSize: "13px",
              fontWeight: typography.fontWeight.medium,
              padding: `8px 16px`,
              borderRadius: borderRadius.md,
              background: "transparent",
              color: colors.text.secondary,
              textDecoration: "none",
              border: `1px solid rgba(255, 255, 255, 0.25)`,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.color = colors.text.primary;
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = colors.text.secondary;
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            }}
          >
            Login
          </Link>

          {/* Join RealVerse Academy - Primary CTA with highest visibility */}
          <Link
            to="/realverse/join"
            style={{
              ...typography.body,
              fontSize: "14px",
              fontWeight: typography.fontWeight.bold,
              padding: `10px 24px`,
              borderRadius: borderRadius.md,
              background: `linear-gradient(135deg, ${colors.accent.main} 0%, #FFB82E 100%)`,
              color: colors.charcoal,
              textDecoration: "none",
              transition: "all 0.2s ease",
              border: "none",
              boxShadow: `0 4px 16px rgba(255, 169, 0, 0.35)`,
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 6px 24px rgba(255, 169, 0, 0.5)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 16px rgba(255, 169, 0, 0.35)`;
            }}
          >
            Join RealVerse Academy
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: isMobile ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            borderRadius: borderRadius.md,
            color: colors.text.primary,
            fontSize: typography.fontSize.xl,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: `linear-gradient(135deg, rgba(5, 11, 32, 0.98) 0%, rgba(10, 22, 51, 0.98) 100%)`,
            backdropFilter: "blur(20px)",
            borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
            padding: spacing.lg,
            display: "flex",
            flexDirection: "column",
            gap: spacing.md,
            boxShadow: shadows.glassDark,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {/* Home */}
          <div>
            <button
              onClick={() => setHomeDropdownOpen(!homeDropdownOpen)}
              style={{
                ...typography.body,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                background: "transparent",
                border: "none",
                padding: spacing.md,
                borderRadius: borderRadius.md,
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Home
              <span>{homeDropdownOpen ? "▲" : "▼"}</span>
            </button>
            {homeDropdownOpen && (
              <div style={{ paddingLeft: spacing.md, marginTop: spacing.xs, display: "flex", flexDirection: "column", gap: spacing.xs }}>
                {homeSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleHomeSectionClick(section.id)}
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      background: "transparent",
                      border: "none",
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Club */}
          <button
            onClick={() => {
              handleHomeSectionClick("philosophy");
              setIsMobileMenuOpen(false);
            }}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              background: "transparent",
              border: "none",
              padding: spacing.md,
              borderRadius: borderRadius.md,
              textAlign: "left",
              width: "100%",
              cursor: "pointer",
            }}
          >
            Club
          </button>

          {/* Teams */}
          <button
            onClick={() => {
              handleHomeSectionClick("teams");
              setIsMobileMenuOpen(false);
            }}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              background: "transparent",
              border: "none",
              padding: spacing.md,
              borderRadius: borderRadius.md,
              textAlign: "left",
              width: "100%",
              cursor: "pointer",
            }}
          >
            Teams
          </button>

          {/* Matches */}
          <button
            onClick={() => {
              handleHomeSectionClick("matches");
              setIsMobileMenuOpen(false);
            }}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              background: "transparent",
              border: "none",
              padding: spacing.md,
              borderRadius: borderRadius.md,
              textAlign: "left",
              width: "100%",
              cursor: "pointer",
            }}
          >
            Matches
          </button>

          {/* Academy */}
          <button
            onClick={() => {
              handleHomeSectionClick("academy");
              setIsMobileMenuOpen(false);
            }}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              background: "transparent",
              border: "none",
              padding: spacing.md,
              borderRadius: borderRadius.md,
              textAlign: "left",
              width: "100%",
              cursor: "pointer",
            }}
          >
            Academy
          </button>

          {/* RealVerse */}
          <Link
            to="/realverse/login"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              textDecoration: "none",
              padding: spacing.md,
              borderRadius: borderRadius.md,
            }}
          >
            RealVerse
          </Link>

          {/* Shop */}
          <Link
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              textDecoration: "none",
              padding: spacing.md,
              borderRadius: borderRadius.md,
            }}
          >
            Shop
          </Link>

          {/* Our Brochure */}
          <Link
            to="/brochure"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              textDecoration: "none",
              padding: spacing.md,
              borderRadius: borderRadius.md,
            }}
          >
            Our Brochure
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              textDecoration: "none",
              padding: spacing.md,
              borderRadius: borderRadius.md,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Cart</span>
            {getItemCount() > 0 && (
              <span style={{
                background: colors.accent.main,
                color: colors.charcoal,
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.bold,
              }}>
                {getItemCount()}
              </span>
            )}
          </Link>

          {/* Divider */}
          <div style={{ 
            height: 1, 
            background: "rgba(255, 255, 255, 0.1)", 
            margin: `${spacing.sm} 0` 
          }} />

          {/* Login - Secondary */}
          <Link
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              padding: spacing.md,
              borderRadius: borderRadius.md,
              background: "transparent",
              color: colors.text.secondary,
              textDecoration: "none",
              textAlign: "center",
              border: `1px solid rgba(255, 255, 255, 0.25)`,
            }}
          >
            Login
          </Link>

          {/* Join RealVerse Academy - Primary CTA with highest visibility */}
          <Link
            to="/realverse/join"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: borderRadius.md,
              background: `linear-gradient(135deg, ${colors.accent.main} 0%, #FFB82E 100%)`,
              color: colors.charcoal,
              textDecoration: "none",
              textAlign: "center",
              marginTop: spacing.sm,
              boxShadow: `0 4px 16px rgba(255, 169, 0, 0.35)`,
              letterSpacing: "0.02em",
            }}
          >
            Join RealVerse Academy
          </Link>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
