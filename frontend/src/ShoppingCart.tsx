import React, { useState } from 'react';
import { API_BASE_URL, getAuthHeaders } from './apiUtils';

type CartItem = {
  productName: string;
  productId?: string | null;
  brand?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

const ShoppingCart: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('shopping_cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const fetchSuggestions = async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (e) {
      console.error('product suggestions error', e);
    }
  };

  const handleSelectSuggestion = async (name: string) => {
    setQuery('');
    setSuggestions([]);

    // Lookup product to get product_id and brand
    try {
      const lookupUrl = new URL(`${API_BASE_URL}/api/products/lookup`);
      lookupUrl.searchParams.set('name', name);
      const lookupRes = await fetch(lookupUrl.toString());
      let productId: string | undefined;
      let brand: string | undefined;
      if (lookupRes.ok) {
        const rows = await lookupRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          productId = rows[0].product_id;
          brand = rows[0].brand || undefined;
        }
      }

      // Get last price for this product for current user
      let lastPrice = 0;
      if (productId) {
        const priceRes = await fetch(`${API_BASE_URL}/api/products/last-price?product_id=${encodeURIComponent(productId)}`, { headers: getAuthHeaders() });
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          if (priceData && priceData.last_unit_price != null) lastPrice = Number(priceData.last_unit_price) || 0;
        }
      }

      // Add to cart with default quantity 1
      setCart(prev => {
        const newItem: CartItem = {
          productName: name,
          productId: productId || null,
          brand,
          quantity: 1,
          unitPrice: lastPrice,
          totalPrice: lastPrice * 1,
        };
        const next = [...prev, newItem];
        localStorage.setItem('shopping_cart', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.error('Error selecting product suggestion', err);
    }
  };

  const updateItem = (idx: number, patch: Partial<CartItem>) => {
    setCart(prev => {
      const copy = prev.slice();
      copy[idx] = { ...copy[idx], ...patch };
      copy[idx].totalPrice = copy[idx].quantity * copy[idx].unitPrice;
      localStorage.setItem('shopping_cart', JSON.stringify(copy));
      return copy;
    });
  };

  const removeItem = (idx: number) => {
    setCart(prev => {
      const copy = prev.slice();
      copy.splice(idx, 1);
      localStorage.setItem('shopping_cart', JSON.stringify(copy));
      return copy;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('shopping_cart');
  };

  const total = cart.reduce((s, it) => s + it.totalPrice, 0);

  return (
    <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Shopping Cart (Plan purchases)</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block' }}>Search products</label>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); fetchSuggestions(e.target.value); }}
          placeholder="Type product name..."
          style={{ width: 400, padding: '.5rem' }}
        />
        {suggestions.length > 0 && (
          <div style={{ background: '#1e293b', color: '#e2e8f0', marginTop: 6, borderRadius: 6, maxWidth: 400 }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{ padding: '.5rem', cursor: 'pointer' }} onMouseDown={(e)=>{ e.preventDefault(); handleSelectSuggestion(s); }}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '.5rem' }}>Items</h3>
        {cart.length === 0 && <div style={{ color: '#94a3b8' }}>No items yet — pick products above to build your shopping list.</div>}
        {cart.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{item.productName}</div>
              <div style={{ color: '#94a3b8', fontSize: '.9rem' }}>{item.brand || ''}</div>
            </div>
            <div>
              <input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) || 1 })} style={{ width: 80 }} />
            </div>
            <div>
              <input type="text" value={item.unitPrice.toFixed(2)} onChange={e => updateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })} style={{ width: 110 }} />
            </div>
            <div style={{ width: 120, textAlign: 'right', fontWeight: 700 }}>₹{item.totalPrice.toFixed(2)}</div>
            <div>
              <button onClick={() => removeItem(idx)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '.4rem .6rem', borderRadius: 6 }}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={clearCart} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '.5rem 1rem', borderRadius: 6 }}>Clear</button>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#94a3b8' }}>Estimated Total</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
