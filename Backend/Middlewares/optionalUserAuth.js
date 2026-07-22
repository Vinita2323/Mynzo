const jwt = require('jsonwebtoken');
const User = require('../Models/User');

/**
 * Optional user auth — attaches req.user when a valid token is present.
 * Does not reject unauthenticated requests (used for personalized feed filtering).
 */
const optionalProtectUser = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.aud !== 'user') {
      return next();
    }

    const user = await User.findById(decoded.id).select('-otp -otpExpiry');
    if (!user) {
      return next();
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      return next();
    }

    req.user = user;
  } catch (_) {
    // Ignore invalid tokens for optional auth
  }

  return next();
};

module.exports = { optionalProtectUser };
