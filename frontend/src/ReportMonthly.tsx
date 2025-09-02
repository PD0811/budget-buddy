// Replace all code in ReportMonthly.tsx with this:

import React, { useState } from "react";
import "./modern-ui.css";

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
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
    null
  );

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
        throw new Error(
          "Failed to fetch report. There might be no data for the selected period."
        );
      }
      const data: Report = await response.json();
      setReport(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCategory = (categoryId: number) => {
    setExpandedCategoryId((prevId) =>
      prevId === categoryId ? null : categoryId
    );
  };

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  return (
    <div className="card page-card" style={{ maxWidth: 920 }}>
      <h2 className="page-heading" style={{ fontSize: "1.55rem" }}>
        Monthly Expense Report
      </h2>
      <form
        onSubmit={handleGenerateReport}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: ".9rem",
          alignItems: "flex-end",
          margin: "1.2rem 0 1.8rem",
        }}
      >
        <label>
          Month
          <br />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <br />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <div style={{ alignSelf: "flex-end", paddingBottom: ".2rem" }}>
          <button
            type="submit"
            className="bb-btn"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </form>
      {isLoading && (
        <div style={{ color: "#8b96a5", fontSize: ".85rem" }}>
          Generating your report...
        </div>
      )}
      {error && (
        <div
          style={{ color: "#f87171", fontSize: ".8rem", marginTop: ".4rem" }}
        >
          Error: {error}
        </div>
      )}
      {report && (
        <>
          <div
            style={{
              fontSize: "1rem",
              margin: "0 0 1.2rem",
              padding: "1.2rem 1.3rem",
              background: "linear-gradient(90deg,#1f2733,#1a202c)",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span
              style={{
                fontSize: ".65rem",
                letterSpacing: ".6px",
                textTransform: "uppercase",
                color: "#8b96a5",
                fontWeight: 600,
              }}
            >
              Total Spent
            </span>
            <strong
              style={{
                fontSize: "1.9rem",
                background: "linear-gradient(90deg,#fff,#c7d2fe 60%,#f0abfc)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              ₹{report.overallTotal.toFixed(2)}
            </strong>
          </div>
          <h3
            style={{
              fontSize: "1.05rem",
              letterSpacing: 0.3,
              margin: "0 0 .8rem",
            }}
          >
            Breakdown by Category
          </h3>
          <table className="table-modern" style={{ marginTop: ".4rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Category</th>
                <th>Transactions</th>
                <th style={{ textAlign: "right" }}>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {report.spendingByCategory.map((cat) => (
                <React.Fragment key={cat.category_id}>
                  <tr
                    onClick={() => handleToggleCategory(cat.category_id)}
                    style={{
                      cursor: "pointer",
                      background:
                        expandedCategoryId === cat.category_id
                          ? "rgba(255,255,255,.04)"
                          : "transparent",
                    }}
                  >
                    <td style={{ textAlign: "left" }}>
                      {expandedCategoryId === cat.category_id ? "▼" : "►"}{" "}
                      {cat.category_name}
                    </td>
                    <td>{cat.transaction_count}</td>
                    <td style={{ textAlign: "right" }}>
                      ₹{parseFloat(cat.total_spent).toFixed(2)}
                    </td>
                  </tr>
                  {expandedCategoryId === cat.category_id && (
                    <tr>
                      <td
                        colSpan={3}
                        style={{ padding: 0, background: "#1b222b" }}
                      >
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <thead>
                            <tr style={{ background: "rgba(255,255,255,.03)" }}>
                              <th
                                style={{
                                  padding: ".45rem .6rem",
                                  textAlign: "left",
                                  fontSize: ".6rem",
                                  letterSpacing: ".5px",
                                  textTransform: "uppercase",
                                  color: "#8b96a5",
                                }}
                              >
                                Date
                              </th>
                              <th
                                style={{
                                  padding: ".45rem .6rem",
                                  textAlign: "left",
                                  fontSize: ".6rem",
                                  letterSpacing: ".5px",
                                  textTransform: "uppercase",
                                  color: "#8b96a5",
                                }}
                              >
                                Product
                              </th>
                              <th
                                style={{
                                  padding: ".45rem .6rem",
                                  textAlign: "right",
                                  fontSize: ".6rem",
                                  letterSpacing: ".5px",
                                  textTransform: "uppercase",
                                  color: "#8b96a5",
                                }}
                              >
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.expenses.map((item) => (
                              <tr
                                key={item.expense_id}
                                style={{
                                  borderTop: "1px solid rgba(255,255,255,.06)",
                                }}
                              >
                                <td
                                  style={{
                                    padding: ".4rem .65rem",
                                    textAlign: "left",
                                    fontSize: ".75rem",
                                  }}
                                >
                                  {new Date(
                                    item.expense_date
                                  ).toLocaleDateString()}
                                </td>
                                <td
                                  style={{
                                    padding: ".4rem .65rem",
                                    textAlign: "left",
                                    fontSize: ".75rem",
                                  }}
                                >
                                  {item.product_name}
                                </td>
                                <td
                                  style={{
                                    padding: ".4rem .65rem",
                                    textAlign: "right",
                                    fontSize: ".75rem",
                                  }}
                                >
                                  ₹{parseFloat(item.total).toFixed(2)}
                                </td>
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
export default ReportMonthly;
