const express = require("express");

// const transactionsController = require("./transactions");
// const usersController = require("./users");
// const recurringPatternsController = require("./recurring-patterns");
// const predictController = require("./predict");
// const authController = require("./auth");

const crudRoutes = require("./crud.routes");
const smartRoutes = require("./smart.routes");
const authRoutes = require("./auth.routes");

const router = express.Router();

// router.use("/auth", authController);
// router.use("/transactions", transactionsController);
// router.use("/users", usersController);
// router.use("/recurring-patterns", recurringPatternsController);
// router.use("/predict", predictController);

router.use('/crud', crudRoutes);
router.use('/smart', smartRoutes);
router.use('/auth', authRoutes);

module.exports = { router };
