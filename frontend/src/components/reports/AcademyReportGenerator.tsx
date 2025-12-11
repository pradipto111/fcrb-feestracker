import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { colors, typography, spacing } from "../../theme/design-tokens";

interface AcademyReportData {
  dateRange: string;
  summary: any;
  attendanceData: any[];
  pipeline: any;
  financeData: any;
  matchesData: any;
  generatedAt: string;
}

interface AcademyReportGeneratorProps {
  data: AcademyReportData;
  onGenerate: () => Promise<void>;
}

export const AcademyReportGenerator: React.FC<AcademyReportGeneratorProps> = ({
  data,
  onGenerate,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    try {
      if (!reportRef.current) {
        throw new Error("Report content not found");
      }

      // Show loading state
      const loadingMsg = document.createElement("div");
      loadingMsg.textContent = "Generating PDF...";
      loadingMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${colors.surface.main};
        padding: ${spacing.xl};
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(loadingMsg);

      // Generate canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Remove loading message
      document.body.removeChild(loadingMsg);

      // Create PDF
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

      // Save PDF
      pdf.save(`FC-Real-Bengaluru-Academy-Report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  return (
    <>
      <div ref={reportRef} style={{ display: "none" }}>
        <AcademyReportContent data={data} />
      </div>
      <button onClick={handleDownloadPDF}>Generate PDF</button>
    </>
  );
};

const AcademyReportContent: React.FC<{ data: AcademyReportData }> = ({ data }) => {
  return (
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
              {`${data.summary?.avgAttendance || 0}%`}
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
              {`${data.summary?.feeCollectionRate || 0}%`}
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
          rate is {`${data.summary?.avgAttendance || 0}%`}.
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
};

export default AcademyReportGenerator;

