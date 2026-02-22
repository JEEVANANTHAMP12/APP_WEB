const { errorResponse } = require('../utils/apiResponse');

/**
 * Restrict access to specific roles
 * Usage: authorizeRoles('admin', 'owner')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }
    next();
  };
};

/**
 * Ensure owner is only accessing THEIR canteen data
 */
const canteenOwnerGuard = (req, res, next) => {
  if (req.user.role === 'admin') return next(); // admin bypasses
  const canteenId = req.params.canteenId || req.body.canteen_id;
  if (
    req.user.canteen_id &&
    req.user.canteen_id.toString() !== canteenId?.toString()
  ) {
    return errorResponse(res, 403, 'Access denied to this canteen');
  }
  next();
};

module.exports = { authorizeRoles, canteenOwnerGuard };
