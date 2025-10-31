import React, { useState, useEffect } from "react";
import { API_BASE_URL, getAuthHeaders } from "./apiUtils";
import {
  FiTrendingDown,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiMapPin,
  FiShoppingBag,
  FiDollarSign,
  FiUsers,
} from "react-icons/fi";
import "./modern-ui.css";

type PriceComparison = {
  product_name: string;
  brand: string;
  my_purchase: {
    vendor: string;
    unit_price: number;
    purchase_date: string;
  };
  cheapest_option: {
    vendor: string;
    min_unit_price: number;
    avg_unit_price: number;
    purchase_count: number;
    last_seen: string;
  };
  savings: {
    amount: number;
    percentage: number;
    is_best_deal: boolean;
  };
  alternative_vendors: Array<{
    vendor: string;
    min_unit_price: number;
    avg_unit_price: number;
    purchase_count: number;
  }>;
};

type PriceComparisonResponse = {
  pincode: string;
  analysis_period_days: number;
  total_products_analyzed: number;
  summary: {
    items_at_best_price: number;
    items_with_cheaper_options: number;
    total_potential_savings: number;
  };
  comparisons: PriceComparison[];
};

const PriceComparison: React.FC = () => {
  const [data, setData] = useState<PriceComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const fetchPriceComparison = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/price-comparison?days=${days}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch price comparison");
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error("Error fetching price comparison:", err);
      setError(err.message || "An error occurred while fetching price comparison");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceComparison();
  }, []);

  const handleRefresh = () => {
    fetchPriceComparison();
  };

  if (loading) {
    return (
      <div className="card page-card" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ color: "#9aa4b4", fontSize: "1.1rem" }}>
          Analyzing local prices...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card page-card">
        <h2 className="page-heading">Local Price Comparison</h2>
        <div
          style={{
            color: "#f87171",
            fontSize: "0.95rem",
            padding: "1.5rem",
            background: "rgba(248, 113, 113, 0.1)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}
        >
          <FiAlertCircle size={24} style={{ flexShrink: 0, marginTop: "0.25rem" }} />
          <div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Unable to load price comparison:</strong>
            </div>
            <div style={{ marginBottom: "1rem" }}>{error}</div>
            {error.includes("pincode") && (
              <div style={{ fontSize: "0.85rem", color: "#fca5a5", lineHeight: "1.5" }}>
                💡 <strong>Tip:</strong> Your location is automatically collected when you log in.
                The pincode is derived from your GPS coordinates. Please try logging out and logging in again
                to refresh your location data.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
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
              Local Price Comparison
            </h1>
            <p style={{ fontSize: "1rem", color: "#9aa4b4", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiMapPin />
              Comparing prices with users in pincode: <strong>{data.pincode}</strong>
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: "0.85rem",
              }}
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={handleRefresh}
              className="bb-btn"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
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
              Products Analyzed
            </div>
            <FiShoppingBag style={{ color: "#6366f1", fontSize: "1.5rem" }} />
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            {data.total_products_analyzed}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#9aa4b4" }}>
            From last {data.analysis_period_days} days
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
              Best Deals
            </div>
            <FiCheckCircle style={{ color: "#10b981", fontSize: "1.5rem" }} />
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            {data.summary.items_at_best_price}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#9aa4b4" }}>
            Already at best price
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
              Potential Savings
            </div>
            <FiDollarSign style={{ color: "#f59e0b", fontSize: "1.5rem" }} />
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            ₹{data.summary.total_potential_savings.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#9aa4b4" }}>
            On {data.summary.items_with_cheaper_options} items
          </div>
        </div>
      </div>

      {/* Price Comparisons */}
      {data.comparisons.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <FiShoppingBag
            style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3, color: "#9aa4b4" }}
          />
          <p style={{ color: "#9aa4b4", fontSize: "1rem" }}>
            No purchases found in the last {data.analysis_period_days} days
          </p>
        </div>
      ) : (
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
            <FiUsers style={{ color: "#06b6d4" }} />
            Price Analysis by Product
          </h3>

          <div style={{ display: "grid", gap: "1rem" }}>
            {data.comparisons.map((comparison, index) => {
              const isExpanded = expandedProduct === comparison.product_name;
              const isBestDeal = comparison.savings.is_best_deal;
              const canSave = comparison.savings.amount > 0;

              return (
                <div
                  key={index}
                  style={{
                    padding: "1rem",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                    border: isBestDeal
                      ? "1px solid rgba(16, 185, 129, 0.3)"
                      : canSave
                      ? "1px solid rgba(245, 158, 11, 0.3)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setExpandedProduct(isExpanded ? null : comparison.product_name)
                    }
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {isBestDeal ? (
                          <FiCheckCircle style={{ color: "#10b981", fontSize: "1.25rem" }} />
                        ) : canSave ? (
                          <FiTrendingDown style={{ color: "#f59e0b", fontSize: "1.25rem" }} />
                        ) : (
                          <FiTrendingUp style={{ color: "#6366f1", fontSize: "1.25rem" }} />
                        )}
                        <div>
                          <h4 style={{ margin: 0, fontSize: "1rem", color: "#fff" }}>
                            {comparison.product_name}
                          </h4>
                          <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#9aa4b4" }}>
                            Brand: {comparison.brand}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: "1rem",
                          marginTop: "0.75rem",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#9aa4b4", marginBottom: "0.25rem" }}>
                            Your Price
                          </div>
                          <div style={{ fontSize: "0.95rem", color: "#fff", fontWeight: "600" }}>
                            ₹{comparison.my_purchase.unit_price.toFixed(2)}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#9aa4b4" }}>
                            at {comparison.my_purchase.vendor}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#9aa4b4", marginBottom: "0.25rem" }}>
                            Best Local Price
                          </div>
                          <div style={{ fontSize: "0.95rem", color: "#10b981", fontWeight: "600" }}>
                            ₹{comparison.cheapest_option.min_unit_price.toFixed(2)}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#9aa4b4" }}>
                            at {comparison.cheapest_option.vendor}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#9aa4b4", marginBottom: "0.25rem" }}>
                            {isBestDeal ? "Status" : "Potential Savings"}
                          </div>
                          {isBestDeal ? (
                            <div style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: "600" }}>
                              ✓ Best Deal
                            </div>
                          ) : (
                            <>
                              <div style={{ fontSize: "0.95rem", color: "#f59e0b", fontWeight: "600" }}>
                                ₹{comparison.savings.amount.toFixed(2)}
                              </div>
                              <div style={{ fontSize: "0.7rem", color: "#f59e0b" }}>
                                ({comparison.savings.percentage.toFixed(1)}% cheaper)
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginLeft: "1rem", fontSize: "1.5rem", color: "#9aa4b4" }}>
                      {isExpanded ? "▼" : "▶"}
                    </div>
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: "1rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div style={{ marginBottom: "1rem" }}>
                        <h5 style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#d2dae3" }}>
                          Best Vendor Details
                        </h5>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                            gap: "0.75rem",
                            padding: "0.75rem",
                            background: "rgba(16, 185, 129, 0.1)",
                            borderRadius: "6px",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "#9aa4b4" }}>Vendor</div>
                            <div style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: "600" }}>
                              {comparison.cheapest_option.vendor}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "#9aa4b4" }}>Avg Price</div>
                            <div style={{ fontSize: "0.85rem", color: "#fff" }}>
                              ₹{comparison.cheapest_option.avg_unit_price.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "#9aa4b4" }}>Purchases</div>
                            <div style={{ fontSize: "0.85rem", color: "#fff" }}>
                              {comparison.cheapest_option.purchase_count}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "#9aa4b4" }}>Last Seen</div>
                            <div style={{ fontSize: "0.85rem", color: "#fff" }}>
                              {new Date(comparison.cheapest_option.last_seen).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {comparison.alternative_vendors.length > 0 && (
                        <div>
                          <h5 style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#d2dae3" }}>
                            Alternative Vendors
                          </h5>
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            {comparison.alternative_vendors.map((vendor, vIndex) => (
                              <div
                                key={vIndex}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  padding: "0.5rem",
                                  background: "rgba(255,255,255,0.05)",
                                  borderRadius: "4px",
                                  fontSize: "0.8rem",
                                }}
                              >
                                <span style={{ color: "#d2dae3" }}>{vendor.vendor}</span>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                  <span style={{ color: "#9aa4b4" }}>
                                    Min: ₹{vendor.min_unit_price.toFixed(2)}
                                  </span>
                                  <span style={{ color: "#9aa4b4" }}>
                                    Avg: ₹{vendor.avg_unit_price.toFixed(2)}
                                  </span>
                                  <span style={{ color: "#9aa4b4" }}>
                                    ({vendor.purchase_count} purchases)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div
        className="card"
        style={{
          marginTop: "1.5rem",
          background: "rgba(6, 182, 212, 0.1)",
          border: "1px solid rgba(6, 182, 212, 0.2)",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <FiUsers style={{ color: "#06b6d4", fontSize: "1.5rem", flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", color: "#67e8f9" }}>
              How This Works
            </h4>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", color: "#9aa4b4", lineHeight: "1.6" }}>
              We compare your recent purchases with other users in your pincode ({data.pincode}) to help you find
              the best local deals. Prices are based on actual purchases made by users in your area within the
              selected time period. Save money by shopping at vendors offering the lowest prices!
            </p>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#67e8f9", lineHeight: "1.5" }}>
              📍 <strong>Automatic Location Detection:</strong> Your pincode is automatically extracted from your GPS
              coordinates when you log in. No manual entry needed! The system uses reverse geocoding to determine
              your postal code for accurate local price comparisons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceComparison;
