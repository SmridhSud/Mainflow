// Placeholder auth middleware (no-op). Replace with real JWT check in production.
module.exports = (req, res, next) => {
  // Example: check for Authorization header, validate token, set req.user
  // If not provided, just continue for public API.
  next();
};
