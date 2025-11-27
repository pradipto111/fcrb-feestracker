import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";

const StudentDetailPage: React.FC = () => {
  const { id } = useParams();
  const studentId = Number(id);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [upiRef, setUpiRef] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .getStudent(studentId)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.createPayment({
        studentId,
        amount: Number(amount),
        paymentMode,
        upiOrTxnReference: upiRef,
        notes
      });
      setAmount("");
      setUpiRef("");
      setNotes("");
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !data) return <p style={{ color: "#e74c3c" }}>Error: {error}</p>;
  if (!data) return <p>Loading...</p>;

  const { student, payments, totalPaid, outstanding } = data;

  return (
    <div>
      <div style={{
        background: "white",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>{student.fullName}</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Program</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{student.programType || "-"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Monthly Fee</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>₹ {student.monthlyFeeAmount.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Status</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{student.status}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Phone</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{student.phoneNumber || "-"}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 }}>
          <div style={{ padding: 16, background: "#e8f5e9", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Total Paid</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#27ae60" }}>₹ {totalPaid.toLocaleString()}</div>
          </div>
          <div style={{ padding: 16, background: "#ffebee", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Outstanding</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#e74c3c" }}>₹ {outstanding.toLocaleString()}</div>
          </div>
          <div style={{ padding: 16, background: "#e3f2fd", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Payments Made</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#3498db" }}>{payments.length}</div>
          </div>
        </div>
      </div>

      <div style={{
        background: "white",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Add Payment</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Amount (₹)</label>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                outline: "none"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Payment Mode</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} style={{
              width: "100%",
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: 8,
              fontSize: 14,
              outline: "none"
            }}>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>UPI ID / Txn Ref</label>
            <input
              placeholder="Optional"
              value={upiRef}
              onChange={(e) => setUpiRef(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                outline: "none"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Notes</label>
            <input
              placeholder="Optional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                outline: "none"
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="submit" disabled={submitting} style={{
              width: "100%",
              padding: "12px 24px",
              background: submitting ? "#ccc" : "#27ae60",
              color: submitting ? "#666" : "#000",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer"
            }}>
              {submitting ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </form>
        {error && <p style={{ color: "#e74c3c", marginTop: 16 }}>{error}</p>}
      </div>

      <div style={{
        background: "white",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Payment History</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Date</th>
                <th style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>Amount</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Mode</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>UPI / Ref</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: 12 }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>₹ {p.amount.toLocaleString()}</td>
                  <td style={{ padding: 12 }}>{p.paymentMode}</td>
                  <td style={{ padding: 12 }}>{p.upiOrTxnReference || "-"}</td>
                  <td style={{ padding: 12 }}>{p.notes || "-"}</td>
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

export default StudentDetailPage;


