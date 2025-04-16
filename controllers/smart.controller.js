const { callGAS } = require('../services');
const { handleGoogleAppsScriptResponse } = require('../utils/responseHandler');

const getDashboardStats = async (req, res) => {
  const userId = req.params.userId || req.query.userId;
  const result = await callGAS('getDashboardStats', 'GET', { userId });
  
  console.log("[Dashboard Stats] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

const predictRecurringTransactions = async (req, res) => {
  const userId = req.params.userId || req.query.userId;
  const result = await callGAS('predictRecurringTransactions', 'GET', { userId });
  
  console.log("[Predict Recurring Transactions] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

const detectNewRecurringPatterns = async (req, res) => {
  const userId = req.params.userId || req.query.userId;
  const result = await callGAS('detectNewRecurringPatterns', 'GET', { userId });
  
  console.log("[Detect New Recurring Patterns] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

const getSmartSuggestions = async (req, res) => {
  const userId = req.params.userId || req.query.userId;
  const result = await callGAS('getSmartSuggestions', 'GET', { userId });
  
  console.log("[Get Smart Suggestions] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

const suggestSmartGoals = async (req, res) => {
  const userId = req.params.userId || req.query.userId;
  const result = await callGAS('suggestSmartGoals', 'GET', { userId });
  
  console.log("[Suggest Smart Goals] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

const getExpenseByCategory = async (req, res) => {
  const userId = req.params.userId || req.query.userId;
  const result = await callGAS('getExpenseByCategory', 'GET', { userId });
  
  console.log("[Expense By Category] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

const getPendingOCRReview = async (req, res) => {
  const userId = req.params.userId || req.query.userId;
  const result = await callGAS('getPendingOCRReview', 'GET', { userId });
  
  console.log("[PendingOCRReview] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

const confirmOCRTransaction = async (req, res) => {
  const result = await callGAS('confirmOCRTransaction', 'POST', req.body);
  
  console.log("[confirmOCRTransaction] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

const predictUsageDuration = async (req, res) => {
  const result = await callGAS('predictUsageDuration', 'POST', req.body);
  
  console.log("[predictUsageDuration] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

const checkBudgetAlerts = async (req, res) => {
  const userId = req.params.userId || req.query.userId;
  const result = await callGAS('checkBudgetAlerts', 'GET', { userId });
  
  console.log("[checkBudgetAlerts] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

const checkGoalReminders = async (req, res) => {
  const userId = req.params.userId || req.query.userId;
  const result = await callGAS('checkGoalReminders', 'GET', { userId });
  
  console.log("[checkGoalReminders] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

module.exports = {
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
  checkGoalReminders
};
