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
    }, 5000); // Change image every 5 seconds

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
      overflow: "hidden"
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
      
      {/* Dark overlay for better text readability */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, rgba(30, 64, 175, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
        zIndex: 1
      }} />
      <div style={{
        background: "rgba(255, 255, 255, 0.98)",
        padding: 48,
        borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        width: "100%",
        maxWidth: 420,
        position: "relative",
        zIndex: 2,
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img 
            src="/fcrb-logo.png" 
            alt="FC Real Bengaluru" 
            style={{ 
              width: 120, 
              height: 120, 
              margin: "0 auto 16px",
              display: "block"
            }} 
          />
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: "#1E40AF" }}>
            FCRB Fees Tracker
          </h1>
          <p style={{ color: "#666", fontSize: 14 }}>FC Real Bengaluru Academy Management</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
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
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                transition: "border 0.2s"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
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
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                transition: "border 0.2s"
              }}
            />
          </div>
          {error && (
            <div style={{
              padding: 12,
              background: "#fee",
              color: "#c33",
              borderRadius: 8,
              fontSize: 14
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 24px",
              background: loading ? "#ccc" : "#1E40AF",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div style={{ marginTop: 24, padding: 16, background: "#f5f5f5", borderRadius: 8, fontSize: 12 }}>
          <strong>Demo Credentials:</strong><br />
          Admin: admin@feestrack.com / admin123<br />
          Coach: rajesh@feestrack.com / coach123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


