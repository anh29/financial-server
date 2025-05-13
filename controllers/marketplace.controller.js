const { callGAS } = require('../services');
const { handleGoogleAppsScriptResponse } = require('../utils/responseHandler');

const getLatestTransaction = async (req, res) => {
  const { userId } = req.params;
  console.log(`[GET LATEST TRANSACTION] Request params:`, req.params);
  const result = await callGAS('getLatestTransaction', 'GET', { userId });
  
  handleGoogleAppsScriptResponse(res, result);
};

const getMonthlyBudgetWithAllocations = async (req, res) => {
  const { userId, month } = req.params;
  console.log(`[GET MONTHLY BUDGET BY MONTH] Request params:`, req.params);
  const result = await callGAS('getMonthlyBudgetWithAllocations', 'GET', { userId, month });
  handleGoogleAppsScriptResponse(res, result);
};

const getHistoricalExpenditures = async (req, res) => {
  const { userId } = req.params;
  console.log(`[GET HISTORICAL EXPENDITURES] Request params:`, req.params);
  const result = await callGAS('getHistoricalExpenditures', 'GET', { userId });
  handleGoogleAppsScriptResponse(res, result);
};

const getUserIncomeAndBudgets = async (req, res) => {
  const { userId } = req.params;
  console.log(`[GET USER INCOME AND BUDGETS] Request params:`, req.params);
  const result = await callGAS('getUserIncomeAndBudgets', 'GET', { userId });
  handleGoogleAppsScriptResponse(res, result);
};

module.exports = {
  getLatestTransaction,
  getMonthlyBudgetWithAllocations,
  getHistoricalExpenditures,
  getUserIncomeAndBudgets,
};
