const express = require("express");
const {
  getLatestTransaction,
} = require("../controllers/marketplace.controller");

const router = express.Router();

router.get("/getLatestTransaction/user/:userId", getLatestTransaction);

module.exports = router;
