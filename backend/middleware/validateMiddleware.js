const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator results.
 * If there are validation errors, it returns a 422 response
 * with a list of error messages.
 *
 * Use this AFTER defining your validation rules with express-validator.
 *
 * @example
 * router.post('/register', [
 *   body('email').isEmail(),
 *   validateRequest,
 *   authController.register
 * ]);
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please check your inputs.',
      errors: errorMessages,
    });
  }

  next();
};

module.exports = { validateRequest };
