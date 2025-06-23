const express = require('express');
const { suggestSmartBudget } = require('../controllers/budget.controller');

const router = express.Router();

// GET /budget/suggest/:userId - Get smart budget suggestion
router.get('/suggest/:userId', suggestSmartBudget);

module.exports = router; 