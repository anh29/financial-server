const { default: axios } = require("axios");
const { GOOGLE_SCRIPT_URL } = require("../utils/constants");

async function sendToGoogleAppsScript({ method, params, type }) {
  try {
    const url = new URL(GOOGLE_SCRIPT_URL);
    url.searchParams.append("type", type);

    // Append all params for GET
    if (method === "GET") {
      params && Object.entries(params).forEach(([key, val]) => {
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

module.exports = { sendToGoogleAppsScript };
