const express = require("express");

const crudRoutes = require("./crud.routes");
const authRoutes = require("./auth.routes");
const marketplaceRoutes = require("./marketplace.routes");

const router = express.Router();

router.use('/crud', crudRoutes);
router.use('/auth', authRoutes);
router.use('/marketplace', marketplaceRoutes);

module.exports = { router };
