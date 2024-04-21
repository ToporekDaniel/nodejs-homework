const Joi = require("@hapi/joi");

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W]).{8,}$/)
    .message(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character."
    ),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
