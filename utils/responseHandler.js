const logger = require('./logger');

const handleGoogleAppsScriptResponse = (res, result) => {
  if (!result) {
    return res.status(500).json({ error: 'No response from Google Apps Script' });
  }

  if (result.error) {
    logger.error('GAS Error:', result.error);
    return res.status(400).json({ error: result.error });
  }

  return res.status(200).json({
    message: result.message || 'Success',
    data: result.data
  });
};

module.exports = { handleGoogleAppsScriptResponse };
