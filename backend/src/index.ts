// backend/src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg'; // <-- Make sure this is imported

// 1. Load environment variables from the .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- DATABASE CONNECTION SETUP ---
// 2. Create a new connection pool using the credentials from .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT), // The port needs to be a number
});

// Add a quick check to see if the connection is successful
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to the PostgreSQL database.');
  }
});
// ------------------------------------


// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
// This is where your API endpoints (like POST /api/expenses) will go.
// They will use the 'pool' object we created above to run queries.
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend! Database connection is set up.' });
});
app.get('/api/expenses', async (req, res) => {
  // For now, we use the hardcoded user. This will be easy to make dynamic later.
  const userId = 'goutam1986'; 

  try {
    // This SQL query joins all the necessary tables to get human-readable data.
    const query = `
      SELECT
        e.expense_id AS id, -- Alias expense_id to id to match the frontend's type
        e.quantity,
        e.unit_price,
        e.total AS "totalPrice", -- Alias total to totalPrice
        e.expense_date AS date,
        p.product_name AS "productName",
        p.brand,
        v.vendor_name AS vendor
      FROM
        Expenses e
      JOIN
        Products p ON e.product_id = p.product_id
      JOIN
        Vendors v ON e.vendor_id = v.vendor_id
      WHERE
        e.user_id = $1
      ORDER BY
        e.expense_date DESC, e.expense_id DESC -- Order by most recent
      LIMIT 10; -- Limit to the 10 most recent entries
    `;

    const { rows } = await pool.query(query, [userId]);
    res.status(200).json(rows);

  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'An internal server error occurred while fetching expenses.' });
  }
});
app.get('/api/products/search', async (req, res) => {
  const { q } = req.query; // q is the search query from the user

  if (!q || typeof q !== 'string') {
    return res.json([]); // Return empty if no query
  }

  try {
    // This query finds products where the name is similar to the search term.
    // It also joins with Categories to get the category_name.
    const query = `
      SELECT
        p.product_id,
        p.product_name,
        p.brand,
        p.category_id,
        c.category_name
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.category_id
      WHERE p.product_name ILIKE $1
      LIMIT 10;
    `;
    const { rows } = await pool.query(query, [`%${q}%`]);
    res.status(200).json(rows);

  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});
// --- FINAL API Endpoint to Add a New Expense ---

app.post('/api/expenses', async (req, res) => {
  // 1. Destructure categoryName instead of categoryId
  const {
    productName,
    brand,
    categoryName, // Changed from categoryId
    quantity,
    unitPrice,
    date,
    vendor,
    totalPrice
  } = req.body;

  const userId = 'goutam1986';
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 2. "Find or Create" the Category
    let categoryResult = await client.query('SELECT category_id FROM Categories WHERE category_name ILIKE $1', [categoryName]);
    let categoryId;

    if (categoryResult.rows.length > 0) {
      // If the category exists, use its ID
      categoryId = categoryResult.rows[0].category_id;
    } else {
      // If the category is new, insert it and get the new ID
          const newCategory = await client.query('INSERT INTO Categories (category_name) VALUES ($1) RETURNING category_id', [categoryName]);
      categoryId = newCategory.rows[0].category_id;
    }
    
    // 3. The rest of the logic uses the determined categoryId
    let productResult = await client.query(
      'SELECT product_id FROM Products WHERE product_name = $1 AND (brand = $2 OR (brand IS NULL AND $2 IS NULL))',
      [productName, brand || null]
    );
    let productId;
    if (productResult.rows.length > 0) {
      productId = productResult.rows[0].product_id;
    } else {
      const newProductId = `${productName.substring(0, 3).toUpperCase()}-${Date.now()}`;
      const newProduct = await client.query(
        'INSERT INTO Products (product_id, product_name, brand, category_id) VALUES ($1, $2, $3, $4) RETURNING product_id',
        [newProductId, productName, brand || null, categoryId]
      );
      productId = newProduct.rows[0].product_id;
    }

    // Find or Create Vendor
    let vendorResult = await client.query('SELECT vendor_id FROM Vendors WHERE vendor_name ILIKE $1', [vendor]);
    let vendorId = vendorResult.rows.length > 0
      ? vendorResult.rows[0].vendor_id
      : (await client.query('INSERT INTO Vendors (vendor_name) VALUES ($1) RETURNING vendor_id', [vendor])).rows[0].vendor_id;

    // Insert the final expense record
    const insertExpenseQuery = `
      INSERT INTO Expenses (user_id, product_id, category_id, vendor_id, expense_date, quantity, unit_price, total)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;
    const expenseValues = [userId, productId, categoryId, vendorId, date, quantity, unitPrice, totalPrice];
    const newExpense = await client.query(insertExpenseQuery, expenseValues);

    await client.query('COMMIT');
    res.status(201).json(newExpense.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in expense creation:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  } finally {
    client.release();
  }
});


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});
