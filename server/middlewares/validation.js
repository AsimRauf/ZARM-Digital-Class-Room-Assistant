const Joi = require('joi');

exports.validateRegister = (req, res, next) => {
  // For multipart/form-data, access fields from req.body
  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  };

  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(userData);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
// Validation for user login
exports.validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Validation for room creation
exports.validateRoomCreation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
