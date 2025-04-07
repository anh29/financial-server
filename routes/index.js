const express = require("express");

const transactionsController = require("./transactions");
const usersController = require("./users");
const recurringPatternsController = require("./recurring-patterns");
const predictController = require("./predict");
const authController = require("./auth");

const router = express.Router();

router.use("/auth", authController);
router.use("/transactions", transactionsController);
router.use("/users", usersController);
router.use("/recurring-patterns", recurringPatternsController);
router.use("/predict", predictController);

module.exports = { router };
