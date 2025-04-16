const { callGAS } = require('../services');
const { handleGoogleAppsScriptResponse } = require('../utils/responseHandler');

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const createRecord = async (req, res) => {
  const { type } = req.params;
  const result = await callGAS(`add${capitalize(type)}`, 'POST', req.body);
  
  console.log(`[CREATE ${type}] Response result:`, result);
  handleGoogleAppsScriptResponse(res, result);
};

const getAllRecords = async (req, res) => {
  const { type } = req.params;
  const result = await callGAS(`getAll${capitalize(type)}`);
  
  console.log(`[GET all ${type}] Response result:`, result);
  handleGoogleAppsScriptResponse(res, result);
};

const getRecordsByUser = async (req, res) => {
  const { type, userId } = req.params;
  const result = await callGAS(`get${capitalize(type)}ByUser`, 'GET', { userId });
  
  console.log(`[GET ${type}] BY USER ${userId} Response result:`, result);
  handleGoogleAppsScriptResponse(res, result);
};

const getRecordById = async (req, res) => {
  const { type, id } = req.params;
  const result = await callGAS(`get${capitalize(type)}ById`, 'GET', { id });
  
  console.log(`[GET ${type}] BY ID ${id} Response result:`, result);
  handleGoogleAppsScriptResponse(res, result);
};

const updateRecord = async (req, res) => {
  const { type } = req.params;
  const result = await callGAS(`update${capitalize(type)}`, 'POST', req.body);
  
  console.log(`[UPDATE ${type}] Response result:`, result);
  handleGoogleAppsScriptResponse(res, result);
};

const deleteRecordById = async (req, res) => {
  const { type, id } = req.params;
  const result = await callGAS(`delete${capitalize(type)}ById`, 'GET', { id });
  
  console.log(`[DELETE ${type}] BY ID ${id} Response result:`, result);
  handleGoogleAppsScriptResponse(res, result);
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordsByUser,
  getRecordById,
  updateRecord,
  deleteRecordById
};
