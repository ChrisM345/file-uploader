const express = require("express");
const router = express.Router();
const controller = require("../controllers/fileController");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/createFolder", controller.getCreateFolder);
router.post("/createFolder", controller.postCreateFolder);
router.get("/:folderName", controller.folderView);
router.get("/:folderName/uploadFile", controller.getFileUpload);
router.post("/:folderName/uploadFile", upload.single("fileData"), controller.postFileUpload);
router.post("/:folderName/delete", controller.postDeleteFolder);
router.post("/:folderName/:filename/id/:id/delete", controller.postDeleteFile);

module.exports = router;
