import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    api
      .getStudents(q)
      .then(setStudents)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "#27ae60";
      case "INACTIVE": return "#95a5a6";
      case "TRIAL": return "#f39c12";
      default: return "#333";
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Students</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: 24, display: "flex", gap: 12 }}>
        <input
          placeholder="Search by name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "2px solid #e0e0e0",
            borderRadius: 8,
            fontSize: 14,
            outline: "none"
          }}
        />
        <button type="submit" style={{
          padding: "12px 24px",
          background: "#667eea",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer"
        }}>
          Search
        </button>
      </form>
      {error && <p style={{ color: "#e74c3c", marginBottom: 16 }}>{error}</p>}
      <div style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
              <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Name</th>
              <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Program</th>
              <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>Status</th>
              <th style={{ padding: 16, textAlign: "right", fontWeight: 600 }}>Monthly Fee</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 16 }}>
                  <Link to={`/students/${s.id}`} style={{
                    color: "#667eea",
                    textDecoration: "none",
                    fontWeight: 600
                  }}>
                    {s.fullName}
                  </Link>
                </td>
                <td style={{ padding: 16 }}>{s.programType || "-"}</td>
                <td style={{ padding: 16 }}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: getStatusColor(s.status) + "20",
                    color: getStatusColor(s.status)
                  }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: 16, textAlign: "right", fontWeight: 600 }}>₹ {s.monthlyFeeAmount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "#999" }}>
            No students found
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;


