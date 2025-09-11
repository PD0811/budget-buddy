// backend/src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg'; // <-- Make sure this is imported
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

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
    console.error('❌ Error connecting to the database:', err);
    console.error('Please check your .env file and database connection');
  } else {
    console.log('✅ Successfully connected to the PostgreSQL database.');
  }
});

// Handle uncaught exceptions to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
// ------------------------------------


// --- Email Configuration ---
// SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Test SendGrid connection
console.log('🔍 SendGrid API Key:', process.env.SENDGRID_API_KEY ? 'Present' : 'Missing');
console.log('🔍 From Email:', process.env.SENDGRID_FROM_EMAIL || 'Not set');

// Fallback nodemailer for Gmail (if you want to keep it as backup)
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Authentication Helper Functions ---
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (user: any) => {
  return jwt.sign(
    { id: user.user_id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const secret = JWT_SECRET;
    const decoded = jwt.verify(token, secret) as any;
    req.user = decoded; // Add user info to request object
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// --- Authentication Routes ---
// SIGNUP
app.post("/api/signup", async (req, res) => {
  const { username, name, contact, password, role, location, pincode } = req.body;
  console.log('Signup request received:', { username, name, contact, role, location, pincode }); // Debug log
  
  if (!username || !name || !contact || !password || !role) {
    return res.status(400).json({ error: "All fields are required (username, name, contact, password, role)." });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully'); // Debug log
    
    // Store location data if provided
    const locationData = location ? JSON.stringify({
      lat: location.lat,
      lng: location.lng,
      city: location.city || 'Unknown',
      country: location.country || 'Unknown',
      timestamp: new Date().toISOString()
    }) : null;
    
    const result = await pool.query(
      `INSERT INTO users (user_id, name, contact, password_hash, role, location_data, pincode, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING user_id, name, role, contact`,
      [username, name, contact, hashed, role, locationData, pincode || null]
    );
    console.log('Database insert successful:', result.rows[0]); // Debug log
    console.log('📍 LOCATION DATA STORED:');
    console.log(`   User: ${username} (${role})`);
    console.log(`   Location: ${location?.city}, ${location?.country}`);
    console.log(`   Coordinates: ${location?.lat}, ${location?.lng}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log('   Raw Data:', locationData);
    
    const user = result.rows[0];
    const token = generateToken(user);
    res.json({ token, user });
  } catch (err: any) {
    console.error('Signup error details:', err); // More detailed error logging
    if (err.code === "23505") {
      return res.status(400).json({ error: "Username or contact already registered." });
    }
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password, role, location } = req.body;
  console.log('Login request received:', { username, role, location }); // Debug log
  
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE user_id = $1 AND role = $2",
      [username, role]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "No account found." });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Incorrect password." });

    // Update location data if provided
    if (location) {
      const locationData = JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        city: location.city || 'Unknown',
        country: location.country || 'Unknown',
        timestamp: new Date().toISOString()
      });
      
      await pool.query(
        "UPDATE users SET location_data = $1 WHERE user_id = $2",
        [locationData, username]
      );
      console.log('📍 LOCATION DATA UPDATED:');
      console.log(`   User: ${username} (${role})`);
      console.log(`   Location: ${location?.city}, ${location?.country}`);
      console.log(`   Coordinates: ${location?.lat}, ${location?.lng}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);
      console.log('   Raw Data:', locationData);
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        role: user.role,
        contact: user.contact,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// PROTECTED ROUTE EXAMPLE
app.get("/api/dashboard", authenticateToken, (req: any, res) => {
  res.json({ message: `Welcome ${req.user.name}!`, role: req.user.role });
});

// VIEW LOCATION DATA (Simple endpoint for testing)
app.get("/api/view-locations", async (req, res) => {
  try {
    const query = `
      SELECT 
        user_id,
        name,
        contact,
        role,
        location_data,
        created_at
      FROM users 
      WHERE location_data IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const { rows } = await pool.query(query);
    
    console.log('📍 LOCATION DATA QUERY:');
    console.log(`   Found ${rows.length} users with location data`);
    
    res.json({
      success: true,
      count: rows.length,
      locations: rows.map(row => ({
        user: row.user_id,
        name: row.name,
        contact: row.contact,
        role: row.role,
        location: row.location_data ? JSON.parse(row.location_data) : null,
        created_at: row.created_at
      }))
    });
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// --- OTP Authentication Routes ---

// SEND EMAIL OTP (Only for registered users)
app.post("/api/send-email-otp", async (req, res) => {
  const { email, role, location } = req.body;
  
  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required." });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    console.log(`\n🔍 OTP REQUEST DEBUG:`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`Location: ${location ? `${location.city}, ${location.country}` : 'Not provided'}`);
    
    // Check if user exists with this email and role
    const userResult = await pool.query(
      "SELECT * FROM users WHERE contact = $1 AND role = $2",
      [email, role]
    );

    console.log(`User query result: ${userResult.rows.length} users found`);

    if (userResult.rows.length === 0) {
      console.log(`❌ No user found with email: ${email} and role: ${role}`);
      return res.status(404).json({ error: "No account found with this email. Please register first." });
    }

    console.log(`✅ User found: ${userResult.rows[0].name}`);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP: ${otp}`);
    
    // Store OTP in database with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    console.log(`OTP expires at: ${expiresAt}`);
    
    try {
      await pool.query(
        `INSERT INTO otp_verifications (email, otp_code, expires_at, created_at) 
         VALUES ($1, $2, $3, NOW()) 
         ON CONFLICT (email) 
         DO UPDATE SET otp_code = $2, expires_at = $3, created_at = NOW()`,
        [email, otp, expiresAt]
      );
      console.log(`✅ OTP stored in database successfully`);
    } catch (dbError) {
      console.error(`❌ Database error storing OTP:`, dbError);
      throw dbError;
    }

    // Send email using SendGrid (preferred) or fallback to Gmail
    try {
      if (process.env.SENDGRID_API_KEY) {
        // Use SendGrid
        const msg = {
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@budgetbuddy.com',
          subject: 'Budget Buddy - Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; text-align: center;">Budget Buddy Verification</h2>
              <p style="font-size: 16px; color: #666;">Your verification code is:</p>
              <div style="background-color: #f4f4f4; padding: 30px; text-align: center; margin: 20px 0; border-radius: 10px;">
                <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>
              <p style="font-size: 14px; color: #666;">This code will expire in 5 minutes.</p>
              <p style="font-size: 14px; color: #666;">If you didn't request this code, please ignore this email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999; text-align: center;">Budget Buddy Team</p>
            </div>
          `
        };

        await sgMail.send(msg);
        
        console.log(`\n📧 SENDGRID EMAIL SENT:`);
        console.log(`To: ${email}`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 5 minutes\n`);

        res.json({ 
          message: "OTP sent successfully to your email",
          email: email.replace(/(.{2}).*(@.*)/, '$1***$2')
        });
      } else {
        // Fallback to Gmail
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Budget Buddy - Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; text-align: center;">Budget Buddy Verification</h2>
              <p style="font-size: 16px; color: #666;">Your verification code is:</p>
              <div style="background-color: #f4f4f4; padding: 30px; text-align: center; margin: 20px 0; border-radius: 10px;">
                <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>
              <p style="font-size: 14px; color: #666;">This code will expire in 5 minutes.</p>
              <p style="font-size: 14px; color: #666;">If you didn't request this code, please ignore this email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999; text-align: center;">Budget Buddy Team</p>
            </div>
          `
        };

        await emailTransporter.sendMail(mailOptions);
        
        console.log(`\n📧 GMAIL EMAIL SENT:`);
        console.log(`To: ${email}`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 5 minutes\n`);

        res.json({ 
          message: "OTP sent successfully to your email",
          email: email.replace(/(.{2}).*(@.*)/, '$1***$2')
        });
      }
    } catch (emailError: any) {
      console.error('❌ Email sending failed:', emailError);
      console.error('❌ Error details:', {
        message: emailError.message,
        code: emailError.code,
        response: emailError.response?.body,
        statusCode: emailError.response?.statusCode
      });
      
      // Fallback to console if email fails
      console.log(`\n📧 EMAIL FAILED - OTP in console:`);
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Expires in: 5 minutes\n`);
      
      res.json({ 
        message: "OTP sent successfully (check console for code - email failed)",
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2')
      });
    }

  } catch (err: any) {
    console.error('❌ Send email OTP error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack
    });
    res.status(500).json({ 
      error: "Server error.", 
      details: err.message 
    });
  }
});

// VERIFY EMAIL OTP (Only for registered users)
app.post("/api/verify-email-otp", async (req, res) => {
  const { email, otp, role, location } = req.body;
  
  if (!email || !otp || !role) {
    return res.status(400).json({ error: "Email, OTP, and role are required." });
  }

  try {
    // Check if OTP is valid and not expired
    const otpResult = await pool.query(
      `SELECT * FROM otp_verifications 
       WHERE email = $1 AND otp_code = $2 AND expires_at > NOW()`,
      [email, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // Get user details (user must exist since we checked in send-otp)
    const userResult = await pool.query(
      "SELECT * FROM users WHERE contact = $1 AND role = $2",
      [email, role]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = userResult.rows[0];
    
    // Delete the used OTP
    await pool.query(
      "DELETE FROM otp_verifications WHERE email = $1",
      [email]
    );

    // Generate JWT token
    const token = generateToken(user);
    
    console.log(`\n👤 USER LOGIN SUCCESSFUL:`);
    console.log(`Email: ${email}`);
    console.log(`User ID: ${user.user_id}`);
    console.log(`Role: ${role}\n`);
    
    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        role: user.role,
        contact: user.contact,
      },
      message: "Email OTP verified successfully."
    });

  } catch (err) {
    console.error('Verify email OTP error:', err);
    res.status(500).json({ error: "Server error." });
  }
});

// --- Other Routes ---
// This is where your API endpoints (like POST /api/expenses) will go.
// They will use the 'pool' object we created above to run queries.

//monthly report gen
app.get('/api/reports/summary', authenticateToken, async (req: any, res) => {
  const userId = req.user.id; // Get from authenticated user
  const { year, month } = req.query;

  // --- Date Calculation Logic (remains the same) ---
  let reportYear, reportMonth;
  if (year && month && !isNaN(parseInt(year as string)) && !isNaN(parseInt(month as string))) {
    reportYear = parseInt(year as string);
    reportMonth = parseInt(month as string) - 1;
  } else {
    const now = new Date();
    reportYear = now.getFullYear();
    reportMonth = now.getMonth();
  }
  const startDate = new Date(reportYear, reportMonth, 1).toISOString();
  const endDate = new Date(reportYear, reportMonth + 1, 0).toISOString();

  try {
    // --- THIS IS THE NEW, CONSOLIDATED QUERY ---
    const query = `
      -- Use a Common Table Expression (CTE) to get all relevant expenses for the period
      WITH monthly_expenses AS (
        SELECT
          e.expense_id,
          e.expense_date,
          e.total,
          p.product_name,
          c.category_id,
          c.category_name
        FROM Expenses e
        JOIN Products p ON e.product_id = p.product_id
        JOIN Categories c ON e.category_id = c.category_id
        WHERE
          e.user_id = $1 AND
          e.expense_date BETWEEN $2 AND $3
      )
      -- Now, group by category and aggregate the results
      SELECT
        me.category_id,
        me.category_name,
        SUM(me.total) AS total_spent,
        COUNT(me.expense_id) AS transaction_count,
        -- This is the magic: aggregate all expenses for this category into a JSON array
        json_agg(
          json_build_object(
            'expense_id', me.expense_id,
            'expense_date', me.expense_date,
            'product_name', me.product_name,
            'total', me.total
          ) ORDER BY me.expense_date DESC
        ) AS expenses
      FROM monthly_expenses me
      GROUP BY
        me.category_id, me.category_name
      ORDER BY
        total_spent DESC;
    `;
    const { rows: spendingByCategory } = await pool.query(query, [userId, startDate, endDate]);

    // Calculate the overall total separately
    const overallTotal = spendingByCategory.reduce((sum, cat) => sum + parseFloat(cat.total_spent), 0);
    
    // Assemble the final report object
    const report = {
      period: { year: reportYear, month: reportMonth + 1 },
      overallTotal,
      spendingByCategory, // This now contains the nested expense details
    };

    res.status(200).json(report);

  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});
//calendar

app.get('/api/reports/calendar', authenticateToken, async (req: any, res) => {
  const userId = req.user.id; // Get from authenticated user
  const { year, month } = req.query;

  // --- Date validation and setup (same as our other report) ---
  let reportYear, reportMonth;
  if (year && month && !isNaN(parseInt(year as string)) && !isNaN(parseInt(month as string))) {
    reportYear = parseInt(year as string);
    reportMonth = parseInt(month as string) - 1; // JS months are 0-11
  } else {
    const now = new Date();
    reportYear = now.getFullYear();
    reportMonth = now.getMonth();
  }
  const startDate = new Date(reportYear, reportMonth, 1).toISOString();
  const endDate = new Date(reportYear, reportMonth + 1, 0).toISOString();

  try {
    // This query gets the total spending for each day that *has* an expense
    const query = `
      SELECT
        EXTRACT(DAY FROM expense_date) AS day,
        SUM(total) AS total_spent
      FROM Expenses
      WHERE
        user_id = $1 AND
        expense_date BETWEEN $2 AND $3
      GROUP BY
        day
      ORDER BY
        day;
    `;
    const { rows } = await pool.query(query, [userId, startDate, endDate]);

    // Now, we create a map for easy lookup on the frontend
    const dailyTotalsMap: { [key: number]: number } = {};
    rows.forEach(row => {
      dailyTotalsMap[row.day] = parseFloat(row.total_spent);
    });

    res.status(200).json(dailyTotalsMap);

  } catch (err) {
    console.error('Error fetching calendar data:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});
//category breakdowns
// This endpoint provides the raw expense data for a specific category within a given month.
app.get('/api/reports/category-details', authenticateToken, async (req: any, res) => {
  const userId = req.user.id; // Get from authenticated user

  // We need categoryId, year, and month from the frontend
  const { categoryId, year, month } = req.query;

  if (!categoryId || !year || !month) {
    return res.status(400).json({ error: 'Missing required parameters: categoryId, year, and month.' });
  }

  // --- Date Calculation (same as summary report) ---
  const reportYear = parseInt(year as string);
  const reportMonth = parseInt(month as string) - 1; // JS months are 0-11
  const startDate = new Date(reportYear, reportMonth, 1).toISOString();
  const endDate = new Date(reportYear, reportMonth + 1, 0).toISOString();
  
  try {
    const query = `
      SELECT
        e.expense_id,
        e.expense_date,
        p.product_name,
        p.brand,
        e.quantity,
        e.unit_price,
        e.total
      FROM Expenses e
      JOIN Products p ON e.product_id = p.product_id
      WHERE
        e.user_id = $1 AND
        e.category_id = $2 AND
        e.expense_date BETWEEN $3 AND $4
      ORDER BY
        e.expense_date DESC;
    `;
    
    const { rows } = await pool.query(query, [userId, categoryId, startDate, endDate]);
    res.status(200).json(rows);

  } catch (err) {
    console.error('Error fetching category details:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// --- A small but important update to your SUMMARY endpoint ---
// We also need to make sure the summary report sends back the category_id.
// Find your `/api/reports/summary` endpoint and add `c.category_id` to the SELECT and GROUP BY clauses.

// In your app.get('/api/reports/summary', ...), find the main query and change it to this:
const query = `
  SELECT
    c.category_id, -- <-- ADD THIS LINE
    c.category_name,
    SUM(e.total) AS total_spent,
    COUNT(e.expense_id) AS transaction_count
  FROM Expenses e
  JOIN Categories c ON e.category_id = c.category_id
  WHERE e.user_id = $1 AND e.expense_date BETWEEN $2 AND $3
  GROUP BY
    c.category_id, c.category_name -- <-- ADD c.category_id HERE
  ORDER BY
    total_spent DESC;
`;


app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend! Database connection is set up.' });
});
app.get('/api/expenses', authenticateToken, async (req: any, res) => {
  // Get user ID from authenticated token
  const userId = req.user.id;
  const { page = 1, limit = 50 } = req.query; // Default to 50 items per page
  const offset = (Number(page) - 1) * Number(limit);

  try {
    // Get total count for pagination info
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Expenses e
      WHERE e.user_id = $1
    `;
    const countResult = await pool.query(countQuery, [userId]);
    const totalCount = parseInt(countResult.rows[0].total);

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
      LIMIT $2 OFFSET $3
    `;

    const { rows } = await pool.query(query, [userId, limit, offset]);
    
    res.status(200).json({
      expenses: rows,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalItems: totalCount,
        itemsPerPage: Number(limit),
        hasNextPage: Number(page) < Math.ceil(totalCount / Number(limit)),
        hasPrevPage: Number(page) > 1
      }
    });

  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'An internal server error occurred while fetching expenses.' });
  }
});
// Search product names only
app.get('/api/products/search', async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.json([]);
  }

  try {
    const query = `
      SELECT MIN(p.product_name) AS product_name
FROM products p
WHERE p.product_name ILIKE $1
GROUP BY lower(p.product_name)
ORDER BY MIN(p.product_name)
LIMIT 10;
    `;
    const { rows } = await pool.query(query, [`%${q}%`]);
    const productNames = rows.map(row => row.product_name).filter(Boolean);
    res.status(200).json(productNames);

  } catch (err) {
    console.error('Error searching product names:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// GET /api/products/lookup?name=...&brand=...
app.get('/api/products/lookup', async (req, res) => {
  const name = String(req.query.name || '').trim();
  const brand = (req.query.brand == null || String(req.query.brand).trim() === '')
    ? null
    : String(req.query.brand).trim();

  if (!name) return res.status(400).json({ error: 'Missing product name' });

  try {
    const q = `
      SELECT p.product_id, p.product_name, p.brand, p.category_id, c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE lower(p.product_name) = lower($1)
        AND COALESCE(lower(p.brand), '') = COALESCE(lower($2), '')
      LIMIT 1;
    `;
    const { rows } = await pool.query(q, [name, brand]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows);
  } catch (e) {
    console.error('lookup error', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Search product details (for other uses)
app.get('/api/products/details', async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.json([]);
  }

  try {
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
    console.error('Error searching product details:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// Search brands endpoint
app.get('/api/brands/search', async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.json([]);
  }

  try {
    const query = `
      SELECT DISTINCT brand
      FROM Products
      WHERE brand IS NOT NULL AND brand ILIKE $1
      ORDER BY brand
      LIMIT 10;
    `;
    const { rows } = await pool.query(query, [`%${q}%`]);
    const brands = rows.map(row => row.brand).filter(Boolean);
    res.status(200).json(brands);

  } catch (err) {
    console.error('Error searching brands:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// Search vendors endpoint
app.get('/api/vendors/search', async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.json([]);
  }

  try {
    const query = `
      SELECT DISTINCT vendor_name
      FROM Vendors
      WHERE vendor_name ILIKE $1
      ORDER BY vendor_name
      LIMIT 10;
    `;
    const { rows } = await pool.query(query, [`%${q}%`]);
    const vendors = rows.map(row => row.vendor_name).filter(Boolean);
    res.status(200).json(vendors);
  } catch (err) {
    console.error('Error searching vendors:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});


// Get monthly spending by category vs average
app.get('/api/reports/monthly-category-comparison', authenticateToken, async (req: any, res) => {
  const userId = req.user.id;
  const { year, month } = req.query;

  // Date calculation
  let reportYear, reportMonth;
  if (year && month && !isNaN(parseInt(year as string)) && !isNaN(parseInt(month as string))) {
    reportYear = parseInt(year as string);
    reportMonth = parseInt(month as string) - 1;
  } else {
    const now = new Date();
    reportYear = now.getFullYear();
    reportMonth = now.getMonth();
  }
  const startDate = new Date(reportYear, reportMonth, 1).toISOString();
  const endDate = new Date(reportYear, reportMonth + 1, 0).toISOString();

  try {
    // Get current month spending by category
    const currentMonthQuery = `
      SELECT
        c.category_name,
        SUM(e.total) AS current_month_spent,
        COUNT(e.expense_id) AS transaction_count
      FROM Expenses e
      JOIN Categories c ON e.category_id = c.category_id
      WHERE e.user_id = $1 AND e.expense_date BETWEEN $2 AND $3
      GROUP BY c.category_id, c.category_name
      ORDER BY current_month_spent DESC;
    `;
    const { rows: currentMonthData } = await pool.query(currentMonthQuery, [userId, startDate, endDate]);

    // Get historical average spending by category (last 12 months)
    const historicalStartDate = new Date(reportYear, reportMonth - 11, 1).toISOString();
    const historicalEndDate = new Date(reportYear, reportMonth + 1, 0).toISOString();

    const averageQuery = `
      SELECT
        c.category_name,
        AVG(monthly_spending) AS average_monthly_spending
      FROM (
        SELECT
          c.category_id,
          c.category_name,
          EXTRACT(YEAR FROM e.expense_date) as year,
          EXTRACT(MONTH FROM e.expense_date) as month,
          SUM(e.total) as monthly_spending
        FROM Expenses e
        JOIN Categories c ON e.category_id = c.category_id
        WHERE e.user_id = $1 AND e.expense_date BETWEEN $2 AND $3
        GROUP BY c.category_id, c.category_name, EXTRACT(YEAR FROM e.expense_date), EXTRACT(MONTH FROM e.expense_date)
      ) monthly_data
      JOIN Categories c ON monthly_data.category_id = c.category_id
      GROUP BY c.category_id, c.category_name
      ORDER BY average_monthly_spending DESC;
    `;
    const { rows: averageData } = await pool.query(averageQuery, [userId, historicalStartDate, historicalEndDate]);

    // Combine current month and average data
    const combinedData = currentMonthData.map(current => {
      const average = averageData.find(avg => avg.category_name === current.category_name);
      return {
        category: current.category_name,
        currentMonth: parseFloat(current.current_month_spent),
        average: average ? parseFloat(average.average_monthly_spending) : 0,
        transactionCount: parseInt(current.transaction_count),
        difference: parseFloat(current.current_month_spent) - (average ? parseFloat(average.average_monthly_spending) : 0),
        percentageChange: average && average.average_monthly_spending > 0 
          ? ((parseFloat(current.current_month_spent) - parseFloat(average.average_monthly_spending)) / parseFloat(average.average_monthly_spending)) * 100
          : 0
      };
    });

    res.status(200).json({
      period: { year: reportYear, month: reportMonth + 1 },
      data: combinedData
    });

  } catch (err) {
    console.error('Error fetching monthly category comparison:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});
// --- FINAL API Endpoint to Add a New Expense ---

// Helper function to process a single expense item
const processExpenseItem = async (client: any, item: any, vendor: string, date: string, userId: string) => {
  const { productName, brand, categoryName, quantity, unitPrice, totalPrice } = item;

  // Find or Create Category
  let categoryResult = await client.query('SELECT category_id FROM Categories WHERE category_name ILIKE $1', [categoryName]);
  let categoryId;

  if (categoryResult.rows.length > 0) {
    categoryId = categoryResult.rows[0].category_id;
  } else {
    const newCategory = await client.query('INSERT INTO Categories (category_name) VALUES ($1) RETURNING category_id', [categoryName]);
    categoryId = newCategory.rows[0].category_id;
  }
  
  // Find or Create Product
  let productResult = await client.query(
    'SELECT product_id FROM Products WHERE product_name = $1 AND (brand = $2 OR (brand IS NULL AND $2 IS NULL))',
    [productName, brand || null]
  );
  let productId;
  if (productResult.rows.length > 0) {
    productId = productResult.rows[0].product_id;
  } else {
    const newProductId = `${productName.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  // Insert the expense record
  const insertExpenseQuery = `
    INSERT INTO Expenses (user_id, product_id, category_id, vendor_id, expense_date, quantity, unit_price, total)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
  `;
  const expenseValues = [userId, productId, categoryId, vendorId, date, quantity, unitPrice, totalPrice];
  const newExpense = await client.query(insertExpenseQuery, expenseValues);
  
  return newExpense.rows[0];
};

// Single expense endpoint (existing)
app.post('/api/expenses', authenticateToken, async (req: any, res) => {
  const {
    productName,
    brand,
    categoryName,
    quantity,
    unitPrice,
    date,
    vendor,
    totalPrice
  } = req.body;

  const userId = req.user.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await processExpenseItem(client, req.body, vendor, date, userId);
    await client.query('COMMIT');
    res.status(201).json(result);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in expense creation:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  } finally {
    client.release();
  }
});

// Batch expenses endpoint (new)
app.post('/api/expenses/batch', authenticateToken, async (req: any, res) => {
  const { items, vendor, date } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required and must not be empty.' });
  }

  if (!vendor) {
    return res.status(400).json({ error: 'Vendor is required.' });
  }

  const userId = req.user.id;
  const expenseDate = date || new Date().toISOString().slice(0, 10);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const item of items) {
      const result = await processExpenseItem(client, item, vendor, expenseDate, userId);
      results.push(result);
    }

    await client.query('COMMIT');
    res.status(201).json({ 
      message: `Successfully added ${results.length} expenses for ${vendor}`,
      count: results.length,
      vendor: vendor,
      date: expenseDate,
      expenses: results
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in batch expense creation:', err);
    res.status(500).json({ error: 'An internal server error occurred while processing batch expenses.' });
  } finally {
    client.release();
  }
});


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});
