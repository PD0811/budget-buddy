import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "./apiUtils";

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

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    productName: "",
    quantity: 1,
    unitPrice: 0,
    date: new Date().toISOString().slice(0, 10),
    brand: "",
    vendor: "",
    categoryName: "",
  });

  // --- Fetch expenses from the backend ---
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch expenses.");
      }
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      // For development, show sample data if backend is not available
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
    }
  };

  // --- Fetch data on component mount ---
  useEffect(() => {
    fetchExpenses();
  }, []); // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "unitPrice" ? Number(value) : value,
    }));
  };

  // Add or update expense
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!form.productName.trim()) {
      alert("Product name is required");
      return;
    }

    if (!form.vendor.trim()) {
      alert("Vendor is required");
      return;
    }

    const totalPrice = form.quantity * form.unitPrice;

    // Create expense data
    let expenseData = {
      productName: form.productName,
      quantity: form.quantity,
      unitPrice: form.unitPrice,
      totalPrice,
      date: form.date,
      brand: form.brand,
      vendor: form.vendor,
      categoryName: form.categoryName, // Add the category field
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;

        // Try to get the response body for more details
        const responseText = await response.text();

        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            // If it's not JSON, use the text as is
            errorMessage = responseText;
          }
        }

        throw new Error(errorMessage);
      }

      // Re-fetch the list from the server
      await fetchExpenses();

      // Reset the form for the next entry
      setForm({
        productName: "",
        quantity: 1,
        unitPrice: 0,
        date: new Date().toISOString().slice(0, 10),
        brand: "",
        vendor: "",
        categoryName: "",
      });
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        alert(
          "Cannot connect to backend server. Please check if it is running on port 3001."
        );
      } else if (error instanceof Error) {
        alert(`Server error: ${error.message}`);
      } else {
        alert("An unexpected error occurred.");
      }

      // Don't add locally on server errors, only on network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        // For development, add expense locally if backend is not available
        const newExpense: Expense = {
          id: Math.max(...expenses.map((e) => e.id), 0) + 1,
          productName: form.productName,
          quantity: form.quantity,
          unitPrice: form.unitPrice,
          totalPrice,
          date: form.date,
          brand: form.brand,
          vendor: form.vendor,
        };

        setExpenses((prev) => [...prev, newExpense]);

        // Reset the form for the next entry
        setForm({
          productName: "",
          quantity: 1,
          unitPrice: 0,
          date: new Date().toISOString().slice(0, 10),
          brand: "",
          vendor: "",
          categoryName: "",
        });
      }
    }
  };

  // Edit expense
  const handleEdit = (id: number) => {
    const exp = expenses.find((e) => e.id === id);
    if (exp) {
      setForm({
        productName: exp.productName,
        quantity: exp.quantity,
        unitPrice: exp.unitPrice,
        date: exp.date.slice(0, 10),
        brand: exp.brand || "",
        vendor: exp.vendor,
        categoryName: "",
      });
      setEditingId(id);
    }
  };

  // Delete expense
  const handleDelete = (id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({
        productName: "",
        quantity: 1,
        unitPrice: 0,
        date: new Date().toISOString().slice(0, 10),
        brand: "",
        vendor: "",
        categoryName: "",
      });
    }
  };

  return (
    <div className="card" style={{ maxWidth: 880, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0, fontSize: "1.4rem", letterSpacing: 0.3 }}>
        {editingId ? "Edit Expense" : "Add Expense"}
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "flex-end",
          marginBottom: "1.25rem",
        }}
      >
        <div>
          <label>
            Product Name
            <br />
            <input
              type="text"
              name="productName"
              value={form.productName}
              onChange={handleChange}
              required
              placeholder="Enter product name..."
              style={{ width: 200 }}
            />
          </label>
        </div>
        <div>
          <label>
            Quantity
            <br />
            <input
              type="number"
              name="quantity"
              min={1}
              value={form.quantity}
              onChange={handleChange}
              required
              style={{ width: 80 }}
            />
          </label>
        </div>
        <div>
          <label>
            Unit Price
            <br />
            <input
              type="number"
              name="unitPrice"
              min={0}
              value={form.unitPrice}
              onChange={handleChange}
              required
              style={{ width: 90 }}
            />
          </label>
        </div>
        <div>
          <label>
            Total Price
            <br />
            <input
              type="text"
              value={form.quantity * form.unitPrice}
              disabled
              style={{ width: 90, background: "#eee" }}
            />
          </label>
        </div>
        <div>
          <label>
            Date
            <br />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Brand (optional)
            <br />
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Brand"
              style={{ width: 100 }}
            />
          </label>
        </div>
        <div>
          <label>
            Category
            <br />
            <input
              type="text"
              name="categoryName"
              value={form.categoryName}
              onChange={handleChange}
              placeholder="Category (optional)"
              style={{ width: 120 }}
            />
          </label>
        </div>
        <div>
          <label>
            Vendor
            <br />
            <input
              type="text"
              name="vendor"
              value={form.vendor}
              onChange={handleChange}
              required
              placeholder="Vendor"
              style={{ width: 100 }}
            />
          </label>
        </div>
        <div style={{ display: "flex", gap: ".6rem" }}>
          <button
            type="submit"
            style={{
              padding: ".6rem 1.4rem",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              letterSpacing: 0.4,
              cursor: "pointer",
            }}
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  productName: "",
                  quantity: 1,
                  unitPrice: 0,
                  date: new Date().toISOString().slice(0, 10),
                  brand: "",
                  vendor: "",
                  categoryName: "",
                });
              }}
              style={{
                padding: ".6rem 1.2rem",
                background: "#4b5563",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 style={{ marginTop: "1.6rem", fontSize: "1.3rem" }}>Your Expenses</h2>
      {expenses.length === 0 ? (
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
            <tr
              style={{ background: "linear-gradient(90deg,#1f2733,#1a202c)" }}
            >
              <th style={thStyle}>Date</th>
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
                  <td style={tdStyle}>{exp.date}</td>
                  <td style={tdStyle}>{exp.productName}</td>
                  <td style={tdStyle}>{exp.brand || "-"}</td>
                  <td style={tdStyle}>{exp.quantity}</td>
                  <td style={tdStyle}>{exp.unitPrice}</td>
                  <td style={tdStyle}>{exp.totalPrice}</td>
                  <td style={tdStyle}>{exp.vendor}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleEdit(exp.id)}
                      style={{
                        marginRight: 8,
                        background: "#4f46e5",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: ".35rem .85rem",
                        fontSize: ".7rem",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
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
};

export default Expenses;
