const express = require("express");
const { validateUserId, validateMonth } = require("../middleware/validation");
const {
  getLatestTransaction,
  getMonthlyBudgetWithAllocations,
  getHistoricalExpenditures,
  getUserIncomeAndBudgets,
  getExpensesTransactions,
  getDashboardStats,
  getUserGoalsWithProgress,
  predictRecurringTransactions,
  detectNewRecurringPatterns,
  getSmartSuggestions,
  suggestSmartGoals,
  getExpenseByCategory,
  getPendingOCRReview,
  confirmOCRTransaction,
  predictUsageDuration,
  checkBudgetAlerts,
  checkGoalReminders,
  predictCategory,
  getRemainingBudget,
  allocateSavingToGoals,
  cancelGoal,
} = require("../controllers/marketplace.controller");

const router = express.Router();

// Apply userId validation to all routes
router.use("/user/:userId", validateUserId);

// Marketplace routes
router.get("/getLatestTransaction/user/:userId", getLatestTransaction);
router.get(
  "/getMonthlyBudgetWithAllocations/user/:userId/month/:month",
  validateMonth,
  getMonthlyBudgetWithAllocations
);
router.get(
  "/getHistoricalExpenditures/user/:userId",
  getHistoricalExpenditures
);
router.get("/getUserIncomeAndBudgets/user/:userId", getUserIncomeAndBudgets);
router.get("/getExpensesTransactions/user/:userId", getExpensesTransactions);

// Smart routes
router.get("/dashboard/:userId", getDashboardStats);
router.get("/predictRecurring/:userId", predictRecurringTransactions);
router.get("/detectRecurring/:userId", detectNewRecurringPatterns);
router.get("/suggestions/:userId", getSmartSuggestions);
router.get("/goals/suggest/:userId", suggestSmartGoals);
router.get("/expenseByCategory/:userId", getExpenseByCategory);
router.get("/ocr/pending/:userId", getPendingOCRReview);
router.post("/ocr/confirm", confirmOCRTransaction);
router.post("/predictUsageDuration", predictUsageDuration);
router.get("/alerts/budget/:userId", checkBudgetAlerts);
router.get("/reminders/goals/:userId", checkGoalReminders);
router.post("/category", predictCategory);
router.get("/getUserGoalsWithProgress/user/:userId", getUserGoalsWithProgress);
router.get("/getRemainingBudget/user/:userId/month/:month", getRemainingBudget);
router.get("/allocateSavingToGoals/user/:userId/amount/:amount", allocateSavingToGoals);

router.post("/cancelGoal", cancelGoal);

module.exports = router;
