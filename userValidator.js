const mysql2 = require("mysql2");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const _ = require("underscore");

const signupValidator = (req, res, next) => {
  const signupSchema = Joi.object().keys({
    fname: Joi.string().required(),
    femail: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "in"] },
      })
      .required(),
    fpassword: Joi.string().required(),
    fMobileNo: Joi.string().min(10).required(),
    fregister: Joi.string().optional(),
  });

  const result = signupSchema.validate(req.body);

  if (!_.isEmpty(result) && !Object.keys(result).includes("error")) {
    next();
  } else {
    return res.status(400).json({ error: result.error.details[0].message });
  }
};

const loginValidator = (req, res, next) => {
  const loginSchema = Joi.object().keys({
    femail: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "in"] },
      })
      .required(),
    fpassword: Joi.string().required(),
  });
  const result = loginSchema.validate(req.body);

  if (!_.isEmpty(result) && !Object.keys(result).includes("error")) {
    next();
  } else {
    res.send({ message: "Invalid email" });
  }
};

module.exports = { signupValidator, loginValidator };
