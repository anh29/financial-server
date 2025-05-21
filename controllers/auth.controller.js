const { callGAS } = require('../services');
const { handleGoogleAppsScriptResponse } = require('../utils/responseHandler');

const createUser = async (req, res) => {
  const result = await callGAS('createUser', 'POST', req.body);
  handleGoogleAppsScriptResponse(res, result);
};

const signIn = async (req, res) => {
  const result = await callGAS('signIn', 'POST', req.body);
  handleGoogleAppsScriptResponse(res, result);
};

module.exports = {
  createUser,
  signIn
};
