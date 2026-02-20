import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";

const MOBILE_NAV_DRAWER_ID = "mobile-nav-drawer";

const MOBILE_BREAKPOINT = 768;

const PublicHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top ? Math.abs(parseInt(document.body.style.top, 10)) : 0;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      if (scrollY) window.scrollTo(0, scrollY);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isMobile]);

  // Restore focus to menu button when mobile menu closes (not on initial mount)
  const prevMobileMenuOpen = useRef(false);
  useEffect(() => {
    if (prevMobileMenuOpen.current && !isMobileMenuOpen && mobileMenuButtonRef.current) {
      mobileMenuButtonRef.current.focus();
    }
    prevMobileMenuOpen.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHomeClick = () => {
    setIsMobileMenuOpen(false);
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
        padding: isMobile ? `${spacing.sm} ${spacing.sm}` : `${spacing.md} ${spacing.xl}`,
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
          padding: isMobile ? `${spacing.sm} ${spacing.md}` : `${spacing.md} ${spacing.lg}`,
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
            minHeight: "56px",
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
            flexShrink: 0,
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
            flexWrap: "nowrap",
            height: "100%",
          }}
        >
          {/* Home */}
          <div style={{ position: "relative", zIndex: 1001 }}>
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
                justifyContent: "center",
                gap: spacing.xs,
                height: "36px",
                minHeight: "36px",
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
              Home
            </button>
          </div>

          {/* Programmes */}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "36px",
              minHeight: "36px",
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
            Programmes
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "36px",
              minHeight: "36px",
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

          {/* Explore RealVerse CTA */}
          <Link
            to="/realverse/experience"
            style={{
              textDecoration: "none",
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: location.pathname.startsWith("/realverse/experience") ? colors.text.primary : colors.text.secondary,
              background: location.pathname.startsWith("/realverse/experience") ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.03)",
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "36px",
              minHeight: "36px",
              border: "1px solid rgba(0,224,255,0.18)",
              boxShadow: "0 0 26px rgba(0,224,255,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text.primary;
              e.currentTarget.style.background = "rgba(0,224,255,0.08)";
              e.currentTarget.style.border = "1px solid rgba(0,224,255,0.32)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = location.pathname.startsWith("/realverse/experience") ? colors.text.primary : colors.text.secondary;
              e.currentTarget.style.background = location.pathname.startsWith("/realverse/experience") ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.03)";
              e.currentTarget.style.border = "1px solid rgba(0,224,255,0.18)";
            }}
          >
            Explore RealVerse
          </Link>

          {/* Shop - Disabled in UI, backend code preserved */}
          {/* <button
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "36px",
              minHeight: "36px",
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
          </button> */}
        </nav>

        {/* CTAs - Ordered by importance: Secondary actions → Primary action */}
        <div
          style={{
            display: !isMobile ? "flex" : "none",
            alignItems: "center",
            gap: spacing.sm,
            flexWrap: "nowrap",
            flexShrink: 0,
            height: "100%",
          }}
        >
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "36px",
              minHeight: "36px",
              boxSizing: "border-box",
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

          {/* Join Fan Club - Secondary CTA */}
          <Link
            to="/fan-club/join"
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "36px",
              minHeight: "36px",
              boxSizing: "border-box",
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
            Join Fan Club
          </Link>

          {/* Join our Academy - Primary CTA with highest visibility */}
          <Link
            to="/brochure"
            style={{
              ...typography.body,
              fontSize: "14px",
              fontWeight: typography.fontWeight.bold,
              padding: "10px 24px",
              borderRadius: borderRadius.md,
              background: `linear-gradient(135deg, ${colors.accent.main} 0%, #FFB82E 100%)`,
              color: colors.text.onAccent,
              textDecoration: "none",
              transition: "all 0.2s ease",
              border: "none",
              boxShadow: "0 4px 16px rgba(255, 169, 0, 0.35)",
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "36px",
              minHeight: "36px",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(255, 169, 0, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(255, 169, 0, 0.35)";
            }}
          >
            Join our Academy
          </Link>
        </div>

        {/* Mobile Menu Button - min 44px touch target */}
        <button
          ref={mobileMenuButtonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls={MOBILE_NAV_DRAWER_ID}
          style={{
            display: isMobile ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 44,
            minHeight: 44,
            width: 44,
            height: 44,
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

      {/* Mobile Menu - Rendered via portal to avoid header overflow/clipping */}
      {isMobileMenuOpen &&
        isMobile &&
        ReactDOM.createPortal(
          <>
            {/* Backdrop - closes menu on tap, prevents interaction with page */}
            <div
              role="button"
              tabIndex={-1}
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setIsMobileMenuOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1201,
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            />
            {/* Drawer - fixed below header, no horizontal overflow */}
            <div
              id={MOBILE_NAV_DRAWER_ID}
              role="navigation"
              aria-label="Main navigation"
              style={{
              position: "fixed",
              top: 72,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1202,
              width: "100%",
              maxWidth: "100vw",
              boxSizing: "border-box",
              padding: spacing.lg,
              paddingLeft: `max(${spacing.lg}, env(safe-area-inset-left))`,
              paddingRight: `max(${spacing.lg}, env(safe-area-inset-right))`,
              background: `linear-gradient(135deg, 
                rgba(5, 11, 32, 0.98) 0%, 
                rgba(10, 22, 51, 0.95) 50%, 
                rgba(5, 11, 32, 0.98) 100%)`,
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              border: `1px solid rgba(255, 255, 255, 0.15)`,
              borderBottom: "none",
              boxShadow: `0 -8px 32px rgba(0, 0, 0, 0.4)`,
              overflowY: "auto",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
              WebkitOverflowScrolling: "touch",
            }}
          >
          {/* Home */}
          <button
            onClick={handleHomeClick}
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
              minHeight: 44,
              textAlign: "left",
              transition: "all 0.2s ease",
            }}
          >
            Home
          </button>

          {/* Programmes */}
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
              minHeight: 44,
              display: "flex",
              alignItems: "center",
            }}
          >
            Programmes
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
              minHeight: 44,
              display: "flex",
              alignItems: "center",
            }}
          >
            About Us
          </Link>

          {/* Explore RealVerse */}
          <Link
            to="/realverse/experience"
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
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              border: "1px solid rgba(0,224,255,0.18)",
            }}
          >
            Explore RealVerse
          </Link>

          {/* Join Fan Club - Secondary CTA */}
          <Link
            to="/fan-club/join"
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
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Join Fan Club
          </Link>

          {/* Shop - Disabled in UI, backend code preserved */}
          {/* <button
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
          </button> */}

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
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Login
          </Link>

          {/* Join RealVerse - Primary CTA with highest visibility */}
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
              color: colors.text.onAccent,
              textDecoration: "none",
              textAlign: "center",
              marginTop: spacing.sm,
              boxShadow: "0 4px 16px rgba(255, 169, 0, 0.35)",
              letterSpacing: "0.02em",
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Join our Academy
          </Link>
          </div>
        </>,
        document.body
      )}
      </div>
    </header>
  );
};

export default PublicHeader;
