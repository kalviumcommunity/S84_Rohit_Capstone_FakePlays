const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // 1. Prioritize token from httpOnly cookie
  let token = req.cookies.token;

  // 2. If no cookie, fall back to Authorization header (for testing/API clients)
  if (!token) {
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7, authHeader.length);
    }
  }

  // 3. If no token is found in either place, send an error
  if (!token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  // 4. Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id;
    if (!userId) {
      return res.status(403).json({ error: "Invalid token payload" });
    }
    req.user = { id: userId };
    next();
  } catch (error) {
    // Clear the invalid cookie if it exists
    res.clearCookie("token");
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;