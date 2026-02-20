import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

const CenterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const result = await api.getCenter(Number(id));
      setData(result);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) return <p style={{ color: "#e74c3c" }}>Error: {error}</p>;
  if (!data) return <p>Loading...</p>;

  const { center, students, stats } = data;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/admin"
          style={{
            color: "#667eea",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600
          }}
        >
          ← Back to Admin
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{center.name}</h1>
          <p style={{ color: "#666", margin: 0 }}>
            {center.location}, {center.city}
          </p>
        </div>
        <button
          onClick={loadData}
          style={{
            padding: "12px 24px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Total Collected</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>₹{stats.totalCollected.toLocaleString()}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>{stats.totalPayments} payments</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Monthly Revenue</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>₹{stats.monthlyRevenuePotential.toLocaleString()}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>Potential</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Total Students</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.totalStudents}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
            {stats.activeStudents} Active
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Trial Students</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.trialStudents}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
            {stats.inactiveStudents} Inactive
          </div>
        </div>
      </div>

      {/* Center Info */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📍 Center Information</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <span style={{ fontWeight: 600, color: "#666" }}>Name:</span>{" "}
            <span>{center.name}</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, color: "#666" }}>Location:</span>{" "}
            <span>{center.location}</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, color: "#666" }}>City:</span>{" "}
            <span>{center.city}</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, color: "#666" }}>Address:</span>{" "}
            <span>{center.address || "Not provided"}</span>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          👥 Students ({students.length})
        </h2>
        
        {students.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", padding: 32 }}>
            No students in this center yet
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Name</th>
                <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Programme</th>
                <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Status</th>
                <th style={{ padding: 16, textAlign: "right", fontWeight: 600 }}>Monthly Fee</th>
                <th style={{ padding: 16, textAlign: "center", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any) => (
                <tr key={student.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: 16, fontWeight: 600 }}>{student.fullName}</td>
                  <td style={{ padding: 16 }}>{student.programType || "-"}</td>
                  <td style={{ padding: 16 }}>
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
                  <td style={{ padding: 16, textAlign: "right", fontWeight: 600 }}>
                    ₹{student.monthlyFeeAmount.toLocaleString()}
                  </td>
                  <td style={{ padding: 16, textAlign: "center" }}>
                    <Link
                      to={`/students/${student.id}`}
                      style={{
                        padding: "6px 16px",
                        background: "#667eea",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CenterDetailPage;


