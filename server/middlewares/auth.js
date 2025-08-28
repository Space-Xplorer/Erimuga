// middlewares/auth.js

export const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized. Please log in." });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.userType === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Forbidden. Admins only." });
};

// ✅ New middleware to check if user is authenticated and return user data
export const getCurrentUser = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    req.currentUser = req.user;
    return next();
  }
  req.currentUser = null;
  return next();
};
