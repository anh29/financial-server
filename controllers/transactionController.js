const { handleGoogleAppsScriptResponse } = require("../utils/responseHandler");
const { REQUEST_TYPES } = require("../utils/requestTypes");
const { sendToGoogleAppsScript } = require("../services");

const getAllTransactions = async (req, res) => {
  console.log('[GET ALL TRANSACTIONS] Request params:', req.params);
  const data = await sendToGoogleAppsScript({
    method: "GET",
    type: REQUEST_TYPES.GET_ALL_TRANSACTIONS,
  });
  console.log('[GET ALL TRANSACTIONS] Response data:', data);
  handleGoogleAppsScriptResponse(res, data);
};

const getTransactionsByUser = async (req, res) => {
  console.log('[GET TRANSACTIONS BY USER] Request params:', req.params);
  const data = await sendToGoogleAppsScript({
    method: "GET",
    type: REQUEST_TYPES.GET_TRANSACTIONS_BY_USER,
    params: {
      userId: req.params.userId,
    },
  });
  console.log('[GET TRANSACTIONS BY USER] Response data:', data);
  handleGoogleAppsScriptResponse(res, data);
};

const getAmortizedTransactionsByUser = async (req, res) => {
  console.log('[GET AMORTIZED TRANSACTIONS BY USER] Request params:', req.params);
  const data = await sendToGoogleAppsScript({
    method: "GET",
    type: REQUEST_TYPES.GET_TRANSACTIONS_AMORTIZED_BY_USERID,
    params: {
      userId: req.params.userId,
    },
  });
  console.log('[GET AMORTIZED TRANSACTIONS BY USER] Response data:', data);
  handleGoogleAppsScriptResponse(res, data);
};

const addTransaction = async (req, res) => {
  console.log('[ADD TRANSACTION] Request body:', req.body);
  const data = await sendToGoogleAppsScript({
    method: "POST",
    type: REQUEST_TYPES.ADD_TRANSACTION,
    params: req.body,
  });
  console.log('[ADD TRANSACTION] Response data:', data);
  handleGoogleAppsScriptResponse(res, data);
};

const updateTransactionById = async (req, res) => {
  console.log('[UPDATE TRANSACTION BY ID] Request body:', req.body);
  const data = await sendToGoogleAppsScript({
    method: "POST",
    type: REQUEST_TYPES.UPDATE_TRANSACTION_BY_ID,
    params: req.body,
  });
  console.log('[UPDATE TRANSACTION BY ID] Response data:', data);
  handleGoogleAppsScriptResponse(res, data);
};

module.exports = {
  getAllTransactions,
  getTransactionsByUser,
  getAmortizedTransactionsByUser,
  addTransaction,
  updateTransactionById,
};
