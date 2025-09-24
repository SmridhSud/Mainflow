const validator = require('validator');

function validateLogin(req, res, next) {
  const { identifier, password } = req.body;
  const errors = {};

  if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
    errors.identifier = 'Email or username is required';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.password = 'Password is required and must be at least 6 characters';
  }

  if (Object.keys(errors).length) return res.status(400).json({ errors });

  // Optionally, check if identifier looks like an email
  if (validator.isEmail(identifier)) {
    req.body.isEmail = true;
  } else {
    req.body.isEmail = false;
  }

  next();
}

module.exports = {
  validateLogin
};
