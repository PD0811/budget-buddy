import React, { useState } from "react";
import "./modern-ui.css";

const AddVendor: React.FC = () => {
  // State for vendors
  const [vendors, setVendors] = useState<string[]>([
    "Big Bazaar",
    "Reliance",
    "Local Store",
  ]);

  // Form states
  const [newVendor, setNewVendor] = useState("");

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
  const handleDeleteVendor = (vendor: string) => {
    setVendors(vendors.filter((v) => v !== vendor));
  };

  return (
    <div className="card page-card">
      <h2 className="page-heading" style={{ fontSize: "1.45rem" }}>
        Add Vendor
      </h2>
      <form
        onSubmit={handleAddVendor}
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
          marginBottom: "1.4rem",
        }}
      >
        <label>
          Vendor Name
          <br />
          <input
            type="text"
            value={newVendor}
            onChange={(e) => setNewVendor(e.target.value)}
            required
            placeholder="Enter vendor name"
            style={{ width: 220 }}
          />
        </label>
        <button type="submit" className="bb-btn">
          Add Vendor
        </button>
      </form>
      <h3
        style={{ marginTop: "1rem", fontSize: "1.05rem", letterSpacing: 0.4 }}
      >
        Vendors List
      </h3>
      {vendors.length === 0 ? (
        <p>No vendors added yet.</p>
      ) : (
        <table className="table-modern" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {vendors
              .slice()
              .sort()
              .map((vendor) => (
                <tr key={vendor}>
                  <td>{vendor}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteVendor(vendor)}
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
export default AddVendor;
