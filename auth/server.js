const express = require("express");
const pg = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// --- SIGNUP ---
app.post("/api/signup", async (req, res) => {
  const { name, contact, password, role } = req.body;
  if (!name || !contact || !password || !role) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, contact, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, role, contact`,
      [name, contact, hashed, role]
    );
    const user = result.rows[0];
    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Contact already registered." });
    }
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// --- LOGIN ---
app.post("/api/login", async (req, res) => {
  const { contact, password, role } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE contact = $1 AND role = $2",
      [contact, role]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "No account found." });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Incorrect password." });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
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

// --- PROTECTED ROUTE EXAMPLE ---
app.get("/api/dashboard", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token." });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: `Welcome ${decoded.name}!`, role: decoded.role });
  } catch {
    res.status(401).json({ error: "Invalid token." });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`✅ Server running on http://localhost:${process.env.PORT}`)
);
