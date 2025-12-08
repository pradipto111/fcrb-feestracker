import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

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
      backgroundColor: isCustomDate ? colors.warning.soft : "rgba(255, 255, 255, 0.1)",
      border: `1px solid ${isCustomDate ? colors.warning.outline : "rgba(255, 255, 255, 0.2)"}`,
      borderRadius: borderRadius.lg,
      padding: spacing.sm,
      fontSize: typography.fontSize.xs,
      color: colors.text.inverted,
      backdropFilter: "blur(10px)",
      minWidth: '200px',
    }}>
      <div style={{ 
        fontWeight: typography.fontWeight.bold, 
        marginBottom: spacing.sm, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between" 
      }}>
        <span>🕐 Debug Date</span>
        {isCustomDate && (
          <Badge variant="warning" size="sm">CUSTOM</Badge>
        )}
      </div>
      
      <div style={{ 
        marginBottom: spacing.sm, 
        fontSize: typography.fontSize.xs, 
        color: "rgba(255, 255, 255, 0.8)",
        fontFamily: typography.fontFamily.primary,
      }}>
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
          padding: `${spacing.xs} ${spacing.sm}`,
          border: `1px solid rgba(255,255,255,0.3)`,
          borderRadius: borderRadius.md,
          fontSize: typography.fontSize.xs,
          marginBottom: spacing.sm,
          background: "rgba(255,255,255,0.1)",
          color: colors.text.inverted,
          fontFamily: typography.fontFamily.primary,
        }}
      />
      
      <div style={{ display: "flex", gap: spacing.xs }}>
        <Button
          onClick={handleSetDate}
          variant="success"
          size="sm"
          style={{ flex: 1 }}
          title="Set system date and refresh dashboards"
        >
          Set
        </Button>
        {isCustomDate && (
          <Button
            onClick={handleResetDate}
            variant="danger"
            size="sm"
            style={{ flex: 1 }}
          >
            Reset
          </Button>
        )}
      </div>

      {message && (
        <div style={{ 
          marginTop: spacing.sm, 
          fontSize: typography.fontSize.xs, 
          color: message.includes("✅") ? colors.success.main : colors.danger.main,
          background: "rgba(0,0,0,0.2)",
          padding: `${spacing.xs} ${spacing.sm}`,
          borderRadius: borderRadius.md,
          fontFamily: typography.fontFamily.primary,
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

