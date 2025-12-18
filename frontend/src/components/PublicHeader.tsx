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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown-container]')) {
        setHomeDropdownOpen(false);
      }
    };

    if (homeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [homeDropdownOpen]);

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
    { id: "centres", label: "Our Centres" },
    { id: "realverse", label: "RealVerse" },
    { id: "fan-club", label: "Fan Club" },
    { id: "fanclub-perks", label: "Fan Club Perks" },
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
        // Use Lenis for smooth scrolling if available
        const lenis = (window as any).lenis;
        if (lenis) {
          lenis.scrollTo(element, {
            offset: -100, // Account for header height
            duration: 1.2,
          });
        } else {
          // Fallback to native smooth scroll
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      // Update URL hash
      window.history.pushState(null, "", `#${sectionId}`);
    }
  };

  const handleHomeClick = () => {
    setIsMobileMenuOpen(false);
    setHomeDropdownOpen(false);
    const lenis = (window as any).lenis;
    if (location.pathname !== "/") {
      navigate("/");
      // Scroll will be handled after navigation
      setTimeout(() => {
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    } else {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        background: "transparent",
        padding: `${spacing.md} ${spacing.xl}`,
        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      {/* Floating glass container with rounded corners */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
          background: isScrolled
            ? `linear-gradient(135deg, 
                rgba(5, 11, 32, 0.75) 0%, 
                rgba(10, 22, 51, 0.7) 50%, 
                rgba(5, 11, 32, 0.75) 100%)`
            : `linear-gradient(135deg, 
                rgba(5, 11, 32, 0.4) 0%, 
                rgba(10, 22, 51, 0.35) 50%, 
                rgba(5, 11, 32, 0.4) 100%)`,
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRadius: borderRadius["2xl"],
          border: `1px solid ${isScrolled ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.08)"}`,
          boxShadow: isScrolled
            ? `0 8px 32px rgba(0, 0, 0, 0.4), 
               0 0 0 1px rgba(255, 255, 255, 0.05) inset,
               0 0 60px rgba(0, 224, 255, 0.08)`
            : `0 4px 24px rgba(0, 0, 0, 0.2), 
               0 0 0 1px rgba(255, 255, 255, 0.03) inset`,
          padding: `${spacing.md} ${spacing.lg}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing.lg,
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Subtle gradient overlay matching infinity flow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 20%, rgba(0,224,255,0.06) 0%, transparent 50%), 
                         radial-gradient(circle at 80% 80%, rgba(255,169,0,0.04) 0%, transparent 50%)`,
            pointerEvents: "none",
            zIndex: 0,
            opacity: isScrolled ? 0.8 : 0.5,
            transition: "opacity 0.3s ease",
          }}
        />
        {/* Content wrapper */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
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
            data-dropdown-container
            style={{
              position: "relative",
              zIndex: 1001,
            }}
            onMouseEnter={() => {
              if (!isMobile) {
                setHomeDropdownOpen(true);
              }
            }}
            onMouseLeave={() => {
              if (!isMobile) {
                // Small delay to allow moving to dropdown
                setTimeout(() => {
                  setHomeDropdownOpen(false);
                }, 100);
              }
            }}
          >
            <button
              onClick={() => {
                if (isMobile) {
                  setHomeDropdownOpen(!homeDropdownOpen);
                } else {
                  // On desktop, clicking Home button should go to top of page
                  handleHomeClick();
                }
              }}
              style={{
                ...typography.body,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: homeDropdownOpen ? colors.text.primary : colors.text.secondary,
                background: homeDropdownOpen ? "rgba(255, 255, 255, 0.05)" : "transparent",
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
                if (!isMobile) {
                  e.currentTarget.style.color = colors.text.primary;
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile && !homeDropdownOpen) {
                  e.currentTarget.style.color = colors.text.secondary;
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              Home
              <span 
                style={{ 
                  fontSize: typography.fontSize.xs, 
                  transition: "transform 0.2s ease", 
                  transform: homeDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  display: "inline-block",
                }}
              >
                ▼
              </span>
            </button>

            {/* Dropdown Menu */}
            {homeDropdownOpen && (
              <div
                data-dropdown-container
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "12px",
                  background: `linear-gradient(135deg, 
                    rgba(5, 11, 32, 0.85) 0%, 
                    rgba(10, 22, 51, 0.8) 50%, 
                    rgba(5, 11, 32, 0.85) 100%)`,
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  border: `1px solid rgba(255, 255, 255, 0.15)`,
                  borderRadius: borderRadius.xl,
                  padding: spacing.sm,
                  minWidth: "240px",
                  maxWidth: "300px",
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 
                              0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                              0 0 40px rgba(0, 224, 255, 0.06)`,
                  zIndex: 1002,
                  animation: "slideDown 0.2s ease-out",
                  overflow: "hidden",
                }}
                onMouseEnter={() => {
                  if (!isMobile) {
                    setHomeDropdownOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  if (!isMobile) {
                    setHomeDropdownOpen(false);
                  }
                }}
              >
                {/* Subtle gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at 20% 20%, rgba(0,224,255,0.04) 0%, transparent 50%)`,
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                {homeSections.map((section, idx) => (
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
                      transition: "all 0.15s ease",
                      animation: `fadeIn 0.2s ease-out ${idx * 0.02}s both`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.text.primary;
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.text.secondary;
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {section.label}
                  </button>
                ))}
                </div>
              </div>
            )}
          </div>

          {/* Programs */}
          <Link
            to="/programs"
            style={{
              textDecoration: "none",
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: location.pathname.startsWith("/programs") ? colors.text.primary : colors.text.secondary,
              background: location.pathname.startsWith("/programs") ? "rgba(255, 255, 255, 0.05)" : "transparent",
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              transition: "all 0.2s ease",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith("/programs")) {
                e.currentTarget.style.color = colors.text.primary;
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith("/programs")) {
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            Programs
          </Link>

          {/* About Us */}
          <Link
            to="/about"
            style={{
              textDecoration: "none",
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: location.pathname === "/about" ? colors.text.primary : colors.text.secondary,
              background: location.pathname === "/about" ? "rgba(255, 255, 255, 0.05)" : "transparent",
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              transition: "all 0.2s ease",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== "/about") {
                e.currentTarget.style.color = colors.text.primary;
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== "/about") {
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            About Us
          </Link>

          {/* Public Fan Club preview CTA (no login required) */}
          <Link
            to="/fan-club/benefits"
            style={{
              textDecoration: "none",
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: location.pathname.startsWith("/fan-club/benefits") ? colors.text.primary : colors.text.secondary,
              background: location.pathname.startsWith("/fan-club/benefits") ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.03)",
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              transition: "all 0.2s ease",
              display: "inline-block",
              border: "1px solid rgba(0,224,255,0.18)",
              boxShadow: "0 0 26px rgba(0,224,255,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text.primary;
              e.currentTarget.style.background = "rgba(0,224,255,0.08)";
              e.currentTarget.style.border = "1px solid rgba(0,224,255,0.32)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = location.pathname.startsWith("/fan-club/benefits") ? colors.text.primary : colors.text.secondary;
              e.currentTarget.style.background = location.pathname.startsWith("/fan-club/benefits") ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.03)";
              e.currentTarget.style.border = "1px solid rgba(0,224,255,0.18)";
            }}
          >
            Your benefits for backing FC Real Bengaluru
          </Link>

          {/* Shop */}
          <button
            onClick={() => {
              navigate("/shop");
              setIsMobileMenuOpen(false);
            }}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: location.pathname === "/shop" ? colors.text.primary : colors.text.secondary,
              background: location.pathname === "/shop" ? "rgba(255, 255, 255, 0.05)" : "transparent",
              border: "none",
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              cursor: "pointer",
              transition: "all 0.2s ease",
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
          </button>
        </nav>

        {/* CTAs - Ordered by importance: Secondary actions → Primary action */}
        <div
          style={{
            display: !isMobile ? "flex" : "none",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          {/* Fan Club - Secondary pill CTA (required) */}
          <button
            onClick={() => handleHomeSectionClick("fan-club")}
            style={{
              ...typography.body,
              fontSize: "13px",
              fontWeight: typography.fontWeight.semibold,
              padding: `8px 14px`,
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              color: colors.text.primary,
              border: `1px solid rgba(0, 224, 255, 0.28)`,
              boxShadow: `0 8px 24px rgba(0,0,0,0.25), 0 0 22px rgba(0,224,255,0.10)`,
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.borderColor = "rgba(0, 224, 255, 0.55)";
              e.currentTarget.style.boxShadow = `0 10px 30px rgba(0,0,0,0.30), 0 0 26px rgba(0,224,255,0.18)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(0, 224, 255, 0.28)";
              e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.25), 0 0 22px rgba(0,224,255,0.10)`;
            }}
          >
            Fan Club
          </button>

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
                  color: colors.brand.charcoal,
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
            to="/brochure"
            style={{
              ...typography.body,
              fontSize: "14px",
              fontWeight: typography.fontWeight.bold,
              padding: `10px 24px`,
              borderRadius: borderRadius.md,
              background: `linear-gradient(135deg, ${colors.accent.main} 0%, #FFB82E 100%)`,
              color: colors.brand.charcoal,
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
            top: "calc(100% + 12px)",
            left: spacing.xl,
            right: spacing.xl,
            maxWidth: "1400px",
            margin: "0 auto",
            background: `linear-gradient(135deg, 
              rgba(5, 11, 32, 0.85) 0%, 
              rgba(10, 22, 51, 0.8) 50%, 
              rgba(5, 11, 32, 0.85) 100%)`,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderRadius: borderRadius.xl,
            border: `1px solid rgba(255, 255, 255, 0.15)`,
            padding: spacing.lg,
            display: "flex",
            flexDirection: "column",
            gap: spacing.md,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 
                        0 0 0 1px rgba(255, 255, 255, 0.05) inset`,
            maxHeight: "80vh",
            overflowY: "auto",
            zIndex: 1201,
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
                background: homeDropdownOpen ? "rgba(255, 255, 255, 0.05)" : "transparent",
                border: "none",
                padding: spacing.md,
                borderRadius: borderRadius.md,
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.2s ease",
              }}
            >
              Home
              <span style={{ 
                transition: "transform 0.2s ease",
                transform: homeDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                display: "inline-block",
              }}>
                ▼
              </span>
            </button>
            {homeDropdownOpen && (
              <div style={{ 
                paddingLeft: spacing.md, 
                marginTop: spacing.xs, 
                display: "flex", 
                flexDirection: "column", 
                gap: spacing.xs,
                animation: "slideDown 0.2s ease-out",
              }}>
                {homeSections.map((section, idx) => (
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
                      transition: "all 0.15s ease",
                      animation: `fadeIn 0.2s ease-out ${idx * 0.02}s both`,
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

          {/* Programs */}
          <Link
            to="/programs"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              textDecoration: "none",
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              background: "transparent",
              padding: spacing.md,
              borderRadius: borderRadius.md,
              textAlign: "left",
              width: "100%",
              display: "block",
            }}
          >
            Programs
          </Link>

          {/* About Us */}
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              textDecoration: "none",
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              background: "transparent",
              padding: spacing.md,
              borderRadius: borderRadius.md,
              textAlign: "left",
              width: "100%",
              display: "block",
            }}
          >
            About Us
          </Link>

          {/* Public Fan Club benefits preview */}
          <Link
            to="/fan-club/benefits"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              textDecoration: "none",
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              background: "rgba(255,255,255,0.03)",
              padding: spacing.md,
              borderRadius: borderRadius.md,
              textAlign: "left",
              width: "100%",
              display: "block",
              border: "1px solid rgba(0,224,255,0.18)",
            }}
          >
            Your benefits for backing FC Real Bengaluru
          </Link>

          {/* Fan Club */}
          <button
            onClick={() => {
              handleHomeSectionClick("fan-club");
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
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text.primary;
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.secondary;
              e.currentTarget.style.background = "transparent";
            }}
          >
            Fan Club
          </button>

          {/* Shop */}
          <button
            onClick={() => {
              navigate("/shop");
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
            Shop
          </button>

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
                color: colors.brand.charcoal,
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
            to="/brochure"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: borderRadius.md,
              background: `linear-gradient(135deg, ${colors.accent.main} 0%, #FFB82E 100%)`,
              color: colors.brand.charcoal,
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
      </div>
    </header>
  );
};

export default PublicHeader;
