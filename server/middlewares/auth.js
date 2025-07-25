// middlewares/auth.js

export const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized. Please log in." });
};


// middlewares/auth.js

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.userType === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Forbidden. Admins only." });
};
