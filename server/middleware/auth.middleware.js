import jwt from "jsonwebtoken";
import { getUserById } from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    return next(); // Skip authentication in test environment
  }
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET); // Verify the access token
      const user = await getUserById(decoded.userId);
      delete user.password_hash;
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user; // Attach the user to the request object
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" }); // Handle token expiration
      }
      throw error; // Rethrow other errors for global error handling
    }
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    res.status(401).json({ message: "Unauthorized access" }); // Handle errors
  }
};

export const authorize = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // Proceed to the next middleware or route handler
  } else {
    res.status(403).json({ message: "Forbidden: Admins only" }); // Handle unauthorized access
  }
};
