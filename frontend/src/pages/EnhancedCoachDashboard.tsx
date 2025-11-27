import React, { useEffect, useState } from "react";
import { api } from "../api/client";

const EnhancedCoachDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [error, setError] = useState("");
  
  // Revenue Chart filters
  const [revenueMonths, setRevenueMonths] = useState(12);
  const [revenuePaymentMode, setRevenuePaymentMode] = useState("all");

  // Monthly Chart filters - no time period, shows all months
  const [monthlyPaymentMode, setMonthlyPaymentMode] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryData, studentsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getStudents()
      ]);
      setSummary(summaryData);
      setStudents(studentsData);
      await loadRevenueData();
      await loadMonthlyData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadRevenueData = async () => {
    try {
      const revenueCollections = await api.getRevenueCollections({
        months: revenueMonths,
        paymentMode: revenuePaymentMode === "all" ? undefined : revenuePaymentMode
      });
      setRevenueData(revenueCollections);
    } catch (err: any) {
      console.error("Failed to load revenue data:", err);
    }
  };

  const loadMonthlyData = async () => {
    try {
      const monthlyCollections = await api.getMonthlyCollections({
        paymentMode: monthlyPaymentMode === "all" ? undefined : monthlyPaymentMode
      });
      setMonthlyData(monthlyCollections);
    } catch (err: any) {
      console.error("Failed to load monthly data:", err);
    }
  };

  if (error) return <p style={{ color: "#e74c3c" }}>Error: {error}</p>;
  if (!summary) return <p>Loading...</p>;

  // Calculate stats
  const activeStudents = students.filter(s => s.status === "ACTIVE").length;
  const trialStudents = students.filter(s => s.status === "TRIAL").length;
  const totalPotentialRevenue = students.reduce((sum, s) => sum + s.monthlyFeeAmount, 0);
  const totalExpected = summary.totalCollected + summary.approxOutstanding;

  // Payment frequency breakdown
  const frequencyBreakdown = students.reduce((acc: any, student) => {
    const freq = student.paymentFrequency || 1;
    const label = freq === 1 ? "Monthly" : 
                  freq === 3 ? "Quarterly" : 
                  freq === 6 ? "Half-yearly" : 
                  freq === 12 ? "Yearly" : `${freq} months`;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/photo3.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: "#1E40AF" }}>
            FCRB Coach Dashboard
          </h1>
          <p style={{ color: "#666", margin: 0 }}>FC Real Bengaluru - Your centers overview</p>
        </div>
        <button
          onClick={loadData}
          style={{
            padding: "12px 24px",
            background: "#1E40AF",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Main Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 24 }}>
        <div style={{
          background: "linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Total Collected</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>₹{summary.totalCollected.toLocaleString()}</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Outstanding</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>₹{summary.approxOutstanding.toLocaleString()}</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Total Students</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{summary.studentCount}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
            {activeStudents} Active, {trialStudents} Trial
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Total Expected</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>₹{totalExpected.toLocaleString()}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>Collected + Outstanding</div>
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
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: 12, 
          marginBottom: 20,
          padding: 12,
          background: "#f8f9fa",
          borderRadius: 8
        }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
              📅 Time Period
            </label>
            <select
              value={revenueMonths}
              onChange={(e) => setRevenueMonths(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "2px solid #e0e0e0",
                borderRadius: 6,
                fontSize: 13,
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
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
              💳 Payment Mode
            </label>
            <select
              value={revenuePaymentMode}
              onChange={(e) => setRevenuePaymentMode(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "2px solid #e0e0e0",
                borderRadius: 6,
                fontSize: 13,
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
                padding: "8px 10px",
                background: "#1E40AF",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        {revenueData.length > 0 ? (
          <>
            <div style={{ height: 250, display: "flex", alignItems: "flex-end", gap: 8, padding: "16px 0" }}>
              {revenueData.map((data, idx) => {
                const maxAmount = Math.max(...revenueData.map(m => m.amount), 1);
                const heightPercent = (data.amount / maxAmount) * 100;
                
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPercent * 2}px`,
                        minHeight: data.amount > 0 ? "15px" : "5px",
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
                          top: "-20px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "9px",
                          fontWeight: 600,
                          color: "#1E40AF",
                          whiteSpace: "nowrap"
                        }}>
                          ₹{(data.amount / 1000).toFixed(0)}k
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 8, 
                      marginTop: 8, 
                      color: "#666", 
                      fontWeight: 600,
                      transform: "rotate(-45deg)",
                      transformOrigin: "center",
                      whiteSpace: "nowrap",
                      marginLeft: "-8px"
                    }}>
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center", marginTop: 32, padding: 12, background: "#f8f9fa", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                Total Revenue ({revenueMonths} months{revenuePaymentMode !== "all" && ` • ${revenuePaymentMode}`})
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1E40AF" }}>
                ₹{revenueData.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                Avg: ₹{Math.floor(revenueData.reduce((sum, m) => sum + m.amount, 0) / revenueMonths).toLocaleString()}/mo
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
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: 12, 
          marginBottom: 20,
          padding: 12,
          background: "#f8f9fa",
          borderRadius: 8
        }}>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
              💳 Payment Mode
            </label>
            <select
              value={monthlyPaymentMode}
              onChange={(e) => setMonthlyPaymentMode(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "2px solid #e0e0e0",
                borderRadius: 6,
                fontSize: 13,
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
                padding: "8px 10px",
                background: "#43e97b",
                color: "#000",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        {monthlyData.length > 0 ? (
          <>
            <div style={{ height: 250, display: "flex", alignItems: "flex-end", gap: 8, padding: "16px 0" }}>
              {monthlyData.map((data, idx) => {
                const maxAmount = Math.max(...monthlyData.map(m => m.amount), 1);
                const heightPercent = (data.amount / maxAmount) * 100;
                
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPercent * 2}px`,
                        minHeight: data.amount > 0 ? "15px" : "5px",
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
                          top: "-20px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "9px",
                          fontWeight: 600,
                          color: "#43e97b",
                          whiteSpace: "nowrap"
                        }}>
                          ₹{(data.amount / 1000).toFixed(0)}k
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 8, 
                      marginTop: 8, 
                      color: "#666", 
                      fontWeight: 600,
                      transform: "rotate(-45deg)",
                      transformOrigin: "center",
                      whiteSpace: "nowrap",
                      marginLeft: "-8px"
                    }}>
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center", marginTop: 32, padding: 12, background: "#f8f9fa", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                Total Allocated ({monthlyData.length} months{monthlyPaymentMode !== "all" && ` • ${monthlyPaymentMode}`})
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#43e97b" }}>
                ₹{monthlyData.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                Avg: ₹{monthlyData.length > 0 ? Math.floor(monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.length).toLocaleString() : 0}/mo
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
            No payment data available yet
          </div>
        )}
      </div>

      {/* Detailed Stats Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Collection Breakdown */}
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📊 Collection Breakdown</h2>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Collected</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#27ae60" }}>
                  ₹{summary.totalCollected.toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: 48 }}>💰</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "#fff3cd", borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Pending</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#f39c12" }}>
                  ₹{summary.approxOutstanding.toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: 48 }}>⏳</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "#e3f2fd", borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Potential Monthly</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#3498db" }}>
                  ₹{totalPotentialRevenue.toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: 48 }}>📈</div>
            </div>
          </div>
        </div>

        {/* Student Status */}
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>👥 Students</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ padding: 12, background: "#d4edda", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#155724", marginBottom: 4 }}>Active</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#155724" }}>{activeStudents}</div>
            </div>
            <div style={{ padding: 12, background: "#fff3cd", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#856404", marginBottom: 4 }}>Trial</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#856404" }}>{trialStudents}</div>
            </div>
            <div style={{ padding: 12, background: "#f8d7da", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#721c24", marginBottom: 4 }}>Inactive</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#721c24" }}>
                {students.filter(s => s.status === "INACTIVE").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Frequency Distribution */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📅 Payment Frequency Distribution</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
          {Object.entries(frequencyBreakdown).map(([label, count]: [string, any]) => (
            <div key={label} style={{
              padding: 16,
              background: "#f8f9fa",
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#1E40AF", marginBottom: 4 }}>
                {count}
              </div>
              <div style={{ fontSize: 14, color: "#666" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Students */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📋 All Students</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Name</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Program</th>
                <th style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>Monthly Fee</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Frequency</th>
                <th style={{ padding: 12, textAlign: "center", fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{student.fullName}</td>
                  <td style={{ padding: 12 }}>{student.programType || "-"}</td>
                  <td style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>
                    ₹{student.monthlyFeeAmount.toLocaleString()}
                  </td>
                  <td style={{ padding: 12 }}>
                    {student.paymentFrequency === 1 ? "Monthly" :
                     student.paymentFrequency === 3 ? "Quarterly" :
                     student.paymentFrequency === 6 ? "Half-yearly" :
                     student.paymentFrequency === 12 ? "Yearly" :
                     `${student.paymentFrequency} months`}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: student.status === "ACTIVE" ? "#27ae6020" : 
                                 student.status === "TRIAL" ? "#f39c1220" : "#95a5a620",
                      color: student.status === "ACTIVE" ? "#27ae60" : 
                            student.status === "TRIAL" ? "#f39c12" : "#95a5a6"
                    }}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCoachDashboard;

