const auth = require("../auth");
const { body, validationResult } = require("express-validator");
const { getUser } = require("../db/queries");

const passwordLengthErr = "must be between 4 and 16 characters.";
const validateLogin = [
  body("password").trim().isLength({ min: 4, max: 16 }).withMessage(`Password ${passwordLengthErr}`),
  body("username").custom(async (value) => {
    if (await getUser(value)) {
      throw new Error("Username already in use");
    }
  }),
];

const get = async (req, res) => {
  res.render("indexView", { title: "File Uploader" });
};

const getSignup = (req, res) => {
  res.render("signupView", { title: "Signup Form", data: {} });
};

const getLogin = (req, res) => {
  let err = req.session.messages;
  if (req.session.messages) {
    err = req.session.messages.pop();
  }
  res.render("loginView", { title: "Login Form", data: {}, error: err });
};

const postLogin = (req, res, next) => {
  auth.passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
  })(req, res, next);
};

module.exports = {
  get,
  getSignup,
  getLogin,
  postLogin,
};
