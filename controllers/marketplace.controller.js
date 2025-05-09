const { callGAS } = require('../services');
const { handleGoogleAppsScriptResponse } = require('../utils/responseHandler');

const getLatestTransaction = async (req, res) => {
  const { type, userId } = req.params;
  console.log(`[GET LATEST TRANSACTION] Request params:`, req.params);
  const result = await callGAS('getLatestTransaction', 'GET', { userId });
  
  handleGoogleAppsScriptResponse(res, result);
};

module.exports = {
  getLatestTransaction,
};
