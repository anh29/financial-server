const { default: axios } = require("axios");
const { GOOGLE_SCRIPT_URL } = require("../utils/constants");

const callGAS = async (path, method = "GET", payload = {}) => {
  const baseUrl = GOOGLE_SCRIPT_URL;
  let url = `${baseUrl}?path=${path}`;

  // Attach query params for GET requests
  if (method === "GET") {
    Object.entries(payload).forEach(([key, value]) => {
      url += `&${key}=${value}`;
    });
  }
  console.log(`[GAS] ${method} ${path} URL:`, url);
  console.log(`[GAS] ${method} ${path} Payload:`, payload);

  try {
    const res = await axios({
      method,
      url,
      headers: {
        "Content-Type": "application/json",
      },
      ...(method === "POST" && { data: payload }),
    });

    return res.data;
  } catch (error) {
    console.error(
      `❌ GAS call failed [${path}]:`,
      error.response?.data || error.message
    );
    return {
      success: false,
      message: "Google Apps Script API call failed",
      error: error.response?.data || error.message,
    };
  }
};

async function sendToGoogleAppsScript({ method, params, type }) {
  try {
    const url = new URL(GOOGLE_SCRIPT_URL);
    url.searchParams.append("type", type);

    // Append all params for GET
    if (method === "GET") {
      params &&
        Object.entries(params).forEach(([key, val]) => {
          url.searchParams.append(key, String(val));
        });

      const res = await axios.get(url.toString());
      return res.data;
    }

    // POST: send in body
    const res = await axios.post(url.toString(), params, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  } catch (err) {
    console.error(`[Google Script API Error]`, err);
    return {
      status: 500,
      message: `Server error while contacting Google Script: ${err}`,
    };
  }
}

module.exports = { sendToGoogleAppsScript, callGAS };
