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

const AddProduct: React.FC = () => {
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
  const [newProductName, setNewProductName] = useState("");
  const [newProductType, setNewProductType] = useState(productTypes[0] || "");

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

  // Delete handlers
  const handleDeleteProduct = (name: string) => {
    setProducts(products.filter((p) => p.name !== name));
  };

  return (
    <div className="card page-card">
      <h2 className="page-heading" style={{ fontSize: "1.45rem" }}>
        Add Product
      </h2>
      <form
        onSubmit={handleAddProduct}
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
          marginBottom: "1.4rem",
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
              style={{ width: 200 }}
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
              style={{ width: 180 }}
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
        <button type="submit" className="bb-btn">
          Add Product
        </button>
      </form>

      <h3
        style={{ marginTop: "1rem", fontSize: "1.05rem", letterSpacing: 0.4 }}
      >
        Products List
      </h3>
      {products.length === 0 ? (
        <p>No products added yet.</p>
      ) : (
        <table className="table-modern" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Product Type</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.name}>
                <td>{prod.name}</td>
                <td>{prod.type}</td>
                <td>
                  <button
                    onClick={() => handleDeleteProduct(prod.name)}
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
export default AddProduct;
