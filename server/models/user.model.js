import pool from "../lib/db/db.js";
import bcrypt from "bcryptjs";

export async function getUserByUsername(username) {
  const user = await pool.query(`SELECT * FROM users WHERE username = $1`, [
    username,
  ]);
  return user;
}

export async function getUserByEmail(email) {
  const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return user; // return single user
}

export async function getUserById(id) {
  const user = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [id]);
  return user.rows[0]; // return single user
}

export async function createUser(username, full_name, email, password) {
  try {
    const hashedPassword = await hashPassword(password);
    const newUser = await pool.query(
      `INSERT INTO users (username, full_name, email, password_hash) 
           VALUES ($1, $2, $3, $4) RETURNING username, full_name, email`,
      [username, full_name, email, hashedPassword]
    );
    return newUser;
  } catch (error) {
    console.log("Error in createUser Function", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}

export async function matchPassword(enteredPassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
}
