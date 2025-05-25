const { default: axios } = require("axios");
const { callGAS } = require("../services");
const { MODEL_URL } = require("../utils/constants");
const { handleGoogleAppsScriptResponse } = require("../utils/responseHandler");
const logger = require("../utils/logger");

// Generic handler for GAS requests
const handleGASRequest = async (res, functionName, params) => {
  try {
    logger.info(`[${functionName}] Request params:`, params);
    const result = await callGAS(functionName, "GET", params);
    handleGoogleAppsScriptResponse(res, result);
  } catch (error) {
    logger.error(`[${functionName}] Error:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller factory for GAS endpoints
const createGASController = (functionName) => {
  return async (req, res) => {
    const params = { ...req.params, ...req.query };
    await handleGASRequest(res, functionName, params);
  };
};

// Special handler for POST requests
const createGASPostController = (functionName) => {
  return async (req, res) => {
    try {
      logger.info(`[${functionName}] Request body:`, req.body);
      const result = await callGAS(functionName, "POST", req.body);
      handleGoogleAppsScriptResponse(res, result);
    } catch (error) {
      logger.error(`[${functionName}] Error:`, error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};

// Special handler for ML prediction
const predictCategory = async (req, res) => {
  logger.info("[PREDICT CATEGORY] Request body:", req.body);

  try {
    const { data } = await axios.post(MODEL_URL, req.body);
    res.status(200).json(data);
  } catch (error) {
    logger.error("[PREDICT CATEGORY] Error:", error.message);
    res.status(500).json({
      error: error.message || "An error occurred during prediction.",
    });
  }
};

module.exports = {
  // Marketplace endpoints
  getLatestTransaction: createGASController("getLatestTransaction"),
  getMonthlyBudgetWithAllocations: createGASController(
    "getMonthlyBudgetWithAllocations"
  ),
  getHistoricalExpenditures: createGASController("getHistoricalExpenditures"),
  getUserIncomeAndBudgets: createGASController("getUserIncomeAndBudgets"),
  getExpensesTransactions: createGASController("getExpensesTransactions"),

  // Smart endpoints
  getDashboardStats: createGASController("getDashboardStats"),
  predictRecurringTransactions: createGASController(
    "predictRecurringTransactions"
  ),
  detectNewRecurringPatterns: createGASController("detectNewRecurringPatterns"),
  getSmartSuggestions: createGASController("getSmartSuggestions"),
  suggestSmartGoals: createGASController("suggestSmartGoals"),
  getExpenseByCategory: createGASController("getExpenseByCategory"),
  getPendingOCRReview: createGASController("getPendingOCRReview"),
  confirmOCRTransaction: createGASPostController("confirmOCRTransaction"),
  predictUsageDuration: createGASPostController("predictUsageDuration"),
  checkBudgetAlerts: createGASController("checkBudgetAlerts"),
  checkGoalReminders: createGASController("checkGoalReminders"),
  predictCategory,
  getUserGoalsWithProgress: createGASController("getUserGoalsWithProgress"),
  getRemainingBudget: createGASController("getRemainingBudget"),
  allocateSavingToGoals: createGASController("allocateSavingToGoals"),
};
