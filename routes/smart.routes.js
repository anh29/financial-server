const express = require("express");
const {
  getDashboardStats,
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
} = require("../controllers/smart.controller");

const router = express.Router();

router.get('/dashboard/:userId', getDashboardStats);
router.get('/predictRecurring/:userId', predictRecurringTransactions);
router.get('/detectRecurring/:userId', detectNewRecurringPatterns);
router.get('/suggestions/:userId', getSmartSuggestions);
router.get('/goals/suggest/:userId', suggestSmartGoals);
router.get('/expenseByCategory/:userId', getExpenseByCategory);
router.get('/ocr/pending/:userId', getPendingOCRReview);
router.post('/ocr/confirm', confirmOCRTransaction);
router.post('/predictUsageDuration', predictUsageDuration);
router.get('/alerts/budget/:userId', checkBudgetAlerts);
router.get('/reminders/goals/:userId', checkGoalReminders);
router.post('/category', predictCategory);

module.exports = router;
