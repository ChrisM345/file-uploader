const auth = require("../auth");
const { body, validationResult } = require("express-validator");
const { getUser, createUser } = require("../db/queries");
const bcrypt = require("bcryptjs");

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
  res.render("indexView", { title: "File Uploader", user: await req.user });
};

const getSignup = (req, res) => {
  res.render("signupView", { title: "Signup Form", data: {} });
};

const postSignup = [
  validateLogin,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("signupView", {
        title: "Signup Form",
        errors: errors.array(),
        data: {
          username: req.body.username,
        },
      });
    }
    try {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return console.log("Error encrypting password");
        }
        createUser(req.body.username, hashedPassword);
        res.redirect("/");
      });
    } catch (err) {
      return next(err);
    }
  },
];

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
  postSignup,
  getLogin,
  postLogin,
};
