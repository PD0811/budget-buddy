// Replace all code in backend/src/seed.ts with this final version

import fs from 'fs';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Load .env variables first ---
dotenv.config();

// --- Re-create the __dirname variable for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Create the connection pool ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

interface ExcelRow {
  user_id: string;
  product_name: string;
  product_type: string;
  vendor: string;
  date: number;
  qty: number;
  unit_price: number;
  total: number;
  brand?: string;
}

async function main() {
  const filePath = path.resolve(__dirname, '..', '..', 'Expense_Data.xlsx');

  if (!fs.existsSync(filePath)) {
    console.error(`Error: Data file not found at ${filePath}`);
    return;
  }

  let client;
  try {
    console.log('Attempting to connect to the database...');
    client = await pool.connect();
    console.log('Database connection successful. Starting seeding process...');

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) throw new Error("Could not find any sheets in the Excel file.");
    
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error(`Sheet with name "${sheetName}" was not found.`);

    const expensesData = xlsx.utils.sheet_to_json(worksheet) as ExcelRow[];
    console.log(`Found ${expensesData.length} expense records to process.`);

    await client.query('BEGIN');

    for (const row of expensesData) {
      // --- Find or Create Vendor (using lowercase table name) ---
      const vendorName = row.vendor || 'Unknown';
      let vendorResult = await client.query('SELECT vendor_id FROM vendors WHERE vendor_name ILIKE $1', [vendorName]);
      let vendorId = vendorResult.rows.length > 0 ? vendorResult.rows[0].vendor_id : (await client.query('INSERT INTO vendors (vendor_name) VALUES ($1) RETURNING vendor_id', [vendorName])).rows[0].vendor_id;

      // --- Find or Create Category (using lowercase table name) ---
      const categoryName = row.product_type || 'Uncategorized';
      let categoryResult = await client.query('SELECT category_id FROM categories WHERE category_name ILIKE $1', [categoryName]);
      let categoryId = categoryResult.rows.length > 0 ? categoryResult.rows[0].category_id : (await client.query('INSERT INTO categories (category_name) VALUES ($1) RETURNING category_id', [categoryName])).rows[0].category_id;

      // --- Find or Create Product (using lowercase table name) ---
      const productName = row.product_name;
      const brand = row.brand || null;
      let productResult = await client.query('SELECT product_id FROM products WHERE product_name = $1 AND (brand = $2 OR (brand IS NULL AND $2 IS NULL))', [productName, brand]);
      let productId;
      if (productResult.rows.length > 0) {
        productId = productResult.rows[0].product_id;
      } else {
        const newProductId = `${productName.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const newProduct = await client.query('INSERT INTO products (product_id, product_name, brand, category_id) VALUES ($1, $2, $3, $4) RETURNING product_id', [newProductId, productName, brand, categoryId]);
        productId = newProduct.rows[0].product_id;
      }
      
      const expenseDate = new Date((row.date - 25569) * 86400 * 1000);
      
      // --- Insert the final Expense record (using lowercase table name) ---
      const insertExpenseQuery = `INSERT INTO expenses (user_id, product_id, category_id, vendor_id, expense_date, quantity, unit_price, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;
      const expenseValues = [row.user_id, productId, categoryId, vendorId, expenseDate, row.qty, row.unit_price, row.total];
      await client.query(insertExpenseQuery, expenseValues);
    }

    await client.query('COMMIT');
    console.log('✅ Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ AN ERROR OCCURRED:');
    console.error(error);
    if (client) {
      await client.query('ROLLBACK');
      console.log('Transaction rolled back.');
    }
  } finally {
    if (client) {
      client.release();
      console.log('Database client released.');
    }
    await pool.end();
    console.log('Connection pool closed.');
  }
}

main();
