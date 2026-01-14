import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { colors, typography, spacing } from "../../theme/design-tokens";

interface StudentImportData {
  name: string;
  phone?: string;
  centerName: string;
  subscriptionStatus?: string;
  monthlyFee?: number;
  startDate?: string;
  payments?: Array<{
    month: string;
    year: number;
    amount: number;
  }>;
  comments?: string;
}

const StudentBulkImportPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [error, setError] = useState("");

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  const parseCSV = (csv: string): StudentImportData[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row");
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Expected columns (flexible matching)
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const phoneIdx = headers.findIndex(h => h.includes('phone'));
    const centerIdx = headers.findIndex(h => h.includes('center') || h.includes('centre'));
    const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('subscription'));
    const monthlyIdx = headers.findIndex(h => h.includes('monthly'));
    const startDateIdx = headers.findIndex(h => h.includes('start') || h.includes('joining'));
    const commentsIdx = headers.findIndex(h => h.includes('comment'));

    // Find payment columns (April, May, June, etc.)
    const paymentColumns: Array<{ month: string; year: number; index: number }> = [];
    const monthMap: Record<string, number> = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4,
      'may': 5, 'june': 6, 'july': 7, 'august': 8,
      'september': 9, 'october': 10, 'november': 11, 'december': 12
    };

    headers.forEach((header, idx) => {
      const headerLower = header.toLowerCase().trim();
      for (const [monthName, monthNum] of Object.entries(monthMap)) {
        if (headerLower.includes(monthName)) {
          // Determine year based on month:
          // April (4) through December (12) = 2025
          // January (1) through March (3) = 2026
          let year = 2025;
          if (monthNum >= 1 && monthNum <= 3) {
            year = 2026; // Jan, Feb, Mar are 2026
          } else {
            year = 2025; // Apr through Dec are 2025
          }
          
          // Override if year is explicitly in header
          const yearMatch = header.match(/(20\d{2})/);
          if (yearMatch) {
            year = parseInt(yearMatch[1]);
          }
          
          paymentColumns.push({ month: monthName, year, index: idx });
          break;
        }
      }
    });

    const students: StudentImportData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length < headers.length) continue; // Skip incomplete rows

      const name = nameIdx >= 0 ? values[nameIdx] : '';
      if (!name) continue; // Skip rows without name

      const phone = phoneIdx >= 0 ? values[phoneIdx] : undefined;
      const centerName = centerIdx >= 0 ? values[centerIdx] : '';
      const subscriptionStatus = statusIdx >= 0 ? values[statusIdx] : undefined;
      const monthlyFee = monthlyIdx >= 0 ? parseFloat(values[monthlyIdx].replace(/[₹,]/g, '')) || undefined : undefined;
      const startDate = startDateIdx >= 0 ? values[startDateIdx] : undefined;
      const comments = commentsIdx >= 0 ? values[commentsIdx] : undefined;

      // Parse payments
      const payments: Array<{ month: string; year: number; amount: number }> = [];
      paymentColumns.forEach(({ month, year, index }) => {
        const value = values[index];
        if (value && value.trim() !== '') {
          const amount = parseFloat(value.replace(/[₹,]/g, ''));
          if (!isNaN(amount) && amount > 0) {
            payments.push({ month, year, amount });
          }
        }
      });

      students.push({
        name,
        phone,
        centerName,
        subscriptionStatus,
        monthlyFee,
        startDate,
        payments,
        comments
      });
    }

    return students;
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      setError("Please paste CSV data");
      return;
    }

    setIsImporting(true);
    setError("");
    setImportResults(null);

    try {
      const students = parseCSV(csvData);
      
      if (students.length === 0) {
        setError("No valid students found in CSV data");
        setIsImporting(false);
        return;
      }

      const result = await api.bulkImportStudents({ students });
      setImportResults(result);
      
      if (result.errors && result.errors.length > 0) {
        setError(`Imported ${result.imported} students, but ${result.failed} failed. Check results below.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to import students");
      console.error("Import error:", err);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadCredentials = () => {
    if (!importResults || !importResults.results) return;

    const csv = [
      ['Name', 'Email', 'Password', 'Center', 'Program Type', 'Payments Created'].join(','),
      ...importResults.results.map((r: any) => [
        r.student.name,
        r.student.email,
        r.student.password,
        r.student.centerId,
        r.student.programType,
        r.paymentsCreated
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-credentials-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.main
      className="rv-page rv-page--admin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        padding: spacing.xl,
        maxWidth: 1400,
        margin: '0 auto'
      }}
    >
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{
          ...typography.h1,
          color: colors.text.primary,
          marginBottom: spacing.md
        }}>
          Bulk Import Students
        </h1>
        <p style={{
          ...typography.body,
          color: colors.text.secondary,
          marginBottom: spacing.lg
        }}>
          Import student data from spreadsheet. Paste CSV data below with columns: Name, Phone, Present Center, Subscription Status, Monthly, Start Date, and payment columns (April, May, June, etc.)
        </p>
      </div>

      {error && (
        <div style={{
          padding: spacing.md,
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: 8,
          marginBottom: spacing.lg
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.lg
      }}>
        <label style={{
          display: 'block',
          ...typography.label,
          color: colors.text.secondary,
          marginBottom: spacing.sm
        }}>
          CSV Data (paste from spreadsheet)
        </label>
        <textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Paste CSV data here. Include header row with: Name, Phone, Present Center, Subscription Status, Monthly, Start Date, April, May, June, July, August, September, October, November, December, January, February, March, Comments"
          style={{
            width: '100%',
            minHeight: '300px',
            padding: spacing.md,
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: colors.text.primary,
            fontFamily: 'monospace',
            fontSize: 14,
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg }}>
        <button
          onClick={handleImport}
          disabled={isImporting || !csvData.trim()}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: isImporting ? '#666' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: isImporting ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: 16
          }}
        >
          {isImporting ? 'Importing...' : 'Import Students'}
        </button>
        <button
          onClick={() => navigate('/realverse/admin/students')}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: 'transparent',
            color: colors.text.secondary,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 16
          }}
        >
          Cancel
        </button>
      </div>

      {importResults && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 12,
          padding: spacing.lg,
          marginTop: spacing.lg
        }}>
          <h2 style={{
            ...typography.h2,
            color: colors.text.primary,
            marginBottom: spacing.md
          }}>
            Import Results
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.md,
            marginBottom: spacing.lg
          }}>
            <div style={{
              padding: spacing.md,
              background: 'rgba(40, 167, 69, 0.2)',
              borderRadius: 8,
              border: '1px solid rgba(40, 167, 69, 0.5)'
            }}>
              <div style={{ ...typography.caption, color: colors.text.muted }}>Imported</div>
              <div style={{ ...typography.h3, color: '#28a745' }}>{importResults.imported}</div>
            </div>
            {importResults.failed > 0 && (
              <div style={{
                padding: spacing.md,
                background: 'rgba(220, 53, 69, 0.2)',
                borderRadius: 8,
                border: '1px solid rgba(220, 53, 69, 0.5)'
              }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Failed</div>
                <div style={{ ...typography.h3, color: '#dc3545' }}>{importResults.failed}</div>
              </div>
            )}
          </div>

          {importResults.results && importResults.results.length > 0 && (
            <>
              <div style={{ marginBottom: spacing.md }}>
                <button
                  onClick={downloadCredentials}
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  Download Credentials CSV
                </button>
              </div>

              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      position: 'sticky',
                      top: 0
                    }}>
                      <th style={{ padding: spacing.sm, textAlign: 'left', ...typography.label }}>Name</th>
                      <th style={{ padding: spacing.sm, textAlign: 'left', ...typography.label }}>Email</th>
                      <th style={{ padding: spacing.sm, textAlign: 'left', ...typography.label }}>Password</th>
                      <th style={{ padding: spacing.sm, textAlign: 'left', ...typography.label }}>Program</th>
                      <th style={{ padding: spacing.sm, textAlign: 'left', ...typography.label }}>Payments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResults.results.map((result: any, idx: number) => (
                      <tr key={idx} style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <td style={{ padding: spacing.sm }}>{result.student.name}</td>
                        <td style={{ padding: spacing.sm, fontFamily: 'monospace', fontSize: 12 }}>
                          {result.student.email}
                        </td>
                        <td style={{ padding: spacing.sm, fontFamily: 'monospace', fontSize: 12 }}>
                          {result.student.password}
                        </td>
                        <td style={{ padding: spacing.sm }}>{result.student.programType}</td>
                        <td style={{ padding: spacing.sm }}>{result.paymentsCreated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {importResults.errors && importResults.errors.length > 0 && (
            <div style={{ marginTop: spacing.lg }}>
              <h3 style={{
                ...typography.h3,
                color: '#dc3545',
                marginBottom: spacing.sm
              }}>
                Errors ({importResults.errors.length})
              </h3>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'rgba(220, 53, 69, 0.1)',
                padding: spacing.md,
                borderRadius: 8
              }}>
                {importResults.errors.map((err: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: spacing.xs, fontSize: 14 }}>
                    <strong>{err.name}</strong>: {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.main>
  );
};

export default StudentBulkImportPage;
