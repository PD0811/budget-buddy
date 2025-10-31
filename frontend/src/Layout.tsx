import React, { useState, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiDollarSign,
  FiPackage,
  FiLayers,
  FiTruck,
  FiBarChart2,
  FiActivity,
  FiCalendar,
  FiFileText,
  FiLogOut,
  FiChevronRight,
  FiTrendingDown,
} from "react-icons/fi";
import "./modern-ui.css";

interface SubItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}
interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  action?: () => void;
  items?: SubItem[];
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{
    top: number;
    direction: "right" | "left";
  }>({ top: 0, direction: "right" });
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const toggleMenu = (menu: string) => {
    if (openMenu === menu) {
      setOpenMenu(null);
      return;
    }

    setOpenMenu(menu);
    setTimeout(() => {
      const wrapper = menuRefs.current[menu];
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect();
        const submenuWidth = 260;
        const spaceRight = window.innerWidth - rect.right;
        const direction = spaceRight < submenuWidth ? "left" : "right";
        setSubmenuPosition({
          top: rect.top,
          direction,
        });
      }
    }, 0);
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const menu: MenuItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <FiGrid />,
      action: () => navigate("/dashboard"),
    },
    {
      key: "expenses",
      label: "Expenses",
      icon: <FiDollarSign />,
      items: [
        {
          label: "Add Expense",
          path: "/expenses/add",
          icon: <FiDollarSign />,
        },
        {
          label: "Manage Expenses",
          path: "/expenses/manage",
          icon: <FiDollarSign />,
        },
      ],
    },
    {
      key: "products",
      label: "Products",
      icon: <FiPackage />,
      items: [
        { label: "Add Product", path: "/product/add", icon: <FiPackage /> },
        {
          label: "Add Product Type",
          path: "/product/add-type",
          icon: <FiLayers />,
        },
        { label: "Add Vendor", path: "/product/add-vendor", icon: <FiTruck /> },
      ],
    },
    {
      key: "reports",
      label: "Reports",
      icon: <FiBarChart2 />,
      items: [
        {
          label: "Automatic Purchase Prediction",
          path: "/reports/prediction",
          icon: <FiActivity />,
        },
        {
          label: "Monthly Expense Report",
          path: "/reports/monthly",
          icon: <FiFileText />,
        },
        {
          label: "Analytics",
          path: "/reports/analytics",
          icon: <FiBarChart2 />,
        },
        {
          label: "Calendar View",
          path: "/reports/calendar",
          icon: <FiCalendar />,
        },
        {
          label: "Export to Excel",
          path: "/reports/export",
          icon: <FiFileText />,
        },
      ],
    },
    {
      key: "price-comparison",
      label: "Price Comparison",
      icon: <FiTrendingDown />,
      action: () => navigate("/price-comparison"),
    },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand">
            <span className="brand-icon">
              <FiDollarSign />
            </span>
            BudgetBuddy
          </div>
        </div>
        <div className="sidebar-scroll">
          <div className="nav-section-title">Navigation</div>
          {menu.map((item) => {
            const active = item.items
              ? item.items.some((si) => isActive(si.path))
              : isActive("/" + item.key);
            return (
              <div
                key={item.key}
                style={{ position: "relative" }}
                ref={(el) => {
                  menuRefs.current[item.key] = el;
                }}
              >
                <button
                  className={`nav-btn ${active ? "active" : ""}`}
                  onClick={() => {
                    if (item.items) {
                      toggleMenu(item.key);
                    } else if (item.action) {
                      item.action();
                    }
                  }}
                >
                  <span className="icon-wrap">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.items && (
                    <FiChevronRight
                      style={{
                        transition: "transform .25s",
                        transform:
                          openMenu === item.key ? "translateX(3px)" : "none",
                      }}
                    />
                  )}
                </button>
                {item.items && openMenu === item.key && (
                  <div
                    className="submenu-popover"
                    style={{
                      position: "fixed",
                      top: submenuPosition.top,
                      left:
                        submenuPosition.direction === "right"
                          ? `calc(${getComputedStyle(
                              document.documentElement
                            ).getPropertyValue("--sidebar-width")} + 8px)`
                          : undefined,
                      right:
                        submenuPosition.direction === "left"
                          ? "270px"
                          : undefined,
                    }}
                  >
                    {item.items.map((sub) => (
                      <button
                        key={sub.path}
                        className="submenu-btn"
                        onClick={() => {
                          navigate(sub.path);
                          setOpenMenu(null);
                        }}
                      >
                        <span className="bullet" />
                        {sub.icon && (
                          <span
                            style={{
                              color: "#818cf8",
                              fontSize: "1rem",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            {sub.icon}
                          </span>
                        )}
                        <span style={{ flex: 1 }}>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Logout button with spacing */}
          <div className="nav-separator" />
          <div className="logout-btn">
            <button className="nav-btn" onClick={() => navigate("/")}>
              <span className="icon-wrap">
                <FiLogOut />
              </span>
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
