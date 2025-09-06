import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiBarChart2,
  FiPlus,
  FiFileText,
  FiPieChart,
  FiClock,
  FiArrowRight,
  FiActivity,
} from "react-icons/fi";
import { authenticatedFetch } from "./apiUtils";
import "./modern-ui.css";

// Types
type User = {
  id: string;
  name: string;
  role: string;
};

type CategorySpending = {
  category_id: number;
  category_name: string;
  total_spent: string;
  transaction_count: string;
  expenses: any[];
};

type MonthlyReport = {
  period: { year: number; month: number };
  overallTotal: number;
  spendingByCategory: CategorySpending[];
};

type DashboardStats = {
  currentMonth: MonthlyReport | null;
  previousMonth: MonthlyReport | null;
  totalExpenses: number;
  recentExpenses: any[];
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    currentMonth: null,
    previousMonth: null,
    totalExpenses: 0,
    recentExpenses: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | "previous">(
    "current"
  );
  const [greeting, setGreeting] = useState("");

  // Generate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Fetch user dashboard data
  const fetchDashboardData = async () => {
    try {
      // Get user info from dashboard endpoint
      const dashboardResponse = await authenticatedFetch(
        "http://localhost:3001/api/dashboard"
      );
      const dashboardData = await dashboardResponse.json();

      // Extract user info from token if available
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUser({
            id: payload.id,
            name:
              payload.name ||
              dashboardData.message.replace("Welcome ", "").replace("!", ""),
            role: payload.role,
          });
        } catch (e) {
          console.error("Error parsing token:", e);
          setUser({
            id: "unknown",
            name:
              dashboardData.message.replace("Welcome ", "").replace("!", "") ||
              "User",
            role: "user",
          });
        }
      }

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const previousDate = new Date(currentYear, currentMonth - 2, 1);
      const previousYear = previousDate.getFullYear();
      const previousMonth = previousDate.getMonth() + 1;

      // Fetch current month data
      let currentMonthData = null;
      try {
        const currentResponse = await authenticatedFetch(
          `http://localhost:3001/api/reports/summary?year=${currentYear}&month=${currentMonth}`
        );
        currentMonthData = await currentResponse.json();
      } catch (error) {
        console.log("No current month data available");
      }

      // Fetch previous month data
      let previousMonthData = null;
      try {
        const previousResponse = await authenticatedFetch(
          `http://localhost:3001/api/reports/summary?year=${previousYear}&month=${previousMonth}`
        );
        previousMonthData = await previousResponse.json();
      } catch (error) {
        console.log("No previous month data available");
      }

      // Fetch recent expenses
      let recentExpenses = [];
      let totalExpenses = 0;
      try {
        const expensesResponse = await authenticatedFetch(
          "http://localhost:3001/api/expenses?page=1&limit=5"
        );
        const expensesData = await expensesResponse.json();
        recentExpenses = expensesData.expenses || [];
        totalExpenses = expensesData.pagination?.totalItems || 0;
      } catch (error) {
        console.log("No expenses data available");
      }

      setStats({
        currentMonth: currentMonthData,
        previousMonth: previousMonthData,
        totalExpenses,
        recentExpenses,
      });

      setGreeting(getGreeting());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const currentData =
    selectedPeriod === "current" ? stats.currentMonth : stats.previousMonth;
  const otherData =
    selectedPeriod === "current" ? stats.previousMonth : stats.currentMonth;

  const calculateChange = () => {
    if (!currentData || !otherData) return null;
    const currentTotal = currentData.overallTotal;
    const otherTotal = otherData.overallTotal;
    const change = currentTotal - otherTotal;
    const percentChange = otherTotal > 0 ? (change / otherTotal) * 100 : 0;
    return { change, percentChange };
  };

  const change = calculateChange();

  if (loading) {
    return (
      <div
        className="card"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          textAlign: "center",
          padding: "3rem",
        }}
      >
        <div style={{ color: "#9aa4b4", fontSize: "1.1rem" }}>
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
      {/* Header Section */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2.2rem",
                margin: "0 0 .4rem",
                background: "linear-gradient(90deg,#fff,#c7d2fe 50%,#f0abfc)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {greeting}, {user?.name || "User"}!
            </h1>
            <p style={{ fontSize: "1rem", color: "#9aa4b4", margin: 0 }}>
              Here's your expense overview and quick insights
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                color: "#9aa4b4",
                marginRight: "0.5rem",
              }}
            >
              View:
            </span>
            <button
              onClick={() => setSelectedPeriod("current")}
              style={{
                padding: "0.4rem 0.8rem",
                background:
                  selectedPeriod === "current"
                    ? "#6366f1"
                    : "rgba(99, 102, 241, 0.2)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "500",
              }}
            >
              Current Month
            </button>
            <button
              onClick={() => setSelectedPeriod("previous")}
              style={{
                padding: "0.4rem 0.8rem",
                background:
                  selectedPeriod === "previous"
                    ? "#6366f1"
                    : "rgba(99, 102, 241, 0.2)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "500",
              }}
            >
              Previous Month
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Total Spending Card */}
        <div
          className="card"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#9aa4b4",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: "600",
              }}
            >
              {selectedPeriod === "current" ? "This Month" : "Previous Month"}{" "}
              Spending
            </div>
            <FiDollarSign style={{ color: "#10b981", fontSize: "1.5rem" }} />
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            ₹{currentData ? currentData.overallTotal.toFixed(2) : "0.00"}
          </div>
          {change && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                color: change.change >= 0 ? "#f87171" : "#10b981",
              }}
            >
              {change.change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              <span>
                {change.change >= 0 ? "+" : ""}₹
                {Math.abs(change.change).toFixed(2)}(
                {change.percentChange >= 0 ? "+" : ""}
                {change.percentChange.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Total Expenses Count */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#9aa4b4",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: "600",
              }}
            >
              Total Expenses
            </div>
            <FiFileText style={{ color: "#8b5cf6", fontSize: "1.5rem" }} />
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            {stats.totalExpenses}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#9aa4b4" }}>
            Recorded transactions
          </div>
        </div>

        {/* Categories Count */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#9aa4b4",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: "600",
              }}
            >
              Active Categories
            </div>
            <FiPieChart style={{ color: "#f59e0b", fontSize: "1.5rem" }} />
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            {currentData ? currentData.spendingByCategory.length : 0}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#9aa4b4" }}>
            Spending categories
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Category Breakdown */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
              Top Spending Categories
            </h3>
            <button
              onClick={() => navigate("/reports/monthly")}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#9aa4b4",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              View Details <FiArrowRight />
            </button>
          </div>

          {currentData && currentData.spendingByCategory.length > 0 ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {currentData.spendingByCategory
                .slice(0, 5)
                .map((category, index) => {
                  const percentage =
                    currentData.overallTotal > 0
                      ? (parseFloat(category.total_spent) /
                          currentData.overallTotal) *
                        100
                      : 0;

                  return (
                    <div
                      key={category.category_id}
                      style={{ marginBottom: "1rem" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "0.9rem", color: "#fff" }}>
                          {category.category_name}
                        </span>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: "#fff",
                              fontWeight: "600",
                            }}
                          >
                            ₹{parseFloat(category.total_spent).toFixed(2)}
                          </div>
                          <div
                            style={{ fontSize: "0.75rem", color: "#9aa4b4" }}
                          >
                            {category.transaction_count} transactions
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          background: "rgba(255,255,255,0.1)",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            background: `hsl(${220 + index * 30}, 70%, 60%)`,
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div
              style={{ textAlign: "center", color: "#9aa4b4", padding: "2rem" }}
            >
              <FiPieChart
                style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}
              />
              <p>No spending data available for this period</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ margin: "0 0 1.5rem", fontSize: "1.2rem" }}>
            Quick Actions
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <button
              onClick={() => navigate("/expenses/add")}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                border: "none",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "center",
              }}
            >
              <FiPlus /> Add New Expense
            </button>

            <button
              onClick={() => navigate("/expenses/manage")}
              style={{
                background: "rgba(99, 102, 241, 0.2)",
                color: "#c7d2fe",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "center",
              }}
            >
              <FiFileText /> Manage Expenses
            </button>

            <button
              onClick={() => navigate("/reports/calendar")}
              style={{
                background: "rgba(245, 158, 11, 0.2)",
                color: "#fcd34d",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "center",
              }}
            >
              <FiCalendar /> Calendar View
            </button>

            <button
              onClick={() => navigate("/reports")}
              style={{
                background: "rgba(139, 92, 246, 0.2)",
                color: "#c4b5fd",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "center",
              }}
            >
              <FiBarChart2 /> All Reports
            </button>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      {stats.recentExpenses.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Recent Expenses</h3>
            <button
              onClick={() => navigate("/expenses/manage")}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#9aa4b4",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              View All <FiArrowRight />
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {stats.recentExpenses.map((expense, index) => (
              <div
                key={expense.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: `hsl(${index * 60}, 70%, 60%)`,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#fff",
                        fontWeight: "500",
                      }}
                    >
                      {expense.productName}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9aa4b4" }}>
                      {expense.vendor} •{" "}
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#fff",
                      fontWeight: "600",
                    }}
                  >
                    ₹{expense.totalPrice}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#9aa4b4" }}>
                    {expense.quantity} × ₹{expense.unitPrice}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month-to-Month Comparison */}
      {change && stats.currentMonth && stats.previousMonth && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <FiTrendingUp style={{ color: "#06b6d4", fontSize: "1.2rem" }} />
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
              Month-to-Month Comparison
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                padding: "1rem",
                background: "rgba(16, 185, 129, 0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#34d399",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Current Month
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                  color: "#fff",
                  marginBottom: "0.25rem",
                }}
              >
                ₹{stats.currentMonth.overallTotal.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9aa4b4" }}>
                {stats.currentMonth.spendingByCategory.length} categories
              </div>
            </div>

            <div
              style={{
                padding: "1rem",
                background: "rgba(99, 102, 241, 0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(99, 102, 241, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#c7d2fe",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Previous Month
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                  color: "#fff",
                  marginBottom: "0.25rem",
                }}
              >
                ₹{stats.previousMonth.overallTotal.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9aa4b4" }}>
                {stats.previousMonth.spendingByCategory.length} categories
              </div>
            </div>

            <div
              style={{
                padding: "1rem",
                background:
                  change.change >= 0
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(34, 197, 94, 0.1)",
                borderRadius: "8px",
                border:
                  change.change >= 0
                    ? "1px solid rgba(239, 68, 68, 0.2)"
                    : "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: change.change >= 0 ? "#fca5a5" : "#86efac",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Change
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                  color: change.change >= 0 ? "#f87171" : "#22c55e",
                  marginBottom: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {change.change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {change.change >= 0 ? "+" : ""}₹{change.change.toFixed(2)}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: change.change >= 0 ? "#fca5a5" : "#86efac",
                }}
              >
                {change.percentChange >= 0 ? "+" : ""}
                {change.percentChange.toFixed(1)}% vs last month
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Insights and Tips */}
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <FiActivity style={{ color: "#06b6d4", fontSize: "1.2rem" }} />
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Smart Insights</h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* Spending Pattern Insight */}
          {currentData && currentData.spendingByCategory.length > 0 && (
            <div
              style={{
                padding: "1rem",
                background: "rgba(6, 182, 212, 0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(6, 182, 212, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#67e8f9",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                � Top Spending Category
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#9aa4b4",
                  lineHeight: "1.5",
                }}
              >
                You spent the most on{" "}
                <strong style={{ color: "#67e8f9" }}>
                  {currentData.spendingByCategory[0]?.category_name}
                </strong>{" "}
                this period with ₹
                {parseFloat(
                  currentData.spendingByCategory[0]?.total_spent || "0"
                ).toFixed(2)}
                .
              </div>
            </div>
          )}

          {/* Transaction Frequency */}
          {stats.recentExpenses.length > 0 && (
            <div
              style={{
                padding: "1rem",
                background: "rgba(139, 92, 246, 0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#c4b5fd",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                🎯 Recent Activity
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#9aa4b4",
                  lineHeight: "1.5",
                }}
              >
                Your last expense was{" "}
                <strong style={{ color: "#c4b5fd" }}>
                  {stats.recentExpenses[0]?.productName}
                </strong>{" "}
                for ₹{stats.recentExpenses[0]?.totalPrice}
                on{" "}
                {new Date(stats.recentExpenses[0]?.date).toLocaleDateString()}.
              </div>
            </div>
          )}

          {/* Monthly Progress */}
          {change && (
            <div
              style={{
                padding: "1rem",
                background:
                  change.change >= 0
                    ? "rgba(245, 158, 11, 0.1)"
                    : "rgba(34, 197, 94, 0.1)",
                borderRadius: "8px",
                border:
                  change.change >= 0
                    ? "1px solid rgba(245, 158, 11, 0.2)"
                    : "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: change.change >= 0 ? "#fcd34d" : "#86efac",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                {change.change >= 0 ? "💰 Spending Alert" : "✅ Good Progress"}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#9aa4b4",
                  lineHeight: "1.5",
                }}
              >
                {change.change >= 0
                  ? `You've spent ₹${Math.abs(change.change).toFixed(
                      2
                    )} more than last month. Consider reviewing your budget.`
                  : `Great job! You've saved ₹${Math.abs(change.change).toFixed(
                      2
                    )} compared to last month.`}
              </div>
            </div>
          )}

          {/* General Tip */}
          <div
            style={{
              padding: "1rem",
              background: "rgba(99, 102, 241, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(99, 102, 241, 0.2)",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#c7d2fe",
                fontWeight: "600",
                marginBottom: "0.5rem",
              }}
            >
              💡 Pro Tip
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#9aa4b4",
                lineHeight: "1.5",
              }}
            >
              Use the calendar view to identify spending patterns and the
              prediction reports to forecast future expenses.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
