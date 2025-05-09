const { default: axios } = require("axios");
const { estimateUsageDuration } = require("../utils/estimateUsageDuration");
const { MODEL_URL } = require("../utils/constants");
const { sendToGoogleAppsScript } = require("../services");
const { REQUEST_TYPES } = require("../utils/requestTypes");

const predictCategory = (req, res) => {
  console.log("[PREDICT CATEGORY] Request body:", req.body);
  const { content, userId } = req.body;

  try {
    axios
      .post(MODEL_URL, {
        texts: content,
      })
      .then((response) => {
        console.log("[PREDICT CATEGORY] Model response:", response.data);

        res.status(200).json({ predictedCategory: response.data, userId });
      });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "An error occurred during prediction." });
  }
};

const predictUsageDuration = async (req, res) => {
  console.log("[PREDICT USAGE DURATION] Request body:", req.body);
  const { current, userId } = req.body;

  try {
    const amortizedTransactions = await sendToGoogleAppsScript({
      method: "GET",
      type: REQUEST_TYPES.GET_TRANSACTIONS_AMORTIZED_BY_USERID,
      params: {
        userId,
      },
    });

    const pastTransactions = amortizedTransactions.data.map((transaction) => ({
      ...transaction,
      date: new Date(transaction.date),
    }));
    console.log(
      "[PREDICT USAGE DURATION] Past transactions:",
      pastTransactions
    );

    const duration = estimateUsageDuration(current, pastTransactions);
    console.log("[PREDICT USAGE DURATION] Estimated duration:", duration);

    res.status(200).json({ estimatedDuration: duration });
  } catch (error) {
    console.error("[PREDICT USAGE DURATION] Error:", error);
    res
      .status(500)
      .json({ error: error.message || "An error occurred during prediction." });
  }
};

module.exports = {
  predictCategory,
  predictUsageDuration,
};
