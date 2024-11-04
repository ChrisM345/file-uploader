const auth = require("../auth");
const { body, validationResult } = require("express-validator");
const { createFolder, uploadFile, getFiles, isUnique } = require("../db/queries");

const validateFolderName = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isAlpha()
    .withMessage("Name must only contain alphabet letters")
    .custom(async (value) => {
      if (await isUnique(value)) {
        throw new Error("Folder Name already exists");
      }
    }),
];

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

const folderView = async (req, res, next) => {
  const folderName = req.params.folderName;
  const userID = req.session.passport.user;
  const files = await getFiles(folderName, userID);
  res.render("folderView", { title: folderName, folderName: folderName, files: files });
};

const getFileUpload = (req, res, next) => {
  const folderName = req.params.folderName;
  res.render("fileUploadView", { title: "File Upload", data: {}, folderName: folderName });
};

const postFileUpload = (req, res, next) => {
  console.log(req.session.passport.user);
  console.log(req.body.fileData);
  console.log(req.params.folderName);
  uploadFile(req.session.passport.user, req.params.folderName, req.body.fileData);
  res.redirect("../");
};

module.exports = {
  getFileUpload,
  getCreateFolder,
  postCreateFolder,
  folderView,
  postFileUpload,
};
