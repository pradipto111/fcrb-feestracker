import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export const SystemDateSetter = () => {
  const { user } = useAuth();
  const [systemDate, setSystemDate] = useState<string>("");
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [actualDate, setActualDate] = useState<string>("");
  const [inputDate, setInputDate] = useState<string>("");
  const [minDate, setMinDate] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const fetchSystemDate = async () => {
    try {
      const data = await api.getSystemDate();
      setSystemDate(new Date(data.systemDate).toLocaleString());
      setIsCustomDate(data.isCustomDate);
      setActualDate(new Date(data.actualDate).toLocaleString());
      
      // Set input to current system date
      const dateObj = new Date(data.systemDate);
      const localDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setInputDate(localDate);
      
      // Set minimum date to current system date (not actual date)
      setMinDate(localDate);
    } catch (error) {
      console.error("Failed to fetch system date:", error);
    }
  };

  useEffect(() => {
    fetchSystemDate();
  }, []);

  const handleSetDate = async () => {
    if (!inputDate) {
      setMessage("Please select a date and time");
      return;
    }

    const selectedDate = new Date(inputDate);
    const currentSystemDate = new Date(minDate);
    
    // Prevent going backwards from current system date
    if (selectedDate < currentSystemDate) {
      setMessage("❌ Cannot go backwards in time. Select a date equal to or after the current system date.");
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    try {
      await api.setSystemDate(selectedDate.toISOString());
      setMessage("✅ System date updated! Refreshing dashboards...");
      await fetchSystemDate();
      
      // Trigger a page reload to refresh all data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage("❌ Failed to update system date");
      console.error(error);
    }
  };

  const handleResetDate = async () => {
    try {
      await api.resetSystemDate();
      setMessage("✅ System date reset! Refreshing dashboards...");
      await fetchSystemDate();
      
      // Trigger a page reload to refresh all data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage("❌ Failed to reset system date");
      console.error(error);
    }
  };

  // Only show for ADMIN
  if (user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div style={{
      backgroundColor: isCustomDate ? "rgba(255, 193, 7, 0.15)" : "rgba(255, 255, 255, 0.1)",
      border: `1px solid ${isCustomDate ? "rgba(255, 193, 7, 0.4)" : "rgba(255, 255, 255, 0.2)"}`,
      borderRadius: "8px",
      padding: "12px",
      fontSize: "11px",
      color: "white"
    }}>
      <div style={{ fontWeight: "bold", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>🕐 Debug Date</span>
        {isCustomDate && <span style={{ color: "#FFC107", fontSize: "9px", background: "rgba(255,193,7,0.2)", padding: "2px 6px", borderRadius: "4px" }}>CUSTOM</span>}
      </div>
      
      <div style={{ marginBottom: "8px", fontSize: "10px", color: "#E0E7FF" }}>
        {new Date(systemDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>
      
      <input
        type="datetime-local"
        value={inputDate}
        onChange={(e) => setInputDate(e.target.value)}
        min={minDate}
        title="Cannot go backwards from current system date"
        style={{
          width: "100%",
          padding: "6px 8px",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "4px",
          fontSize: "10px",
          marginBottom: "8px",
          background: "rgba(255,255,255,0.1)",
          color: "white"
        }}
      />
      
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={handleSetDate}
          style={{
            flex: 1,
            padding: "6px 8px",
            backgroundColor: "#10B981",
            color: "#000",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: "700",
            fontWeight: 600
          }}
          title="Set system date and refresh dashboards"
        >
          Set
        </button>
        {isCustomDate && (
          <button
            onClick={handleResetDate}
            style={{
              flex: 1,
              padding: "6px 8px",
              backgroundColor: "#F97316",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: 600
            }}
          >
            Reset
          </button>
        )}
      </div>

      {message && (
        <div style={{ 
          marginTop: "8px", 
          fontSize: "9px", 
          color: message.includes("✅") ? "#10B981" : "#F97316",
          background: "rgba(0,0,0,0.2)",
          padding: "4px 6px",
          borderRadius: "4px"
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

