import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import HeroSection from "../components/HeroSection";

const EnhancedAdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [error, setError] = useState("");
  
  // Chart 1 filters (Revenue)
  const [revenueMonths, setRevenueMonths] = useState(12);
  const [revenueCenterId, setRevenueCenterId] = useState("");
  const [revenuePaymentMode, setRevenuePaymentMode] = useState("all");
  
  // Chart 2 filters (Monthly) - no time period filter, shows all months
  const [monthlyCenterId, setMonthlyCenterId] = useState("");
  const [monthlyPaymentMode, setMonthlyPaymentMode] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadRevenueData();
  }, [revenueMonths, revenueCenterId, revenuePaymentMode]);

  useEffect(() => {
    loadMonthlyData();
  }, [monthlyCenterId, monthlyPaymentMode]);

  const loadData = async () => {
    try {
      const [summaryData, centersData, studentsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getCenters(),
        api.getStudents()
      ]);
      setSummary(summaryData);
      setCenters(centersData);
      setStudents(studentsData);
      await Promise.all([loadRevenueData(), loadMonthlyData()]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadRevenueData = async () => {
    try {
      const data = await api.getRevenueCollections({
        months: revenueMonths,
        centerId: revenueCenterId || undefined,
        paymentMode: revenuePaymentMode === "all" ? undefined : revenuePaymentMode
      });
      setRevenueData(data);
    } catch (err: any) {
      console.error("Failed to load revenue data:", err);
    }
  };

  const loadMonthlyData = async () => {
    try {
      const data = await api.getMonthlyCollections({
        centerId: monthlyCenterId || undefined,
        paymentMode: monthlyPaymentMode === "all" ? undefined : monthlyPaymentMode
      });
      setMonthlyData(data);
    } catch (err: any) {
      console.error("Failed to load monthly data:", err);
    }
  };

  if (error) return <p style={{ color: "#e74c3c" }}>Error: {error}</p>;
  if (!summary || !centers.length) return <p>Loading...</p>;

  // Calculate center-wise stats
  const centerStats = centers.map(center => {
    const centerStudents = students.filter(s => s.centerId === center.id);
    const centerRevenue = centerStudents.reduce((sum, s) => s.monthlyFeeAmount, 0);
    return {
      ...center,
      studentCount: centerStudents.length,
      revenue: centerRevenue,
      activeStudents: centerStudents.filter(s => s.status === "ACTIVE").length
    };
  });

  const totalRevenue = centerStats.reduce((sum, c) => sum + c.revenue, 0);
  const activeStudents = students.filter(s => s.status === "ACTIVE").length;
  const totalExpected = summary.totalCollected + summary.approxOutstanding;

  return (
    <div style={{
      minHeight: "100vh"
    }}>
      {/* Hero Section with Video */}
      <HeroSection 
        title="Welcome to RealVerse"
        subtitle="Complete academy management and analytics dashboard"
        showVideo={true}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
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
            Admin Dashboard
          </h1>
          <p style={{ 
            color: "#64748B", 
            margin: 0,
            fontSize: "1rem",
            fontWeight: 500
          }}>
            Complete academy overview and analytics
          </p>
        </div>
        <button
          onClick={loadData}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
          }}
        >
          Refresh
        </button>
      </div>

      {/* Main Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 32 }}>
        <div style={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          padding: 28,
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(16, 185, 129, 0.2)",
          color: "white",
          transition: "transform 0.2s ease",
          cursor: "default"
        }}
        className="gamified-card"
        >
          <div style={{ fontSize: "14px", marginBottom: "12px", opacity: 0.95, fontWeight: 500 }}>Total Revenue</div>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "'Poppins', sans-serif" }}>₹{summary.totalCollected.toLocaleString()}</div>
          <div style={{ fontSize: "13px", marginTop: "8px", opacity: 0.9, fontWeight: 500 }}>
            All-time collections
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          padding: 28,
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(245, 158, 11, 0.2)",
          color: "white",
          transition: "transform 0.2s ease",
          cursor: "default"
        }}
        className="gamified-card"
        >
          <div style={{ fontSize: "14px", marginBottom: "12px", opacity: 0.95, fontWeight: 500 }}>Outstanding</div>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "'Poppins', sans-serif" }}>₹{summary.approxOutstanding.toLocaleString()}</div>
          <div style={{ fontSize: "13px", marginTop: "8px", opacity: 0.9, fontWeight: 500 }}>
            Pending collections
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Total Students</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{summary.studentCount}</div>
          <div style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>
            {activeStudents} Active across {centers.length} centers
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Total Expected</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>₹{totalExpected.toLocaleString()}</div>
          <div style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>
            Collected + Outstanding
          </div>
        </div>
      </div>

      {/* CHART 1: Revenue Collections */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>💰 Revenue Collections</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0 0" }}>Total money collected by payment date</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: 16, 
          marginBottom: 24,
          padding: 16,
          background: "#f8f9fa",
          borderRadius: 8
        }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              📅 Time Period
            </label>
            <select
              value={revenueMonths}
              onChange={(e) => setRevenueMonths(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              <option value="3">Last 3 Months</option>
              <option value="6">Last 6 Months</option>
              <option value="12">Last 12 Months</option>
              <option value="18">Last 18 Months</option>
              <option value="24">Last 24 Months</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              🏢 Center
            </label>
            <select
              value={revenueCenterId}
              onChange={(e) => setRevenueCenterId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              <option value="">All Centers</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              💳 Payment Mode
            </label>
            <select
              value={revenuePaymentMode}
              onChange={(e) => setRevenuePaymentMode(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={loadRevenueData}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#1E40AF",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14
              }}
            >
              🔄 Refresh Chart
            </button>
          </div>
        </div>
        {revenueData.length > 0 ? (
          <>
            <div style={{ height: 300, display: "flex", alignItems: "flex-end", gap: 8, padding: "16px 0" }}>
              {revenueData.map((data, idx) => {
                const maxAmount = Math.max(...revenueData.map(m => m.amount), 1);
                const heightPercent = (data.amount / maxAmount) * 100;
                
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPercent * 2.5}px`,
                        minHeight: data.amount > 0 ? "20px" : "5px",
                        background: data.amount > 0 
                          ? "linear-gradient(to top, #1E40AF, #1E3A8A)" 
                          : "#e0e0e0",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s",
                        cursor: "pointer",
                        position: "relative"
                      }}
                      title={`${data.month}: ₹${data.amount.toLocaleString()}`}
                    >
                      {data.amount > 0 && (
                        <div style={{
                          position: "absolute",
                          top: "-24px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#1E40AF",
                          whiteSpace: "nowrap"
                        }}>
                          ₹{(data.amount / 1000).toFixed(0)}k
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 9, 
                      marginTop: 8, 
                      color: "#666", 
                      fontWeight: 600,
                      transform: "rotate(-45deg)",
                      transformOrigin: "center",
                      whiteSpace: "nowrap",
                      marginLeft: "-10px"
                    }}>
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center", marginTop: 32, padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                Total Revenue ({revenueMonths} months
                {revenueCenterId && ` • ${centers.find(c => c.id === Number(revenueCenterId))?.name}`}
                {revenuePaymentMode !== "all" && ` • ${revenuePaymentMode}`})
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1E40AF" }}>
                ₹{revenueData.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                Average: ₹{Math.floor(revenueData.reduce((sum, m) => sum + m.amount, 0) / revenueMonths).toLocaleString()}/month
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
            No payment data available yet
          </div>
        )}
      </div>

      {/* CHART 2: Monthly Collections */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>📊 Monthly Collections</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0 0" }}>Allocated monthly income (shows all months with payments, including future)</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: 16, 
          marginBottom: 24,
          padding: 16,
          background: "#f8f9fa",
          borderRadius: 8
        }}>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              🏢 Center
            </label>
            <select
              value={monthlyCenterId}
              onChange={(e) => setMonthlyCenterId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              <option value="">All Centers</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              💳 Payment Mode
            </label>
            <select
              value={monthlyPaymentMode}
              onChange={(e) => setMonthlyPaymentMode(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={loadMonthlyData}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#43e97b",
                color: "#000",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14
              }}
            >
              🔄 Refresh Chart
            </button>
          </div>
        </div>
        {monthlyData.length > 0 ? (
          <>
            <div style={{ height: 300, display: "flex", alignItems: "flex-end", gap: 8, padding: "16px 0" }}>
              {monthlyData.map((data, idx) => {
                const maxAmount = Math.max(...monthlyData.map(m => m.amount), 1);
                const heightPercent = (data.amount / maxAmount) * 100;
                
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPercent * 2.5}px`,
                        minHeight: data.amount > 0 ? "20px" : "5px",
                        background: data.amount > 0 
                          ? "linear-gradient(to top, #43e97b, #38f9d7)" 
                          : "#e0e0e0",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s",
                        cursor: "pointer",
                        position: "relative"
                      }}
                      title={`${data.month}: ₹${data.amount.toLocaleString()}`}
                    >
                      {data.amount > 0 && (
                        <div style={{
                          position: "absolute",
                          top: "-24px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#43e97b",
                          whiteSpace: "nowrap"
                        }}>
                          ₹{(data.amount / 1000).toFixed(0)}k
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 9, 
                      marginTop: 8, 
                      color: "#666", 
                      fontWeight: 600,
                      transform: "rotate(-45deg)",
                      transformOrigin: "center",
                      whiteSpace: "nowrap",
                      marginLeft: "-10px"
                    }}>
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center", marginTop: 32, padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                Total Allocated ({monthlyData.length} months
                {monthlyCenterId && ` • ${centers.find(c => c.id === Number(monthlyCenterId))?.name}`}
                {monthlyPaymentMode !== "all" && ` • ${monthlyPaymentMode}`})
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#43e97b" }}>
                ₹{monthlyData.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                Average: ₹{monthlyData.length > 0 ? Math.floor(monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.length).toLocaleString() : 0}/month
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
            No payment data available yet
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 32 }}>
        {/* Collection vs Outstanding Comparison */}
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📊 Collection Overview</h2>
          <div style={{ height: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 48, padding: "16px 0" }}>
            {/* Collected Bar */}
            <div style={{ flex: 1, maxWidth: 200, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "100%",
                height: `${(summary.totalCollected / totalExpected) * 250}px`,
                minHeight: "50px",
                background: "linear-gradient(to top, #1E40AF, #1E3A8A)",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 18
              }}>
                ₹{(summary.totalCollected / 1000).toFixed(0)}k
              </div>
              <div style={{ fontSize: 16, marginTop: 12, color: "#1E40AF", fontWeight: 700 }}>
                Collected
              </div>
              <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
                {totalExpected > 0 ? ((summary.totalCollected / totalExpected) * 100).toFixed(1) : 0}%
              </div>
            </div>

            {/* Outstanding Bar */}
            <div style={{ flex: 1, maxWidth: 200, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "100%",
                height: `${(summary.approxOutstanding / totalExpected) * 250}px`,
                minHeight: "50px",
                background: "linear-gradient(to top, #f093fb, #f5576c)",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 18
              }}>
                ₹{(summary.approxOutstanding / 1000).toFixed(0)}k
              </div>
              <div style={{ fontSize: 16, marginTop: 12, color: "#f5576c", fontWeight: 700 }}>
                Outstanding
              </div>
              <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
                {totalExpected > 0 ? ((summary.approxOutstanding / totalExpected) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 24, padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Total Expected Revenue</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#333" }}>₹{totalExpected.toLocaleString()}</div>
          </div>
        </div>

        {/* Center Pie Chart */}
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🏢 Centers</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {centerStats.map((center, idx) => {
              const percentage = totalRevenue > 0 ? ((center.revenue / totalRevenue) * 100).toFixed(1) : 0;
              const colors = ["#1E40AF", "#f093fb", "#4facfe", "#43e97b", "#feca57"];
              return (
                <div key={center.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{center.name}</span>
                    <span style={{ fontSize: 14, color: "#666" }}>{percentage}%</span>
                  </div>
                  <div style={{
                    height: 8,
                    background: "#f0f0f0",
                    borderRadius: 4,
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: colors[idx % colors.length],
                      transition: "width 0.3s"
                    }} />
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {center.studentCount} students • ₹{center.revenue.toLocaleString()}/mo
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Center-wise Detailed Stats */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 32
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🎯 Center-wise Performance</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {centerStats.map((center, idx) => {
            const colors = [
              { bg: "#1E40AF20", text: "#1E40AF" },
              { bg: "#f093fb20", text: "#f093fb" },
              { bg: "#4facfe20", text: "#4facfe" },
              { bg: "#43e97b20", text: "#43e97b" }
            ];
            const color = colors[idx % colors.length];
            
            return (
              <div key={center.id} style={{
                padding: 20,
                background: color.bg,
                borderRadius: 12,
                border: `2px solid ${color.text}30`
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 16, alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: color.text }}>
                      {center.name}
                    </h3>
                    <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
                      {center.location}, {center.city}
                    </p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: color.text }}>
                      {center.studentCount}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>Students</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: color.text }}>
                      {center.activeStudents}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>Active</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: color.text }}>
                      ₹{center.revenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>Monthly</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Total Centers</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#1E40AF" }}>{centers.length}</div>
        </div>

        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Active Students</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#27ae60" }}>{activeStudents}</div>
        </div>

        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Trial Students</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#f39c12" }}>
            {students.filter(s => s.status === "TRIAL").length}
          </div>
        </div>

        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Avg Fee/Student</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#3498db" }}>
            ₹{students.length > 0 ? Math.floor(totalRevenue / students.length).toLocaleString() : 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;

