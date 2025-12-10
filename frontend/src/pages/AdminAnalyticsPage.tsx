import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import {
  getAdminKPIs,
  getAdminAttendanceByCentre,
  getAdminAttendanceOverTime,
  getAdminPlayersPerPathwayLevel,
  getAdminSessionsAndLoad,
  getAdminMatches,
} from "../mocks/mockAnalyticsService";
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
        Academy Performance Report
      </h2>
      <div style={{ fontSize: "14px", color: "#666", marginTop: "20px" }}>
        <div>Date Range: {data.dateRange}</div>
        <div style={{ marginTop: "10px" }}>
          Generated on: {new Date(data.generatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>

    {/* Overview KPIs */}
    <div style={{ marginBottom: "40px" }}>
      <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        Overview KPIs
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
            Total Active Players
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {data.summary?.totalActivePlayers || 0}
          </div>
        </div>
        <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
            Avg Attendance %
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {data.summary?.avgAttendance || 0}%
          </div>
        </div>
        <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
            Sessions (30 Days)
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {data.summary?.sessionsLast30Days || 0}
          </div>
        </div>
        <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
            Matches (Season)
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {data.summary?.matchesSeason || 0}
          </div>
        </div>
        <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
            Fee Collection %
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {data.summary?.feeCollectionRate || 0}%
          </div>
        </div>
        <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
            Wellness Average
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {data.summary?.avgWellness || 0}/5
          </div>
        </div>
      </div>
    </div>

    {/* Player Pipeline */}
    {data.pipeline && (
      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
          Player Pipeline
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
                Level
              </th>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>
                Players
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.pipeline.pipeline || {}).map(([level, count]: [string, any]) => (
              <tr key={level}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{level}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Training & Attendance Summary */}
    <div style={{ marginBottom: "40px" }}>
      <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        Training & Attendance Summary
      </h3>
      <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
        Attendance data shows {data.attendanceData.length} periods tracked. Average attendance
        rate is {data.summary?.avgAttendance || 0}%.
      </p>
    </div>

    {/* Matches & Selection */}
    {data.matchesData && (
      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
          Matches & Selection
        </h3>
        {data.matchesData.byCompetition && (
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>
              Matches by Competition
            </h4>
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
                    Competition
                  </th>
                  <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>
                    Matches
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.matchesData.byCompetition.map((comp: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {comp.competition}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{comp.matches}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
      <div>FC Real Bengaluru Academy Performance Report</div>
      <div style={{ marginTop: "5px" }}>
        Generated on {new Date(data.generatedAt).toLocaleString()}
      </div>
    </div>
  </div>
);

const AdminAnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceByCentre, setAttendanceByCentre] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any>(null);
  const [financeData, setFinanceData] = useState<any>(null);
  const [sessionsData, setSessionsData] = useState<any[]>([]);
  const [matchesData, setMatchesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedCentre, setSelectedCentre] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [groupBy, setGroupBy] = useState<"week" | "month">("week");
  const [centres, setCentres] = useState<any[]>([]);

  useEffect(() => {
    loadCentres();
  }, []);

  useEffect(() => {
    loadAllData();
  }, [selectedCentre, dateRange, groupBy]);

  const loadCentres = async () => {
    try {
      const data = await api.getCenters();
      setCentres(data);
    } catch (err: any) {
      console.error("Failed to load centres:", err);
    }
  };

  // Enable mock data - check env variable or default to true for localhost
  const USE_MOCK_DATA = 
    import.meta.env.VITE_USE_MOCK_ANALYTICS === "true" || 
    import.meta.env.VITE_USE_MOCK_ANALYTICS === true ||
    (import.meta.env.DEV && window.location.hostname === "localhost");
  console.log("[AdminAnalytics] USE_MOCK_DATA:", USE_MOCK_DATA, "env value:", import.meta.env.VITE_USE_MOCK_ANALYTICS, "hostname:", window.location.hostname);

  const loadAllData = async () => {
    setLoading(true);
    setError("");
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(dateRange));
      const dateRangeObj = { from: startDate, to: endDate };

      if (USE_MOCK_DATA) {
        // Use mock data
        const filters = {
          dateRange: dateRangeObj,
          centreId: selectedCentre || undefined,
        };

        const summaryData = getAdminKPIs(filters);
        const attendanceDataRes = getAdminAttendanceOverTime(filters, groupBy);
        const attendanceByCentreRes = getAdminAttendanceByCentre(filters);
        const pipelineData = getAdminPlayersPerPathwayLevel();
        const sessionsDataRes = getAdminSessionsAndLoad(filters);
        const matchesDataRes = getAdminMatches();

        setSummary(summaryData);
        setAttendanceData(attendanceDataRes);
        setAttendanceByCentre(attendanceByCentreRes);
        setPipeline(pipelineData);
        setFinanceData({ monthlyTrend: [], expectedMonthly: 0, collectedThisMonth: 0, outstanding: 0 });
        setSessionsData(sessionsDataRes);
        setMatchesData(matchesDataRes);
      } else {
        // Use real API
        const endDateStr = endDate.toISOString().split("T")[0];
        const startDateStr = startDate.toISOString().split("T")[0];

        const [
          summaryData,
          attendanceDataRes,
          attendanceByCentreRes,
          pipelineData,
          financeDataRes,
          sessionsDataRes,
          matchesDataRes,
        ] = await Promise.all([
          api.getAdminAnalyticsSummary({
            centerId: selectedCentre || undefined,
            startDate: startDateStr,
            endDate: endDateStr,
          }),
          api.getAdminAttendanceAnalytics({
            centerId: selectedCentre || undefined,
            groupBy,
          }),
          api.getAdminAttendanceByCentre(),
          api.getAdminPipeline(),
          api.getAdminFinance({ months: "12" }),
          api.getAdminSessions({
            centerId: selectedCentre || undefined,
          }),
          api.getAdminMatches(),
        ]);

        setSummary(summaryData);
        setAttendanceData(attendanceDataRes);
        setAttendanceByCentre(attendanceByCentreRes);
        setPipeline(pipelineData);
        setFinanceData(financeDataRes);
        setSessionsData(sessionsDataRes);
        setMatchesData(matchesDataRes);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(dateRange));
      const startDateStr = startDate.toISOString().split("T")[0];

      const reportData = {
        dateRange: `${startDateStr} to ${endDate}`,
        summary,
        attendanceData,
        pipeline,
        financeData,
        matchesData,
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

      pdf.save(`FC-Real-Bengaluru-Academy-Report-${new Date().toISOString().split("T")[0]}.pdf`);

      // Cleanup
      root.unmount();
      document.body.removeChild(reportDiv);
    } catch (err: any) {
      console.error("Error generating PDF:", err);
      alert(`Failed to generate PDF: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl }}>
        <div style={{ ...typography.h3, color: colors.text.primary }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: spacing.xl }}>
        <div style={{ color: colors.warning.main }}>{error}</div>
      </div>
    );
  }

  const centreOptions = [
    { value: "", label: "All Centres" },
    ...centres.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const dateRangeOptions = [
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 90 Days" },
    { value: "180", label: "Last 6 Months" },
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
            Analytics Dashboard
          </h1>
          <p style={{ ...typography.body, color: colors.text.muted, marginTop: spacing.xs }}>
            System-wide performance metrics and insights
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleDownloadPDF}
          style={{
            width: "100%",
          }}
        >
          📄 Download Academy Report (PDF)
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
            label: "Date Range",
            value: dateRange,
            options: dateRangeOptions,
            onChange: setDateRange,
          },
          {
            label: "Group By",
            value: groupBy,
            options: [
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ],
            onChange: (val) => setGroupBy(val as "week" | "month"),
          },
        ]}
      />

      {/* KPI Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        <KPIChip
          label="Total Active Players"
          value={summary?.totalActivePlayers || 0}
        />
        <KPIChip
          label="Avg Attendance %"
          value={`${summary?.avgAttendance || 0}%`}
          trend={summary?.avgAttendance >= 85 ? "up" : summary?.avgAttendance >= 70 ? "neutral" : "down"}
        />
        <KPIChip
          label="Sessions (30 Days)"
          value={summary?.sessionsLast30Days || 0}
        />
        <KPIChip
          label="Matches (Season)"
          value={summary?.matchesSeason || 0}
        />
        <KPIChip
          label="Fee Collection %"
          value={`${summary?.feeCollectionRate || 0}%`}
        />
        <KPIChip
          label="Wellness Average"
          value={`${summary?.avgWellness || 0}/5`}
        />
      </div>

      {/* Attendance Analytics */}
      <AnalyticsCard
        title="Attendance Over Time"
        subtitle={`Grouped by ${groupBy}`}
        fullWidth
      >
        <ChartContainer height={300} isEmpty={attendanceData.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
              <XAxis dataKey="period" stroke={colors.text.secondary} />
              <YAxis stroke={colors.text.secondary} />
              <Tooltip
                contentStyle={{
                  background: colors.surface.main,
                  border: `1px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={colors.primary.main}
                strokeWidth={2}
                name="Attendance %"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </AnalyticsCard>

      {/* Attendance by Centre */}
      <AnalyticsCard title="Attendance by Centre" fullWidth>
        <ChartContainer height={300} isEmpty={attendanceByCentre.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceByCentre}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
              <XAxis dataKey="centreName" stroke={colors.text.secondary} />
              <YAxis stroke={colors.text.secondary} />
              <Tooltip
                contentStyle={{
                  background: colors.surface.main,
                  border: `1px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                }}
              />
              <Bar dataKey="rate" fill={colors.primary.main} name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </AnalyticsCard>

      {/* Pipeline */}
      {pipeline && (
        <AnalyticsCard title="Player Pipeline" fullWidth>
          <ChartContainer height={300} isEmpty={!pipeline.pipeline}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(pipeline.pipeline || {}).map(([level, count]) => ({ level, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                <XAxis dataKey="level" stroke={colors.text.secondary} />
                <YAxis stroke={colors.text.secondary} />
                <Tooltip
                  contentStyle={{
                    background: colors.surface.main,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                  }}
                />
                <Bar dataKey="count" fill={colors.accent.main} name="Players" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AnalyticsCard>
      )}

      {/* Finance */}
      {financeData && (
        <AnalyticsCard title="Finance Analytics" fullWidth>
          <div style={{ marginBottom: spacing.md }}>
            <div className="responsive-flex-row" style={{ 
              display: "flex", 
              flexDirection: "column",
              gap: spacing.md,
            }}>
              <KPIChip label="Expected Monthly" value={`₹${financeData.expectedMonthly?.toLocaleString() || 0}`} />
              <KPIChip label="Collected This Month" value={`₹${financeData.collectedThisMonth?.toLocaleString() || 0}`} />
              <KPIChip label="Outstanding" value={`₹${financeData.outstanding?.toLocaleString() || 0}`} />
            </div>
          </div>
          <ChartContainer height={300} isEmpty={financeData.monthlyTrend?.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financeData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                <XAxis dataKey="month" stroke={colors.text.secondary} />
                <YAxis stroke={colors.text.secondary} />
                <Tooltip
                  contentStyle={{
                    background: colors.surface.main,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={colors.success.main}
                  strokeWidth={2}
                  name="Amount (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AnalyticsCard>
      )}

      {/* Sessions & Load */}
      <AnalyticsCard title="Sessions & Training Load" fullWidth>
        <ChartContainer height={300} isEmpty={sessionsData.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sessionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
              <XAxis dataKey="week" stroke={colors.text.secondary} />
              <YAxis yAxisId="left" stroke={colors.text.secondary} />
              <YAxis yAxisId="right" orientation="right" stroke={colors.text.secondary} />
              <Tooltip
                contentStyle={{
                  background: colors.surface.main,
                  border: `1px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="sessions" fill={colors.primary.main} name="Sessions" />
              <Bar yAxisId="right" dataKey="avgExertion" fill={colors.accent.main} name="Avg Exertion" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </AnalyticsCard>

      {/* Matches */}
      {matchesData && (
        <AnalyticsCard title="Match & Selection Analytics" fullWidth>
          <div className="responsive-grid-2" style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr",
            gap: spacing.xl,
          }}>
            <div>
              <h4 style={{ ...typography.h4, marginBottom: spacing.md }}>Matches by Competition</h4>
              <ChartContainer height={250} isEmpty={matchesData.byCompetition?.length === 0}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={matchesData.byCompetition}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                    <XAxis dataKey="competition" stroke={colors.text.secondary} />
                    <YAxis stroke={colors.text.secondary} />
                    <Tooltip
                      contentStyle={{
                        background: colors.surface.main,
                        border: `1px solid ${colors.surface.card}`,
                        borderRadius: borderRadius.md,
                      }}
                    />
                    <Bar dataKey="matches" fill={colors.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div>
              <h4 style={{ ...typography.h4, marginBottom: spacing.md }}>Participation Distribution</h4>
              <ChartContainer height={250} isEmpty={!matchesData.participationDistribution}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(matchesData.participationDistribution || {}).map(([name, value]) => ({
                        name,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(matchesData.participationDistribution || {}).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </AnalyticsCard>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;

