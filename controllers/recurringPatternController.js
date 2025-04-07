const { handleGoogleAppsScriptResponse } = require('../utils/responseHandler');
const { REQUEST_TYPES } = require('../utils/requestTypes');
const { sendToGoogleAppsScript } = require('../services');

const getRecurringPatternsByUser = async (req, res) => {
  console.log('[GET RECURRING PATTERNS BY USER] Request params:', req.params);
  const data = await sendToGoogleAppsScript({
    method: 'GET',
    type: REQUEST_TYPES.GET_RECURRING_PATTERNS_BY_USERID,
    params: { userId: req.params.userId }
  });
  console.log('[GET RECURRING PATTERNS BY USER] Response data:', data);
  handleGoogleAppsScriptResponse(res, data);
};

const addRecurringPattern = async (req, res) => {
  console.log('[ADD RECURRING PATTERN] Request body:', req.body);
  const data = await sendToGoogleAppsScript({
    method: 'POST',
    type: REQUEST_TYPES.ADD_RECURRING_PATTERN,
    params: req.body
  });
  console.log('[ADD RECURRING PATTERN] Response data:', data);
  handleGoogleAppsScriptResponse(res, data);
};

const updateRecurringPattern = async (req, res) => {
  console.log('[UPDATE RECURRING PATTERN] Request params:', req.params);
  console.log('[UPDATE RECURRING PATTERN] Request body:', req.body);
  const data = await sendToGoogleAppsScript({
    method: 'POST',
    type: REQUEST_TYPES.UPDATE_RECURRING_PATTERN,
    params: {
      newData: req.body,
      id: req.params.patternId
    }
  });
  console.log('[UPDATE RECURRING PATTERN] Response data:', data);
  handleGoogleAppsScriptResponse(res, data);
};

module.exports = {
  getRecurringPatternsByUser,
  addRecurringPattern,
  updateRecurringPattern
};
