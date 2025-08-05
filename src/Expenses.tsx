import React, { useState } from "react";

// Example product database (to be replaced with backend/database later)
const productDatabase = [
  { id: 1, name: "Milk", unit: "Litre" },
  { id: 2, name: "Bread", unit: "Nos" },
  { id: 3, name: "Rice", unit: "Kg" },
  { id: 4, name: "Eggs", unit: "Nos" },
  { id: 5, name: "Cooking Oil", unit: "Litre" },
];

type Expense = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
  brand?: string;
  vendor: string;
};

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState<Omit<Expense, "id" | "totalPrice">>({
    productId: productDatabase[0].id,
    quantity: 1,
    unitPrice: 0,
    date: new Date().toISOString().slice(0, 10),
    brand: "",
    vendor: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Helper to get product info
  const getProduct = (id: number) =>
    productDatabase.find((p) => p.id === id) || productDatabase[0];

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "unitPrice" || name === "productId"
          ? Number(value)
          : value,
    }));
  };

  // Add or update expense
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalPrice = form.quantity * form.unitPrice;
    if (editingId !== null) {
      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === editingId ? { ...exp, ...form, totalPrice } : exp
        )
      );
      setEditingId(null);
    } else {
      setExpenses((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now(),
          totalPrice,
        },
      ]);
    }
    setForm({
      productId: productDatabase[0].id,
      quantity: 1,
      unitPrice: 0,
      date: new Date().toISOString().slice(0, 10),
      brand: "",
      vendor: "",
    });
  };

  // Edit expense
  const handleEdit = (id: number) => {
    const exp = expenses.find((e) => e.id === id);
    if (exp) {
      setForm({
        productId: exp.productId,
        quantity: exp.quantity,
        unitPrice: exp.unitPrice,
        date: exp.date,
        brand: exp.brand || "",
        vendor: exp.vendor,
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
        productId: productDatabase[0].id,
        quantity: 1,
        unitPrice: 0,
        date: new Date().toISOString().slice(0, 10),
        brand: "",
        vendor: "",
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "2rem auto",
        background: "#fff",
        padding: "2rem",
        borderRadius: 8,
        boxShadow: "0 0 10px rgba(0,0,0,0.07)",
      }}
    >
      <h2>{editingId ? "Edit Expense" : "Add Expense"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "flex-end",
        }}
      >
        <div>
          <label>
            Item Name
            <br />
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
            >
              {productDatabase.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name}
                </option>
              ))}
            </select>
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
            Unit
            <br />
            <input
              type="text"
              value={getProduct(form.productId).unit}
              disabled
              style={{ width: 70, background: "#eee" }}
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
        <div>
          <button
            type="submit"
            style={{
              padding: "0.5rem 1.5rem",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 4,
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
                  productId: productDatabase[0].id,
                  quantity: 1,
                  unitPrice: 0,
                  date: new Date().toISOString().slice(0, 10),
                  brand: "",
                  vendor: "",
                });
              }}
              style={{
                marginLeft: 8,
                padding: "0.5rem 1.5rem",
                background: "#aaa",
                color: "#fff",
                border: "none",
                borderRadius: 4,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 style={{ marginTop: "2.5rem" }}>Your Expenses</h2>
      {expenses.length === 0 ? (
        <p>No expenses added yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ background: "#f0f4fa" }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Item</th>
              <th style={thStyle}>Brand</th>
              <th style={thStyle}>Quantity</th>
              <th style={thStyle}>Unit</th>
              <th style={thStyle}>Unit Price</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Vendor</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => {
              const prod = getProduct(exp.productId);
              return (
                <tr key={exp.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{exp.date}</td>
                  <td style={tdStyle}>{prod.name}</td>
                  <td style={tdStyle}>{exp.brand || "-"}</td>
                  <td style={tdStyle}>{exp.quantity}</td>
                  <td style={tdStyle}>{prod.unit}</td>
                  <td style={tdStyle}>{exp.unitPrice}</td>
                  <td style={tdStyle}>{exp.totalPrice}</td>
                  <td style={tdStyle}>{exp.vendor}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleEdit(exp.id)}
                      style={{
                        marginRight: 8,
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "0.25rem 0.75rem",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      style={{
                        background: "#e53e3e",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "0.25rem 0.75rem",
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
  padding: "0.5rem",
  borderBottom: "2px solid #ddd",
  fontWeight: 600,
  fontSize: "1rem",
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem",
  textAlign: "center",
};

export default Expenses;
