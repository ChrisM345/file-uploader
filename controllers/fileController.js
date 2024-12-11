const auth = require("../auth");
const { body, validationResult } = require("express-validator");
const {
  createFolder,
  uploadFile,
  getFiles,
  isUnique,
  deleteFolder,
  deleteFile,
  updateFileURLs,
  renameFolder,
  getFile,
  renameFile,
} = require("../db/queries");

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_BYPASS);

//Bucket name I am using from supabase
const supabaseURLPath = `file-upload-project`;

//Basic validation
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
  try {
    const folderName = req.params.folderName;
    const userID = req.session.passport.user;
    const files = await getFiles(folderName, userID);
    res.render("folderView", { title: folderName, folderName: folderName, files: files });
  } catch (err) {
    next(err);
  }
};

const getFileUpload = (req, res, next) => {
  const folderName = req.params.folderName;
  res.render("fileUploadView", { title: "File Upload", data: {}, folderName: folderName });
};

const getFileDetails = async (req, res, next) => {
  const fileData = await getFile(req.params.folderName, req.session.passport.user, req.params.fileName);
  res.render("fileDetails", { title: "File Details", fileData: fileData, folderName: req.params.folderName });
};

const getDownloadFile = async (req, res, next) => {
  //path for supabase
  const path = `${req.session.passport.user}/${req.params.folderName}/${req.params.fileName}`;
  const { data, error } = await supabase.storage.from(supabaseURLPath).download(path);
  //setting header for file download
  res.setHeader("Content-Disposition", `attachment; filename="${req.params.fileName}"`);

  //convert blob to buffer and send
  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  res.send(buffer);
};

const postFileUpload = async (req, res, next) => {
  const userID = req.session.passport.user;
  const folderName = req.params.folderName;
  const fileName = req.file.originalname;
  const fileSize = req.file.size;
  const supabasePath = `${userID}/${folderName}/${fileName}`;
  const URL = `${process.env.SUPABASE_FILE_URL}/${supabasePath}`;
  //upload to supabase, allow file rewrite
  const { data, error } = await supabase.storage.from(supabaseURLPath).upload(supabasePath, req.file.buffer, {
    upsert: true,
    contentType: req.file.mimetype,
  });
  if (!error) {
    uploadFile(userID, folderName, fileName, URL, fileSize);
  }
  await res.redirect("../");
};

const postRenameFolder = [
  validateFolderName,
  async (req, res, next) => {
    const errors = validationResult(req);
    const folderName = req.params.folderName;
    const newFolderName = req.body.name;
    const userID = req.session.passport.user;
    const files = await getFiles(folderName, userID);
    if (!errors.isEmpty()) {
      return res.status(400).render("folderView", {
        title: folderName,
        folderName: folderName,
        files: files,
        errors: errors.array(),
      });
    }

    //to rename a "folder" in supabase we need to go through each file in the folder and move the file
    //first rename folder
    await renameFolder(folderName, newFolderName, userID);
    files.forEach(async (file) => {
      //get old and new URLs and supabase paths
      let newURL = file.url.split("/");
      let fileName = newURL.pop();
      newURL.pop();
      newURL = newURL.join("/") + `/${newFolderName}/${fileName}`;
      let supabaseCurrentPath = file.url.split("/");
      supabaseCurrentPath = supabaseCurrentPath.slice(-3).join("/");
      let supabaseNewPath = newURL.split("/");
      supabaseNewPath = supabaseNewPath.slice(-3).join("/");

      await supabase.storage.from(supabaseURLPath).move(supabaseCurrentPath, supabaseNewPath);
      await updateFileURLs(newFolderName, userID, fileName, newURL);
    });

    await res.redirect("/");
  },
];

const postDeleteFolder = async (req, res, next) => {
  const userID = req.session.passport.user;
  const folderName = req.params.folderName;
  //to delete "folders" in supabase we need to list all files and delete each file
  const { data, error } = await supabase.storage.from(supabaseURLPath).list(`${userID}/${folderName}`);
  let paths = [];
  data.forEach((file) => {
    let path = `${userID}/${folderName}/${file.name}`;
    paths.push(path);
  });
  await supabase.storage.from(supabaseURLPath).remove(paths);
  await deleteFolder(folderName, userID);
  res.redirect("/");
};

const postDeleteFile = async (req, res, next) => {
  const fileID = parseInt(req.params.id);
  const path = `${req.session.passport.user}/${req.params.folderName}/${req.params.fileName}`;
  await supabase.storage.from(supabaseURLPath).remove(path);
  await deleteFile(fileID);
  res.redirect(req.get("referer"));
};

const postRenameFile = async (req, res, next) => {
  const userID = req.session.passport.user;
  const fileID = parseInt(req.params.fileID);
  const folderName = req.params.folderName;
  const fileName = req.params.fileName;
  const newFileName = req.body.name;
  const ext = fileName.split(".")[1];
  const originalURL = `${userID}/${folderName}/${fileName}`;
  const newURL = `${userID}/${folderName}/${newFileName}.${ext}`;

  renameFile(fileID, newFileName);

  await supabase.storage.from(supabaseURLPath).move(originalURL, newURL);

  await res.redirect("../../");
};

module.exports = {
  getFileUpload,
  getCreateFolder,
  postCreateFolder,
  folderView,
  postFileUpload,
  postDeleteFolder,
  postDeleteFile,
  getDownloadFile,
  postRenameFolder,
  getFileDetails,
  postRenameFile,
};
