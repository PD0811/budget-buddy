import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleMenuClick = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: "#23232a",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: "2rem 1rem",
          boxShadow: "2px 0 10px rgba(0,0,0,0.07)",
        }}
      >
        <h2
          style={{
            marginBottom: "2rem",
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.5rem",
            letterSpacing: 1,
          }}
        >
          BudgetBuddy
        </h2>
        
        {/* Dashboard */}
        <button
          style={sidebarBtnStyle}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>

        {/* Expenses */}
        <div>
          <button
            style={sidebarBtnStyle}
            onClick={() => handleMenuClick("expenses")}
          >
            Expenses
          </button>
          {openMenu === "expenses" && (
            <div style={submenuStyle}>
              <button
                style={submenuBtnStyle}
                onClick={() => navigate("/expenses")}
              >
                Add/View/Edit/Delete Expenses
              </button>
            </div>
          )}
        </div>

        {/* Products */}
        <div>
          <button
            style={sidebarBtnStyle}
            onClick={() => handleMenuClick("products")}
          >
            Products
          </button>
          {openMenu === "products" && (
            <div style={submenuStyle}>
              <button
                style={submenuBtnStyle}
                onClick={() => navigate("/product/add")}
              >
                Add Product
              </button>
              <button
                style={submenuBtnStyle}
                onClick={() => navigate("/product/add-type")}
              >
                Add Product Type
              </button>
              <button
                style={submenuBtnStyle}
                onClick={() => navigate("/product/add-vendor")}
              >
                Add Vendor
              </button>
            </div>
          )}
        </div>

        {/* Reports */}
        <div>
          <button
            style={sidebarBtnStyle}
            onClick={() => handleMenuClick("reports")}
          >
            Reports
          </button>
          {openMenu === "reports" && (
            <div style={submenuStyle}>
              <button
                style={submenuBtnStyle}
                onClick={() => navigate("/reports/prediction")}
              >
                Automatic Purchase Prediction
              </button>
              <button
                style={submenuBtnStyle}
                onClick={() => navigate("/reports/monthly")}
              >
                Monthly Expense Report
              </button>
              <button
                style={submenuBtnStyle}
                onClick={() => navigate("/reports/calendar")}
              >
                Calendar View of Expenses
              </button>
              <button
                style={submenuBtnStyle}
                onClick={() => navigate("/reports/export")}
              >
                Export Expenses to Excel
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <div style={{ marginTop: "auto" }}>
          <button
            style={{ ...sidebarBtnStyle, background: "#e53e3e", color: "#fff" }}
            onClick={() => navigate("/")}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

const sidebarBtnStyle: React.CSSProperties = {
  width: "100%",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  padding: "0.75rem 1rem",
  fontSize: "1rem",
  marginBottom: "0.5rem",
  cursor: "pointer",
  textAlign: "left",
  fontWeight: 500,
  transition: "background 0.2s",
};

const submenuStyle: React.CSSProperties = {
  marginLeft: "1rem",
  marginBottom: "0.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const submenuBtnStyle: React.CSSProperties = {
  background: "#374151",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  padding: "0.5rem 1rem",
  fontSize: "0.95rem",
  textAlign: "left",
  cursor: "pointer",
  marginBottom: "0.2rem",
};

export default Layout;