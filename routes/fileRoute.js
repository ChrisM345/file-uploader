const express = require("express");
const router = express.Router();
const controller = require("../controllers/fileController");

router.get("/createFolder", controller.getCreateFolder);
router.post("/createFolder", controller.postCreateFolder);
router.get("/:folderName", controller.folderView);
router.get("/:folderName/uploadFile", controller.getFileUpload);
router.post("/:folderName/uploadFile", controller.postFileUpload);
router.post("/:folderName/delete", controller.postDeleteFolder);
router.post("/:folderName/:filename/id/:id/delete", controller.postDeleteFile);

module.exports = router;
