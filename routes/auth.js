const express = require("express");
const { createUser, signIn } = require("../controllers/userController");

const router = express.Router();

router.post("/createUser", createUser);
router.post("/signin", signIn);

module.exports = router;