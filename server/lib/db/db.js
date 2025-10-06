import pkg from "pg";
import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

// const { Pool } = pkg;
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const pool = new Pool({
  connectionString: `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require&channel_binding=require`,
});

export default pool;
