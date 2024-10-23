const express = require("express");
const router = express.Router();
const controller = require("../controllers/indexController");

router.get("/", controller.get);
router.get("/signup", controller.getSignup);
router.get("/login", controller.getLogin);
router.post("/login", controller.postLogin);
router.post("/signup", controller.postSignup);

module.exports = router;
