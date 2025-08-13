// Create this new file at: backend/src/db.ts

import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables from the .env file
dotenv.config();

// Create and EXPORT the pool. The 'export' is the most important part.
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});
