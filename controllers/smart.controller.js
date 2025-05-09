const { default: axios } = require('axios');
const { callGAS } = require('../services');
const { MODEL_URL, categoryKeyMap } = require('../utils/constants');
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

const predictCategory = async (req, res) => {
  console.log("[PREDICT CATEGORY] Request body:", req.body);

  try {
    const response = await axios.post(MODEL_URL, req.body);
    const confidences = response.data.category_confidence;

    console.log("[PREDICT CATEGORY] Model response:", confidences);

    // Find the highest-confidence category
    let maxLabel = null;
    let maxConfidence = -1;

    for (const [label, confidence] of Object.entries(confidences)) {
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        maxLabel = label;
      }
    }

    const key = categoryKeyMap[maxLabel];

    res.status(200).json({
      predictedCategory: {
        label: maxLabel,
        key: key
      }
    });
  } catch (error) {
    console.error("[PREDICT CATEGORY] Error:", error.message);
    res.status(500).json({
      error: error.message || "An error occurred during prediction."
    });
  }
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
  checkGoalReminders,
  predictCategory,
};
