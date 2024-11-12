const express = require("express");
const router = express.Router();
const controller = require("../controllers/fileController");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/createFolder", controller.getCreateFolder);
router.post("/createFolder", controller.postCreateFolder);
router.get("/:folderName", controller.folderView);

router.post("/:folderName/uploadFile", upload.single("fileData"), controller.postFileUpload);
router.post("/:folderName/:renameFolder", controller.postRenameFolder);
router.get("/:folderName/uploadFile", controller.getFileUpload);

router.post("/:folderName/delete", controller.postDeleteFolder);
router.post("/:folderName/:fileName/id/:id/delete", controller.postDeleteFile);
router.get("/:folderName/:fileName", controller.getFileDetails);
router.get("/:folderName/:fileName/download", controller.getDownloadFile);
router.post("/:folderName/:fileName/renameID/:fileID", controller.postRenameFile);

module.exports = router;
