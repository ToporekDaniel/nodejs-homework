const Joi = require("@hapi/joi");

const schemaPOST = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9()\s+-]+$/)
    .min(8)
    .max(30)
    .required(),
});

const schemaPUT = Joi.object({
  name: Joi.string().min(2).max(30).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^[0-9()\s+-]+$/)
    .min(8)
    .max(30)
    .optional(),
});

module.exports = {
  schemaPOST,
  schemaPUT,
};
