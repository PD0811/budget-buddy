import React, { useState, useEffect } from "react";

interface VendorSelectorProps {
  selectedVendor: string;
  onVendorChange: (vendor: string) => void;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ selectedVendor, onVendorChange }) => {
  const [vendors, setVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch random vendors from API
  const fetchRandomVendors = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/vendors/random?limit=8");
      if (!response.ok) {
        throw new Error("Failed to fetch vendors");
      }
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      // Fallback to predefined vendors
      const predefinedVendors = [
        "Big Bazaar", "Reliance Fresh", "DMart", "Spencer's", "More", "Vishal Mega Mart",
        "Local Store", "Corner Shop", "Super Market", "Grocery Store", "Department Store",
        "Hypermarket", "Convenience Store", "Food Bazaar", "Easy Day", "Star Bazaar",
        "Metro Cash & Carry", "Hypercity", "Central", "Westside", "Pantaloons", "Shoppers Stop"
      ];
      const shuffled = predefinedVendors.sort(() => 0.5 - Math.random());
      setVendors(shuffled.slice(0, 8));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomVendors();
  }, []);

  const handleVendorSelect = (vendor: string) => {
    onVendorChange(vendor);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <p>Loading vendors...</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ 
        marginBottom: '1rem', 
        fontSize: '1.1rem', 
        color: '#e2e8f0',
        fontWeight: '600'
      }}>
        Select Vendor
      </h3>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontSize: '0.9rem', 
            color: '#cbd5e1',
            fontWeight: '500'
          }}>
            choose vendor
          </label>
          <select
            value={selectedVendor}
            onChange={(e) => handleVendorSelect(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6366f1';
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <option value="" style={{ color: '#64748b' }}>
              {loading ? 'Loading vendors...' : 'Select a vendor'}
            </option>
            {vendors.map((vendor) => (
              <option 
                key={vendor} 
                value={vendor}
                style={{ color: '#e2e8f0', background: '#1e293b' }}
              >
                {vendor}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={() => {
            setLoading(true);
            fetchRandomVendors();
            onVendorChange(''); // Clear selection when refreshing
          }}
          disabled={loading}
          style={{
            background: loading ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
            color: loading ? '#94a3b8' : '#6366f1',
            border: '1px solid #6366f1',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            height: 'fit-content'
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

    </div>
  );
};

export default VendorSelector;
