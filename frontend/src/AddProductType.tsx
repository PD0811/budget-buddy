import React, { useState } from "react";
import "./modern-ui.css";

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
    <div className="card page-card">
      <h2 className="page-heading" style={{ fontSize: "1.45rem" }}>
        Add Product Type
      </h2>
      <form
        onSubmit={handleAddType}
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
          marginBottom: "1.4rem",
        }}
      >
        <label>
          New Type
          <br />
          <input
            type="text"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            required
            placeholder="Enter new product type"
            style={{ width: 220 }}
          />
        </label>
        <button type="submit" className="bb-btn">
          Add Type
        </button>
      </form>
      <h3
        style={{ marginTop: "1rem", fontSize: "1.05rem", letterSpacing: 0.4 }}
      >
        Product Types List
      </h3>
      {productTypes.length === 0 ? (
        <p>No product types added yet.</p>
      ) : (
        <table className="table-modern" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Product Type</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {productTypes.map((type) => (
              <tr key={type}>
                <td>{type}</td>
                <td>
                  <button
                    onClick={() => handleDeleteType(type)}
                    className="bb-btn danger"
                    style={{ padding: ".4rem .9rem", fontSize: ".65rem" }}
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
export default AddProductType;
