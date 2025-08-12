import React from "react";
import { useNavigate } from "react-router-dom";

const Products: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        background: "#fff",
        padding: "2rem",
        borderRadius: 8,
        boxShadow: "0 0 10px rgba(0,0,0,0.07)",
        textAlign: "center",
      }}
    >
      <h2>Product Management</h2>
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        Manage your products, product types, and vendors
      </p>
      
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <button
          onClick={() => navigate("/product/add")}
          style={btnStyle}
        >
          Add Product
        </button>
        <button
          onClick={() => navigate("/product/add-type")}
          style={btnStyle}
        >
          Add Product Type
        </button>
        <button
          onClick={() => navigate("/product/add-vendor")}
          style={btnStyle}
        >
          Add Vendor
        </button>
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  padding: "0.75rem 1.5rem",
  fontSize: "1rem",
  borderRadius: "4px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  transition: "background 0.2s",
};

export default Products;
