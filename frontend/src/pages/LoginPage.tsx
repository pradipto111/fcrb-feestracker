import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
      background: "#0F172A"
    }}>
      {/* Background Slideshow */}
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
            opacity: currentImageIndex === index ? 1 : 0,
            transition: "opacity 2s ease-in-out",
            zIndex: 0
          }}
        />
      ))}
      
      {/* Brand Gradient Overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.85) 0%, rgba(5, 150, 105, 0.85) 100%)",
        zIndex: 1
      }} />

      {/* Login Card */}
      <div style={{
        background: "rgba(255, 255, 255, 0.98)",
        padding: "48px",
        borderRadius: "24px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        width: "100%",
        maxWidth: "440px",
        position: "relative",
        zIndex: 2,
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.2)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <img 
            src="/fcrb-logo.png" 
            alt="FC Real Bengaluru" 
            style={{ 
              width: 120, 
              height: 120, 
              margin: "0 auto 20px",
              display: "block",
              borderRadius: "16px",
              background: "white",
              padding: 8,
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
            }} 
          />
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: 800, 
            marginBottom: "8px",
            fontFamily: "'Poppins', sans-serif",
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em"
          }}>
            RealVerse
          </h1>
          <p style={{ 
            color: "#64748B", 
            fontSize: "15px",
            fontWeight: 500
          }}>
            FC Real Bengaluru Universe
          </p>
          <p style={{ 
            color: "#94A3B8", 
            fontSize: "13px",
            marginTop: "4px"
          }}>
            Your complete football academy management platform
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontSize: "14px", 
              fontWeight: 600,
              color: "#1E293B"
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "2px solid #E2E8F0",
                borderRadius: "10px",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s ease",
                fontFamily: "'Inter', sans-serif"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#10B981";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontSize: "14px", 
              fontWeight: 600,
              color: "#1E293B"
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "2px solid #E2E8F0",
                borderRadius: "10px",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s ease",
                fontFamily: "'Inter', sans-serif"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#10B981";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "12px 16px",
              background: "#FEE2E2",
              color: "#DC2626",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 500,
              border: "1px solid #FECACA"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "16px 24px",
              background: loading 
                ? "#94A3B8" 
                : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: loading 
                ? "none" 
                : "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
              fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 15px 20px -3px rgba(16, 185, 129, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(16, 185, 129, 0.3)";
              }
            }}
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <div style={{ 
          marginTop: "32px", 
          padding: "20px", 
          background: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)", 
          borderRadius: "12px", 
          fontSize: "12px",
          border: "1px solid #E2E8F0"
        }}>
          <div style={{ fontWeight: 700, marginBottom: "8px", color: "#1E293B" }}>
            Demo Credentials
          </div>
          <div style={{ color: "#64748B", lineHeight: "1.6" }}>
            <div><strong>Admin:</strong> admin@feestrack.com / admin123</div>
            <div style={{ marginTop: "4px" }}><strong>Coach:</strong> coach@feestrack.com / coach123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
