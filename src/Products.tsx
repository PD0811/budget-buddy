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

const Products: React.FC = () => {
  // State for product types, products, and vendors
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
  const [vendors, setVendors] = useState<string[]>([
    "Big Bazaar",
    "Reliance",
    "Local Store",
  ]);

  // Form states
  const [newProductName, setNewProductName] = useState("");
  const [newProductType, setNewProductType] = useState(productTypes[0] || "");
  const [newType, setNewType] = useState("");
  const [newVendor, setNewVendor] = useState("");

  // Add product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newProductName.trim() &&
      newProductType &&
      !products.some(
        (p) => p.name.toLowerCase() === newProductName.trim().toLowerCase()
      )
    ) {
      setProducts([
        ...products,
        { name: newProductName.trim(), type: newProductType },
      ]);
      setNewProductName("");
      setNewProductType(productTypes[0] || "");
    }
  };

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

  // Add vendor
  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newVendor.trim() &&
      !vendors.some((v) => v.toLowerCase() === newVendor.trim().toLowerCase())
    ) {
      setVendors([...vendors, newVendor.trim()]);
      setNewVendor("");
    }
  };

  // Delete handlers
  const handleDeleteProduct = (name: string) => {
    setProducts(products.filter((p) => p.name !== name));
  };
  const handleDeleteType = (type: string) => {
    setProductTypes(productTypes.filter((t) => t !== type));
    setProducts(products.filter((p) => p.type !== type));
    if (newProductType === type) setNewProductType(productTypes[0] || "");
  };
  const handleDeleteVendor = (vendor: string) => {
    setVendors(vendors.filter((v) => v !== vendor));
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "2rem auto",
        background: "#fff",
        padding: "2rem",
        borderRadius: 8,
        boxShadow: "0 0 10px rgba(0,0,0,0.07)",
      }}
    >
      <h2>Add Product</h2>
      <form
        onSubmit={handleAddProduct}
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label>
            Product Name
            <br />
            <input
              type="text"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              required
              placeholder="Enter product name"
              style={{ width: 180 }}
            />
          </label>
        </div>
        <div>
          <label>
            Product Type
            <br />
            <select
              value={newProductType}
              onChange={(e) => setNewProductType(e.target.value)}
              required
              style={{ width: 160 }}
            >
              {productTypes
                .slice()
                .sort()
                .map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
            </select>
          </label>
        </div>
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
          Add Product
        </button>
      </form>

      <h3 style={{ marginTop: "2rem" }}>Products List</h3>
      {products.length === 0 ? (
        <p>No products added yet.</p>
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
              <th style={thStyle}>Product Name</th>
              <th style={thStyle}>Product Type</th>
              <th style={thStyle}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.name} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{prod.name}</td>
                <td style={tdStyle}>{prod.type}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleDeleteProduct(prod.name)}
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

      <h2 style={{ marginTop: "2.5rem" }}>Add Product Type</h2>
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

      <h2 style={{ marginTop: "2.5rem" }}>Add Vendor</h2>
      <form
        onSubmit={handleAddVendor}
        style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}
      >
        <input
          type="text"
          value={newVendor}
          onChange={(e) => setNewVendor(e.target.value)}
          required
          placeholder="Enter vendor name"
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
          Add Vendor
        </button>
      </form>

      <h3 style={{ marginTop: "1.5rem" }}>Vendors List</h3>
      {vendors.length === 0 ? (
        <p>No vendors added yet.</p>
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
              <th style={thStyle}>Vendor Name</th>
              <th style={thStyle}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {vendors
              .slice()
              .sort()
              .map((vendor) => (
                <tr key={vendor} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{vendor}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDeleteVendor(vendor)}
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

export default Products;
