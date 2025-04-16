const express = require("express");
const {
  signIn,
  createUser,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post('/signIn', signIn);
router.post('/signUp', createUser);

module.exports = router;
