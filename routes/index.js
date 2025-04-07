const express = require("express");
const { createUser, signIn } = require("../controllers/userController");

const transactionsController = require("./transactions");
const usersController = require("./users");
const recurringPatternsController = require("./recurring-patterns");
const predictController = require("./predict");

const router = express.Router();

router.post("/createUser", createUser);
router.post("/signin", signIn);

router.use("/transactions", transactionsController);
router.use("/users", usersController);
router.use("/recurring-patterns", recurringPatternsController);
router.use("/predict", predictController);

module.exports = { router };
