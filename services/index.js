const { default: axios } = require('axios');
const FormData = require('form-data');
const { API_URL } = require('../utils/constants');

async function sendToGoogleAppsScript({params, type}) {
  const formData = new FormData();
  formData.append('type', type);
  formData.append('params', JSON.stringify(params));

  try {
    const response = await axios.post(API_URL, formData);
    return response.data;
  } catch (error) {
    console.error('Error communicating with Google Apps Script:', error.message);
    throw new Error('Failed to communicate with Google Apps Script.');
  }
}

module.exports = { sendToGoogleAppsScript };
