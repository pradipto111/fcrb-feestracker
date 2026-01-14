import React, { useEffect, useState } from "react";
import { api } from "../api/client";
// Removed mock analytics imports - using real finance data only
import { AnalyticsCard } from "../components/analytics/AnalyticsCard";
import { ChartContainer } from "../components/analytics/ChartContainer";
import { FilterBar } from "../components/analytics/FilterBar";
import { KPIChip } from "../components/analytics/KPIChip";
import { TrendIndicator } from "../components/analytics/TrendIndicator";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// PDF Report Content Component (moved outside to fix JSX parsing)
const ReportContent: React.FC<{ data: any }> = ({ data }) => (
  <div
    style={{
      width: "210mm",
      minHeight: "297mm",
      padding: "20mm",
      background: "#ffffff",
      color: "#000000",
      fontFamily: "Arial, sans-serif",
    }}
  >
    {/* Cover */}
    <div style={{ textAlign: "center", marginBottom: "40px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px" }}>
        FC Real Bengaluru
      </h1>
      <h2 style={{ fontSize: "24px", fontWeight: "normal", marginBottom: "20px" }}>
        Finance Analytics Report
      </h2>
      <div style={{ fontSize: "14px", color: "#666", marginTop: "20px" }}>
        <div>Date Range: {data.dateRange}</div>
        <div style={{ marginTop: "10px" }}>
          Generated on: {new Date(data.generatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>

    {/* Finance Overview KPIs */}
    {data.studentFinanceData && (
      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
          Finance Overview
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "15px",
          }}
        >
          <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
              Total Collected
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              ₹{data.studentFinanceData.totalCollected?.toLocaleString() || 0}
            </div>
          </div>
          <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
              Total Students
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {data.studentFinanceData.studentCount || 0}
            </div>
          </div>
          <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
              Outstanding Dues
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              ₹{data.studentFinanceData.approxOutstanding?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Center Finance Summary */}
    {data.centerFinanceData && data.centerFinanceData.length > 0 && (
      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
          Center-Wise Finance Summary
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>
                Center
              </th>
              <th style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                Students
              </th>
              <th style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                Total Collected
              </th>
              <th style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                Outstanding
              </th>
              <th style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                Collection Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {data.centerFinanceData.map((center: any) => (
              <tr key={center.centerId}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{center.centerName}</td>
                <td style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                  {center.studentCount}
                </td>
                <td style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                  ₹{center.totalCollected.toLocaleString()}
                </td>
                <td style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                  ₹{center.approxOutstanding.toLocaleString()}
                </td>
                <td style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                  {center.collectionRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Program Finance Summary */}
    {data.programFinanceData && data.programFinanceData.length > 0 && (
      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
          Program-Wise Finance Summary
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>
                Program
              </th>
              <th style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                Students
              </th>
              <th style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                Total Collected
              </th>
              <th style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                Outstanding
              </th>
            </tr>
          </thead>
          <tbody>
            {data.programFinanceData.map((program: any) => (
              <tr key={program.program}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{program.program}</td>
                <td style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                  {program.students}
                </td>
                <td style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                  ₹{program.totalCollected.toLocaleString()}
                </td>
                <td style={{ padding: "10px", textAlign: "right", border: "1px solid #ddd" }}>
                  ₹{program.outstanding.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Churned Students Impact */}
    {data.churnedStudentsData && data.churnedStudentsData.totalChurned > 0 && (
      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
          Churned Students Financial Impact
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
              Total Churned
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {data.churnedStudentsData.totalChurned}
            </div>
          </div>
          <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
              Total Revenue Lost
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              ₹{data.churnedStudentsData.totalChurnedRevenue?.toLocaleString() || 0}
            </div>
          </div>
          <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
              Avg Revenue per Churned
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              ₹{data.churnedStudentsData.avgChurnedRevenue?.toFixed(0) || 0}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Notes & Actions */}
    <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "2px solid #ddd" }}>
      <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        Notes & Actions
      </h3>
      <div
        style={{
          minHeight: "100px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          fontSize: "14px",
          color: "#666",
        }}
      >
        {/* Placeholder for admin notes */}
      </div>
    </div>

    {/* Footer */}
    <div
      style={{
        marginTop: "40px",
        paddingTop: "20px",
        borderTop: "1px solid #ddd",
        textAlign: "center",
        fontSize: "12px",
        color: "#999",
      }}
    >
      <div>FC Real Bengaluru Finance Analytics Report</div>
      <div style={{ marginTop: "5px" }}>
        Generated on {new Date(data.generatedAt).toLocaleString()}
      </div>
    </div>
  </div>
);

const AdminAnalyticsPage: React.FC = () => {
  const [studentFinanceData, setStudentFinanceData] = useState<any>(null);
  const [centerFinanceData, setCenterFinanceData] = useState<any[]>([]);
  const [revenueCollections, setRevenueCollections] = useState<any[]>([]);
  const [monthlyCollections, setMonthlyCollections] = useState<any[]>([]);
  const [paymentModeBreakdown, setPaymentModeBreakdown] = useState<any[]>([]);
  const [programFinanceData, setProgramFinanceData] = useState<any[]>([]);
  const [churnedStudentsData, setChurnedStudentsData] = useState<any>(null);
  const [fanClubRevenue, setFanClubRevenue] = useState<any>(null);
  const [shopRevenue, setShopRevenue] = useState<any>(null);
  const [comprehensiveFinance, setComprehensiveFinance] = useState<any>(null);
  const [detailedStudentFinance, setDetailedStudentFinance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedCentre, setSelectedCentre] = useState("");
  const [revenueMonths, setRevenueMonths] = useState(12);
  const [paymentModeFilter, setPaymentModeFilter] = useState("all");
  const [centres, setCentres] = useState<any[]>([]);

  useEffect(() => {
    loadCentres();
  }, []);

  useEffect(() => {
    let mounted = true;
    let refreshTimeout: NodeJS.Timeout;
    
    const load = async () => {
      if (mounted) {
        await loadAllData();
      }
    };
    
    // Initial load
    load();
    
    // Refresh data when page becomes visible (with debounce)
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) {
        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(() => {
          if (mounted) {
            loadAllData();
          }
        }, 500);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mounted = false;
      clearTimeout(refreshTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCentre]); // Only reload when center changes

  useEffect(() => {
    // Load revenue and monthly data when filters change (only after initial load)
    if (studentFinanceData) {
      loadRevenueData();
      loadMonthlyData();
      loadDetailedStudentFinance();
      // Reload shop revenue with new months filter
      api.getShopRevenue({ months: revenueMonths })
        .then(data => {
          if (data) setShopRevenue(data);
        })
        .catch(err => {
          console.error("Failed to load shop revenue:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCentre, revenueMonths, paymentModeFilter]);

  const loadCentres = async () => {
    try {
      const data = await api.getCenters();
      setCentres(data);
    } catch (err: any) {
      console.error("Failed to load centres:", err);
    }
  };

  const loadCenterFinanceData = async () => {
    try {
      const centersData = await api.getCenters();
      if (!Array.isArray(centersData) || centersData.length === 0) {
        setCenterFinanceData([]);
        return;
      }
      
      // Load center data in parallel but with error handling
      const centerFinancePromises = centersData.map(async (center: any) => {
        try {
          const [centerSummary, revenueData] = await Promise.all([
            api.getDashboardSummary({ centerId: String(center.id) }).catch(() => ({
              totalCollected: 0,
              studentCount: 0,
              approxOutstanding: 0
            })),
            api.getRevenueCollections({ 
              months: 12, 
              centerId: String(center.id) 
            }).catch(() => [])
          ]);
          
          const totalRevenue = Array.isArray(revenueData) 
            ? revenueData.reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
            : 0;
          
          const totalCollected = centerSummary?.totalCollected || 0;
          const approxOutstanding = centerSummary?.approxOutstanding || 0;
          
          return {
            centerId: center.id,
            centerName: center.name,
            totalCollected,
            studentCount: centerSummary?.studentCount || 0,
            approxOutstanding,
            totalRevenue,
            collectionRate: totalCollected > 0 
              ? ((totalCollected / (totalCollected + approxOutstanding)) * 100).toFixed(1)
              : "0"
          };
        } catch (err) {
          console.error(`Failed to load finance data for center ${center.id}:`, err);
          return {
            centerId: center.id,
            centerName: center.name,
            totalCollected: 0,
            studentCount: 0,
            approxOutstanding: 0,
            totalRevenue: 0,
            collectionRate: "0"
          };
        }
      });
      const centerFinanceResults = await Promise.all(centerFinancePromises);
      setCenterFinanceData(centerFinanceResults);
    } catch (err) {
      console.error("Failed to load center finance data:", err);
      setCenterFinanceData([]);
    }
  };

  const loadProgramFinanceData = async () => {
    try {
      const students = await api.getStudents(undefined, undefined, true);
      if (!Array.isArray(students)) return;

      // Group by program type
      const programMap: { [key: string]: { students: number; totalCollected: number; outstanding: number; active: number; churned: number } } = {};
      
      students.forEach((student: any) => {
        const program = student.programType || "Unknown";
        if (!programMap[program]) {
          programMap[program] = {
            students: 0,
            totalCollected: 0,
            outstanding: 0,
            active: 0,
            churned: 0
          };
        }
        programMap[program].students++;
        programMap[program].totalCollected += student.totalPaid || 0;
        programMap[program].outstanding += student.outstanding || 0;
        if (student.status === "ACTIVE") {
          programMap[program].active++;
        } else if (student.status === "INACTIVE" && student.churnedDate) {
          programMap[program].churned++;
        }
      });

      const programData = Object.entries(programMap).map(([program, data]) => ({
        program,
        ...data,
        collectionRate: data.totalCollected > 0
          ? ((data.totalCollected / (data.totalCollected + data.outstanding)) * 100).toFixed(1)
          : "0"
      }));

      setProgramFinanceData(programData);
    } catch (err) {
      console.error("Failed to load program finance data:", err);
      setProgramFinanceData([]);
    }
  };

  const loadChurnedStudentsData = async () => {
    try {
      const students = await api.getStudents(undefined, undefined, true);
      if (!Array.isArray(students)) return;

      const churnedStudents = students.filter((s: any) => s.status === "INACTIVE" && s.churnedDate);
      const totalChurnedRevenue = churnedStudents.reduce((sum: number, s: any) => sum + (s.totalPaid || 0), 0);
      const avgChurnedRevenue = churnedStudents.length > 0 ? totalChurnedRevenue / churnedStudents.length : 0;
      
      // Group by month of churn
      const churnByMonth: { [key: string]: number } = {};
      churnedStudents.forEach((s: any) => {
        if (s.churnedDate) {
          const date = new Date(s.churnedDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          churnByMonth[monthKey] = (churnByMonth[monthKey] || 0) + 1;
        }
      });

      setChurnedStudentsData({
        totalChurned: churnedStudents.length,
        totalChurnedRevenue,
        avgChurnedRevenue,
        churnByMonth: Object.entries(churnByMonth).map(([month, count]) => ({
          month,
          count,
          revenue: churnedStudents
            .filter((s: any) => {
              if (!s.churnedDate) return false;
              const date = new Date(s.churnedDate);
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              return monthKey === month;
            })
            .reduce((sum: number, s: any) => sum + (s.totalPaid || 0), 0)
        }))
      });
    } catch (err) {
      console.error("Failed to load churned students data:", err);
      setChurnedStudentsData(null);
    }
  };

  const loadDetailedStudentFinance = async () => {
    try {
      const students = await api.getStudents(undefined, selectedCentre || undefined, true);
      if (!Array.isArray(students)) return;

      // Create detailed breakdown with micro-level details
      const detailed = students.map((student: any) => {
        const totalPaid = student.totalPaid || 0;
        const outstanding = student.outstanding || 0;
        const expectedTotal = totalPaid + outstanding;
        const collectionRate = expectedTotal > 0 ? (totalPaid / expectedTotal) * 100 : 100;
        
        return {
          id: student.id,
          name: student.fullName,
          center: student.center?.name || "Unknown",
          program: student.programType || "Unknown",
          status: student.status,
          joiningDate: student.joiningDate,
          churnedDate: student.churnedDate,
          monthlyFee: student.monthlyFeeAmount || 0,
          paymentFrequency: student.paymentFrequency || 1,
          totalPaid,
          outstanding,
          expectedTotal,
          collectionRate: collectionRate.toFixed(1),
          isChurned: student.status === "INACTIVE" && student.churnedDate
        };
      });

      // Sort by outstanding (highest first) for attention
      detailed.sort((a, b) => b.outstanding - a.outstanding);
      setDetailedStudentFinance(detailed);
    } catch (err) {
      console.error("Failed to load detailed student finance:", err);
      setDetailedStudentFinance([]);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError("");
    try {
      // Load dashboard summary (main finance overview) - this is critical, load first
      const dashboardSummary = await api.getDashboardSummary({
        centerId: selectedCentre || undefined,
      }).catch(err => {
        console.error("Failed to load dashboard summary:", err);
        return null;
      });

      if (dashboardSummary) {
        setStudentFinanceData(dashboardSummary);
      } else {
        // Set default values if summary fails
        setStudentFinanceData({ totalCollected: 0, studentCount: 0, approxOutstanding: 0 });
      }

      // Clear loading state immediately after getting main data so UI can render
      setLoading(false);
      setError("");

      // Load comprehensive finance data (includes all revenue streams)
      const comprehensiveData = await api.getComprehensiveFinance({
        centerId: selectedCentre || undefined
      }).catch(err => {
        console.error("Failed to load comprehensive finance:", err);
        return null;
      });
      if (comprehensiveData) {
        setComprehensiveFinance(comprehensiveData);
      }

      // Load payment mode breakdown (non-blocking, don't wait)
      api.getPaymentModeBreakdown()
        .then(paymentModes => {
          if (paymentModes && Array.isArray(paymentModes)) {
            setPaymentModeBreakdown(paymentModes);
          } else {
            setPaymentModeBreakdown([]);
          }
        })
        .catch(err => {
          console.error("Failed to load payment mode breakdown:", err);
          setPaymentModeBreakdown([]);
        });

      // Load fan club revenue (non-blocking)
      api.getFanClubRevenue()
        .then(data => {
          if (data) setFanClubRevenue(data);
        })
        .catch(err => {
          console.error("Failed to load fan club revenue:", err);
          setFanClubRevenue(null);
        });

      // Load shop revenue (non-blocking)
      api.getShopRevenue({ months: revenueMonths })
        .then(data => {
          if (data) setShopRevenue(data);
        })
        .catch(err => {
          console.error("Failed to load shop revenue:", err);
          setShopRevenue(null);
        });

      // Load detailed student finance (non-blocking)
      loadDetailedStudentFinance();

      // Load other data asynchronously (non-blocking, don't wait)
      loadCenterFinanceData().catch(err => {
        console.error("Error loading center finance data:", err);
        setCenterFinanceData([]);
      });
      
      loadProgramFinanceData().catch(err => {
        console.error("Error loading program finance data:", err);
        setProgramFinanceData([]);
      });
      
      loadChurnedStudentsData().catch(err => {
        console.error("Error loading churned students data:", err);
        setChurnedStudentsData(null);
      });
    } catch (err: any) {
      console.error("Error loading analytics:", err);
      setError(err.message || "Failed to load analytics");
      // Ensure we have at least default data so page can render
      setStudentFinanceData({ totalCollected: 0, studentCount: 0, approxOutstanding: 0 });
      setLoading(false);
    }
  };

  const loadRevenueData = async () => {
    try {
      const data = await api.getRevenueCollections({
        months: revenueMonths,
        centerId: selectedCentre || undefined,
        paymentMode: paymentModeFilter === "all" ? undefined : paymentModeFilter
      });
      if (data && Array.isArray(data)) {
        setRevenueCollections(data);
      } else {
        setRevenueCollections([]);
      }
    } catch (err: any) {
      console.error("Failed to load revenue collections:", err);
      setRevenueCollections([]);
    }
  };

  const loadMonthlyData = async () => {
    try {
      const data = await api.getMonthlyCollections({
        centerId: selectedCentre || undefined,
        paymentMode: paymentModeFilter === "all" ? undefined : paymentModeFilter
      });
      if (data && Array.isArray(data)) {
        setMonthlyCollections(data);
      } else {
        setMonthlyCollections([]);
      }
    } catch (err: any) {
      console.error("Failed to load monthly collections:", err);
      setMonthlyCollections([]);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const reportData = {
        dateRange: `Last ${revenueMonths} months`,
        studentFinanceData,
        centerFinanceData,
        revenueCollections,
        monthlyCollections,
        paymentModeBreakdown,
        programFinanceData,
        churnedStudentsData,
        generatedAt: new Date().toISOString(),
      };

      // Dynamically import and use PDF generator
      const { AcademyReportGenerator } = await import("../components/reports/AcademyReportGenerator");
      
      // Create a temporary div to render the report
      const reportDiv = document.createElement("div");
      reportDiv.style.position = "fixed";
      reportDiv.style.left = "-9999px";
      reportDiv.style.top = "0";
      document.body.appendChild(reportDiv);

      // Render report content
      const React = await import("react");
      const ReactDOM = await import("react-dom/client");
      const root = ReactDOM.createRoot(reportDiv);
      
      root.render(React.createElement(ReportContent, { data: reportData }));

      // Wait for render, then generate PDF
      await new Promise((resolve) => setTimeout(resolve, 500));

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(reportDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`FC-Real-Bengaluru-Finance-Report-${new Date().toISOString().split("T")[0]}.pdf`);

      // Cleanup
      root.unmount();
      document.body.removeChild(reportDiv);
    } catch (err: any) {
      console.error("Error generating PDF:", err);
      alert(`Failed to generate PDF: ${err.message}`);
    }
  };

  if (loading && !studentFinanceData) {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <div style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>
          Loading analytics...
        </div>
        <div style={{ ...typography.body, color: colors.text.muted }}>
          Please wait while we fetch your finance data
        </div>
      </div>
    );
  }

  if (error && !studentFinanceData) {
    return (
      <div style={{ padding: spacing.xl }}>
        <div style={{ color: colors.warning.main, marginBottom: spacing.md }}>{error}</div>
        <Button 
          variant="primary" 
          onClick={() => {
            setError("");
            loadAllData();
          }}
        >
          Retry Loading
        </Button>
      </div>
    );
  }

  const centreOptions = [
    { value: "", label: "All Centres" },
    ...centres.map((c) => ({ value: String(c.id), label: c.name })),
  ];


  const COLORS = [
    colors.primary.main,
    colors.accent.main,
    colors.success.main,
    colors.warning.main,
  ];

  return (
    <div style={{ padding: spacing.md }}>
      <div
        className="responsive-flex-row"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.md,
          marginBottom: spacing.xl,
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ ...typography.h2, color: colors.text.primary, margin: 0 }}>
            Finance Analytics Dashboard
          </h1>
          <p style={{ ...typography.body, color: colors.text.muted, marginTop: spacing.xs }}>
            Comprehensive financial metrics and insights for students and centers
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleDownloadPDF}
          style={{
            width: "100%",
          }}
        >
          📄 Download Finance Report (PDF)
        </Button>
      </div>

      <FilterBar
        filters={[
          {
            label: "Centre",
            value: selectedCentre,
            options: centreOptions,
            onChange: setSelectedCentre,
          },
          {
            label: "Revenue Period",
            value: String(revenueMonths),
            options: [
              { value: "3", label: "Last 3 Months" },
              { value: "6", label: "Last 6 Months" },
              { value: "12", label: "Last 12 Months" },
              { value: "24", label: "Last 24 Months" },
            ],
            onChange: (val) => setRevenueMonths(Number(val)),
          },
          {
            label: "Payment Mode",
            value: paymentModeFilter,
            options: [
              { value: "all", label: "All Modes" },
              { value: "CASH", label: "Cash" },
              { value: "UPI", label: "UPI" },
              { value: "BANK_TRANSFER", label: "Bank Transfer" },
              { value: "CHEQUE", label: "Cheque" },
            ],
            onChange: setPaymentModeFilter,
          },
        ]}
      />

      {/* Comprehensive Finance KPI Summary */}
      {comprehensiveFinance && (
        <AnalyticsCard title="Complete Financial Overview" fullWidth>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: spacing.md,
              marginBottom: spacing.lg,
            }}
          >
            <KPIChip
              label="Total Revenue (All Streams)"
              value={`₹${comprehensiveFinance.totalRevenue?.toLocaleString() || 0}`}
              trend="up"
            />
            <KPIChip
              label="Student Revenue"
              value={`₹${comprehensiveFinance.revenueBreakdown?.student?.toLocaleString() || 0}`}
            />
            <KPIChip
              label="Fan Club Revenue (Monthly)"
              value={`₹${comprehensiveFinance.revenueBreakdown?.fanClub?.toLocaleString() || 0}`}
            />
            <KPIChip
              label="Shop Revenue"
              value={`₹${comprehensiveFinance.revenueBreakdown?.shop?.toLocaleString() || 0}`}
            />
          </div>
        </AnalyticsCard>
      )}

      {/* Student Finance KPI Summary */}
      {studentFinanceData && (
        <AnalyticsCard title="Student Finance Summary" fullWidth>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: spacing.md,
            }}
          >
            <KPIChip
              label="Total Collected"
              value={`₹${studentFinanceData.totalCollected?.toLocaleString() || 0}`}
              trend="up"
            />
            <KPIChip
              label="Total Students"
              value={studentFinanceData.studentCount || 0}
            />
            <KPIChip
              label="Outstanding Dues"
              value={`₹${studentFinanceData.approxOutstanding?.toLocaleString() || 0}`}
              trend={studentFinanceData.approxOutstanding > 0 ? "down" : "neutral"}
            />
            <KPIChip
              label="Collection Rate"
              value={`${studentFinanceData.totalCollected && studentFinanceData.approxOutstanding 
                ? ((studentFinanceData.totalCollected / (studentFinanceData.totalCollected + studentFinanceData.approxOutstanding)) * 100).toFixed(1)
                : 100}%`}
              trend={studentFinanceData.totalCollected && studentFinanceData.approxOutstanding 
                ? ((studentFinanceData.totalCollected / (studentFinanceData.totalCollected + studentFinanceData.approxOutstanding)) * 100) >= 80 ? "up" : "neutral"
                : "neutral"}
            />
            {churnedStudentsData && (
              <>
                <KPIChip
                  label="Churned Students"
                  value={churnedStudentsData.totalChurned || 0}
                  trend="down"
                />
                <KPIChip
                  label="Churned Revenue Lost"
                  value={`₹${churnedStudentsData.totalChurnedRevenue?.toLocaleString() || 0}`}
                />
              </>
            )}
          </div>
        </AnalyticsCard>
      )}

      {/* Fan Club Finance */}
      {fanClubRevenue && (
        <AnalyticsCard title="Fan Club Revenue Analytics" fullWidth>
          <div style={{ marginBottom: spacing.md }}>
            <div className="responsive-flex-row" style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}>
              <KPIChip 
                label="Total Active Fans" 
                value={fanClubRevenue.totalFans || 0}
              />
              <KPIChip 
                label="Projected Monthly Revenue" 
                value={`₹${fanClubRevenue.totalProjectedMonthlyRevenue?.toLocaleString() || 0}`}
                trend="up"
              />
              <KPIChip 
                label="Projected Yearly Revenue" 
                value={`₹${fanClubRevenue.totalProjectedYearlyRevenue?.toLocaleString() || 0}`}
                trend="up"
              />
            </div>
          </div>
          {fanClubRevenue.revenueByTier && fanClubRevenue.revenueByTier.length > 0 && (
            <div style={{ marginTop: spacing.lg }}>
              <h4 style={{ ...typography.h4, marginBottom: spacing.md, color: colors.text.primary }}>
                Revenue by Tier
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${colors.surface.card}` }}>
                      <th style={{ padding: spacing.sm, textAlign: "left", ...typography.label }}>Tier</th>
                      <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Fans</th>
                      <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Monthly Price</th>
                      <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Yearly Price</th>
                      <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Monthly Revenue</th>
                      <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Yearly Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fanClubRevenue.revenueByTier.map((tier: any) => (
                      <tr key={tier.tierId} style={{ borderBottom: `1px solid ${colors.surface.card}` }}>
                        <td style={{ padding: spacing.sm, color: colors.text.primary, fontWeight: 600 }}>
                          {tier.tierName}
                        </td>
                        <td style={{ padding: spacing.sm, textAlign: "right", color: colors.text.primary }}>
                          {tier.fanCount}
                        </td>
                        <td style={{ padding: spacing.sm, textAlign: "right", color: colors.text.primary }}>
                          ₹{tier.monthlyPrice.toLocaleString()}
                        </td>
                        <td style={{ padding: spacing.sm, textAlign: "right", color: colors.text.primary }}>
                          ₹{tier.yearlyPrice.toLocaleString()}
                        </td>
                        <td style={{ padding: spacing.sm, textAlign: "right", color: colors.success.main }}>
                          ₹{tier.projectedMonthlyRevenue.toLocaleString()}
                        </td>
                        <td style={{ padding: spacing.sm, textAlign: "right", color: colors.success.main }}>
                          ₹{tier.projectedYearlyRevenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </AnalyticsCard>
      )}

      {/* Shop Finance */}
      {shopRevenue && (
        <AnalyticsCard title="Shop Revenue Analytics" fullWidth>
          <div style={{ marginBottom: spacing.md }}>
            <div className="responsive-flex-row" style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}>
              <KPIChip 
                label="Total Revenue" 
                value={`₹${shopRevenue.totalRevenue?.toLocaleString() || 0}`}
                trend="up"
              />
              <KPIChip 
                label="Total Orders" 
                value={shopRevenue.totalOrders || 0}
              />
              <KPIChip 
                label="Paid Orders" 
                value={shopRevenue.paidOrdersCount || 0}
              />
              <KPIChip 
                label="Avg Order Value" 
                value={`₹${shopRevenue.avgOrderValue?.toLocaleString() || 0}`}
              />
              <KPIChip 
                label="Conversion Rate" 
                value={`${shopRevenue.conversionRate?.toFixed(1) || 0}%`}
                trend={shopRevenue.conversionRate >= 80 ? "up" : "neutral"}
              />
              <KPIChip 
                label="Pending Revenue" 
                value={`₹${shopRevenue.pendingRevenue?.toLocaleString() || 0}`}
                trend="down"
              />
            </div>
          </div>
          {shopRevenue.monthlyTrend && shopRevenue.monthlyTrend.length > 0 && (
            <ChartContainer height={300} isEmpty={shopRevenue.monthlyTrend.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shopRevenue.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                  <XAxis 
                    dataKey="month" 
                    stroke={colors.text.secondary}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke={colors.text.secondary}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke={colors.text.secondary}
                  />
                  <Tooltip
                    contentStyle={{
                      background: colors.surface.main,
                      border: `1px solid ${colors.surface.card}`,
                      borderRadius: borderRadius.md,
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === "orders") return value;
                      return `₹${value.toLocaleString()}`;
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill={colors.success.main} name="Revenue (₹)" />
                  <Bar yAxisId="right" dataKey="orders" fill={colors.primary.main} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
          {shopRevenue.categoryBreakdown && shopRevenue.categoryBreakdown.length > 0 && (
            <div style={{ marginTop: spacing.lg }}>
              <h4 style={{ ...typography.h4, marginBottom: spacing.md, color: colors.text.primary }}>
                Revenue by Product Category
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${colors.surface.card}` }}>
                      <th style={{ padding: spacing.sm, textAlign: "left", ...typography.label }}>Category</th>
                      <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Revenue</th>
                      <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopRevenue.categoryBreakdown.map((cat: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${colors.surface.card}` }}>
                        <td style={{ padding: spacing.sm, color: colors.text.primary, fontWeight: 600 }}>
                          {cat.category}
                        </td>
                        <td style={{ padding: spacing.sm, textAlign: "right", color: colors.success.main }}>
                          ₹{cat.revenue.toLocaleString()}
                        </td>
                        <td style={{ padding: spacing.sm, textAlign: "right", color: colors.text.primary }}>
                          {cat.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </AnalyticsCard>
      )}

      {/* Student Finance Overview */}
      {studentFinanceData && (
        <AnalyticsCard title="Overall Finance Summary" fullWidth>
          <div style={{ marginBottom: spacing.md }}>
            <div className="responsive-flex-row" style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}>
              <KPIChip 
                label="Total Collected" 
                value={`₹${studentFinanceData.totalCollected?.toLocaleString() || 0}`}
                trend="up"
              />
              <KPIChip 
                label="Total Students" 
                value={studentFinanceData.studentCount || 0}
              />
              <KPIChip 
                label="Outstanding Dues" 
                value={`₹${studentFinanceData.approxOutstanding?.toLocaleString() || 0}`}
                trend={studentFinanceData.approxOutstanding > 0 ? "down" : "neutral"}
              />
              <KPIChip 
                label="Collection Rate" 
                value={`${studentFinanceData.totalCollected && studentFinanceData.approxOutstanding 
                  ? ((studentFinanceData.totalCollected / (studentFinanceData.totalCollected + studentFinanceData.approxOutstanding)) * 100).toFixed(1)
                  : 100}%`}
                trend={studentFinanceData.totalCollected && studentFinanceData.approxOutstanding 
                  ? ((studentFinanceData.totalCollected / (studentFinanceData.totalCollected + studentFinanceData.approxOutstanding)) * 100) >= 80 ? "up" : "neutral"
                  : "neutral"}
              />
            </div>
          </div>
        </AnalyticsCard>
      )}

      {/* Revenue Collections Over Time */}
      {revenueCollections.length > 0 && (
        <AnalyticsCard
          title="Revenue Collections Over Time"
          subtitle={`Last ${revenueMonths} months`}
          fullWidth
        >
          <ChartContainer height={350} isEmpty={revenueCollections.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueCollections}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                <XAxis 
                  dataKey="month" 
                  stroke={colors.text.secondary}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke={colors.text.secondary}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: colors.surface.main,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                  }}
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={colors.success.main}
                  strokeWidth={3}
                  name="Revenue (₹)"
                  dot={{ fill: colors.success.main, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AnalyticsCard>
      )}

      {/* Monthly Collections Allocation */}
      {monthlyCollections.length > 0 && (
        <AnalyticsCard
          title="Monthly Collections Allocation"
          subtitle="Payments allocated to specific months"
          fullWidth
        >
          <ChartContainer height={350} isEmpty={monthlyCollections.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCollections}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                <XAxis 
                  dataKey="month" 
                  stroke={colors.text.secondary}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke={colors.text.secondary}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: colors.surface.main,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                  }}
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey="amount" fill={colors.primary.main} name="Amount (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AnalyticsCard>
      )}

      {/* Payment Mode Breakdown */}
      {paymentModeBreakdown.length > 0 && (
        <AnalyticsCard title="Payment Mode Breakdown" fullWidth>
          <ChartContainer height={300} isEmpty={paymentModeBreakdown.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentModeBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => `${name}: ₹${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {paymentModeBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: colors.surface.main,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                  }}
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AnalyticsCard>
      )}

      {/* Program-Wise Finance Analytics */}
      {programFinanceData.length > 0 && (
        <AnalyticsCard title="Program-Wise Finance Analytics" fullWidth>
          <ChartContainer height={350} isEmpty={programFinanceData.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={programFinanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                <XAxis dataKey="program" stroke={colors.text.secondary} />
                <YAxis 
                  yAxisId="left"
                  stroke={colors.text.secondary}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke={colors.text.secondary}
                />
                <Tooltip
                  contentStyle={{
                    background: colors.surface.main,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === "students" || name === "active" || name === "churned") {
                      return value;
                    }
                    return `₹${value.toLocaleString()}`;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="totalCollected" fill={colors.success.main} name="Total Collected" />
                <Bar yAxisId="left" dataKey="outstanding" fill={colors.danger.main} name="Outstanding" />
                <Bar yAxisId="right" dataKey="students" fill={colors.primary.main} name="Total Students" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          <div style={{ marginTop: spacing.lg }}>
            <h4 style={{ ...typography.h4, marginBottom: spacing.md, color: colors.text.primary }}>
              Program Finance Details
            </h4>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.surface.card}` }}>
                    <th style={{ padding: spacing.sm, textAlign: "left", ...typography.label }}>Program</th>
                    <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Students</th>
                    <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Active</th>
                    <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Churned</th>
                    <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Total Collected</th>
                    <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Outstanding</th>
                    <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Collection Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {programFinanceData.map((program: any, idx: number) => (
                    <tr key={program.program} style={{ borderBottom: `1px solid ${colors.surface.card}` }}>
                      <td style={{ padding: spacing.sm, color: colors.text.primary, fontWeight: 600 }}>
                        {program.program}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: "right", color: colors.text.primary }}>
                        {program.students}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: "right", color: colors.success.main }}>
                        {program.active}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: "right", color: colors.danger.main }}>
                        {program.churned}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: "right", color: colors.success.main }}>
                        ₹{program.totalCollected.toLocaleString()}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: "right", color: colors.danger.main }}>
                        ₹{program.outstanding.toLocaleString()}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: "right", color: colors.text.primary }}>
                        {program.collectionRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnalyticsCard>
      )}

      {/* Churned Students Impact */}
      {churnedStudentsData && churnedStudentsData.totalChurned > 0 && (
        <AnalyticsCard title="Churned Students Financial Impact" fullWidth>
          <div style={{ marginBottom: spacing.md }}>
            <div className="responsive-flex-row" style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}>
              <KPIChip 
                label="Total Churned" 
                value={churnedStudentsData.totalChurned}
                trend="down"
              />
              <KPIChip 
                label="Total Revenue Lost" 
                value={`₹${churnedStudentsData.totalChurnedRevenue?.toLocaleString() || 0}`}
              />
              <KPIChip 
                label="Avg Revenue per Churned" 
                value={`₹${churnedStudentsData.avgChurnedRevenue?.toFixed(0) || 0}`}
              />
            </div>
          </div>
          {churnedStudentsData.churnByMonth && churnedStudentsData.churnByMonth.length > 0 && (
            <ChartContainer height={300} isEmpty={churnedStudentsData.churnByMonth.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={churnedStudentsData.churnByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                  <XAxis 
                    dataKey="month" 
                    stroke={colors.text.secondary}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis yAxisId="left" stroke={colors.text.secondary} />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    stroke={colors.text.secondary}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: colors.surface.main,
                      border: `1px solid ${colors.surface.card}`,
                      borderRadius: borderRadius.md,
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === "count") return value;
                      return `₹${value.toLocaleString()}`;
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill={colors.danger.main} name="Churned Count" />
                  <Bar yAxisId="right" dataKey="revenue" fill={colors.warning.main} name="Revenue Lost (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </AnalyticsCard>
      )}


      {/* Detailed Student Finance (Micro-level) */}
      {detailedStudentFinance.length > 0 && (
        <AnalyticsCard title="Detailed Student Finance (Micro-level Analysis)" fullWidth>
          <div style={{ marginBottom: spacing.md }}>
            <p style={{ ...typography.body, color: colors.text.muted, marginBottom: spacing.md }}>
              Individual student payment status, outstanding amounts, and collection rates. Sorted by highest outstanding first.
            </p>
          </div>
          <div style={{ overflowX: "auto", maxHeight: "600px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, background: colors.surface.main }}>
                <tr style={{ borderBottom: `2px solid ${colors.surface.card}` }}>
                  <th style={{ padding: spacing.sm, textAlign: "left", ...typography.label }}>Student</th>
                  <th style={{ padding: spacing.sm, textAlign: "left", ...typography.label }}>Center</th>
                  <th style={{ padding: spacing.sm, textAlign: "left", ...typography.label }}>Program</th>
                  <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Monthly Fee</th>
                  <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Total Paid</th>
                  <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Outstanding</th>
                  <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Collection Rate</th>
                  <th style={{ padding: spacing.sm, textAlign: "center", ...typography.label }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {detailedStudentFinance.map((student: any) => (
                  <tr 
                    key={student.id} 
                    style={{ 
                      borderBottom: `1px solid ${colors.surface.card}`,
                      backgroundColor: student.outstanding > 0 ? (colors.warning.main + "10") : "transparent"
                    }}
                  >
                    <td style={{ padding: spacing.sm, color: colors.text.primary, fontWeight: 600 }}>
                      {student.name}
                    </td>
                    <td style={{ padding: spacing.sm, color: colors.text.secondary }}>
                      {student.center}
                    </td>
                    <td style={{ padding: spacing.sm, color: colors.text.secondary }}>
                      {student.program}
                    </td>
                    <td style={{ padding: spacing.sm, textAlign: "right", color: colors.text.primary }}>
                      ₹{student.monthlyFee.toLocaleString()}
                    </td>
                    <td style={{ padding: spacing.sm, textAlign: "right", color: colors.success.main }}>
                      ₹{student.totalPaid.toLocaleString()}
                    </td>
                    <td style={{ padding: spacing.sm, textAlign: "right", color: student.outstanding > 0 ? colors.danger.main : colors.text.primary, fontWeight: student.outstanding > 0 ? 600 : 400 }}>
                      ₹{student.outstanding.toLocaleString()}
                    </td>
                    <td style={{ padding: spacing.sm, textAlign: "right", color: colors.text.primary }}>
                      {student.collectionRate}%
                    </td>
                    <td style={{ padding: spacing.sm, textAlign: "center" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: borderRadius.sm,
                        fontSize: typography.caption.fontSize,
                        backgroundColor: student.isChurned ? colors.danger.main + "20" : colors.success.main + "20",
                        color: student.isChurned ? colors.danger.main : colors.success.main,
                        fontWeight: 600
                      }}>
                        {student.isChurned ? "Churned" : student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalyticsCard>
      )}

      {/* Center-Wise Finance Analytics */}
      {centerFinanceData.length > 0 && (
        <AnalyticsCard title="Center-Wise Finance Analytics" fullWidth>
          <ChartContainer height={400} isEmpty={centerFinanceData.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={centerFinanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                <XAxis type="number" stroke={colors.text.secondary} />
                <YAxis dataKey="centerName" type="category" width={150} stroke={colors.text.secondary} />
                <Tooltip
                  contentStyle={{
                    background: colors.surface.main,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                  }}
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="totalCollected" fill={colors.success.main} name="Total Collected" />
                <Bar dataKey="approxOutstanding" fill={colors.danger.main} name="Outstanding" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          <div style={{ marginTop: spacing.lg }}>
            <h4 style={{ ...typography.h4, marginBottom: spacing.md, color: colors.text.primary }}>
              Center Finance Details
            </h4>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.surface.card}` }}>
                    <th style={{ padding: spacing.sm, textAlign: "left", ...typography.label }}>Center</th>
                    <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Students</th>
                    <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Total Collected</th>
                    <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Outstanding</th>
                    <th style={{ padding: spacing.sm, textAlign: "right", ...typography.label }}>Collection Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {centerFinanceData.map((center: any) => (
                    <tr key={center.centerId} style={{ borderBottom: `1px solid ${colors.surface.card}` }}>
                      <td style={{ padding: spacing.sm, color: colors.text.primary }}>{center.centerName}</td>
                      <td style={{ padding: spacing.sm, textAlign: "right", color: colors.text.primary }}>
                        {center.studentCount}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: "right", color: colors.success.main }}>
                        ₹{center.totalCollected.toLocaleString()}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: "right", color: colors.danger.main }}>
                        ₹{center.approxOutstanding.toLocaleString()}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: "right", color: colors.text.primary }}>
                        {center.collectionRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnalyticsCard>
      )}

    </div>
  );
};

export default AdminAnalyticsPage;

