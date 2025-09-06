import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
  FiPieChart,
  FiBarChart2,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
} from "react-icons/fi";
import { authenticatedFetch } from "./apiUtils";
import "./modern-ui.css";

// Types
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

type ComparisonData = {
  category: string;
  currentMonth: number;
  average: number;
  transactionCount: number;
  difference: number;
  percentageChange: number;
};

type MonthlyTrend = {
  month: string;
  total: number;
  transactions: number;
};

// Color palette for charts
const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#8b5a2b",
];

const Analytics: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<MonthlyReport | null>(null);
  const [previousMonth, setPreviousMonth] = useState<MonthlyReport | null>(
    null
  );
  const [comparison, setComparison] = useState<ComparisonData[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | "previous">(
    "current"
  );

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonthNum = currentDate.getMonth() + 1;

      const previousDate = new Date(currentYear, currentMonthNum - 2, 1);
      const previousYear = previousDate.getFullYear();
      const previousMonthNum = previousDate.getMonth() + 1;

      // Fetch current month data
      let currentData = null;
      try {
        const currentResponse = await authenticatedFetch(
          `http://localhost:3001/api/reports/summary?year=${currentYear}&month=${currentMonthNum}`
        );
        currentData = await currentResponse.json();
      } catch (error) {
        console.log("No current month data");
      }

      // Fetch previous month data
      let previousData = null;
      try {
        const previousResponse = await authenticatedFetch(
          `http://localhost:3001/api/reports/summary?year=${previousYear}&month=${previousMonthNum}`
        );
        previousData = await previousResponse.json();
      } catch (error) {
        console.log("No previous month data");
      }

      // Fetch comparison data
      let comparisonData = [];
      try {
        const comparisonResponse = await authenticatedFetch(
          `http://localhost:3001/api/reports/monthly-category-comparison?year=${currentYear}&month=${currentMonthNum}`
        );
        const comparisonResult = await comparisonResponse.json();
        comparisonData = comparisonResult.data || [];
      } catch (error) {
        console.log("No comparison data");
      }

      // Generate monthly trends (last 6 months)
      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonthNum - 1 - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthName = date.toLocaleDateString("en-US", { month: "short" });

        try {
          const response = await authenticatedFetch(
            `http://localhost:3001/api/reports/summary?year=${year}&month=${month}`
          );
          const data = await response.json();
          trends.push({
            month: monthName,
            total: data.overallTotal || 0,
            transactions:
              data.spendingByCategory.reduce(
                (sum: number, cat: CategorySpending) =>
                  sum + parseInt(cat.transaction_count),
                0
              ) || 0,
          });
        } catch (error) {
          trends.push({
            month: monthName,
            total: 0,
            transactions: 0,
          });
        }
      }

      setCurrentMonth(currentData);
      setPreviousMonth(previousData);
      setComparison(comparisonData);
      setMonthlyTrends(trends);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Prepare pie chart data
  const pieChartData =
    selectedPeriod === "current"
      ? currentMonth?.spendingByCategory.map((cat, index) => ({
          name: cat.category_name,
          value: parseFloat(cat.total_spent),
          color: COLORS[index % COLORS.length],
        })) || []
      : previousMonth?.spendingByCategory.map((cat, index) => ({
          name: cat.category_name,
          value: parseFloat(cat.total_spent),
          color: COLORS[index % COLORS.length],
        })) || [];

  // Prepare bar chart data for comparison
  const barChartData = comparison.slice(0, 8).map((item, index) => ({
    category:
      item.category.length > 10
        ? item.category.substring(0, 10) + "..."
        : item.category,
    current: item.currentMonth,
    average: item.average,
    difference: item.difference,
  }));

  // Custom label for pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.08) return null; // Hide labels for slices smaller than 8%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4; // Move labels further out
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#d2dae3"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="11"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalSpent > 0 ? (data.value / totalSpent) * 100 : 0;
      return (
        <div
          style={{
            background: "rgba(0, 0, 0, 0.9)",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            minWidth: "200px",
          }}
        >
          <p style={{ color: "#fff", margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: "600" }}>
            {data.name}
          </p>
          <p style={{ color: "#67e8f9", margin: "0 0 0.25rem", fontSize: "0.85rem" }}>
            Amount: ₹{data.value.toFixed(2)}
          </p>
          <p style={{ color: "#10b981", margin: "0", fontSize: "0.85rem" }}>
            Share: {percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <p style={{ color: "#fff", margin: 0, fontSize: "0.85rem" }}>
            <strong>{label}</strong>
          </p>
          <p style={{ color: "#10b981", margin: 0, fontSize: "0.8rem" }}>
            Current: ₹{payload[0]?.value?.toFixed(2)}
          </p>
          <p style={{ color: "#6366f1", margin: 0, fontSize: "0.8rem" }}>
            Average: ₹{payload[1]?.value?.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div
        className="card page-card"
        style={{ textAlign: "center", padding: "3rem" }}
      >
        <div style={{ color: "#9aa4b4", fontSize: "1.1rem" }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  const totalSpent =
    selectedPeriod === "current"
      ? currentMonth?.overallTotal || 0
      : previousMonth?.overallTotal || 0;

  const totalCategories =
    selectedPeriod === "current"
      ? currentMonth?.spendingByCategory.length || 0
      : previousMonth?.spendingByCategory.length || 0;

  const avgTransactionValue =
    pieChartData.length > 0
      ? totalSpent /
        pieChartData.reduce(
          (sum, cat) =>
            sum +
            parseInt(
              selectedPeriod === "current"
                ? currentMonth?.spendingByCategory.find(
                    (c) => c.category_name === cat.name
                  )?.transaction_count || "0"
                : previousMonth?.spendingByCategory.find(
                    (c) => c.category_name === cat.name
                  )?.transaction_count || "0"
            ),
          0
        )
      : 0;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1rem" }}>
      {/* Header */}
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
              className="page-heading"
              style={{ margin: "0 0 0.5rem", fontSize: "2rem" }}
            >
              Analytics Dashboard
            </h1>
            <p style={{ fontSize: "1rem", color: "#9aa4b4", margin: 0 }}>
              Comprehensive insights into your spending patterns and trends
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
              Period:
            </span>
            <button
              onClick={() => setSelectedPeriod("current")}
              style={{
                padding: "0.4rem 0.8rem",
                background:
                  selectedPeriod === "current"
                    ? "#10b981"
                    : "rgba(16, 185, 129, 0.2)",
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
                    ? "#10b981"
                    : "rgba(16, 185, 129, 0.2)",
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

      {/* Key Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
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
              Total Spending
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
            ₹{totalSpent.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#9aa4b4" }}>
            {selectedPeriod === "current" ? "This month" : "Previous month"}
          </div>
        </div>

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
              Categories
            </div>
            <FiPieChart style={{ color: "#6366f1", fontSize: "1.5rem" }} />
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            {totalCategories}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#9aa4b4" }}>
            Active categories
          </div>
        </div>

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
              Avg Transaction
            </div>
            <FiActivity style={{ color: "#f59e0b", fontSize: "1.5rem" }} />
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            ₹{avgTransactionValue.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#9aa4b4" }}>
            Per transaction
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Pie Chart - Category Distribution */}
        <div className="card">
          <h3
            style={{
              margin: "0 0 1.5rem",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FiPieChart style={{ color: "#6366f1" }} />
            Spending by Category
          </h3>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={60}
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '12px',
                    color: '#9aa4b4'
                  }}
                  formatter={(value: string) => {
                    // Truncate long category names in legend
                    return value.length > 15 ? value.substring(0, 15) + '...' : value;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{ textAlign: "center", padding: "3rem", color: "#9aa4b4" }}
            >
              <FiPieChart
                style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}
              />
              <p>No spending data available for this period</p>
            </div>
          )}
          
          {/* Category Breakdown Table */}
          {pieChartData.length > 0 && (
            <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
              <h4 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#d2dae3" }}>Category Breakdown</h4>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {pieChartData.map((item, index) => {
                  const percentage = totalSpent > 0 ? (item.value / totalSpent) * 100 : 0;
                  return (
                    <div key={index} style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      padding: "0.5rem",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "6px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                        <div style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: COLORS[index % COLORS.length]
                        }} />
                        <span style={{ fontSize: "0.85rem", color: "#d2dae3", wordBreak: "break-word" }}>
                          {item.name}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: "120px", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "0.8rem", color: "#9aa4b4" }}>
                          {percentage.toFixed(1)}%
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "#fff", fontWeight: "600" }}>
                          ₹{item.value.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Current vs Average */}
        <div className="card">
          <h3
            style={{
              margin: "0 0 1.5rem",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FiBarChart2 style={{ color: "#10b981" }} />
            Current vs Average Spending
          </h3>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#9aa4b4", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#9aa4b4", fontSize: 12 }} />
                <Tooltip content={<BarTooltip />} />
                <Legend />
                <Bar
                  dataKey="current"
                  name="Current Month"
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="average"
                  name="Historical Average"
                  fill="#6366f1"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{ textAlign: "center", padding: "3rem", color: "#9aa4b4" }}
            >
              <FiBarChart2
                style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}
              />
              <p>No comparison data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3
          style={{
            margin: "0 0 1.5rem",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FiTrendingUp style={{ color: "#ec4899" }} />
          6-Month Spending Trend
        </h3>
        {monthlyTrends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrends}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="month" tick={{ fill: "#9aa4b4", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9aa4b4", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#ec4899"
                fillOpacity={0.3}
                fill="url(#colorTotal)"
              />
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{ textAlign: "center", padding: "3rem", color: "#9aa4b4" }}
          >
            <FiTrendingUp
              style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}
            />
            <p>No trend data available</p>
          </div>
        )}
      </div>

      {/* Category Insights */}
      {comparison.length > 0 && (
        <div className="card">
          <h3
            style={{
              margin: "0 0 1.5rem",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FiActivity style={{ color: "#06b6d4" }} />
            Category Performance Analysis
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {comparison.slice(0, 6).map((item, index) => {
              const isIncrease = item.difference > 0;
              const isEqual = Math.abs(item.difference) < 1;

              return (
                <div
                  key={index}
                  style={{
                    padding: "1rem",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: "1rem", color: "#fff" }}>
                      {item.category}
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        color: isEqual
                          ? "#9aa4b4"
                          : isIncrease
                          ? "#f87171"
                          : "#34d399",
                        fontSize: "0.9rem",
                      }}
                    >
                      {isEqual ? (
                        <FiMinus />
                      ) : isIncrease ? (
                        <FiArrowUp />
                      ) : (
                        <FiArrowDown />
                      )}
                      {Math.abs(item.percentageChange).toFixed(1)}%
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", color: "#9aa4b4" }}>
                      Current:
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "#fff",
                        fontWeight: "600",
                      }}
                    >
                      ₹{item.currentMonth.toFixed(2)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", color: "#9aa4b4" }}>
                      Average:
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#c7d2fe" }}>
                      ₹{item.average.toFixed(2)}
                    </span>
                  </div>

                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "0.85rem", color: "#9aa4b4" }}>
                      Transactions:
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#fcd34d" }}>
                      {item.transactionCount}
                    </span>
                  </div>

                  {!isEqual && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.5rem",
                        background: isIncrease
                          ? "rgba(239, 68, 68, 0.1)"
                          : "rgba(34, 197, 94, 0.1)",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        color: isIncrease ? "#fca5a5" : "#86efac",
                      }}
                    >
                      {isIncrease
                        ? `₹${Math.abs(item.difference).toFixed(
                            2
                          )} more than usual`
                        : `₹${Math.abs(item.difference).toFixed(
                            2
                          )} saved vs average`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Insights */}
      <div className="card">
        <h3
          style={{
            margin: "0 0 1.5rem",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FiActivity style={{ color: "#f59e0b" }} />
          Key Insights & Recommendations
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* Spending Velocity */}
          {monthlyTrends.length >= 2 && (
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
                📈 Spending Velocity
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#9aa4b4",
                  lineHeight: "1.5",
                }}
              >
                {(() => {
                  const recent = monthlyTrends.slice(-2);
                  const change = recent[1].total - recent[0].total;
                  const isIncreasing = change > 0;
                  return isIncreasing
                    ? `Your spending increased by ₹${Math.abs(change).toFixed(
                        2
                      )} from last month. Consider reviewing your budget.`
                    : `Great! You reduced spending by ₹${Math.abs(
                        change
                      ).toFixed(2)} compared to last month.`;
                })()}
              </div>
            </div>
          )}

          {/* Top Category Alert */}
          {pieChartData.length > 0 && (
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
                🎯 Budget Focus
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#9aa4b4",
                  lineHeight: "1.5",
                }}
              >
                {(() => {
                  const topCategory = pieChartData[0];
                  const percentage = (topCategory.value / totalSpent) * 100;
                  return `${topCategory.name} accounts for ${percentage.toFixed(
                    1
                  )}% of your spending. ${
                    percentage > 40
                      ? "Consider diversifying your expenses."
                      : "Good balance across categories."
                  }`;
                })()}
              </div>
            </div>
          )}

          {/* Transaction Pattern */}
          {monthlyTrends.length > 0 && (
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
                💳 Transaction Patterns
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#9aa4b4",
                  lineHeight: "1.5",
                }}
              >
                {(() => {
                  const avgTransactions =
                    monthlyTrends.reduce(
                      (sum, month) => sum + month.transactions,
                      0
                    ) / monthlyTrends.length;
                  const lastMonth = monthlyTrends[monthlyTrends.length - 1];
                  return lastMonth.transactions > avgTransactions
                    ? `You made ${
                        lastMonth.transactions
                      } transactions last month, above your average of ${avgTransactions.toFixed(
                        0
                      )}. You're tracking expenses well!`
                    : `You made ${lastMonth.transactions} transactions last month. Consider tracking smaller expenses for better insights.`;
                })()}
              </div>
            </div>
          )}

          {/* Seasonal Trend */}
          {monthlyTrends.length >= 3 && (
            <div
              style={{
                padding: "1rem",
                background: "rgba(245, 158, 11, 0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#fcd34d",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                📊 Trend Analysis
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#9aa4b4",
                  lineHeight: "1.5",
                }}
              >
                {(() => {
                  const recent3Months = monthlyTrends.slice(-3);
                  const isUpTrend =
                    recent3Months[2].total > recent3Months[0].total;
                  const avgSpending =
                    recent3Months.reduce((sum, month) => sum + month.total, 0) /
                    3;
                  return isUpTrend
                    ? `Your spending trend is increasing over the last 3 months (avg: ₹${avgSpending.toFixed(
                        2
                      )}). Plan ahead for next month.`
                    : `Your spending is stable or decreasing (avg: ₹${avgSpending.toFixed(
                        2
                      )}). Keep up the good financial discipline!`;
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
