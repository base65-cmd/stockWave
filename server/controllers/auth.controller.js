import {
  createUser,
  matchPassword,
  getUserByUsername,
  getUserByEmail,
} from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { client } from "../lib/redis.js";

const generateAuthTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  // Store the refresh token in Redis or your preferred storage
  await client.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    60 * 60 * 24 * 7
  ); // Store for 7 days
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attacks
    secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
    sameSite: "strict", // prevent CSRF attacks, cross site request forgery attacks
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attacks
    secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
    sameSite: "strict", // prevent CSRF attacks, cross site request forgery attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req, res) => {
  const { username, full_name, email, password } = req.body;

  try {
    const result = await getUserByUsername(username);
    const existingUser = result.rows[0];

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await createUser(username, full_name, email, password);

    //Authentication token generation can be added here
    const { accessToken, refreshToken } = generateAuthTokens(user.user_id); // Generate tokens
    await storeRefreshToken(user.user_id, refreshToken); // Store the refresh token in Redis

    setCookies(res, accessToken, refreshToken); // Set cookies for access and refresh tokens

    res.status(201).json({
      user: user.rows[0],
      message: "User created successfully",
    });
  } catch (error) {
    console.log("Error in register controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await getUserByEmail(email);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }

    const user = result.rows[0];

    const valid = await matchPassword(password, user.password_hash);

    if (user && valid) {
      const { accessToken, refreshToken } = generateAuthTokens(user.user_id); // Generate tokens
      await storeRefreshToken(user.user_id, refreshToken); // Store the refresh token in Redis

      setCookies(res, accessToken, refreshToken); // Set cookies for access and refresh tokens
      delete user.password_hash;
      res.status(200).json({
        user: user,
        message: "Login successfully",
      });
    } else {
      res.status(400).json({ message: "Incorrect email or password" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
    // res.status(400).json({ message: "Incorrect email or password" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        await client.del(`refresh_token:${decoded.userId}`);
      } catch (err) {
        console.error("Token verification failed:", err);
      }
    }
    // Clear cookies on logout
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "development") {
      return res
        .status(200)
        .json({ message: "Development mode, skipping refresh" });
    }
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401); // Unauthorized

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await client.get(`refresh_token:${decoded.userId}`);

    if (refreshToken !== storedToken) return res.sendStatus(403); // Forbidden
    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true, // prevent XSS attacks, cross site scripting attacks
      secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
      sameSite: "strict", // prevent CSRF attacks, cross site request forgery attacks
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.status(200).json({ message: "Access token refreshed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log(error.message);
  }
};
