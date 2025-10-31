import React, { useState } from "react";
import { API_BASE_URL } from "./apiUtils";

type ExpenseItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  brand: string;
  categoryName: string;
};

const AddExpense: React.FC = () => {
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [currentItem, setCurrentItem] = useState<ExpenseItem>({
    productName: "",
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    brand: "",
    categoryName: "",
  });
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [vendorSuggestions, setVendorSuggestions] = useState<string[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);
  // Fetch vendor suggestions from backend
  const fetchVendorSuggestions = async (query: string) => {
    if (query.length < 2) {
      setVendorSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const vendorNames = await response.json();
        setVendorSuggestions(vendorNames);
      }
    } catch (error) {
      console.error('Error fetching vendor suggestions:', error);
    }
  };

  // Calculate total price whenever quantity or unit price changes
  const calculateTotalPrice = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  // Fetch product name suggestions from backend
  const fetchProductSuggestions = async (query: string) => {
    if (query.length < 2) {
      setProductSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const productNames = await response.json();
        // API now returns only product names directly
        setProductSuggestions(productNames);
      }
    } catch (error) {
      console.error('Error fetching product suggestions:', error);
    }
  };

  // Fetch brand suggestions from backend
  const fetchBrandSuggestions = async (query: string) => {
    if (query.length < 2) {
      setBrandSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/brands/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const brands = await response.json();
        setBrandSuggestions(brands);
      }
    } catch (error) {
      console.error('Error fetching brand suggestions:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setCurrentItem((prev) => {
      const updatedItem = { ...prev };
      
      if (name === "quantity") {
        const numValue = Number(value) || 0;
        updatedItem.quantity = numValue;
        updatedItem.totalPrice = calculateTotalPrice(numValue, prev.unitPrice);
      } else if (name === "unitPrice") {
        const numValue = parseFloat(value) || 0;
        updatedItem.unitPrice = numValue;
        updatedItem.totalPrice = calculateTotalPrice(prev.quantity, numValue);
      } else {
        (updatedItem as any)[name] = value;
      }
      
      return updatedItem;
    });

    // Trigger suggestions for product name and brand
    if (name === "productName") {
      fetchProductSuggestions(value);
      setShowProductSuggestions(value.length > 0);
    } else if (name === "brand") {
      fetchBrandSuggestions(value);
      setShowBrandSuggestions(value.length > 0);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (field: 'productName' | 'brand', value: string) => {
  if (field === 'productName') {
    // Close dropdown immediately
    setShowProductSuggestions(false);

    try {
      const url = new URL(`${API_BASE_URL}/api/products/lookup`);
      url.searchParams.set('name', value); // no brand param

      const resp = await fetch(url.toString());
      if (resp.ok) {
        const data = await resp.json();
        // The API returns an array, so we need to get the first element
        const product = Array.isArray(data) && data.length > 0 ? data[0] : null;
        const cat = product?.category_name || '';
        console.log('Product lookup result:', product); // Debug log
        // Set both product name and category in a single call
        setCurrentItem(prev => ({
          ...prev,
          productName: value,
          categoryName: cat
        }));
      } else {
        // not found -> set product name only, leave category blank
        setCurrentItem(prev => ({ 
          ...prev, 
          productName: value,
          categoryName: ''
        }));
      }
    } catch {
      // network error -> set product name only, leave category as-is
      setCurrentItem(prev => ({ ...prev, productName: value }));
    }
  } else {
    // If you keep brand suggestions for other reasons, just set brand and close; no lookup
    setCurrentItem(prev => ({ ...prev, brand: value }));
    setShowBrandSuggestions(false);
  }
};





  const addItemToList = () => {
    if (!currentItem.productName.trim()) {
      alert("Product name is required");
      return;
    }

    if (!selectedVendor.trim()) {
      alert("Please select a vendor");
      return;
    }

    setExpenseItems([...expenseItems, { ...currentItem }]);
    setCurrentItem({
      productName: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0, // Will be calculated automatically
      brand: "",
      categoryName: "",
    });
  };

  const removeItemFromList = (index: number) => {
    setExpenseItems(expenseItems.filter((_, i) => i !== index));
  };

  const clearAllItems = () => {
    setExpenseItems([]);
  };

  const handleSubmitAll = async () => {
    if (expenseItems.length === 0) {
      alert("Please add at least one item before submitting");
      return;
    }

    if (!selectedVendor.trim()) {
      alert("Please select a vendor");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/expenses/batch`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          items: expenseItems,
          vendor: selectedVendor,
          date: new Date().toISOString().slice(0, 10),
        }),
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        const responseText = await response.text();
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = responseText;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      alert(result.message || `Successfully added ${expenseItems.length} items for ${selectedVendor}`);
      
      setExpenseItems([]);
      setCurrentItem({
        productName: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0, // Will be calculated automatically
        brand: "",
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
    }
  };

  return (
    <div className="card" style={{ maxWidth: 880, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0, fontSize: "1.4rem", letterSpacing: 0.3 }}>
        Add Expense
      </h2>
      
      {/* Vendor Selection (dynamic) */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <label>
          vendor
          <br />
          <input
            type="text"
            name="vendor"
            value={selectedVendor}
            onChange={e => {
              setSelectedVendor(e.target.value);
              fetchVendorSuggestions(e.target.value);
              setShowVendorSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowVendorSuggestions(selectedVendor.length > 0)}
            onBlur={() => setTimeout(() => setShowVendorSuggestions(false), 500)}
            required
            placeholder="Enter vendor name..."
            style={{ width: 250 }}
          />
        </label>
        {showVendorSuggestions && vendorSuggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '250px',
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            {vendorSuggestions.map((suggestion, index) => (
              <div
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevents input blur from cancelling the selection
                  setSelectedVendor(suggestion);
                  setShowVendorSuggestions(false);
                }}
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  color: '#e2e8f0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Current Item Form */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ 
          marginBottom: "1rem", 
          fontSize: "1.1rem", 
          color: "#e2e8f0",
          fontWeight: "600"
        }}>
          Add Item to List
        </h3>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addItemToList();
          }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "flex-end",
            marginBottom: "1.25rem",
          }}
        >
        <div style={{ position: 'relative' }}>
          <label>
            product name
            <br />
            <input
              type="text"
              name="productName"
              value={currentItem.productName}
              onChange={handleChange}
              onFocus={() => setShowProductSuggestions(currentItem.productName.length > 0)}
              onBlur={() => setTimeout(() => setShowProductSuggestions(false), 500)}
              required
              placeholder="Enter product name..."
              style={{ width: 200 }}
            />
          </label>
          {showProductSuggestions && productSuggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              {productSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                onMouseDown={(e) => {
    e.preventDefault(); // prevents input blur from cancelling the selection
    handleSuggestionSelect('productName', suggestion);
  }}
                  style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    color: '#e2e8f0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label>
            Quantity
            <br />
            <input
              type="number"
              name="quantity"
              min={1}
              value={currentItem.quantity}
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
              type="text"
              name="unitPrice"
              value={currentItem.unitPrice}
              onChange={handleChange}
              required
              placeholder="0.00"
              style={{ width: 90 }}
            />
          </label>
        </div>
        <div>
          <label>
            total price
            <br />
            <input
              type="text"
              value={currentItem.totalPrice.toFixed(2)}
              disabled
              style={{ 
                width: 90, 
                background: "#eee", 
                color: "#666",
                cursor: "not-allowed"
              }}
            />
          </label>
        </div>
        <div style={{ position: 'relative' }}>
          <label>
            Brand (optional)
            <br />
            <input
              type="text"
              name="brand"
              value={currentItem.brand}
              onChange={handleChange}
              onFocus={() => setShowBrandSuggestions(currentItem.brand.length > 0)}
              onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
              placeholder="Brand"
              style={{ width: 100 }}
            />
          </label>
          {showBrandSuggestions && brandSuggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              {brandSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionSelect('brand', suggestion)}
                  style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    color: '#e2e8f0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label>
            Category
            <br />
            <input
              type="text"
              name="categoryName"
              value={currentItem.categoryName}
              onChange={handleChange}
              placeholder="Category (optional)"
              style={{ width: 120 }}
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
            Add to List
          </button>
        </div>
        </form>
      </div>

      {/* Items List */}
      {expenseItems.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "1rem"
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: "1.1rem", 
              color: "#e2e8f0",
              fontWeight: "600"
            }}>
              Items for {selectedVendor} ({expenseItems.length})
            </h3>
            <button
              onClick={clearAllItems}
              style={{
                padding: "0.5rem 1rem",
                background: "transparent",
                color: "#dc2626",
                border: "1px solid #dc2626",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.85rem"
              }}
            >
              Clear All
            </button>
          </div>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            padding: "1rem",
            maxHeight: "300px",
            overflowY: "auto"
          }}>
            {expenseItems.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", color: "#e2e8f0", marginBottom: "0.25rem" }}>
                    {item.productName}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                    Qty: {item.quantity} × ₹{item.unitPrice.toFixed(2)} = ₹{item.totalPrice.toFixed(2)}
                    {item.brand && ` • ${item.brand}`}
                    {item.categoryName && ` • ${item.categoryName}`}
                  </div>
                </div>
                <button
                  onClick={() => removeItemFromList(index)}
                  style={{
                    padding: "0.25rem 0.75rem",
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.75rem"
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit All Button */}
      {expenseItems.length > 0 && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleSubmitAll}
            style={{
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
            }}
          >
            Submit All {expenseItems.length} Items for {selectedVendor}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddExpense;


