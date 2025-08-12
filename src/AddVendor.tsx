import React, { useState } from "react";

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
      <h2>Add Vendor</h2>
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

export default AddVendor;
