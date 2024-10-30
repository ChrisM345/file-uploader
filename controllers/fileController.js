const auth = require("../auth");
const { body, validationResult } = require("express-validator");
const { createFolder } = require("../db/queries");

const validateFolderName = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isAlpha()
    .withMessage("Name must only contain alphabet letters"),
];

const getFileUpload = (req, res, next) => {
  res.render("fileUploadView", { title: "File Upload", data: {} });
};

const getCreateFolder = (req, res, next) => {
  res.render("createFolderView", { title: "Create Folder", data: {} });
};

const postCreateFolder = [
  validateFolderName,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("createFolderView", {
        title: "Create Folder",
        errors: errors.array(),
        data: {
          name: req.body.name,
        },
      });
    }
    createFolder(req.session.passport.user, req.body.name);
    res.redirect("/");
  },
];

module.exports = {
  getFileUpload,
  getCreateFolder,
  postCreateFolder,
};
