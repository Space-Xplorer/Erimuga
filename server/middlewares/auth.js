// middlewares/auth.js

export const isLoggedIn = (req, res, next) => {
  console.log('🔒 isLoggedIn middleware check:');
  console.log('  - Session ID:', req.sessionID);
  console.log('  - Session exists:', !!req.session);
  console.log('  - req.isAuthenticated function exists:', typeof req.isAuthenticated === 'function');
  console.log('  - req.isAuthenticated result:', req.isAuthenticated ? req.isAuthenticated() : 'Function not found');
  console.log('  - User object:', req.user ? { _id: req.user._id, email: req.user.email } : 'No user');

  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log('✅ isLoggedIn: User is authenticated, proceeding...');
    return next();
  }
  
  console.log('❌ isLoggedIn: User not authenticated, blocking request');
  return res.status(401).json({ error: "Unauthorized. Please log in." });
};

export const isAdmin = (req, res, next) => {
  console.log('👑 isAdmin middleware check:');
  console.log('  - User:', req.user ? { _id: req.user._id, userType: req.user.userType } : 'No user');
  
  if (req.user && req.user.userType === "admin") {
    console.log('✅ isAdmin: User is admin, proceeding...');
    return next();
  }
  
  console.log('❌ isAdmin: User is not admin, blocking request');
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
