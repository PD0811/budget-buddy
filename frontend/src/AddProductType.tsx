import React, { useState } from "react";

const defaultProductTypes = [
  "Vegetables",
  "Fruits",
  "Clothes",
  "Travel",
  "Electricity",
  "Rent",
  "School Fees",
  "Stationery",
  "Accessories",
  "Furniture",
];

const AddProductType: React.FC = () => {
  // State for product types and products
  const [productTypes, setProductTypes] = useState<string[]>([
    ...defaultProductTypes,
  ]);
  const [products, setProducts] = useState<{ name: string; type: string }[]>([
    { name: "Milk", type: "Vegetables" },
    { name: "Bread", type: "Stationery" },
    { name: "Rice", type: "Vegetables" },
    { name: "Eggs", type: "Accessories" },
    { name: "Cooking Oil", type: "Vegetables" },
  ]);

  // Form states
  const [newType, setNewType] = useState("");
  const [newProductType, setNewProductType] = useState(productTypes[0] || "");

  // Add product type
  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newType.trim() &&
      !productTypes.some(
        (t) => t.toLowerCase() === newType.trim().toLowerCase()
      )
    ) {
      setProductTypes([...productTypes, newType.trim()]);
      setNewType("");
    }
  };

  // Delete handlers
  const handleDeleteType = (type: string) => {
    setProductTypes(productTypes.filter((t) => t !== type));
    setProducts(products.filter((p) => p.type !== type));
    if (newProductType === type) setNewProductType(productTypes[0] || "");
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
      <h2>Add Product Type</h2>
      <form
        onSubmit={handleAddType}
        style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}
      >
        <input
          type="text"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          required
          placeholder="Enter new product type"
          style={{ width: 200 }}
        />
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
          Add Type
        </button>
      </form>

      <h3 style={{ marginTop: "1.5rem" }}>Product Types List</h3>
      {productTypes.length === 0 ? (
        <p>No product types added yet.</p>
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
              <th style={thStyle}>Product Type</th>
              <th style={thStyle}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {productTypes.map((type) => (
              <tr key={type} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{type}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleDeleteType(type)}
                    style={deleteBtnStyle}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
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

const deleteBtnStyle: React.CSSProperties = {
  background: "#e53e3e",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  padding: "0.25rem 0.75rem",
  cursor: "pointer",
};

export default AddProductType;
