const { sendToGoogleAppsScript } = require('../services');
const { handleGoogleAppsScriptResponse } = require('../utils/responseHandler');

async function createUser(req, res) {
  try {
    const data = await sendToGoogleAppsScript({ params: req.body, type: 'createUser' });
    handleGoogleAppsScriptResponse(res, data);
  } catch (error) {
    res.status(500).json({
      error: error.message || 'An unexpected error occurred.',
    });
  }
}

async function signIn(req, res) {
  try {
    const data = await sendToGoogleAppsScript({ params: req.body, type: 'signIn' });
    handleGoogleAppsScriptResponse(res, data);
  } catch (error) {
    res.status(500).json({
      error: error.message || 'An unexpected error occurred.',
    });
  }
}

module.exports = { createUser, signIn };
