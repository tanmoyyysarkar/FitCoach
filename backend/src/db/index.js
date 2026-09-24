import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  ...(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DATABASE_HOST || "localhost",
        port: Number(process.env.DATABASE_PORT || 5433),
        user: process.env.DATABASE_USER || "fitness_user",
        password: process.env.DATABASE_PASSWORD || "fitness_password",
        database: process.env.DATABASE_NAME || "fitness_db",
      }),
});

export const query = (text, values) => pool.query(text, values);

export const connectDB = async () => {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
    console.log("Database connected");
  } finally {
    client.release();
  }
};