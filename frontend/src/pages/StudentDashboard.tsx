import React, { useEffect, useState } from "react";
import { api } from "../api/client";

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getStudentDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: "#e74c3c" }}>Error: {error}</p>;
  if (!data) return <p>Loading...</p>;

  const { student, payments, summary } = data;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/photo3.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24,
        backdropFilter: "blur(10px)"
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: "#1E40AF" }}>
          Welcome to FCRB, {student.fullName}!
        </h1>
        <p style={{ color: "#666", fontSize: 16 }}>{student.center.name} - {student.programType}</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 24 }}>
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Monthly Fee</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#3498db" }}>₹ {student.monthlyFeeAmount.toLocaleString()}</div>
        </div>

        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Total Paid</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#27ae60" }}>₹ {summary.totalPaid.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>{summary.paymentCount} payments</div>
        </div>

        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Total Due</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f39c12" }}>₹ {summary.totalDue.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>{summary.monthsSinceJoining} months</div>
        </div>

        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Outstanding</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: summary.outstanding > 0 ? "#e74c3c" : "#27ae60" }}>
            ₹ {Math.abs(summary.outstanding).toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
            {summary.outstanding > 0 ? "Due" : summary.outstanding < 0 ? "Advance" : "Paid"}
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div style={{
        background: "white",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Your Information</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{student.email || "-"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Phone</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{student.phoneNumber || "-"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Date of Birth</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "-"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Joining Date</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {student.joiningDate ? new Date(student.joiningDate).toLocaleDateString() : "-"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Status</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              <span style={{
                padding: "4px 12px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                background: student.status === "ACTIVE" ? "#27ae6020" : student.status === "TRIAL" ? "#f39c1220" : "#95a5a620",
                color: student.status === "ACTIVE" ? "#27ae60" : student.status === "TRIAL" ? "#f39c12" : "#95a5a6"
              }}>
                {student.status}
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Center</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{student.center.name}</div>
            <div style={{ fontSize: 12, color: "#999" }}>{student.center.city}</div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div style={{
        background: "white",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Payment History</h2>
        {summary.lastPaymentDate && (
          <p style={{ color: "#666", marginBottom: 16 }}>
            Last payment: {new Date(summary.lastPaymentDate).toLocaleDateString()}
          </p>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Date</th>
                <th style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>Amount</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Mode</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Reference</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: 12 }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td style={{ padding: 12, textAlign: "right", fontWeight: 600, color: "#27ae60" }}>
                    ₹ {p.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: 12 }}>{p.paymentMode}</td>
                  <td style={{ padding: 12, fontSize: 14, color: "#666" }}>{p.upiOrTxnReference || "-"}</td>
                  <td style={{ padding: 12, fontSize: 14, color: "#666" }}>{p.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "#999" }}>
              No payments yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;


