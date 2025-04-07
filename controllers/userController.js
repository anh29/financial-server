const { sendToGoogleAppsScript } = require("../services");
const { REQUEST_TYPES } = require("../utils/requestTypes");
const { handleGoogleAppsScriptResponse } = require("../utils/responseHandler");

async function createUser(req, res) {
  console.log("[CREATE USER] Request body:", req.body);
  const data = await sendToGoogleAppsScript({
    method: "POST",
    params: req.body,
    type: REQUEST_TYPES.CREATE_USER,
  });
  console.log("[CREATE USER] Response data:", data);
  handleGoogleAppsScriptResponse(res, data);
}

async function signIn(req, res) {
  console.log("[SIGN IN] Request body:", req.body);
  const data = await sendToGoogleAppsScript({
    params: req.body,
    type: REQUEST_TYPES.SIGN_IN,
    method: "POST",
  });
  console.log("[SIGN IN] Response data:", data);
  handleGoogleAppsScriptResponse(res, data);
}

async function getUserById(req, res) {
  console.log("[GET USER BY ID] Request params:", req.params);
  const data = await sendToGoogleAppsScript({
    method: "GET",
    type: REQUEST_TYPES.GET_USER_BY_USERID,
    params: {
      userId: req.params.userId,
    },
  });
  console.log("[GET USER BY ID] Response data:", data);
  handleGoogleAppsScriptResponse(res, data);
}

async function updateUser(req, res) {
  console.log("[UPDATE USER] Request params:", req.params);
  const data = await sendToGoogleAppsScript({
    method: "POST",
    type: REQUEST_TYPES.UPDATE_USER,
    params: {
      ...req.body,
      id: req.params.userId,
    },
  });
  console.log("[UPDATE USER] Response data:", data);
  handleGoogleAppsScriptResponse(res, data);
}

module.exports = { createUser, signIn, getUserById, updateUser };
