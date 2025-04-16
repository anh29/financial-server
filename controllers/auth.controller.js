const { callGAS } = require('../services');
const { handleGoogleAppsScriptResponse } = require('../utils/responseHandler');

const createUser = async (req, res) => {
  const result = await callGAS('createUser', 'POST', req.body);
  
  console.log("[CREATE USER] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

const signIn = async (req, res) => {
  const result = await callGAS('signIn', 'POST', req.body);
  
  console.log("[SIGN IN] Response result:", result);
  handleGoogleAppsScriptResponse(res, result);
};

module.exports = {
  createUser,
  signIn
};
