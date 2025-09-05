import React, { useEffect, useState } from "react";

type Expense = {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
  brand?: string;
  vendor: string;
};

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const ManageExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);


  const fetchExpenses = async (page: number = 1, loadAll: boolean = false) => {
    setLoading(true);
    try {
      const limit = loadAll ? 10000 : 50; // Large limit for "show all"
      const response = await fetch(`http://localhost:3001/api/expenses?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch expenses.");
      }
      const data = await response.json();
      setExpenses(data.expenses);
      setPagination(loadAll ? null : data.pagination);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setExpenses([
        {
          id: 1,
          productName: "Sample Product",
          quantity: 2,
          unitPrice: 10.99,
          totalPrice: 21.98,
          date: "2024-08-12",
          brand: "Sample Brand",
          vendor: "Sample Vendor",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setShowAll(false);
  };

  const handleShowAll = () => {
    setShowAll(true);
    fetchExpenses(1, true);
  };

  const handleShowPaginated = () => {
    setShowAll(false);
    setCurrentPage(1);
    fetchExpenses(1, false);
  };

  const handleDelete = (id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="card" style={{ maxWidth: 880, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0, fontSize: "1.4rem", letterSpacing: 0.3 }}>
        Manage Expenses
      </h2>
      
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        alignItems: 'center'
      }}>
        <button
          onClick={handleShowPaginated}
          disabled={!showAll}
          style={{
            padding: '0.5rem 1rem',
            background: !showAll ? '#10b981' : 'rgba(16, 185, 129, 0.3)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: !showAll ? 'default' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500'
          }}
        >
          Paginated View
        </button>
        <button
          onClick={handleShowAll}
          disabled={showAll}
          style={{
            padding: '0.5rem 1rem',
            background: showAll ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: showAll ? 'default' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500'
          }}
        >
          Show All Expenses
        </button>
        {showAll && (
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Showing all {expenses.length} expenses
          </span>
        )}
      </div>
      
      {pagination && !showAll && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#cbd5e1'
        }}>
          <div>
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} expenses
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
              style={{
                padding: '0.5rem 1rem',
                background: pagination.hasPrevPage ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                fontSize: '0.85rem'
              }}
            >
              Previous
            </button>
            <span style={{ minWidth: '100px', textAlign: 'center' }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              style={{
                padding: '0.5rem 1rem',
                background: pagination.hasNextPage ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                fontSize: '0.85rem'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          Loading expenses...
        </div>
      ) : expenses.length === 0 ? (
        <p>No expenses added yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
            fontSize: ".85rem",
          }}
        >
          <thead>
            <tr style={{ background: "linear-gradient(90deg,#1f2733,#1a202c)" }}>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Brand</th>
              <th style={thStyle}>Quantity</th>
              <th style={thStyle}>Unit Price</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Vendor</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => {
              return (
                <tr
                  key={exp.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
                >
                  <td style={tdStyle}>{exp.productName}</td>
                  <td style={tdStyle}>{exp.brand || "-"}</td>
                  <td style={tdStyle}>{exp.quantity}</td>
                  <td style={tdStyle}>{exp.unitPrice}</td>
                  <td style={tdStyle}>{exp.totalPrice}</td>
                  <td style={tdStyle}>{exp.vendor}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      style={{
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: ".35rem .85rem",
                        fontSize: ".7rem",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: ".55rem .6rem",
  borderBottom: "2px solid rgba(255,255,255,.08)",
  fontWeight: 600,
  fontSize: ".7rem",
  letterSpacing: ".5px",
  textTransform: "uppercase",
  color: "#9aa4b4",
  textAlign: "center",
};

const tdStyle: React.CSSProperties = {
  padding: ".55rem .65rem",
  textAlign: "center",
  color: "#d6d9dd",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "140px",
};

export default ManageExpenses;



