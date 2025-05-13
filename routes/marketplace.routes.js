const express = require("express");
const {
  getLatestTransaction,
  getMonthlyBudgetWithAllocations,
  getHistoricalExpenditures,  
  getUserIncomeAndBudgets,
} = require("../controllers/marketplace.controller");

const router = express.Router();

router.get("/getLatestTransaction/user/:userId", getLatestTransaction);
router.get("/getMonthlyBudgetWithAllocations/user/:userId/month/:month", getMonthlyBudgetWithAllocations);
router.get("/getHistoricalExpenditures/user/:userId", getHistoricalExpenditures);
router.get("/getUserIncomeAndBudgets/user/:userId", getUserIncomeAndBudgets);

module.exports = router;
