const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const tokenHeader = req.header("Authorization");
  if (!tokenHeader) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  // Accept both "Bearer <token>" and raw "<token>"
  const token = tokenHeader.startsWith("Bearer ")
    ? tokenHeader.slice(7).trim()
    : tokenHeader.trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Existing code signs { id: user._id }, not { user: { id } }
    const userId = decoded?.id || decoded?.user?.id;
    if (!userId) {
      return res.status(403).json({ error: "Invalid token payload" });
    }
    req.user = { id: userId };
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
