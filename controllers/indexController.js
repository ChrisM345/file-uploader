const auth = require("../auth");
const { body, validationResult } = require("express-validator");
const { getUser, createUser, setAdmin, getFolders } = require("../db/queries");
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

const validateSecret = [body("secret").trim().equals("verysecret").withMessage("Incorrect Secret")];

const get = async (req, res) => {
  res.render("indexView", { title: "File Uploader", user: await req.user, data: await getFolders(await req.user) });
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

const getAdmin = (req, res, next) => {
  res.render("adminSignupView", { title: "Admin Signup" });
};

const postAdmin = [
  validateSecret,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("adminSignupView", {
        title: "Admin Signup",
        errors: errors.array(),
      });
    }
    setAdmin(req.session.passport.user);
    res.redirect("/");
  },
];

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

module.exports = {
  get,
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  getAdmin,
  postAdmin,
  logout,
};
