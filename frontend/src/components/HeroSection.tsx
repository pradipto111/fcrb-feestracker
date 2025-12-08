import React, { useState } from "react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  showVideo?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, showVideo = false }) => {
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      minHeight: showVideo ? "500px" : "300px",
      borderRadius: "16px",
      overflow: "hidden",
      marginBottom: "32px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }}>
      {/* Background Image */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url(/photo1.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.3
      }} />
      
      {/* Gradient Overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)"
      }} />

      {/* Video Section */}
      {showVideo && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.5)"
        }}>
          {!videoPlaying ? (
            <button
              onClick={() => setVideoPlaying(true)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "3px solid white",
                borderRadius: "50%",
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div style={{
                width: 0,
                height: 0,
                borderLeft: "20px solid white",
                borderTop: "12px solid transparent",
                borderBottom: "12px solid transparent",
                marginLeft: "4px"
              }} />
            </button>
          ) : (
            <video
              src="/fcrb-video.mp4"
              autoPlay
              controls
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: "12px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
              }}
              onEnded={() => setVideoPlaying(false)}
            />
          )}
        </div>
      )}

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 2,
        padding: showVideo ? "40px" : "60px 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: showVideo ? "center" : "flex-start",
        height: "100%",
        color: "white"
      }}>
        <h1 style={{
          fontSize: showVideo ? "3rem" : "2.5rem",
          fontWeight: 800,
          fontFamily: "'Poppins', sans-serif",
          marginBottom: subtitle ? "16px" : 0,
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          letterSpacing: "-0.02em"
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: "1.25rem",
            fontWeight: 500,
            opacity: 0.95,
            textShadow: "0 1px 4px rgba(0,0,0,0.2)",
            maxWidth: "600px"
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default HeroSection;


