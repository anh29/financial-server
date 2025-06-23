const logger = require('./logger');

const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    status: statusCode,
    message: message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'Internal server error', error = null) => {
  const response = {
    status: statusCode,
    message: message
  };
  
  if (error) {
    response.error = error;
  }
  
  logger.error(`Error ${statusCode}: ${message}`, error);
  return res.status(statusCode).json(response);
};

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

module.exports = { 
  handleGoogleAppsScriptResponse,
  successResponse,
  errorResponse
};
