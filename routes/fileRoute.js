const express = require("express");
const router = express.Router();
const controller = require("../controllers/fileController");

router.get("/upload", controller.getFileUpload);
router.get("/createFolder", controller.getCreateFolder);
router.post("/createFolder", controller.postCreateFolder);

module.exports = router;
