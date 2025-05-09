const GOOGLE_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const MODEL_URL = process.env.MODEL_URL;
const MODEL_PREDICT_ENDPOINT = process.env.MODEL_PREDICT_ENDPOINT;

const CATEGORY_DEFAULT_DURATION = [
  { category: 'shopping', defaultDurationDays: 90 },
  { category: 'food_drink', defaultDurationDays: 3 },
  { category: 'moving', defaultDurationDays: 1 },
  { category: 'house', defaultDurationDays: 90 },
  { category: 'health', defaultDurationDays: 30 },
  { category: 'entertainment', defaultDurationDays: 7 },
  { category: 'investigation', defaultDurationDays: 365 },
  { category: 'sociality', defaultDurationDays: 1 },
];

const categoryKeyMap = {
  "Nhà cửa": "housing",
  "Ăn uống": "food",
  "Du lịch": "travel",
  "Xã hội": "social",
  "Mua sắm": "shopping",
  "Sức khỏe": "health",
  "Đầu tư": "investment",
  "Giáo dục": "education",
  "Di chuyển": "transportation",
  "Giải trí": "entertainment"
};

module.exports = {
  GOOGLE_SCRIPT_URL,
  MODEL_URL,
  MODEL_PREDICT_ENDPOINT,
  CATEGORY_DEFAULT_DURATION,
  categoryKeyMap,
};