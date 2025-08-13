// Replace all code in ReportMonthly.tsx with this:

import React, { useState } from "react";

// --- Type Definitions (no changes here) ---
type ExpenseDetail = {
  expense_id: number;
  expense_date: string;
  product_name: string;
  total: string;
};

type CategorySpending = {
  category_id: number;
  category_name: string;
  total_spent: string;
  transaction_count: string;
  expenses: ExpenseDetail[];
};

type Report = {
  period: { year: number; month: number };
  overallTotal: number;
  spendingByCategory: CategorySpending[];
};

const ReportMonthly: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setReport(null);
    setExpandedCategoryId(null);

    try {
      const url = `http://localhost:3001/api/reports/summary?year=${selectedYear}&month=${selectedMonth}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch report. There might be no data for the selected period.");
      }
      const data: Report = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCategory = (categoryId: number) => {
    setExpandedCategoryId(prevId => prevId === categoryId ? null : categoryId);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, name: "January" }, { value: 2, name: "February" },
    { value: 3, name: "March" }, { value: 4, name: "April" },
    { value: 5, name: "May" }, { value: 6, name: "June" },
    { value: 7, name: "July" }, { value: 8, name: "August" },
    { value: 9, name: "September" }, { value: 10, name: "October" },
    { value: 11, name: "November" }, { value: 12, name: "December" },
  ];

  return (
    <div style={pageStyle}>
      <h2>Monthly Expense Report</h2>
      
      <form onSubmit={handleGenerateReport} style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', margin: '2rem 0' }}>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
          {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Report"}
        </button>
      </form>

      {isLoading && <div>Generating your report...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      {report && (
        <>
          <div style={{ fontSize: '1.75rem', margin: '1rem 0', padding: '1.5rem', background: '#f0f4fa', borderRadius: 8 }}>
            {/* --- CHANGE 1: Changed $ to ₹ --- */}
            <strong>Total Spent: ₹{report.overallTotal.toFixed(2)}</strong>
          </div>
          <h3>Breakdown by Category</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ background: '#eee', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '0.5rem' }}>Transactions</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {report.spendingByCategory.map((cat) => (
                <React.Fragment key={cat.category_id}>
                  <tr onClick={() => handleToggleCategory(cat.category_id)} style={{ cursor: 'pointer', background: expandedCategoryId === cat.category_id ? '#e9f5ff' : 'transparent' }}>
                    <td style={{ padding: '0.5rem', textAlign: 'left' }}>{expandedCategoryId === cat.category_id ? '▼' : '►'} {cat.category_name}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>{cat.transaction_count}</td>
                    {/* --- CHANGE 2: Changed $ to ₹ --- */}
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{parseFloat(cat.total_spent).toFixed(2)}</td>
                  </tr>
                  
                  {expandedCategoryId === cat.category_id && (
                    <tr>
                      <td colSpan={3} style={{ padding: '0 1rem 1rem 1rem', background: '#f8f9fa' }}>
                        <table style={{ width: '100%', marginTop: '0.5rem' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Date</th>
                              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Product</th>
                              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.expenses.map(item => (
                              <tr key={item.expense_id} style={{ borderTop: '1px solid #eee' }}>
                                <td style={{ padding: '0.25rem 0.5rem', textAlign: 'left' }}>{new Date(item.expense_date).toLocaleDateString()}</td>
                                <td style={{ padding: '0.25rem 0.5rem', textAlign: 'left' }}>{item.product_name}</td>
                                {/* --- CHANGE 3: Changed $ to ₹ --- */}
                                <td style={{ padding: '0.25rem 0.5rem', textAlign: 'right' }}>₹{parseFloat(item.total).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  maxWidth: 800,
  margin: "2rem auto",
  background: "#fff",
  padding: "2rem",
  borderRadius: 8,
  boxShadow: "0 0 10px rgba(0,0,0,0.07)",
};

export default ReportMonthly;
